import { Router, type IRouter, type Request, type Response } from "express";
import { db, votesTable, usersTable, notificationsTable, activityLogsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const MILESTONES = [100, 500, 1000, 5000, 10000];

function getMilestoneLabel(votes: number): string {
  if (votes >= 10000) return "10K Milestone";
  if (votes >= 5000) return "5K Milestone";
  if (votes >= 1000) return "1K Milestone";
  if (votes >= 500) return "500 Club";
  if (votes >= 100) return "Century Mark";
  return "Getting Started";
}

async function getCreator() {
  const [creator] = await db.select().from(usersTable).where(eq(usersTable.role, "creator"));
  return creator;
}

router.post("/votes/cast", requireAuth, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const today = new Date().toISOString().split("T")[0];
  const existing = await db.select().from(votesTable).where(and(eq(votesTable.voterId, userId), eq(votesTable.voteDate, today)));
  if (existing.length > 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const allVotes = await db.select().from(votesTable);
    res.json({
      success: false,
      message: "You have already voted today. Next vote available in " + Math.ceil((tomorrow.getTime() - Date.now()) / 3600000) + " hours.",
      totalVotes: allVotes.length,
      alreadyVoted: true,
      nextVoteAt: tomorrow.toISOString(),
    });
    return;
  }
  await db.insert(votesTable).values({ voterId: userId, voteDate: today });
  await db.insert(activityLogsTable).values({ userId, action: "vote_given" });
  const allVotes = await db.select().from(votesTable);
  const totalVotes = allVotes.length;
  // Notify creator
  const creator = await getCreator();
  if (creator) {
    const voter = (req as any).user;
    await db.insert(notificationsTable).values({
      userId: creator.id, actorId: userId, type: "new_vote",
      title: "New cheer vote!", body: `${voter.name} cheered for you!`,
      relatedId: userId, relatedType: "user",
    });
  }
  res.json({
    success: true,
    message: "Your cheer has been counted!",
    totalVotes,
    alreadyVoted: false,
    nextVoteAt: null,
  });
});

router.get("/votes/stats", optionalAuth, async (req: Request, res: Response)=> {
  const creator = await getCreator();
  const goalVotes = creator?.goalVotes ?? 10000;
  const allVotes = await db.select().from(votesTable);
  const totalVotes = allVotes.length;
  const today = new Date().toISOString().split("T")[0];
  const todayVotes = allVotes.filter((v) => v.voteDate === today).length;
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split("T")[0];
  const weeklyVotes = allVotes.filter((v) => v.voteDate >= weekAgo).length;
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
  const monthlyVotes = allVotes.filter((v) => v.voteDate >= monthAgo).length;
  const milestones = MILESTONES.map((m) => ({ votes: m, label: getMilestoneLabel(m), achieved: totalVotes >= m }));
  const nextMilestone = milestones.find((m) => !m.achieved) ?? milestones[milestones.length - 1];
  const percentage = goalVotes > 0 ? Math.min(100, (totalVotes / goalVotes) * 100) : 0;
  res.json({ totalVotes, goalVotes, percentage, todayVotes, weeklyVotes, monthlyVotes, milestones, nextMilestone });
});

router.get("/votes/my-status", requireAuth, async (req: Request, res: Response)=> {
  const userId = (req as any).userId;
  const today = new Date().toISOString().split("T")[0];
  const todayVote = await db.select().from(votesTable).where(and(eq(votesTable.voterId, userId), eq(votesTable.voteDate, today)));
  const hasVotedToday = todayVote.length > 0;
  const userVotes = await db.select().from(votesTable).where(eq(votesTable.voterId, userId));
  let nextVoteAt = null;
  if (hasVotedToday) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    nextVoteAt = tomorrow.toISOString();
  }
  res.json({ hasVotedToday, nextVoteAt, totalUserVotes: userVotes.length });
});

router.get("/votes/supporters", optionalAuth, async (req: Request, res: Response)=> {
  const limit = parseInt(String(req.query.limit ?? "10"), 10);
  const allVotes = await db.select().from(votesTable);
  const voteCounts = new Map<number, number>();
  for (const v of allVotes) {
    voteCounts.set(v.voterId, (voteCounts.get(v.voterId) ?? 0) + 1);
  }
  const sorted = [...voteCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const supporters = await Promise.all(sorted.map(async ([userId, voteCount]) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return null;
    return { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl, isVerified: user.isVerified, voteCount };
  }));
  res.json({ supporters: supporters.filter(Boolean) });
});

export default router;
