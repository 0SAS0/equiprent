import { headers } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type BetterAuthSession = {
	user: {
		id: string;
		email: string;
		name?: string | null;
		emailVerified?: boolean;
		role: "STUDENT" | "STAFF" | "EQUIPMENT_MANAGER" | "ADMIN";
	};
	session: {
		id: string;
		expiresAt: string;
	};
};

export async function getServerSession(): Promise<BetterAuthSession | null> {
	const incomingHeaders = await headers();
	const cookie = incomingHeaders.get("cookie") ?? "";

	const res = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
		method: "GET",
		headers: {
			cookie,
		},
		cache: "no-store",
	});

	if (!res.ok) {
		return null;
	}

	const data = (await res.json()) as BetterAuthSession | null;
	if (!data?.user?.id) {
		return null;
	}
	return data;
}
