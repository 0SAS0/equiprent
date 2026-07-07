export type UserRole = "STUDENT" | "STAFF" | "EQUIPMENT_MANAGER" | "ADMIN";

export interface AppUser {
	id: string;
	email: string;
	name?: string | null;
	role: UserRole;
	studentId?: string | null;
	phone?: string | null;
	emailVerified: boolean;
	active: boolean;
	createdAt: string;
}
