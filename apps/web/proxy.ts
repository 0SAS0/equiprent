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

  // Not logged in -> protect dashboard + verify page
  if (!session && (isDashboard || isVerify)) {
    const next = encodeURIComponent(`${pathname}${search}`)
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url))
  }

  // Logged in -> block auth pages (login/register)
  if (session) {
    if (isLogin || isRegister) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If not verified and tries to access dashboard -> force verify
    if (!session.user.emailVerified && isDashboard) {
      return NextResponse.redirect(new URL("/verify-email", request.url))
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/verify-email"],
};