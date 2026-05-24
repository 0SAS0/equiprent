import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

type ResetPasswordPageProps = {
	searchParams: Promise<{ token?: string }>;
};
export default async function ResetPasswordPage({
	searchParams,
}: ResetPasswordPageProps) {
	const params = await searchParams;
	const token = params.token ?? "";
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<ResetPasswordForm token={token} />
		</Suspense>
	);
}
