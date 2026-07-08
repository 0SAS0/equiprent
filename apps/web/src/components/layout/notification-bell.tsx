"use client";

import { BellIcon, CheckCheckIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

const POLL_INTERVAL_MS = 60_000;

function formatRelativeTime(date: string) {
	const diffMs = Date.now() - new Date(date).getTime();
	const diffMinutes = Math.round(diffMs / 60_000);

	if (diffMinutes < 1) return "just now";
	if (diffMinutes < 60) return `${diffMinutes}m ago`;

	const diffHours = Math.round(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}h ago`;

	const diffDays = Math.round(diffHours / 24);
	return `${diffDays}d ago`;
}

export function NotificationBell() {
	const [notifications, setNotifications] = useState<AppNotification[]>([]);

	const unreadCount = notifications.filter((n) => !n.read).length;

	const loadNotifications = useCallback(async () => {
		try {
			const data = await apiFetch<AppNotification[]>("/notifications/me");
			setNotifications(data);
		} catch (error) {
			console.error("Failed to load notifications", error);
		}
	}, []);

	useEffect(() => {
		loadNotifications();
		const interval = setInterval(loadNotifications, POLL_INTERVAL_MS);
		return () => clearInterval(interval);
	}, [loadNotifications]);

	async function handleMarkAsRead(id: string) {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
		);
		try {
			await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
		} catch (error) {
			console.error("Failed to mark notification as read", error);
		}
	}

	async function handleMarkAllAsRead() {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		try {
			await apiFetch("/notifications/read-all", { method: "PATCH" });
		} catch (error) {
			console.error("Failed to mark notifications as read", error);
		}
	}

	return (
		<DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="relative"
					aria-label="Notifications"
				>
					<BellIcon className="size-4" />
					{unreadCount > 0 && (
						<span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-blue-500" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="flex items-center justify-between px-1.5 py-1">
					<DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={handleMarkAllAsRead}
							className="flex items-center gap-1 text-xs text-primary hover:underline"
						>
							<CheckCheckIcon className="size-3.5" />
							Mark all as read
						</button>
					)}
				</div>
				<DropdownMenuSeparator />
				<div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
					{notifications.length === 0 && (
						<p className="px-1.5 py-6 text-center text-sm text-muted-foreground">
							No notifications yet
						</p>
					)}
					{notifications.map((notification) => (
						<button
							type="button"
							key={notification.id}
							onClick={() =>
								!notification.read && handleMarkAsRead(notification.id)
							}
							className={cn(
								"flex flex-col items-start gap-0.5 rounded-md px-2 py-2 text-left text-sm hover:bg-accent",
								!notification.read && "bg-accent/40",
							)}
						>
							<div className="flex w-full items-center gap-2">
								{!notification.read && (
									<span className="size-1.5 shrink-0 rounded-full bg-blue-500" />
								)}
								<span className="truncate font-medium">
									{notification.title}
								</span>
							</div>
							<span className="line-clamp-2 text-xs text-muted-foreground">
								{notification.message}
							</span>
							<span className="text-[11px] text-muted-foreground">
								{formatRelativeTime(notification.createdAt)}
							</span>
						</button>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
