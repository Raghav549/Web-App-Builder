import { Router, type IRouter } from "express";
import { db, usersTable, followsTable, blocksTable, restrictsTable, activityLogsTable, notificationsTable } from "@workspace/db";
import { eq, and, or, ne } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function safeUser(user: typeof usersTable.$inferSelect, viewerId?: number, followsTable?: any, isFollowing?: boolean) {
  const { passwordHash: _pw, ...rest } = user;
  return rest;
}

async function buildUserProfile(user: typeof usersTable.$inferSelect, viewerId?: number) {
  const { passwordHash: _pw, ...base } = user;
  const followers = await db.select().from(followsTable).where(and(eq(followsTable.followingId, user.id), eq(followsTable.status, "approved")));
  const following = await db.select().from(followsTable).where(and(eq(followsTable.followerId, user.id), eq(followsTable.status, "approved")));
  const { postsTable, likesTable } = await import("@workspace/db");
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, user.id));
  const likes = await db.select().from(likesTable).where(eq(likesTable.userId, user.id));
  const { votesTable } = await import("@workspace/db");
  const votes = await db.select().from(votesTable).where(eq(votesTable.voterId, user.id));

  let isFollowing = null, isFollowRequestSent = null, isBlocked = null;
  if (viewerId && viewerId !== user.id) {
    const follow = await db.select().from(followsTable).where(and(eq(followsTable.followerId, viewerId), eq(followsTable.followingId, user.id)));
    if (follow.length > 0) {
      isFollowing = follow[0].status === "approved";
      isFollowRequestSent = follow[0].status === "pending";
    }
    const block = await db.select().from(blocksTable).where(and(eq(blocksTable.userId, viewerId), eq(blocksTable.blockedId, user.id)));
    isBlocked = block.length > 0;
  }

  return {
    ...base,
    followersCount: followers.length,
    followingCount: following.length,
    postsCount: posts.length,
    likesCount: likes.length,
    totalVotes: votes.length,
    profileViews: 0,
    isFollowing,
    isFollowRequestSent,
    isBlocked,
  };
}

router.get("/users/:userId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const viewerId = (req as any).userId;
  res.json(await buildUserProfile(user, viewerId));
});

router.get("/users/by-username/:username", async (req, res): Promise<void> => {
  const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username.toLowerCase()));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const viewerId = (req as any).userId;
  res.json(await buildUserProfile(user, viewerId));
});

router.patch("/users/me/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const { name, username, bio, alternateBio, avatarUrl, coverUrl, mixChannelId } = req.body;
  if (username) {
    const existing = await db.select().from(usersTable).where(and(eq(usersTable.username, username.toLowerCase()), ne(usersTable.id, userId)));
    if (existing.length > 0) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }
  }
  const updates: Partial<typeof usersTable.$inferSelect> = {};
  if (name !== undefined) updates.name = name;
  if (username !== undefined) updates.username = username.toLowerCase();
  if (bio !== undefined) updates.bio = bio;
  if (alternateBio !== undefined) updates.alternateBio = alternateBio;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (coverUrl !== undefined) updates.coverUrl = coverUrl;
  if (mixChannelId !== undefined) updates.mixChannelId = mixChannelId;
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  await db.insert(activityLogsTable).values({ userId, action: "profile_edit" });
  const { passwordHash: _pw, ...rest } = updated;
  res.json(rest);
});

router.patch("/users/me/privacy", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const { isPrivate, whoCanMessage, whoCanComment, whoCanViewFollowers, whoCanDownload } = req.body;
  const updates: any = {};
  if (isPrivate !== undefined) updates.isPrivate = isPrivate;
  if (whoCanMessage !== undefined) updates.whoCanMessage = whoCanMessage;
  if (whoCanComment !== undefined) updates.whoCanComment = whoCanComment;
  if (whoCanViewFollowers !== undefined) updates.whoCanViewFollowers = whoCanViewFollowers;
  if (whoCanDownload !== undefined) updates.whoCanDownload = whoCanDownload;
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  await db.insert(activityLogsTable).values({ userId, action: "privacy_change" });
  res.json({
    isPrivate: updated.isPrivate,
    whoCanMessage: updated.whoCanMessage,
    whoCanComment: updated.whoCanComment,
    whoCanViewFollowers: updated.whoCanViewFollowers,
    whoCanDownload: updated.whoCanDownload,
  });
});

router.get("/users/me/notification-settings", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  res.json({
    votes: user.notifVotes,
    newFollowers: user.notifNewFollowers,
    followRequests: user.notifFollowRequests,
    likes: user.notifLikes,
    comments: user.notifComments,
    replies: user.notifReplies,
    messages: user.notifMessages,
    mentions: user.notifMentions,
    postShares: user.notifPostShares,
    profileViews: user.notifProfileViews,
    aiNewPosts: user.notifAiNewPosts,
    systemAlerts: user.notifSystemAlerts,
  });
});

