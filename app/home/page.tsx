// app/home/page.tsx
import { cookies } from "next/headers";
import { query } from "@/app/lib/db";
import HomePageClient from "./HomePageClient";
import AuthGuard from "./AuthGuard";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return <div>Please log in to access your dashboard.</div>;
  }

  const session = await query<{ user_id: number }>(
    "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()",
    [token]
  );

  if (session.rowCount === 0) {
    return <div>Please log in to access your dashboard.</div>;
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

  const userStats = {
    name: userData.full_name,
    currentWeight: profileData.current_weight,
    goalWeight: profileData.goal_weight,
    weeklyGoal: profileData.weekly_goal,
    completedWorkouts: 0, // This week's completed workouts - would need separate query
    currentStreak: profileData.current_streak,
    totalWorkouts: profileData.total_workouts,
  };

  const handleSaveWorkout = async (workout: any[]) => {
    "use server";
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/workouts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ exercises: workout }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save workout");
      }
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  return (
    <AuthGuard>
      <HomePageClient userStats={userStats} onSaveWorkout={handleSaveWorkout} />
    </AuthGuard>
  );
}
