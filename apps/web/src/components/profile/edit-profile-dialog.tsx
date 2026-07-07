"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { apiFetch } from "@/lib/api";
import type { UserProfile } from "@/types/users";

const profileSchema = z.object({
	name: z.string().trim().min(2, "Name must contain at least 2 characters"),
	phone: z.string().trim().optional(),
	studentId: z.string().trim().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type EditProfileDialogProps = {
	user: UserProfile;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditProfileDialog({
	user,
	open,
	onOpenChange,
}: EditProfileDialogProps) {
	const router = useRouter();
	const {
		register,
		reset,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user.name ?? "",
			phone: user.phone ?? "",
			studentId: user.studentId ?? "",
		},
	});

	useEffect(() => {
		reset({
			name: user.name ?? "",
			phone: user.phone ?? "",
			studentId: user.studentId ?? "",
		});
	}, [user, reset]);

	async function onSubmit(data: ProfileFormData) {
		try {
			await apiFetch("/users/me", {
				method: "PATCH",
				body: JSON.stringify(data),
			});
			toast.success("Profile updated");
			onOpenChange(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update profile",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>Update your personal details.</DialogDescription>
				</DialogHeader>

				<form noValidate onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field
							className="sm:col-span-2"
							data-invalid={Boolean(errors.name)}
						>
							<FieldLabel htmlFor="profile-name">Name</FieldLabel>
							<Input
								id="profile-name"
								autoComplete="off"
								aria-invalid={Boolean(errors.name)}
								{...register("name")}
							/>
							<FieldError errors={[errors.name]} />
						</Field>

						<Field data-invalid={Boolean(errors.phone)}>
							<FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
							<Input id="profile-phone" {...register("phone")} />
							<FieldError errors={[errors.phone]} />
						</Field>

						<Field data-invalid={Boolean(errors.studentId)}>
							<FieldLabel htmlFor="profile-student-id">Student ID</FieldLabel>
							<Input id="profile-student-id" {...register("studentId")} />
							<FieldError errors={[errors.studentId]} />
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