router.patch("/users/me/notification-settings", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const fields: any = {};
  const map: Record<string, string> = {
    votes: "notifVotes", newFollowers: "notifNewFollowers", followRequests: "notifFollowRequests",
    likes: "notifLikes", comments: "notifComments", replies: "notifReplies", messages: "notifMessages",
    mentions: "notifMentions", postShares: "notifPostShares", profileViews: "notifProfileViews",
    aiNewPosts: "notifAiNewPosts", systemAlerts: "notifSystemAlerts",
  };
  for (const [key, col] of Object.entries(map)) {
    if (req.body[key] !== undefined) fields[col] = req.body[key];
  }
  const [updated] = await db.update(usersTable).set(fields).where(eq(usersTable.id, userId)).returning();
  res.json({
    votes: updated.notifVotes, newFollowers: updated.notifNewFollowers, followRequests: updated.notifFollowRequests,
    likes: updated.notifLikes, comments: updated.notifComments, replies: updated.notifReplies, messages: updated.notifMessages,
    mentions: updated.notifMentions, postShares: updated.notifPostShares, profileViews: updated.notifProfileViews,
    aiNewPosts: updated.notifAiNewPosts, systemAlerts: updated.notifSystemAlerts,
  });
});

router.patch("/users/me/chat-settings", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const { readReceipts, typingIndicators, showOnlineStatus, whoCanMessageMe } = req.body;
  const updates: any = {};
  if (readReceipts !== undefined) updates.readReceipts = readReceipts;
  if (typingIndicators !== undefined) updates.typingIndicators = typingIndicators;
  if (showOnlineStatus !== undefined) updates.showOnlineStatus = showOnlineStatus;
  if (whoCanMessageMe !== undefined) updates.whoCanMessageMe = whoCanMessageMe;
  await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));
  res.json({ success: true });
});

router.post("/users/:userId/follow", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const targetId = parseInt(raw, 10);
  const followerId = (req as any).userId;
  if (followerId === targetId) {
    res.status(400).json({ error: "Cannot follow yourself" });
    return;
  }
  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, targetId));
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const existing = await db.select().from(followsTable).where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, targetId)));
  if (existing.length > 0) {
    res.json({ status: existing[0].status === "approved" ? "following" : "requested" });
    return;
  }
  const status = target.isPrivate ? "pending" : "approved";
  await db.insert(followsTable).values({ followerId, followingId: targetId, status });
  await db.insert(activityLogsTable).values({ userId: followerId, action: "follow", metadata: String(targetId) });
  // Send notification
  const follower = (req as any).user;
  await db.insert(notificationsTable).values({
    userId: targetId,
    actorId: followerId,
    type: status === "pending" ? "follow_request" : "new_follower",
    title: status === "pending" ? "New follow request" : "New follower",
    body: `${follower.name} ${status === "pending" ? "wants to follow you" : "started following you"}`,
    relatedId: followerId,
    relatedType: "user",
  });
  res.json({ status: status === "approved" ? "following" : "requested" });
});

router.post("/users/:userId/unfollow", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const targetId = parseInt(raw, 10);
  const followerId = (req as any).userId;
  await db.delete(followsTable).where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, targetId)));
  await db.insert(activityLogsTable).values({ userId: followerId, action: "unfollow", metadata: String(targetId) });
  res.json({ status: "unfollowed" });
});

router.get("/users/:userId/followers", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const approved = await db.select().from(followsTable).where(and(eq(followsTable.followingId, userId), eq(followsTable.status, "approved")));
  const users = await Promise.all(
    approved.map(async (f) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, f.followerId));
      if (!user) return null;
      return buildUserProfile(user, (req as any).userId);
    })
  );
  const filtered = users.filter(Boolean);
  res.json({ users: filtered, total: filtered.length, page: 1 });
});

router.get("/users/:userId/following", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const approved = await db.select().from(followsTable).where(and(eq(followsTable.followerId, userId), eq(followsTable.status, "approved")));
  const users = await Promise.all(
    approved.map(async (f) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, f.followingId));
      if (!user) return null;
      return buildUserProfile(user, (req as any).userId);
    })
  );
  const filtered = users.filter(Boolean);
  res.json({ users: filtered, total: filtered.length, page: 1 });
});

router.get("/users/:userId/posts", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const { postsTable, likesTable } = await import("@workspace/db");
  const posts = await db.select().from(postsTable).where(and(eq(postsTable.authorId, userId), eq(postsTable.visibility, "public"))).orderBy(postsTable.createdAt);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const viewerId = (req as any).userId;
  const authorProfile = await buildUserProfile(user, viewerId);
  const enriched = await Promise.all(posts.map(async (post) => {
    let isLiked = null;
    if (viewerId) {
      const like = await db.select().from(likesTable).where(and(eq(likesTable.userId, viewerId), eq(likesTable.postId, post.id)));
      isLiked = like.length > 0;
    }
    return { ...post, author: authorProfile, isLiked, isSaved: null };
  }));
  res.json({ posts: enriched, total: enriched.length, page: 1, hasMore: false });
});

