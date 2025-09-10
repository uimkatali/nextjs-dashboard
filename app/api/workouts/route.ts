import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
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
    const { exercises } = await request.json();

    // Create workout
    const workout = await query<{ id: number }>(
      "INSERT INTO workouts (user_id, name, started_at, completed_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id",
      [userId, `Workout ${new Date().toLocaleDateString()}`]
    );

    const workoutId = workout.rows[0].id;

    // Add exercises and sets
    for (const exercise of exercises) {
      // Get or create exercise
      let exerciseRecord = await query<{ id: number }>(
        "SELECT id FROM exercises WHERE name = $1",
        [exercise.name]
      );

      if (exerciseRecord.rowCount === 0) {
        exerciseRecord = await query<{ id: number }>(
          "INSERT INTO exercises (name, category, muscle_groups, is_custom) VALUES ($1, $2, $3, true) RETURNING id",
          [exercise.name, "Custom", []]
        );
      }

      const exerciseId = exerciseRecord.rows[0].id;

      // Create workout exercise
      const workoutExercise = await query<{ id: number }>(
        "INSERT INTO workout_exercises (workout_id, exercise_id, target_sets) VALUES ($1, $2, $3) RETURNING id",
        [workoutId, exerciseId, exercise.targetSets]
      );

      const workoutExerciseId = workoutExercise.rows[0].id;

      // Create sets
      for (let i = 0; i < exercise.sets.length; i++) {
        const set = exercise.sets[i];
        await query(
          "INSERT INTO workout_sets (workout_exercise_id, set_number, weight, reps, completed, completed_at) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            workoutExerciseId,
            i + 1,
            set.weight,
            set.reps,
            set.completed,
            set.completed ? new Date() : null,
          ]
        );
      }
    }

    // Update user stats
    await query(
      "UPDATE user_profiles SET total_workouts = total_workouts + 1, current_streak = current_streak + 1, updated_at = NOW() WHERE user_id = $1",
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: "Workout saved successfully",
    });
  } catch (error) {
    console.error("Workout save error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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

    // Get recent workouts
    const workouts = await query<{
      id: number;
      name: string;
      started_at: string;
      completed_at: string;
      duration_minutes: number;
    }>(
      "SELECT id, name, started_at, completed_at, duration_minutes FROM workouts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: workouts.rows,
    });
  } catch (error) {
    console.error("Workouts fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
