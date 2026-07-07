"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { AppUser } from "@/types/users";

const roles = ["STUDENT", "STAFF", "EQUIPMENT_MANAGER", "ADMIN"] as const;

const statuses = ["true", "false"] as const;

const userSchema = z.object({
	name: z.string().trim().min(2, "Name must contain at least 2 characters"),
	phone: z.string().trim().optional(),
	studentId: z.string().trim().optional(),
	role: z.enum(roles, { message: "Select a role" }),
	active: z.enum(statuses, { message: "Select a status" }),
});

type EditUserDialogProps = {
	user: AppUser | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};
type UserFormData = z.infer<typeof userSchema>;

function roleLabel(role: string) {
	return role
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function EditUserDialog({
	user,
	open,
	onOpenChange,
}: EditUserDialogProps) {
	const router = useRouter();
	const {
		control,
		register,
		reset,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: "",
			phone: "",
			studentId: "",
			role: "STUDENT",
			active: "true",
		},
	});

	useEffect(() => {
		if (!user) return;

		reset({
			name: user.name ?? "",
			phone: user.phone ?? "",
			studentId: user.studentId ?? "",
			role: user.role,
			active: user.active ? "true" : "false",
		});
	}, [user, reset]);

	async function onSubmit(data: UserFormData) {
		if (!user) return;
		try {
			await apiFetch(`/users/${user.id}`, {
				method: "PATCH",
				body: JSON.stringify({
					name: data.name,
					phone: data.phone,
					studentId: data.studentId,
					role: data.role,
					active: data.active === "true",
				}),
			});
			toast.success("User updated");
			onOpenChange(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update user",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit user</DialogTitle>
					<DialogDescription>
						Update the role and details of an existing user.
					</DialogDescription>
				</DialogHeader>

				<form noValidate onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field
							className="sm:col-span-2"
							data-invalid={Boolean(errors.name)}
						>
							<FieldLabel htmlFor="user-name">Name</FieldLabel>
							<Input
								id="user-name"
								autoComplete="off"
								aria-invalid={Boolean(errors.name)}
								{...register("name")}
							/>
							<FieldError errors={[errors.name]} />
						</Field>

						<Controller
							control={control}
							name="role"
							render={({ field }) => (
								<Field data-invalid={Boolean(errors.role)}>
									<FieldLabel htmlFor="user-role">Role</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger
											id="user-role"
											className="w-full"
											aria-invalid={Boolean(errors.role)}
										>
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
												<SelectItem key={role} value={role}>
													{roleLabel(role)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[errors.role]} />
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="active"
							render={({ field }) => (
								<Field data-invalid={Boolean(errors.active)}>
									<FieldLabel htmlFor="user-active">Status</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger
											id="user-active"
											className="w-full"
											aria-invalid={Boolean(errors.active)}
										>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="true">Active</SelectItem>
											<SelectItem value="false">Inactive</SelectItem>
										</SelectContent>
									</Select>
									<FieldError errors={[errors.active]} />
								</Field>
							)}
						/>

						<Field>
							<FieldLabel htmlFor="user-phone">Phone</FieldLabel>
							<Input id="user-phone" {...register("phone")} />
						</Field>

						<Field>
							<FieldLabel htmlFor="user-student-id">Student ID</FieldLabel>
							<Input id="user-student-id" {...register("studentId")} />
						</Field>
					</div>

					<DialogFooter className="mt-6">
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isSubmitting}>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
