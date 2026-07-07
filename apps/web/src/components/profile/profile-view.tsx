"use client";

import {
	CalendarIcon,
	CheckCircle2Icon,
	ClockIcon,
	IdCardIcon,
	ListChecksIcon,
	PencilIcon,
	PhoneIcon,
	ShieldCheckIcon,
	ShieldOffIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserRoleBadge } from "@/components/users/user-role-badge";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/users";
import { EditProfileDialog } from "./edit-profile-dialog";
import { ProfileReservations } from "./profile-reservations";

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function getInitials(name?: string | null) {
	if (!name) return "??";
	return name
		.split(" ")
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function InfoRow({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
				{icon}
			</div>
			<div className="flex min-w-0 flex-col">
				<span className="text-xs text-muted-foreground">{label}</span>
				<span className="truncate text-sm font-medium">{value}</span>
			</div>
		</div>
	);
}

function StatCard({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: number;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					{icon}
				</div>
				<div className="flex flex-col">
					<span className="text-2xl font-semibold leading-none">{value}</span>
					<span className="text-xs text-muted-foreground">{label}</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function ProfileView({ user }: { user: UserProfile }) {
	const [editOpen, setEditOpen] = useState(false);

	const activeCount = user.reservations.filter((reservation) =>
		["PENDING", "CONFIRMED", "ACTIVE"].includes(reservation.status),
	).length;
	const completedCount = user.reservations.filter(
		(reservation) => reservation.status === "RETURNED",
	).length;

	return (
		<div className="flex flex-col gap-6 py-2">
			<Card>
				<CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
					<div className="relative shrink-0">
						<Avatar className="size-20 ring-4 ring-primary/10">
							<AvatarFallback className="bg-linear-to-br from-blue-600 to-indigo-600 text-xl font-semibold text-white">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<span
							className={cn(
								"absolute right-0 bottom-0 size-4 rounded-full ring-2 ring-card",
								user.active ? "bg-green-500" : "bg-gray-400",
							)}
						/>
					</div>

					<div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start">
						<h1 className="text-lg font-semibold">
							{user.name ?? "Unnamed user"}
						</h1>
						<p className="text-sm text-muted-foreground">{user.email}</p>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							<UserRoleBadge role={user.role} />
							<Badge
								variant={user.active ? "outline" : "destructive"}
								className="px-1.5"
							>
								{user.active ? "Active" : "Inactive"}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
				<Card className="h-fit lg:sticky lg:top-4">
					<CardContent className="flex flex-col gap-4">
						<Button
							onClick={() => setEditOpen(true)}
							className="w-full gap-1.5"
						>
							<PencilIcon className="size-4" />
							Edit profile
						</Button>

						<div className="flex flex-col gap-4">
							<InfoRow
								icon={<PhoneIcon className="size-4" />}
								label="Phone"
								value={user.phone ?? "Not provided"}
							/>
							<InfoRow
								icon={<IdCardIcon className="size-4" />}
								label="Student ID"
								value={user.studentId ?? "Not provided"}
							/>
							<InfoRow
								icon={
									user.emailVerified ? (
										<ShieldCheckIcon className="size-4 text-green-500" />
									) : (
										<ShieldOffIcon className="size-4 text-yellow-500" />
									)
								}
								label="Email verification"
								value={user.emailVerified ? "Verified" : "Not verified"}
							/>
							<InfoRow
								icon={<CalendarIcon className="size-4" />}
								label="Member since"
								value={formatDate(user.createdAt)}
							/>
						</div>
					</CardContent>
				</Card>

				<div className="flex flex-col gap-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<StatCard
							icon={<ListChecksIcon className="size-5" />}
							label="Recent reservations"
							value={user.reservations.length}
						/>
						<StatCard
							icon={<ClockIcon className="size-5" />}
							label="In progress"
							value={activeCount}
						/>
						<StatCard
							icon={<CheckCircle2Icon className="size-5" />}
							label="Completed"
							value={completedCount}
						/>
					</div>

					<ProfileReservations reservations={user.reservations} />
				</div>
			</div>

			<EditProfileDialog
				user={user}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
		</div>
	);
}
