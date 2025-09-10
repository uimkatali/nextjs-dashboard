import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths = ["/home"];

  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Note: Session validation is now handled in the page component
    // This middleware only checks for the presence of a session cookie
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*"],
};
