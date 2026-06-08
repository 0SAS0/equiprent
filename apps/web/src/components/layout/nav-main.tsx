"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: React.ReactNode;
	}[];
}) {
	const pathname = usePathname();
	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-4">
				<Separator className="mx-2" />
				<span className="ml-2 text-[12px] text-muted-foreground uppercase tracking-widest font-semibold">
					Main
				</span>
				<SidebarMenu>
					{items.map((item) => {
						const isActive =
							pathname === item.url ||
							(item.url !== "/dashboard" && pathname.startsWith(item.url));
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									isActive={isActive}
									tooltip={item.title}
									size="lg"
								>
									<Link href={item.url} className="flex items-center gap-3">
										<span>{item.icon}</span>
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
