"use client";

import { PencilIcon, PowerIcon, PowerOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { AppUser } from "@/types/users";
import { UserRoleBadge } from "./user-role-badge";

type UserTableProps = {
	users: AppUser[];
	onEdit?: (user: AppUser) => void;
};

function Detail({ label, value }: { label: string; value?: string | number }) {
	return (
		<div className="grid gap-1 border-b pb-3 last:border-0">
			<dt className="text-xs font-medium text-muted-foreground">{label}</dt>
			<dd className="text-sm">{value || "-"}</dd>
		</div>
	);
}

export function UserTable({ users, onEdit }: UserTableProps) {
	const router = useRouter();
	const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
	const [isToggling, setIsToggling] = useState<string | null>(null);

	function openDetails(user: AppUser) {
		setSelectedUser(user);
	}

	async function toggleActive(user: AppUser) {
		const nextActive = !user.active;
		const confirmed = window.confirm(
			nextActive
				? `Reactivate „${user.name ?? user.email}”?`
				: `Deactivate „${user.name ?? user.email}”?`,
		);

		if (!confirmed) return;

		setIsToggling(user.id);

		try {
			if (nextActive) {
				await apiFetch<AppUser>(`/users/${user.id}`, {
					method: "PATCH",
					body: JSON.stringify({ active: true }),
				});
			} else {
				await apiFetch<AppUser>(`/users/${user.id}`, { method: "DELETE" });
			}
			setSelectedUser((current) =>
				current?.id === user.id ? { ...current, active: nextActive } : current,
			);
			toast.success(nextActive ? "User reactivated" : "User deactivated");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update user",
			);
		} finally {
			setIsToggling(null);
		}
	}

	return (
		<>
			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Student ID</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow
								key={user.id}
								tabIndex={0}
								className="cursor-pointer focus-visible:bg-muted focus-visible:outline-none"
								onClick={() => openDetails(user)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										openDetails(user);
									}
								}}
							>
								<TableCell className="font-medium">
									{user.name ?? "-"}
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<UserRoleBadge role={user.role} />
								</TableCell>
								<TableCell className="font-mono text-xs">
									{user.studentId ?? "-"}
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={
											user.active
												? "bg-green-500/10 px-1.5 text-green-500"
												: "bg-gray-500/10 px-1.5 text-gray-500"
										}
									>
										{user.active ? "Active" : "Inactive"}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={(event) => {
												event.stopPropagation();
												onEdit ? onEdit(user) : openDetails(user);
											}}
										>
											<PencilIcon data-icon="inline-start" />
											Edit
										</Button>
										<Button
											type="button"
											variant={user.active ? "destructive" : "outline"}
											size="sm"
											disabled={isToggling === user.id}
											onClick={(event) => {
												event.stopPropagation();
												void toggleActive(user);
											}}
										>
											{user.active ? (
												<PowerOffIcon data-icon="inline-start" />
											) : (
												<PowerIcon data-icon="inline-start" />
											)}
											{user.active ? "Deactivate" : "Activate"}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}

						{users.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-32 text-center text-muted-foreground"
								>
									No users found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<Sheet
				open={selectedUser !== null}
				onOpenChange={(open) => {
					if (!open) setSelectedUser(null);
				}}
			>
				<SheetContent className="sm:max-w-md">
					{selectedUser && (
						<>
							<SheetHeader>
								<div className="pr-10">
									<SheetTitle>
										{selectedUser.name ?? selectedUser.email}
									</SheetTitle>
									<SheetDescription>{selectedUser.email}</SheetDescription>
								</div>
							</SheetHeader>

							<dl className="grid gap-3 overflow-y-auto px-4">
								<div className="grid gap-1 border-b pb-3">
									<dt className="text-xs font-medium text-muted-foreground">
										Role
									</dt>
									<dd>
										<UserRoleBadge role={selectedUser.role} />
									</dd>
								</div>
								<Detail label="Phone" value={selectedUser.phone ?? undefined} />
								<Detail
									label="Student ID"
									value={selectedUser.studentId ?? undefined}
								/>
								<div className="grid gap-1 border-b pb-3">
									<dt className="text-xs font-medium text-muted-foreground">
										Status
									</dt>
									<dd>
										<Badge
											variant="outline"
											className={
												selectedUser.active
													? "bg-green-500/10 px-1.5 text-green-500"
													: "bg-gray-500/10 px-1.5 text-gray-500"
											}
										>
											{selectedUser.active ? "Active" : "Inactive"}
										</Badge>
									</dd>
								</div>
								<Detail
									label="Joined"
									value={new Date(selectedUser.createdAt).toLocaleDateString(
										"pl-PL",
									)}
								/>
							</dl>

							<SheetFooter className="flex-row justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => onEdit?.(selectedUser)}
									disabled={!onEdit}
								>
									<PencilIcon data-icon="inline-start" />
									Edit
								</Button>
								<Button
									type="button"
									variant={selectedUser.active ? "destructive" : "outline"}
									disabled={isToggling === selectedUser.id}
									onClick={() => void toggleActive(selectedUser)}
								>
									{selectedUser.active ? (
										<PowerOffIcon data-icon="inline-start" />
									) : (
										<PowerIcon data-icon="inline-start" />
									)}
									{selectedUser.active ? "Deactivate" : "Activate"}
								</Button>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
