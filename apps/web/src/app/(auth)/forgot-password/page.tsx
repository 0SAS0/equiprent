"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
	const [error, setError] = useState<string | null>(null);
	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	});
	const onSubmit = async (data: ForgotPasswordFormData) => {
		const { data: resetData } = await authClient.requestPasswordReset({
			email: data.email,
			redirectTo: `/reset-password`,
		});

		console.log(resetData);
		if (resetData?.message) {
			setError(resetData.message);
		}
	};
	return (
		<div className={cn("flex flex-col gap-6")}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Forgot Password</CardTitle>
					<CardDescription>
						Enter your email address to receive a password reset link.
					</CardDescription>
					<FieldSeparator className="my-1 mb-0" />
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="default" className="mb-4 p-2">
							<AlertCircle className="h-4 w-4 " />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<form onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									{...register("email")}
									id="email"
									type="email"
									placeholder="email@example.com"
									required
								/>
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email.message}
									</p>
								)}
							</Field>
							<Field>
								<Button type="submit" className="w-full">
									Send Reset Link
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}
