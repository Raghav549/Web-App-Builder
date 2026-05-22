import { Router, type IRouter } from "express";
import { db, notificationsTable, usersTable, followsTable, postsTable, likesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

async function buildUserProfile(user: typeof usersTable.$inferSelect) {
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

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const filter = String(req.query.filter ?? "all");
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const all = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)).orderBy(desc(notificationsTable.createdAt));
  let filtered = all;
  if (filter === "unread") filtered = all.filter((n) => !n.isRead);
  else if (filter === "mentions") filtered = all.filter((n) => n.type === "mention");
  else if (filter === "messages") filtered = all.filter((n) => n.type === "new_message");
  else if (filter === "activity") filtered = all.filter((n) => ["new_like", "new_comment", "new_reply", "post_shared"].includes(n.type));
  const enriched = await Promise.all(filtered.map(async (n) => {
    let actor = null;
    if (n.actorId) {
      const [actorUser] = await db.select().from(usersTable).where(eq(usersTable.id, n.actorId));
      if (actorUser) actor = await buildUserProfile(actorUser);
    }
    return { ...n, actor };
  }));
  const unreadCount = all.filter((n) => !n.isRead).length;
  res.json({ notifications: enriched, total: filtered.length, page, unreadCount });
});

router.post("/notifications/mark-all-read", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  res.json({ success: true });
});

router.post("/notifications/:notificationId/read", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;
  const notificationId = parseInt(raw, 10);
  const userId = (req as any).userId;
  await db.update(notificationsTable).set({ isRead: true }).where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)));
  res.json({ success: true });
});

router.delete("/notifications/:notificationId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;
  const notificationId = parseInt(raw, 10);
  const userId = (req as any).userId;
  await db.delete(notificationsTable).where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)));
  res.sendStatus(204);
});

router.get("/notifications/unread-count", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const unread = await db.select().from(notificationsTable).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
  res.json({ count: unread.length });
});

export default router;
