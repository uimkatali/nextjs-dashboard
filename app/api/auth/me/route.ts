import { JWTService } from "@/app/lib/jwt";
import { UserService } from "@/app/lib/services/userService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get("session")?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = JWTService.verify(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await UserService.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
