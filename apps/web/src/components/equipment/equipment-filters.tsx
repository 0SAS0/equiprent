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

type EquipmentFiltersProps = {
	categories?: string[];
};

export function EquipmentFilters({ categories = [] }: EquipmentFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentSearch = searchParams.get("search") ?? "";
	const currentStatus = searchParams.get("status") ?? "all";
	const currentCategory = searchParams.get("category") ?? "all";

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
					placeholder="Search for equipment..."
					aria-label="Search for equipment"
					value={currentSearch}
					onChange={(event) => updateParam("search", event.target.value)}
					className="pl-9"
				/>
			</div>

			<Select
				value={currentStatus}
				onValueChange={(value) => updateParam("status", value)}
			>
				<SelectTrigger className="w-full" aria-label="Filter by status">
					<SelectValue placeholder="Status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Status</SelectItem>
					<SelectItem value="AVAILABLE">Avaiable</SelectItem>
					<SelectItem value="RESERVED">Reserved</SelectItem>
					<SelectItem value="RENTED">Rented</SelectItem>
					<SelectItem value="MAINTENANCE">Maintenance</SelectItem>
					<SelectItem value="DAMAGED">Damaged</SelectItem>
					<SelectItem value="RETIRED">Retired</SelectItem>
				</SelectContent>
			</Select>

			<Select
				value={currentCategory}
				onValueChange={(value) => updateParam("category", value)}
			>
				<SelectTrigger className="w-full" aria-label="Filter by category">
					<SelectValue placeholder="Kategoria" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Categories</SelectItem>
					{categories.map((category) => (
						<SelectItem key={category} value={category}>
							{category}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
