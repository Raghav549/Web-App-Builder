import { Router, type IRouter, type Request, type Response } from "express";
import { db, conversationsTable, conversationParticipantsTable, messagesTable, usersTable, notificationsTable, followsTable, postsTable, likesTable } from "@workspace/db";
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

async function enrichConversation(conv: typeof conversationsTable.$inferSelect, viewerId: number) {
  const participants = await db.select().from(conversationParticipantsTable).where(eq(conversationParticipantsTable.conversationId, conv.id));
  const participantProfiles = await Promise.all(participants.map(async (p) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, p.userId));
    if (!user) return null;
    return buildUserProfile(user);
  }));
  const [lastMsg] = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conv.id)).orderBy(desc(messagesTable.createdAt));
  let lastMessage = null;
  if (lastMsg) {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, lastMsg.senderId));
    const senderProfile = sender ? await buildUserProfile(sender) : null;
    lastMessage = { ...lastMsg, sender: senderProfile };
  }
  const unreadCount = await db.select().from(messagesTable).where(and(eq(messagesTable.conversationId, conv.id), eq(messagesTable.isSeen, false))).then((msgs) => msgs.filter((m) => m.senderId !== viewerId).length);
  return {
    ...conv,
    participants: participantProfiles.filter(Boolean),
    lastMessage,
    unreadCount,
  };
}

router.get("/conversations", requireAuth, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const myConvs = await db.select().from(conversationParticipantsTable).where(eq(conversationParticipantsTable.userId, userId));
  const conversations = await Promise.all(myConvs.map(async (p) => {
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, p.conversationId));
    if (!conv) return null;
    return enrichConversation(conv, userId);
  }));
  const filtered = conversations.filter(Boolean);
  filtered.sort((a: any, b: any) => {
    const aTime = a?.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b?.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });
  res.json({ conversations: filtered });
});

router.post("/conversations", requireAuth, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const { participantId } = req.body;
  if (!participantId) {
    res.status(400).json({ error: "Participant ID required" });
    return;
  }
  // Check if conversation already exists
  const myConvs = await db.select().from(conversationParticipantsTable).where(eq(conversationParticipantsTable.userId, userId));
  for (const cp of myConvs) {
    const otherParticipants = await db.select().from(conversationParticipantsTable).where(and(eq(conversationParticipantsTable.conversationId, cp.conversationId), eq(conversationParticipantsTable.userId, participantId)));
    if (otherParticipants.length > 0) {
      const [conv] = await db.select().from(conversationsTable).where(and(eq(conversationsTable.id, cp.conversationId), eq(conversationsTable.isGroup, false)));
      if (conv) {
        res.json(await enrichConversation(conv, userId));
        return;
      }
    }
  }
  const [conv] = await db.insert(conversationsTable).values({ isGroup: false, createdById: userId }).returning();
  await db.insert(conversationParticipantsTable).values({ conversationId: conv.id, userId });
  await db.insert(conversationParticipantsTable).values({ conversationId: conv.id, userId: participantId });
  res.status(201).json(await enrichConversation(conv, userId));
});

router.get("/conversations/:conversationId", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const conversationId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, conversationId));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json(await enrichConversation(conv, userId));
});

router.get("/conversations/:conversationId/messages", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const conversationId = parseInt(raw, 10);
  const msgs = await db.select().from(messagesTable).where(and(eq(messagesTable.conversationId, conversationId), eq(messagesTable.deletedForEveryone, false))).orderBy(messagesTable.createdAt);
  const enriched = await Promise.all(msgs.map(async (msg) => {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, msg.senderId));
    const senderProfile = sender ? await buildUserProfile(sender) : null;
    return { ...msg, sender: senderProfile };
  }));
  res.json({ messages: enriched, total: enriched.length, page: 1 });
});

router.post("/conversations/:conversationId/messages", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const conversationId = parseInt(raw, 10);
  const userId = (req as any).userId;
  const { content, mediaUrl, replyToId } = req.body;
  if (!content) {
    res.status(400).json({ error: "Content required" });
    return;
  }
  const [msg] = await db.insert(messagesTable).values({
    conversationId, senderId: userId, content, mediaUrl: mediaUrl ?? null, replyToId: replyToId ?? null,
  }).returning();
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const senderProfile = sender ? await buildUserProfile(sender) : null;
  // Notify other participants
  const participants = await db.select().from(conversationParticipantsTable).where(eq(conversationParticipantsTable.conversationId, conversationId));
  for (const p of participants) {
    if (p.userId !== userId) {
      await db.insert(notificationsTable).values({
        userId: p.userId, actorId: userId, type: "new_message",
        title: "New message", body: `${sender?.name ?? "Someone"}: ${content.slice(0, 50)}`,
        relatedId: conversationId, relatedType: "conversation",
      });
    }
  }
  res.status(201).json({ ...msg, sender: senderProfile });
});

router.post("/conversations/:conversationId/seen", requireAuth, async (req: Request, res: Response)=> {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const conversationId = parseInt(raw, 10);
  const userId = (req as any).userId;
  await db.update(messagesTable).set({ isSeen: true }).where(and(eq(messagesTable.conversationId, conversationId)));
  res.json({ success: true });
});

router.post("/conversations/group", requireAuth, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const { groupName, groupAvatarUrl, memberIds } = req.body;
  if (!groupName || !memberIds?.length) {
    res.status(400).json({ error: "Group name and members required" });
    return;
  }
  const [conv] = await db.insert(conversationsTable).values({ isGroup: true, groupName, groupAvatarUrl: groupAvatarUrl ?? null, createdById: userId }).returning();
  await db.insert(conversationParticipantsTable).values({ conversationId: conv.id, userId, isAdmin: true });
  for (const memberId of memberIds) {
    await db.insert(conversationParticipantsTable).values({ conversationId: conv.id, userId: memberId });
  }
  res.status(201).json(await enrichConversation(conv, userId));
});

export default router;
