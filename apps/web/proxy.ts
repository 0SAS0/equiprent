import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";
  const isVerify = pathname === "/verify-email";
  const isAuthPage = isLogin || isRegister || isVerify;

  if (!session && isDashboard) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && !session.user.emailVerified && isDashboard) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  if (session && session.user.emailVerified && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && !session.user.emailVerified && (isLogin || isRegister)) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/verify-email"], // Specify the routes the middleware applies to
};