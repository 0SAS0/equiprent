"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const roles = ["STUDENT", "STAFF", "EQUIPMENT_MANAGER", "ADMIN"];

export function UserFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentSearch = searchParams.get("search") ?? "";
	const currentRole = searchParams.get("role") ?? "all";
	const currentActive = searchParams.get("active") ?? "all";

	function updateParam(name: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());
		const normalizedValue = value.trim();

		if (!normalizedValue || normalizedValue === "all") {
			params.delete(name);
		} else {
			params.set(name, normalizedValue);
		}

		const query = params.toString();
		router.push(query ? `?${query}` : "?", { scroll: false });
	}

	return (
		<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
			<div className="relative">
				<SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search for users..."
					aria-label="Search for users"
					value={currentSearch}
					onChange={(event) => updateParam("search", event.target.value)}
					className="pl-9"
				/>
			</div>

			<Select
				value={currentRole}
				onValueChange={(value) => updateParam("role", value)}
			>
				<SelectTrigger className="w-full" aria-label="Filter by role">
					<SelectValue placeholder="Role" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Roles</SelectItem>
					{roles.map((role) => (
						<SelectItem key={role} value={role}>
							{role}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={currentActive}
				onValueChange={(value) => updateParam("active", value)}
			>
				<SelectTrigger className="w-full" aria-label="Filter by status">
					<SelectValue placeholder="Status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Status</SelectItem>
					<SelectItem value="true">Active</SelectItem>
					<SelectItem value="false">Inactive</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
