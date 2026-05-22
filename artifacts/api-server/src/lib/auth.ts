import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "ai-pop-cute-secret-key";
const JWT_EXPIRES_IN = "30d";

export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
