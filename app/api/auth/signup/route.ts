import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";
import { headers } from "next/headers";

async function logSignupAttempt(
  email: string,
  success: boolean,
  error?: string
) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  await sql`
    INSERT INTO signup_logs (
      email, 
      success, 
      attempt_time, 
      ip_address, 
      error_message,
      user_agent
    )
    VALUES (
      ${email}, 
      ${success}, 
      NOW(), 
      ${ip}, 
      ${error || null},
      ${userAgent}
    )
  `;
}

export async function executeQuery(query: string, values: any[]) {
  try {
    const result = await sql.query(query, values);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  let email = "unknown";

  try {
    console.log("Received signup request");
    const { fullName, email: userEmail, password } = await request.json();
    email = userEmail;

    // 1. Validate input
    // Log input validation
    console.log("Validating input for:", email);
    if (!fullName || !email || !password) {
      await logSignupAttempt(email, false, "Missing required fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      await logSignupAttempt(email, false, "Email already registered");
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user in database
    await sql`
      INSERT INTO users (full_name, email, password, created_at)
      VALUES (${fullName}, ${email}, ${hashedPassword}, NOW())
    `;

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
