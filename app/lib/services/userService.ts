import { User } from "@/app/types/auth";
import db from "../db";

import bcrypt from "bcrypt";

export class UserService {
  // Initialize users table if it does not exist
  static async initTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    await db.query(query);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email.toLowerCase()]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findById(id: string): Promise<User | null> {
    const query =
      "SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1";
    const result = await db.query(query, [id]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async create(
    userData: Omit<User, "id" | "created_at" | "updated_at">
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const query = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email, created_at, updated_at
    `;

    const result = await db.query(query, [
      userData.name,
      userData.email.toLowerCase(),
      hashedPassword,
    ]);

    return result.rows[0];
  }

  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
