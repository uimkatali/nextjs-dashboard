import { NextResponse } from "next/server";
import { healthCheck, getPoolStats } from "@/app/lib/db";

export async function GET() {
  try {
    const isHealthy = await healthCheck();
    const poolStats = getPoolStats();

    if (!isHealthy) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: false,
          poolStats,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      database: true,
      poolStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
