import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Define public paths
  if (request.nextUrl.pathname.startsWith("/login") || 
      request.nextUrl.pathname.startsWith("/register")) {
    if (session) {
      // If already logged in, redirect to dashboard
      const payload = await decrypt(session);
      if (payload) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await decrypt(session);
  if (!payload) {
    // Invalid session
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // (Optional) Role based access control
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (payload.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url)); // or unauthorized page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

