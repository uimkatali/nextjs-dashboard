// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { DatabaseInitializer } from "@/app/lib/db-init";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // Ensure all required tables exist before proceeding
    await DatabaseInitializer.ensureTablesExist();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Find user
    const userRes = await query<{ id: number; password: string }>(
      "SELECT id, password FROM users WHERE lower(email) = $1",
      [normalizedEmail]
    );

    if (userRes.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session (opaque token)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await query(
      "INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES ($1, $2, $3, NOW())",
      [user.id, token, expiresAt]
    );

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
