import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";
import { DatabaseInitializer } from "@/app/lib/db-init";

export async function GET() {
  try {
    // Ensure all required tables exist before proceeding
    await DatabaseInitializer.ensureTablesExist();

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const session = await query<{ user_id: number }>(
      "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [token]
    );

    if (session.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const userId = session.rows[0].user_id;

    // Get weight history ordered by most recent first
    const history = await query<{
      id: number;
      weight_type: string;
      old_value: number | null;
      new_value: number;
      changed_at: Date;
    }>(
      `SELECT id, weight_type, old_value, new_value, changed_at 
       FROM weight_history 
       WHERE user_id = $1 
       ORDER BY changed_at DESC 
       LIMIT 100`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: history.rows.map((row) => ({
        id: row.id,
        weightType: row.weight_type,
        oldValue: row.old_value,
        newValue: row.new_value,
        changedAt: row.changed_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Weight history fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
