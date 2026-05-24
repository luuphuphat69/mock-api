import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  // Ignore API routes & static files
  if (path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/assets")) {
    return NextResponse.next();
  }

  let token = req.cookies.get("token")?.value;

  const isAuthPage = path === "/login";
  const isProtectedPage =
    path === "/projects" ||
    path.startsWith("/projects/") ||
    path === "/profile" ||
    path.startsWith("/profile/");

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:path*", "/profile/:path*", "/login"],
};