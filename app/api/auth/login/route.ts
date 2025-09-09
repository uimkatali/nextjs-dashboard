import { JWTService } from "@/app/lib/jwt";
import { UserService } from "@/app/lib/services/userService";
import { LoginRequest, LoginResponse } from "@/app/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Initialize table if not exists
    await UserService.initTable();

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await UserService.findByEmail(email);
    if (!user) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await UserService.verifyPassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = JWTService.sign({
      userId: user.id,
      email: user.email,
    });

    // Create response
    const response = NextResponse.json<LoginResponse>({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });

    // Set HTTP-only cookie for security
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