router.post("/users/:userId/block", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const blockedId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const existing = await db.select().from(blocksTable).where(and(eq(blocksTable.userId, userId), eq(blocksTable.blockedId, blockedId)));
  if (existing.length === 0) {
    await db.insert(blocksTable).values({ userId, blockedId });
    await db.insert(activityLogsTable).values({ userId, action: "block", metadata: String(blockedId) });
  }
  res.json({ success: true });
});

router.post("/users/:userId/unblock", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const blockedId = parseInt(raw, 10);
  const userId = (req as any).userId;
  await db.delete(blocksTable).where(and(eq(blocksTable.userId, userId), eq(blocksTable.blockedId, blockedId)));
  res.json({ success: true });
});

router.get("/users/me/blocked", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const blocks = await db.select().from(blocksTable).where(eq(blocksTable.userId, userId));
  const users = await Promise.all(blocks.map(async (b) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, b.blockedId));
    if (!user) return null;
    return buildUserProfile(user);
  }));
  res.json({ users: users.filter(Boolean), total: users.length, page: 1 });
});

router.post("/users/:userId/restrict", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const restrictedId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const existing = await db.select().from(restrictsTable).where(and(eq(restrictsTable.userId, userId), eq(restrictsTable.restrictedId, restrictedId)));
  if (existing.length === 0) {
    await db.insert(restrictsTable).values({ userId, restrictedId });
    await db.insert(activityLogsTable).values({ userId, action: "restrict", metadata: String(restrictedId) });
  }
  res.json({ success: true });
});

router.post("/users/:userId/unrestrict", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const restrictedId = parseInt(raw, 10);
  const userId = (req as any).userId;
  await db.delete(restrictsTable).where(and(eq(restrictsTable.userId, userId), eq(restrictsTable.restrictedId, restrictedId)));
  res.json({ success: true });
});

router.get("/users/me/restricted", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const restricts = await db.select().from(restrictsTable).where(eq(restrictsTable.userId, userId));
  const users = await Promise.all(restricts.map(async (r) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.restrictedId));
    if (!user) return null;
    return buildUserProfile(user);
  }));
  res.json({ users: users.filter(Boolean), total: users.length, page: 1 });
});

router.get("/users/follow-requests", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const pending = await db.select().from(followsTable).where(and(eq(followsTable.followingId, userId), eq(followsTable.status, "pending")));
  const users = await Promise.all(pending.map(async (f) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, f.followerId));
    if (!user) return null;
    return buildUserProfile(user);
  }));
  res.json({ users: users.filter(Boolean), total: users.length, page: 1 });
});

router.post("/users/follow-requests/:requesterId/accept", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.requesterId) ? req.params.requesterId[0] : req.params.requesterId;
  const requesterId = parseInt(raw, 10);
  const userId = (req as any).userId;
  await db.update(followsTable).set({ status: "approved" }).where(and(eq(followsTable.followerId, requesterId), eq(followsTable.followingId, userId)));
  const follower = await db.select().from(usersTable).where(eq(usersTable.id, requesterId));
  if (follower.length > 0) {
    await db.insert(notificationsTable).values({
      userId: requesterId, actorId: userId, type: "follow_accepted",
      title: "Follow request accepted", body: `Your follow request was accepted`,
      relatedId: userId, relatedType: "user",
    });
  }
  res.json({ success: true });
});

router.post("/users/follow-requests/:requesterId/reject", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.requesterId) ? req.params.requesterId[0] : req.params.requesterId;
  const requesterId = parseInt(raw, 10);
  const userId = (req as any).userId;
  await db.update(followsTable).set({ status: "rejected" }).where(and(eq(followsTable.followerId, requesterId), eq(followsTable.followingId, userId)));
  res.json({ success: true });
});

router.get("/users/me/activity-log", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const { activityLogsTable } = await import("@workspace/db");
  const activities = await db.select().from(activityLogsTable).where(eq(activityLogsTable.userId, userId)).orderBy(activityLogsTable.createdAt);
  res.json({ activities, total: activities.length, page });
});

router.get("/users/me/reach", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const { postsTable, likesTable, commentsTable, sharesTable } = await import("@workspace/db");
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, userId));
  const totalViews = posts.reduce((s, p) => s + p.viewsCount, 0);
  const totalLikes = posts.reduce((s, p) => s + p.likesCount, 0);
  const totalComments = posts.reduce((s, p) => s + p.commentsCount, 0);
  const totalShares = posts.reduce((s, p) => s + p.sharesCount, 0);
  const totalDownloads = posts.reduce((s, p) => s + p.downloadsCount, 0);
  const bestPost = posts.sort((a, b) => b.likesCount - a.likesCount)[0] ?? null;
  res.json({ totalViews, totalLikes, totalComments, totalShares, totalDownloads, bestPost });
});

export default router;
