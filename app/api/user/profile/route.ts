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

    // Get user basic info
    const user = await query<{ full_name: string; email: string }>(
      "SELECT full_name, email FROM users WHERE id = $1",
      [userId]
    );

    // Get or create user profile
    let profile = await query<{
      current_weight: number;
      goal_weight: number;
      weekly_goal: number;
      current_streak: number;
      total_workouts: number;
    }>(
      "SELECT current_weight, goal_weight, weekly_goal, current_streak, total_workouts FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (profile.rowCount === 0) {
      // Create default profile with race condition protection
      try {
        await query(
          "INSERT INTO user_profiles (user_id, current_weight, goal_weight, weekly_goal, current_streak, total_workouts) VALUES ($1, 70, 75, 4, 0, 0) ON CONFLICT (user_id) DO NOTHING",
          [userId]
        );
      } catch (error) {
        // Ignore duplicate key errors - profile might have been created by another request
        console.log("Profile creation conflict handled:", error);
      }

      // Re-fetch profile (either newly created or existing)
      profile = await query<{
        current_weight: number;
        goal_weight: number;
        weekly_goal: number;
        current_streak: number;
        total_workouts: number;
      }>(
        "SELECT current_weight, goal_weight, weekly_goal, current_streak, total_workouts FROM user_profiles WHERE user_id = $1",
        [userId]
      );
    }

    const userData = user.rows[0];
    const profileData = profile.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        name: userData.full_name,
        email: userData.email,
        currentWeight: profileData.current_weight,
        goalWeight: profileData.goal_weight,
        weeklyGoal: profileData.weekly_goal,
        currentStreak: profileData.current_streak,
        totalWorkouts: profileData.total_workouts,
        completedWorkouts: 0, // This week's completed workouts - would need separate query
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const { currentWeight, goalWeight, weeklyGoal } = await request.json();

    // Get current values before updating (or create profile if it doesn't exist)
    let currentProfile = await query<{
      current_weight: number | null;
      goal_weight: number | null;
    }>(
      "SELECT current_weight, goal_weight FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    // If profile doesn't exist, create it first
    if (currentProfile.rowCount === 0) {
      await query(
        "INSERT INTO user_profiles (user_id, current_weight, goal_weight, weekly_goal) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING",
        [userId, currentWeight, goalWeight, weeklyGoal]
      );
      // Re-fetch to get the created profile
      currentProfile = await query<{
        current_weight: number | null;
        goal_weight: number | null;
      }>(
        "SELECT current_weight, goal_weight FROM user_profiles WHERE user_id = $1",
        [userId]
      );
    }

    const oldCurrentWeight = currentProfile.rows[0]?.current_weight;
    const oldGoalWeight = currentProfile.rows[0]?.goal_weight;

    // Update profile (userId always comes from validated session, never from request)
    await query(
      "UPDATE user_profiles SET current_weight = $1, goal_weight = $2, weekly_goal = $3, updated_at = NOW() WHERE user_id = $4",
      [currentWeight, goalWeight, weeklyGoal, userId]
    );

    // Log weight changes to history if values changed
    if (oldCurrentWeight !== currentWeight) {
      await query(
        `INSERT INTO weight_history (user_id, weight_type, old_value, new_value, changed_at) 
         VALUES ($1, 'current_weight', $2, $3, NOW())`,
        [userId, oldCurrentWeight, currentWeight]
      );
    }

    if (oldGoalWeight !== goalWeight) {
      await query(
        `INSERT INTO weight_history (user_id, weight_type, old_value, new_value, changed_at) 
         VALUES ($1, 'goal_weight', $2, $3, NOW())`,
        [userId, oldGoalWeight, goalWeight]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
