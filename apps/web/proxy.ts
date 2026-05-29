import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Session = {
	user: {
		id?: string;
		emailVerified?: boolean;
	} | null;
	session?: {
		id?: string;
	} | null;
};

type AuthenticatedSession = {
	user: {
		id: string;
		emailVerified?: boolean;
	};
	session?: {
		id?: string;
	} | null;
};

async function readSessionFromApi(
	request: NextRequest,
): Promise<AuthenticatedSession | null> {
	const cookie = request.headers.get("cookie") || "";
	const res = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
		method: "GET",
		headers: {
			cookie,
		},
		cache: "no-store",
	});
	if (!res.ok) return null;
	const data = (await res.json()) as Session | null;
	if (!data?.user?.id) {
		return null;
	}
	return {
		...data,
		user: {
			id: data.user.id,
			emailVerified: data.user.emailVerified,
		},
	};
}

export async function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	const session = await readSessionFromApi(request);

	const isDashboard = pathname.startsWith("/dashboard");
	const isLogin = pathname === "/login";
	const isRegister = pathname === "/register";
	const isVerify = pathname === "/verify-email";

	// Not logged in -> protect dashboard + verify page
	if (!session && isDashboard) {
		const next = encodeURIComponent(`${pathname}${search}`);
		return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
	}
	if (!session && !isVerify) {
		redirect("/login");
	}
	// Logged in -> block auth pages (login/register)
	if (session) {
		if (isLogin || isRegister) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		// If not verified and tries to access dashboard -> force verify
		if (!session.user.emailVerified && isDashboard) {
			return NextResponse.redirect(new URL("/verify-email", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/login", "/register", "/verify-email"],
};
