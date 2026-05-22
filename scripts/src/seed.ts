import bcrypt from "bcryptjs";
import { db, usersTable, postsTable, votesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Upsert Ai (creator account)
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, "aipopgirl@demo.com"));
  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash("ai123456789", 10);
    await db.insert(usersTable).values({
      numericId: 18641424,
      name: "Ai",
      username: "aipopgirl",
      email: "aipopgirl@demo.com",
      passwordHash,
      bio: "Hi! I'm Ai — a cheerful pop girl who loves music, cute things, and you! Vote for me in the contest and let's reach the stars together!",
      alternateBio: "Pop idol contestant | MixChannel 18641424 | Let's make music and memories together!",
      avatarUrl: null,
      coverUrl: null,
      isVerified: true,
      role: "creator",
      isPrivate: false,
      mixChannelId: "18641424",
      goalVotes: 10000,
    });
    console.log("Created Ai creator account");
  } else {
    console.log("Ai creator account already exists");
  }

  // Seed some demo users
  const demoUsers = [
    { name: "Sakura Fan", username: "sakurafan", email: "sakura@demo.com" },
    { name: "MixPop Star", username: "mixpopstar", email: "mixpop@demo.com" },
    { name: "CuteVoter88", username: "cutevoter88", email: "cute88@demo.com" },
    { name: "YellowHeart", username: "yellowheart", email: "yellow@demo.com" },
    { name: "AiSupporter1", username: "aisupporter1", email: "supporter1@demo.com" },
  ];

  for (const u of demoUsers) {
    const ex = await db.select().from(usersTable).where(eq(usersTable.email, u.email));
    if (ex.length === 0) {
      const passwordHash = await bcrypt.hash("demo123456", 10);
      const maxNumericId = await db.select({ numericId: usersTable.numericId }).from(usersTable).orderBy(usersTable.numericId);
      const nextId = maxNumericId.length > 0 ? Math.max(...maxNumericId.map(r => r.numericId)) + 1 : 100001;
      await db.insert(usersTable).values({
        numericId: nextId,
        name: u.name,
        username: u.username,
        email: u.email,
        passwordHash,
        isVerified: true,
        role: "user",
      });
      console.log(`Created demo user: ${u.username}`);
    }
  }

  // Seed some votes for Ai
  const [creator] = await db.select().from(usersTable).where(eq(usersTable.role, "creator"));
  const allUsers = await db.select().from(usersTable).where(eq(usersTable.role, "user"));
  if (creator && allUsers.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    for (const user of allUsers) {
      const voteEx = await db.select().from(votesTable).where(eq(votesTable.voterId, user.id));
      if (voteEx.length === 0) {
        // Seed a few historical votes
        for (let i = 1; i <= 3; i++) {
          const voteDate = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().split("T")[0];
          const ex = await db.select().from(votesTable).where(eq(votesTable.voterId, user.id));
          const alreadyVotedDate = ex.find(v => v.voteDate === voteDate);
          if (!alreadyVotedDate) {
            await db.insert(votesTable).values({ voterId: user.id, voteDate });
          }
        }
        console.log(`Seeded votes for user: ${user.username}`);
      }
    }
  }

  // Seed some demo posts for Ai
  if (creator) {
    const existingPosts = await db.select().from(postsTable).where(eq(postsTable.authorId, creator.id));
    if (existingPosts.length === 0) {
      const demoPosts = [
        { caption: "Thank you all for the amazing support! Every vote means the world to me! #aipopgirl #cutecontest #cheerai", isPinned: true },
        { caption: "Practicing for my next performance! Can't wait to share it with everyone! #music #popidol", isPinned: false },
        { caption: "Good morning! Starting the day with a smile and lots of energy! Vote for me today! #morning #cheerai #aipopgirl", isPinned: false },
        { caption: "Just crossed 100 votes! You all are amazing! Thank you so much #milestone #grateful", isPinned: false },
        { caption: "Having so much fun with the community! Let's keep pushing for the top! #popcontest #aipopgirl", isPinned: false },
      ];
      for (const p of demoPosts) {
        await db.insert(postsTable).values({
          authorId: creator.id,
          caption: p.caption,
          visibility: "public",
          allowComments: true,
          allowDownloads: true,
          isPinned: p.isPinned,
          likesCount: Math.floor(Math.random() * 50) + 5,
          viewsCount: Math.floor(Math.random() * 500) + 100,
          commentsCount: Math.floor(Math.random() * 20) + 2,
        });
      }
      console.log("Seeded demo posts for Ai");
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
