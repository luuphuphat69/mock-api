import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  console.log(`[Proxy] Checking: ${path}`);

  // Ignore API routes & static files
  if (path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/assets")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.log("[Proxy] ❌ No token — redirect");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:path*"],
};