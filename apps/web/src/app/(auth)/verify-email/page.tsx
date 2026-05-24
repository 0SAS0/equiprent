import { Mail } from "lucide-react";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { getServerSession } from "@/lib/server-session";
import { cn } from "@/lib/utils";
import { ResendVerificationButton } from "./resend-button";

type VerifyEmailPageProps = {
	searchParams?: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({
	searchParams,
}: VerifyEmailPageProps) {
	const session = await getServerSession();
	const params = (await searchParams) ?? {};
	const emailFromQuery = params.email;
	if (session?.user?.emailVerified) {
		redirect("/dashboard");
	}

	if (!session && !emailFromQuery) {
		redirect("/login");
	}

	const emailToShow =
		session?.user?.email ?? emailFromQuery ?? "your email address";

	return (
		<div className={cn("flex flex-col gap-6 max-w-md mx-auto w-full")}>
			<Card>
				<CardHeader className="text-center">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-xl">
						<Mail />
					</div>
					<CardTitle className="text-xl">
						Welcome {session?.user?.name}
					</CardTitle>
					<p className="mb-1 text-xs font-medium uppercase text-muted-foreground mt-2">
						Step 2/3 · Email verification
					</p>
					<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card"></FieldSeparator>
					<CardDescription className="mt-1">
						We have sent a verification link to your email address:
					</CardDescription>
					<span className="font-medium text-foreground">{emailToShow}</span>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							Please check your inbox and click the verification link.
						</Field>
					</FieldGroup>
					<div className="flex items-center justify-center mt-4">
						<ResendVerificationButton email={emailToShow} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
