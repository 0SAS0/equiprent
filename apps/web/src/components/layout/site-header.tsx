"use client";

import { BellIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const PAGE_TITLES: Record<string, string> = {
	"/dashboard": "Dashboard",
	"/equipment": "Equipment",
	"/reservations": "Reservations",
	"/returns": "Returns",
	"/reports": "Reports",
	"/users": "Users",
	"/profile": "Profile",
};

export function SiteHeader() {
	const pathname = usePathname();
	const title = PAGE_TITLES[pathname] ?? "EquipRent";
	const isEquipmentPage =
		pathname === "/equipment" || pathname.startsWith("/equipment/");

	const today = new Date().toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>

				<div className="flex flex-col justify-center">
					<h1 className="text-base font-semibold leading-tight">{title}</h1>
					<span className="text-[11px] text-muted-foreground hidden sm:block">
						{today}
					</span>
				</div>

				<div className="ml-auto flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="relative"
						aria-label="Notifications"
					>
						<BellIcon className="size-4" />
						<span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
					</Button>

					{!isEquipmentPage && (
						<Button
							asChild
							size="sm"
							className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5"
						>
							<Link href="/equipment">
								<PlusIcon className="size-4" />
								Add Equipment
							</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
