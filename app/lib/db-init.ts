import { query } from "./db";

export class DatabaseInitializer {
  private static initialized = false;

  /**
   * Ensures all required database tables exist
   * This is called automatically by routes that need the tables
   */
  static async ensureTablesExist(): Promise<void> {
    if (this.initialized) {
      return; // Already checked in this process
    }

    try {
      // Check if core tables exist
      const tableChecks = await Promise.all([
        this.tableExists("users"),
        this.tableExists("sessions"),
        this.tableExists("user_profiles"),
        this.tableExists("weight_history"),
      ]);

      const [usersExist, sessionsExist, profilesExist, weightHistoryExist] = tableChecks;

      if (!usersExist || !sessionsExist || !profilesExist || !weightHistoryExist) {
        console.log("Missing required tables, running auto-migration...");
        await this.runMigration();
      }

      this.initialized = true;
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw new Error("Database initialization failed");
    }
  }

  /**
   * Check if a specific table exists
   */
  private static async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `,
        [tableName]
      );

      return result.rows[0]?.exists || false;
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  /**
   * Run the migration by calling the migration endpoint internally
   */
  private static async runMigration(): Promise<void> {
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

      // Create index for session expiration cleanup
      await query(`
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
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

      // Create index for signup logs cleanup and analytics
      await query(`
        CREATE INDEX IF NOT EXISTS idx_signup_logs_attempt_time ON signup_logs(attempt_time)
      `);

      // Create weight_history table to track all weight changes
      await query(`
        CREATE TABLE IF NOT EXISTS weight_history (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          weight_type VARCHAR(20) NOT NULL CHECK (weight_type IN ('current_weight', 'goal_weight')),
          old_value DECIMAL(5,2),
          new_value DECIMAL(5,2) NOT NULL,
          changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      // Create indexes for weight_history queries
      await query(`
        CREATE INDEX IF NOT EXISTS idx_weight_history_user_id ON weight_history(user_id)
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_weight_history_changed_at ON weight_history(changed_at DESC)
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_weight_history_user_type ON weight_history(user_id, weight_type, changed_at DESC)
      `);

      console.log("Auto-migration completed successfully");
    } catch (error) {
      console.error("Auto-migration failed:", error);
      throw error;
    }
  }

  /**
   * Reset the initialization flag (useful for testing)
   */
  static reset(): void {
    this.initialized = false;
  }
}
