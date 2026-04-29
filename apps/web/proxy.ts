import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";
  const isVerify = pathname === "/verify-email";
  const isAuthPage = isLogin || isRegister || isVerify;

  // Not logged in -> protect dashboard + verify page
  if (!session && (isDashboard || isVerify)) {
    const next = encodeURIComponent(`${pathname}${search}`)
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url))
  }

  // Logged in but not verified -> force verify before dashboard
  if (session && !session.user.emailVerified && isDashboard) {
    return NextResponse.redirect(new URL("/verify-email", request.url))
  }

  // Logged in + verified -> block auth pages
  if (session && session.user.emailVerified && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Logged in + not verified -> block login/register
  if (session && !session.user.emailVerified && (isLogin || isRegister)) {
    return NextResponse.redirect(new URL("/verify-email", request.url))
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/verify-email"], // Specify the routes the middleware applies to
};