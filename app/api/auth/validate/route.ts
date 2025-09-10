import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const session = await query<{ user_id: number }>(
      "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [token]
    );

    if (session.rowCount === 0) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      userId: session.rows[0].user_id,
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
