import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken } from "../lib/auth";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req.headers.authorization as string | undefined);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  (req as any).user = user;
  (req as any).userId = user.id;
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req.headers.authorization as string | undefined);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
      if (user) {
        (req as any).user = user;
        (req as any).userId = user.id;
      }
    }
  }
  next();
}

export function requireCreator(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  if (!user || user.role !== "creator") {
    res.status(403).json({ error: "Creator access required" });
    return;
  }
  next();
}
