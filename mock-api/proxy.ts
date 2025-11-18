import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Renamed to 'proxy' to match your project conventions
export function proxy(req: NextRequest) {
  // 1. Log the current path being accessed
  console.log(`[Proxy] Intercepting request for: ${req.nextUrl.pathname}`);

  // 2. Try to get the token
  const token = req.cookies.get("token")?.value;

  // 3. Debug: Log whether the token was found (DO NOT log the actual token for security)
  if (token) {
    console.log(`[Proxy] ✅ Token found. Allowing request.`);
  } else {
    console.log(`[Proxy] ❌ No token cookie found. Redirecting to /`);
    
    // Optional: Log all available cookies to see if it's named differently
    console.log(`[Proxy] Available cookies:`, req.cookies.getAll().map(c => c.name));
  }

  // no token → block page
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// The matcher determines which routes this proxy runs on
export const config = {
  matcher: ["/projects/(.*)"],
};