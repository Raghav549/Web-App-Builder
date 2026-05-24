import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, postsTable, likesTable, followsTable } from "@workspace/db";
import { like, eq, and, or, ilike } from "drizzle-orm";
import { optionalAuth } from "../middlewares/requireAuth";

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

router.get("/search", optionalAuth, async (req: Request, res: Response)=> {
  const q = String(req.query.q ?? "").trim();
  const type = String(req.query.type ?? "all");
  if (!q) {
    res.json({ users: [], posts: [], hashtags: [], total: 0 });
    return;
  }
  const pattern = `%${q}%`;
  let users: any[] = [], posts: any[] = [], hashtags: any[] = [];
  if (type === "all" || type === "users") {
    const found = await db.select().from(usersTable).where(
      or(ilike(usersTable.name, pattern), ilike(usersTable.username, pattern))
    );
    users = await Promise.all(found.map((u) => buildUserProfile(u)));
  }
  if (type === "all" || type === "posts") {
    const found = await db.select().from(postsTable).where(and(ilike(postsTable.caption, pattern), eq(postsTable.visibility, "public")));
    const enriched = await Promise.all(found.map(async (post) => {
      const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
      const authorProfile = author ? await buildUserProfile(author) : null;
      return { ...post, author: authorProfile, isLiked: null, isSaved: null };
    }));
    posts = enriched;
  }
  if (type === "all" || type === "hashtags") {
    const allPosts = await db.select({ caption: postsTable.caption }).from(postsTable).where(ilike(postsTable.caption, `%#${q}%`));
    const tagCounts = new Map<string, number>();
    for (const p of allPosts) {
      if (!p.caption) continue;
      const tags = p.caption.match(/#\w+/g) ?? [];
      for (const tag of tags) {
        if (tag.toLowerCase().includes(q.toLowerCase())) {
          tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) ?? 0) + 1);
        }
      }
    }
    hashtags = [...tagCounts.entries()].map(([tag, postsCount]) => ({ tag, postsCount }));
  }
  res.json({ users, posts, hashtags, total: users.length + posts.length + hashtags.length });
});

router.get("/search/trending", async (_req: Request, res: Response)=> {
  const allPosts = await db.select({ caption: postsTable.caption }).from(postsTable);
  const tagCounts = new Map<string, number>();
  for (const p of allPosts) {
    if (!p.caption) continue;
    const tags = p.caption.match(/#\w+/g) ?? [];
    for (const tag of tags) {
      tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) ?? 0) + 1);
    }
  }
  const sorted = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, postsCount]) => ({ tag, postsCount }));
  // Add default trending if none
  if (sorted.length === 0) {
    res.json({ hashtags: [
      { tag: "#aipopgirl", postsCount: 0 },
      { tag: "#cutecontest", postsCount: 0 },
      { tag: "#popidol", postsCount: 0 },
      { tag: "#cheerai", postsCount: 0 },
    ]});
    return;
  }
  res.json({ hashtags: sorted });
});

export default router;
