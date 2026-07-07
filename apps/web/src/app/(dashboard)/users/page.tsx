import { cookies } from "next/headers";
import { Suspense } from "react";
import { UserFilters } from "@/components/users/user-filters";
import { UserManager } from "@/components/users/user-manager";
import { apiFetch } from "@/lib/api";
import type { AppUser } from "@/types/users";

type UsersPageProps = {
	searchParams: Promise<{
		search?: string | string[];
		role?: string | string[];
		active?: string | string[];
	}>;
};

function getStringParam(value: string | string[] | undefined) {
	return typeof value === "string" ? value : undefined;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
	const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
	const query = new URLSearchParams();

	const search = getStringParam(params.search)?.trim();
	const role = getStringParam(params.role);
	const active = getStringParam(params.active);

	if (search) query.set("search", search);
	if (role) query.set("role", role);
	if (active) query.set("active", active);

	const queryString = query.toString();
	const users = await apiFetch<AppUser[]>(
		`/users${queryString ? `?${queryString}` : ""}`,
		{
			headers: { cookie: cookieStore.toString() },
			cache: "no-store",
		},
	);

	return (
		<div className="flex flex-col gap-6 py-2">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Users</h1>
					<p className="text-sm text-muted-foreground">
						Manage user accounts, roles and access.
					</p>
				</div>
			</div>

			<Suspense fallback={<div className="h-8" />}>
				<UserFilters />
			</Suspense>

			<UserManager users={users} />
		</div>
	);
}
