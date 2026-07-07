"use client";

import { useState } from "react";
import type { AppUser } from "@/types/users";
import { EditUserDialog } from "./edit-user-dialog";
import { UserTable } from "./user-table";

type UserManagerProps = {
	users: AppUser[];
};

export function UserManager({ users }: UserManagerProps) {
	const [editedUser, setEditedUser] = useState<AppUser | null>(null);

	return (
		<>
			<UserTable users={users} onEdit={setEditedUser} />

			<EditUserDialog
				user={editedUser}
				open={editedUser !== null}
				onOpenChange={(open) => {
					if (!open) setEditedUser(null);
				}}
			/>
		</>
	);
}
