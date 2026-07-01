import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FaultStatus } from "@/types/fault";

const statusColors: Record<FaultStatus, string> = {
	REPORTED: "bg-red-500/10 text-red-500",
	IN_REVIEW: "bg-yellow-500/10 text-yellow-500",
	IN_REPAIR: "bg-blue-500/10 text-blue-500",
	RESOLVED: "bg-green-500/10 text-green-500",
	CLOSED: "bg-gray-500/10 text-gray-500",
};

function statusLabel(status: FaultStatus) {
	return status
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function FaultStatusBadge({ status }: { status: FaultStatus }) {
	return (
		<Badge variant="outline" className={cn("px-1.5", statusColors[status])}>
			{statusLabel(status)}
		</Badge>
	);
}
