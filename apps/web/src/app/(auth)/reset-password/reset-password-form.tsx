"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z
			.string()
			.min(8, "Confirm Password must be at least 8 characters long"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	});
	const router = useRouter();
	const onSubmit = async (data: ResetPasswordFormData) => {
		if (!token) return;
		await authClient.resetPassword({
			token,
			newPassword: data.password,
		});
		router.replace("/login");
	};

	return (
		<div className={cn("flex flex-col gap-6")}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Reset Password</CardTitle>
					<CardDescription>Enter your new password below.</CardDescription>
					<FieldSeparator className="my-1 mb-0" />
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input
								{...register("password")}
								id="password"
								type="password"
								placeholder="New password"
								required
							/>
							<FieldLabel htmlFor="confirm-password">
								Confirm Password
							</FieldLabel>
							{errors.password && (
								<FieldDescription className="text-red-500">
									{errors.password.message}
								</FieldDescription>
							)}
							<Input
								{...register("confirmPassword")}
								id="confirm-password"
								type="password"
								placeholder="Confirm new password"
								required
							/>
							{errors.confirmPassword && (
								<FieldDescription className="text-red-500">
									{errors.confirmPassword.message}
								</FieldDescription>
							)}
							<Field>
								<Button type="submit" className="w-full">
									Reset Password
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{" "}
				<a href="/terms">Terms of Service</a> and{" "}
				<a href="/privacy">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}
