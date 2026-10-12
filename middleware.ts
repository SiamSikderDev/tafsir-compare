import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Expose the pathname to server components (the admin layout uses it
  // to exempt /admin/login from its session redirect).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const nextWithPathname = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  // Public login page
  if (pathname === "/admin/login") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return nextWithPathname();
  }

  // Everything else under /admin requires a session
  if (!req.auth) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return nextWithPathname();
});

export const config = {
  matcher: ["/admin/:path*"],
};
