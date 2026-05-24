import { Router, type IRouter, type Request, type Response } from "express";
import { db, postsTable, commentsTable, likesTable, sharesTable, savedPostsTable, usersTable, notificationsTable, activityLogsTable, followsTable } from "@workspace/db";
import { eq, and, desc, or } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

async function buildUserProfile(user: typeof usersTable.$inferSelect, viewerId?: number) {
  const { passwordHash: _pw, ...base } = user;
  const followers = await db.select().from(followsTable).where(and(eq(followsTable.followingId, user.id), eq(followsTable.status, "approved")));
  const following = await db.select().from(followsTable).where(and(eq(followsTable.followerId, user.id), eq(followsTable.status, "approved")));
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, user.id));
  const likes = await db.select().from(likesTable).where(eq(likesTable.userId, user.id));
  return {
    ...base,
    followersCount: followers.length,
    followingCount: following.length,
    postsCount: posts.length,
    likesCount: likes.length,
    totalVotes: 0,
    profileViews: 0,
    isFollowing: null,
    isFollowRequestSent: null,
    isBlocked: null,
  };
}

async function enrichPost(post: typeof postsTable.$inferSelect, viewerId?: number) {
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
  const authorProfile = author ? await buildUserProfile(author, viewerId) : null;
  let isLiked = null, isSaved = null;
  if (viewerId) {
    const like = await db.select().from(likesTable).where(and(eq(likesTable.userId, viewerId), eq(likesTable.postId, post.id)));
    isLiked = like.length > 0;
    const saved = await db.select().from(savedPostsTable).where(and(eq(savedPostsTable.userId, viewerId), eq(savedPostsTable.postId, post.id)));
    isSaved = saved.length > 0;
  }
  return { ...post, author: authorProfile, isLiked, isSaved };
}

router.get("/posts", optionalAuth, async (req: Request, res: Response)=> {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "20"), 10);
  const viewerId = (req as any).userId;
  const allPosts = await db.select().from(postsTable).where(eq(postsTable.visibility, "public")).orderBy(desc(postsTable.isPinned), desc(postsTable.createdAt));
  const start = (page - 1) * limit;
  const pagePosts = allPosts.slice(start, start + limit);
  const enriched = await Promise.all(pagePosts.map((p) => enrichPost(p, viewerId)));
  res.json({ posts: enriched, total: allPosts.length, page, hasMore: start + limit < allPosts.length });
});

router.post("/posts", requireAuth, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const { caption, mediaUrl, mediaType, filterName, visibility = "public", allowComments = true, allowDownloads = true, isPinned = false } = req.body;
  const [post] = await db.insert(postsTable).values({
    authorId: userId, caption: caption ?? null, mediaUrl: mediaUrl ?? null,
    mediaType: mediaType ?? null, filterName: filterName ?? null,
    visibility, allowComments, allowDownloads, isPinned,
  }).returning();
  await db.insert(activityLogsTable).values({ userId, action: "post_created", metadata: String(post.id) });
  res.status(201).json(await enrichPost(post, userId));
});

router.get("/posts/liked", requireAuth, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const likes = await db.select().from(likesTable).where(eq(likesTable.userId, userId)).orderBy(desc(likesTable.createdAt));
  const posts = await Promise.all(likes.map(async (l) => {
    const [post] = await db.select().from(postsTable).where(eq(postsTable.id, l.postId));
    if (!post) return null;
    return enrichPost(post, userId);
  }));
  const filtered = posts.filter(Boolean);
  res.json({ posts: filtered, total: filtered.length, page: 1, hasMore: false });
});

router.get("/posts/:postId", optionalAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  // Increment view count
  await db.update(postsTable).set({ viewsCount: post.viewsCount + 1 }).where(eq(postsTable.id, postId));
  const viewerId = (req as any).userId;
  res.json(await enrichPost({ ...post, viewsCount: post.viewsCount + 1 }, viewerId));
});

router.patch("/posts/:postId", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (post.authorId !== userId) {
    res.status(403).json({ error: "You can only edit your own posts" });
    return;
  }
  const updates: any = {};
  if (req.body.caption !== undefined) updates.caption = req.body.caption;
  if (req.body.visibility !== undefined) updates.visibility = req.body.visibility;
  if (req.body.allowComments !== undefined) updates.allowComments = req.body.allowComments;
  if (req.body.allowDownloads !== undefined) updates.allowDownloads = req.body.allowDownloads;
  if (req.body.isPinned !== undefined) updates.isPinned = req.body.isPinned;
  const [updated] = await db.update(postsTable).set(updates).where(eq(postsTable.id, postId)).returning();
  res.json(await enrichPost(updated, userId));
});

router.delete("/posts/:postId", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const user = (req as any).user;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (post.authorId !== userId && user.role !== "creator") {
    res.status(403).json({ error: "You can only delete your own posts" });
    return;
  }
  await db.delete(postsTable).where(eq(postsTable.id, postId));
  await db.insert(activityLogsTable).values({ userId, action: "post_deleted", metadata: String(postId) });
  res.sendStatus(204);
});

