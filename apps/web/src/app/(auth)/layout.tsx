import { Blocks } from "lucide-react";
import { Particles } from "@/components/ui/particles";
export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center gap-6  p-6 md:p-10">
			<Particles className="absolute inset-0 z-0" />
			<div className="flex w-full max-w-sm flex-col gap-6 absolute">
				<a href="/" className="flex items-center gap-2 self-center font-medium">
					<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<Blocks className="size-4" />
					</div>
					EquipRent
				</a>
				{children}
			</div>
		</div>
	);
}
