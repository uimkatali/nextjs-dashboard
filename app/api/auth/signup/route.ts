import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { query, withTransaction } from "@/app/lib/db";
import { DatabaseInitializer } from "@/app/lib/db-init";

function sanitizeHeaderValue(value: string | null): string {
  if (!value) return "unknown";
  // Sanitize header values to prevent injection
  return value
    .replace(/[^\w\s\-\.,:;/]/g, "") // Remove potentially dangerous characters
    .substring(0, 255); // Limit length
}

async function logSignupAttempt(
  email: string,
  success: boolean,
  error?: string
) {
  const headersList = await headers();
  const rawIp =
    headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
  const rawUserAgent = headersList.get("user-agent");

  // Sanitize and validate inputs
  const ip = sanitizeHeaderValue(rawIp);
  const userAgent = sanitizeHeaderValue(rawUserAgent);
  const sanitizedError = error ? error.substring(0, 500) : null; // Limit error message length

  try {
    await query(
      `INSERT INTO signup_logs (email, success, attempt_time, ip_address, error_message, user_agent)
      VALUES ($1, $2, NOW(), $3, $4, $5)`,
      [email, success, ip, sanitizedError, userAgent]
    );
  } catch (logError) {
    console.error("Failed to log signup attempt:", logError);
    // Don't throw here - logging should not break the signup process
  }
}

export async function POST(request: Request) {
  let email = "unknown";

  try {
    // Ensure all required tables exist before proceeding
    await DatabaseInitializer.ensureTablesExist();

    console.log("Received signup request");
    const { name, email: userEmail, password } = await request.json();
    email = userEmail;

    // 1. Validate input
    console.log("Validating input for:", email);
    if (!name || !email || !password) {
      await logSignupAttempt(email, false, "Missing required fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await logSignupAttempt(email, false, "Invalid email format");
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      await logSignupAttempt(email, false, "Password too short");
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Validate name length and characters
    if (name.length < 2 || name.length > 100) {
      await logSignupAttempt(email, false, "Invalid name length");
      return NextResponse.json(
        {
          success: false,
          message: "Name must be between 2 and 100 characters",
        },
        { status: 400 }
      );
    }

    // Normalize email for consistency with login
    const normalizedEmail = String(email).trim().toLowerCase();

    // 2. Check if user already exists
    const existingUser = await query<{ id: string }>(
      "SELECT id FROM users WHERE lower(email) = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      await logSignupAttempt(email, false, "Email already registered");
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user in database with transaction for data integrity
    await withTransaction(async (client) => {
      // Double-check user doesn't exist within transaction to prevent race condition
      const doubleCheck = await client.query(
        "SELECT id FROM users WHERE lower(email) = $1",
        [normalizedEmail]
      );

      if (doubleCheck.rows.length > 0) {
        throw new Error("Email already registered");
      }

      // Create user
      await client.query(
        "INSERT INTO users (full_name, email, password, created_at) VALUES ($1, $2, $3, NOW())",
        [name, normalizedEmail, hashedPassword]
      );
    });

    // Log successful signup
    await logSignupAttempt(email, true);

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Detailed error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      email,
    });
    await logSignupAttempt(
      email,
      false,
      String(error) || "Unknown server error"
    );
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
