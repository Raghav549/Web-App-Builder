import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, postsTable, votesTable, followsTable, likesTable, commentsTable, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireCreator } from "../middlewares/requireAuth";

const router: IRouter = Router();

async function buildUserProfile(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, ...base } = user;
  const followers = await db.select().from(followsTable).where(and(eq(followsTable.followingId, user.id), eq(followsTable.status, "approved")));
  const following = await db.select().from(followsTable).where(and(eq(followsTable.followerId, user.id), eq(followsTable.status, "approved")));
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, user.id));
  const userLikes = await db.select().from(likesTable).where(eq(likesTable.userId, user.id));
  return {
    ...base,
    followersCount: followers.length,
    followingCount: following.length,
    postsCount: posts.length,
    likesCount: userLikes.length,
    totalVotes: 0,
    profileViews: 0,
    isFollowing: null,
    isFollowRequestSent: null,
    isBlocked: null,
  };
}

async function getCreator() {
  const [creator] = await db.select().from(usersTable).where(eq(usersTable.role, "creator"));
  return creator;
}

router.get("/creator/stats", requireAuth, requireCreator, async (req: Request, res: Response)=> {
  const creator = await getCreator();
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  const allVotes = await db.select().from(votesTable);
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
  const todayVotes = allVotes.filter((v) => v.voteDate === today).length;
  const weeklyVotes = allVotes.filter((v) => v.voteDate >= weekAgo).length;
  const monthlyVotes = allVotes.filter((v) => v.voteDate >= monthAgo).length;
  const followers = await db.select().from(followsTable).where(and(eq(followsTable.followingId, creator.id), eq(followsTable.status, "approved")));
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, creator.id));
  const totalPostViews = posts.reduce((s, p) => s + p.viewsCount, 0);
  const totalPostLikes = posts.reduce((s, p) => s + p.likesCount, 0);
  const engagementRate = posts.length > 0 ? totalPostLikes / Math.max(1, totalPostViews) * 100 : 0;
  res.json({
    totalVotes: allVotes.length,
    todayVotes,
    weeklyVotes,
    monthlyVotes,
    profileViews: 0,
    postViews: totalPostViews,
    newFollowers: followers.length,
    engagementRate: Math.round(engagementRate * 100) / 100,
    goalVotes: creator.goalVotes,
  });
});

router.get("/creator/analytics", requireAuth, requireCreator, async (req: Request, res: Response)=> {
  const creator = await getCreator();
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, creator.id)).orderBy(desc(postsTable.likesCount));
  const topPosts = await Promise.all(posts.slice(0, 5).map(async (post) => {
    const authorProfile = await buildUserProfile(creator);
    return { ...post, author: authorProfile, isLiked: null, isSaved: null };
  }));
  // Generate fake daily metrics for the last 7 days
  const profileViewsHistory = [];
  const postViewsHistory = [];
  const followerGrowth = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().split("T")[0];
    profileViewsHistory.push({ date, value: Math.floor(Math.random() * 50) + 10 });
    postViewsHistory.push({ date, value: Math.floor(Math.random() * 200) + 50 });
    followerGrowth.push({ date, value: Math.floor(Math.random() * 10) + 1 });
  }
  res.json({ profileViewsHistory, postViewsHistory, followerGrowth, topPosts });
});

router.get("/creator/vote-analytics", requireAuth, requireCreator, async (req: Request, res: Response)=> {
  const allVotes = await db.select().from(votesTable).orderBy(votesTable.createdAt);
  // Group by day
  const dayMap = new Map<string, number>();
  for (const v of allVotes) {
    dayMap.set(v.voteDate, (dayMap.get(v.voteDate) ?? 0) + 1);
  }
  const votesHistory = [...dayMap.entries()].slice(-30).map(([date, value]) => ({ date, value }));
  // Recent voters
  const voteCounts = new Map<number, number>();
  for (const v of allVotes) {
    voteCounts.set(v.voterId, (voteCounts.get(v.voterId) ?? 0) + 1);
  }
  const sorted = [...voteCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const recentVoters = await Promise.all(sorted.map(async ([userId, voteCount]) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return null;
    return { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl, isVerified: user.isVerified, voteCount };
  }));
  res.json({ votesHistory, recentVoters: recentVoters.filter(Boolean) });
});

router.get("/creator/supporters", requireAuth, requireCreator, async (req: Request, res: Response)=> {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const allVotes = await db.select().from(votesTable);
  const voteCounts = new Map<number, number>();
  for (const v of allVotes) {
    voteCounts.set(v.voterId, (voteCounts.get(v.voterId) ?? 0) + 1);
  }
  const sorted = [...voteCounts.entries()].sort((a, b) => b[1] - a[1]);
  const supporters = await Promise.all(sorted.map(async ([userId, voteCount]) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return null;
    return { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl, isVerified: user.isVerified, voteCount };
  }));
  const filtered = supporters.filter(Boolean);
  res.json({ supporters: filtered, total: filtered.length, page });
});

router.patch("/creator/goal", requireAuth, requireCreator, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const { goalVotes } = req.body;
  if (!goalVotes || goalVotes < 1) {
    res.status(400).json({ error: "Invalid goal" });
    return;
  }
  await db.update(usersTable).set({ goalVotes }).where(eq(usersTable.id, userId));
  res.json({ goalVotes });
});

router.get("/creator/posts", requireAuth, requireCreator, async (req: Request, res: Response)=> {
  const creator = await getCreator();
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, creator.id)).orderBy(desc(postsTable.createdAt));
  const authorProfile = await buildUserProfile(creator);
  const enriched = posts.map((post) => ({ ...post, author: authorProfile, isLiked: null, isSaved: null }));
  res.json({ posts: enriched, total: enriched.length, page, hasMore: false });
});

router.get("/creator/comments", requireAuth, requireCreator, async (req: Request, res: Response)=> {
  const creator = await getCreator();
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const creatorPosts = await db.select().from(postsTable).where(eq(postsTable.authorId, creator.id));
  const postIds = creatorPosts.map((p) => p.id);
  let allComments: any[] = [];
  for (const postId of postIds) {
    const comments = await db.select().from(commentsTable).where(eq(commentsTable.postId, postId)).orderBy(desc(commentsTable.createdAt));
    const enriched = await Promise.all(comments.map(async (c) => {
      const [author] = await db.select().from(usersTable).where(eq(usersTable.id, c.authorId));
      const authorProfile = author ? await buildUserProfile(author) : null;
      return { ...c, author: authorProfile, replies: [] };
    }));
    allComments = allComments.concat(enriched);
  }
  res.json({ comments: allComments, total: allComments.length, page });
});

export default router;
