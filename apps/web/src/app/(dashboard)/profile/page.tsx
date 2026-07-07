import { cookies } from "next/headers";
import { ProfileView } from "@/components/profile/profile-view";
import { apiFetch } from "@/lib/api";
import type { UserProfile } from "@/types/users";

export default async function ProfilePage() {
	const cookieStore = await cookies();
	const user = await apiFetch<UserProfile>("/users/me", {
		headers: { cookie: cookieStore.toString() },
		cache: "no-store",
	});

	return <ProfileView user={user} />;
}
