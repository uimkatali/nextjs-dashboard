import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    // If there's a valid session token, invalidate it in the database
    if (token) {
      await query("DELETE FROM sessions WHERE token = $1", [token]);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the correct session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    // Even if database operation fails, clear the cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}
