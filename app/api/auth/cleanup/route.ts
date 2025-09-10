import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function POST() {
  try {
    // Delete expired sessions
    const result = await query(
      "DELETE FROM sessions WHERE expires_at <= NOW()"
    );

    const deletedCount = result.rowCount || 0;

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired sessions`,
      deletedSessions: deletedCount,
    });
  } catch (error) {
    console.error("Session cleanup error:", error);
    return NextResponse.json(
      { success: false, message: "Session cleanup failed" },
      { status: 500 }
    );
  }
}

// Also provide a GET endpoint for manual testing
export async function GET() {
  try {
    // Get count of expired sessions
    const result = await query(
      "SELECT COUNT(*) as expired_count FROM sessions WHERE expires_at <= NOW()"
    );

    const expiredCount = result.rows[0]?.expired_count || 0;

    // Get total session count
    const totalResult = await query(
      "SELECT COUNT(*) as total_count FROM sessions"
    );

    const totalCount = totalResult.rows[0]?.total_count || 0;

    return NextResponse.json({
      success: true,
      expiredSessions: parseInt(expiredCount),
      totalSessions: parseInt(totalCount),
      activeSessions: parseInt(totalCount) - parseInt(expiredCount),
    });
  } catch (error) {
    console.error("Session stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get session stats" },
      { status: 500 }
    );
  }
}
