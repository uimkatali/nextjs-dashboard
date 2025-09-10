import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Alternative middleware using Web Crypto API
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths = ["/home"];

  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Validate session using Web Crypto API
    try {
      // Create a simple hash of the token for validation
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // You could store this hash in a separate table for quick validation
      // For now, we'll just check if token exists and has proper format
      if (token.length !== 64) {
        // Assuming 32-byte hex token
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch (error) {
      console.error("Middleware auth check failed:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*"],
};
