import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, passwordResetTokensTable, activityLogsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { signToken } from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";
import { randomBytes } from "crypto";

const router: IRouter = Router();

let nextNumericId = 100001;

async function getNextNumericId(): Promise<number> {
  const users = await db.select({ numericId: usersTable.numericId }).from(usersTable).orderBy(usersTable.numericId);
  if (users.length === 0) return nextNumericId;
  return Math.max(...users.map((u) => u.numericId)) + 1;
}

function buildUserResponse(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, ...rest } = user;
  return rest;
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { name, username, email, password, avatarUrl } = req.body;
  if (!name || !username || !email || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const existing = await db.select().from(usersTable).where(or(eq(usersTable.email, email), eq(usersTable.username, username)));
  if (existing.length > 0) {
    if (existing.find((u) => u.email === email)) {
      res.status(400).json({ error: "Email already registered" });
    } else {
      res.status(400).json({ error: "Username already taken" });
    }
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const numericId = await getNextNumericId();
  const [user] = await db.insert(usersTable).values({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
    numericId,
    isVerified: true,
    role: "user",
    avatarUrl: avatarUrl ?? null,
  }).returning();
  await db.insert(activityLogsTable).values({ userId: user.id, action: "signup" });
  const token = signToken(user.id, user.role);
  res.status(201).json({ token, user: buildUserResponse(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    res.status(400).json({ error: "Missing credentials" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(
    or(eq(usersTable.email, identifier.toLowerCase()), eq(usersTable.username, identifier.toLowerCase()))
  );
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  await db.insert(activityLogsTable).values({ userId: user.id, action: "login" });
  const token = signToken(user.id, user.role);
  res.json({ token, user: buildUserResponse(user) });
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  await db.insert(activityLogsTable).values({ userId, action: "logout" });
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  res.json(buildUserResponse(user));
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await db.insert(passwordResetTokensTable).values({ userId: user.id, token, expiresAt });
    req.log.info({ token }, "Password reset token generated (email sending not implemented)");
  }
  res.json({ message: "If that email exists, a reset link has been sent." });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ error: "Token and password required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const [resetToken] = await db.select().from(passwordResetTokensTable).where(eq(passwordResetTokensTable.token, token));
  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, resetToken.userId));
  await db.update(passwordResetTokensTable).set({ used: true }).where(eq(passwordResetTokensTable.id, resetToken.id));
  await db.insert(activityLogsTable).values({ userId: resetToken.userId, action: "password_reset" });
  res.json({ message: "Password reset successfully" });
});

router.post("/auth/change-password", requireAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Both passwords required" });
    return;
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  await db.insert(activityLogsTable).values({ userId: user.id, action: "password_changed" });
  res.json({ message: "Password changed successfully" });
});

export default router;