router.post("/posts/:postId/like", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const existing = await db.select().from(likesTable).where(and(eq(likesTable.userId, userId), eq(likesTable.postId, postId)));
  let liked = false;
  let newCount = post.likesCount;
  if (existing.length === 0) {
    await db.insert(likesTable).values({ userId, postId });
    newCount = post.likesCount + 1;
    await db.update(postsTable).set({ likesCount: newCount }).where(eq(postsTable.id, postId));
    liked = true;
    await db.insert(activityLogsTable).values({ userId, action: "like", metadata: String(postId) });
    if (post.authorId !== userId) {
      const liker = (req as any).user;
      await db.insert(notificationsTable).values({
        userId: post.authorId, actorId: userId, type: "new_like",
        title: "New like", body: `${liker.name} liked your post`,
        relatedId: postId, relatedType: "post",
      });
    }
  } else {
    liked = true;
  }
  res.json({ liked, likesCount: newCount });
});

router.post("/posts/:postId/unlike", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (post) {
    await db.delete(likesTable).where(and(eq(likesTable.userId, userId), eq(likesTable.postId, postId)));
    const newCount = Math.max(0, post.likesCount - 1);
    await db.update(postsTable).set({ likesCount: newCount }).where(eq(postsTable.id, postId));
  }
  res.json({ success: true });
});

router.get("/posts/:postId/comments", optionalAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const comments = await db.select().from(commentsTable).where(and(eq(commentsTable.postId, postId), eq(commentsTable.parentId, null as any))).orderBy(commentsTable.createdAt);
  const enriched = await Promise.all(comments.map(async (comment) => {
    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, comment.authorId));
    const authorProfile = author ? await buildUserProfile(author) : null;
    const replies = await db.select().from(commentsTable).where(eq(commentsTable.parentId, comment.id)).orderBy(commentsTable.createdAt);
    const enrichedReplies = await Promise.all(replies.map(async (reply) => {
      const [replyAuthor] = await db.select().from(usersTable).where(eq(usersTable.id, reply.authorId));
      const replyAuthorProfile = replyAuthor ? await buildUserProfile(replyAuthor) : null;
      return { ...reply, author: replyAuthorProfile, replies: [] };
    }));
    return { ...comment, author: authorProfile, replies: enrichedReplies };
  }));
  res.json({ comments: enriched, total: enriched.length, page: 1 });
});

router.post("/posts/:postId/comments", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const { content, parentId } = req.body;
  if (!content) {
    res.status(400).json({ error: "Content required" });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (!post.allowComments) {
    res.status(403).json({ error: "Comments are disabled for this post" });
    return;
  }
  const [comment] = await db.insert(commentsTable).values({ postId, authorId: userId, content, parentId: parentId ?? null }).returning();
  await db.update(postsTable).set({ commentsCount: post.commentsCount + 1 }).where(eq(postsTable.id, postId));
  await db.insert(activityLogsTable).values({ userId, action: "comment", metadata: String(postId) });
  if (post.authorId !== userId) {
    const commenter = (req as any).user;
    await db.insert(notificationsTable).values({
      userId: post.authorId, actorId: userId,
      type: parentId ? "new_reply" : "new_comment",
      title: parentId ? "New reply" : "New comment",
      body: `${commenter.name} ${parentId ? "replied to a comment" : "commented on your post"}`,
      relatedId: postId, relatedType: "post",
    });
  }
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const authorProfile = author ? await buildUserProfile(author) : null;
  res.status(201).json({ ...comment, author: authorProfile, replies: [] });
});

router.delete("/posts/:postId/comments/:commentId", requireAuth, async (req: Request, res: Response)=> {
  const rawPost = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const rawComment = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
  const postId = parseInt(rawPost, 10);
  const commentId = parseInt(rawComment, 10);
  const userId = (req as any).userId;
  const user = (req as any).user;
  const [comment] = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId));
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (comment.authorId !== userId && (!post || post.authorId !== userId) && user.role !== "creator") {
    res.status(403).json({ error: "Cannot delete this comment" });
    return;
  }
  await db.delete(commentsTable).where(eq(commentsTable.id, commentId));
  if (post) {
    await db.update(postsTable).set({ commentsCount: Math.max(0, post.commentsCount - 1) }).where(eq(postsTable.id, postId));
  }
  res.sendStatus(204);
});

router.post("/posts/:postId/pin", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post || post.authorId !== userId) {
    res.status(403).json({ error: "Cannot pin this post" });
    return;
  }
  await db.update(postsTable).set({ isPinned: true }).where(eq(postsTable.id, postId));
  res.json({ success: true });
});

router.post("/posts/:postId/unpin", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  await db.update(postsTable).set({ isPinned: false }).where(eq(postsTable.id, postId));
  res.json({ success: true });
});

router.post("/posts/:postId/share", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const postId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (post) {
    await db.insert(sharesTable).values({ userId, postId });
    await db.update(postsTable).set({ sharesCount: post.sharesCount + 1 }).where(eq(postsTable.id, postId));
    if (post.authorId !== userId) {
      const sharer = (req as any).user;
      await db.insert(notificationsTable).values({
        userId: post.authorId, actorId: userId, type: "post_shared",
        title: "Post shared", body: `${sharer.name} shared your post`,
        relatedId: postId, relatedType: "post",
      });
    }
  }
  res.json({ success: true });
});

export default router;
