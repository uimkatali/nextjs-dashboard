import jwt from "jsonwebtoken";

const JWT_SECRET: jwt.Secret =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || 7;

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  static sign(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as number,
    });
  }

  static verify(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return null;
    }
  }
}
