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

export function ReservationFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentSearch = searchParams.get("search") ?? "";
	const currentStatus = searchParams.get("status") ?? "all";

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
		<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
			<div className="relative">
				<SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search reservations..."
					aria-label="Search reservations"
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
					<SelectItem value="all">All statuses</SelectItem>
					<SelectItem value="PENDING">Pending</SelectItem>
					<SelectItem value="CONFIRMED">Confirmed</SelectItem>
					<SelectItem value="ACTIVE">Active</SelectItem>
					<SelectItem value="RETURNED">Returned</SelectItem>
					<SelectItem value="CANCELLED">Cancelled</SelectItem>
					<SelectItem value="OVERDUE">Overdue</SelectItem>
					<SelectItem value="REJECTED">Rejected</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
