import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET() {
  try {
    // Create users table (base table that others reference)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create index for email lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    // Create sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create index for session token lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)
    `);

    // Create signup_logs table (used by signup route)
    await query(`
      CREATE TABLE IF NOT EXISTS signup_logs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        success BOOLEAN NOT NULL,
        attempt_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ip_address VARCHAR(45),
        error_message TEXT,
        user_agent TEXT
      )
    `);

    // Create user profiles table
    await query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_weight DECIMAL(5,2),
        goal_weight DECIMAL(5,2),
        weekly_goal INT DEFAULT 4,
        current_streak INT DEFAULT 0,
        total_workouts INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create unique index to ensure one profile per user
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)
    `);

    // Create exercises table
    await query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        muscle_groups TEXT[],
        is_custom BOOLEAN DEFAULT FALSE,
        created_by_user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create workouts table
    await query(`
      CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        duration_minutes INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create workout_exercises table
    await query(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id SERIAL PRIMARY KEY,
        workout_id INT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
        exercise_id INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        target_sets INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create workout_sets table
    await query(`
      CREATE TABLE IF NOT EXISTS workout_sets (
        id SERIAL PRIMARY KEY,
        workout_exercise_id INT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
        set_number INT NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        reps INT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Insert default exercises
    await query(`
      INSERT INTO exercises (name, category, muscle_groups) VALUES
      ('Bench Press', 'Chest', ARRAY['chest', 'triceps', 'shoulders']),
      ('Squat', 'Legs', ARRAY['quadriceps', 'glutes', 'hamstrings']),
      ('Deadlift', 'Back', ARRAY['back', 'glutes', 'hamstrings']),
      ('Overhead Press', 'Shoulders', ARRAY['shoulders', 'triceps']),
      ('Barbell Row', 'Back', ARRAY['back', 'biceps']),
      ('Pull-ups', 'Back', ARRAY['back', 'biceps']),
      ('Dips', 'Chest', ARRAY['chest', 'triceps']),
      ('Bicep Curls', 'Arms', ARRAY['biceps'])
      ON CONFLICT DO NOTHING
    `);

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
      tables_created: [
        "users",
        "sessions",
        "signup_logs",
        "user_profiles",
        "exercises",
        "workouts",
        "workout_exercises",
        "workout_sets",
      ],
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Migration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
