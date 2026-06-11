import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/reservation";

const statusColors: Record<ReservationStatus, string> = {
	PENDING: "bg-yellow-500/10 text-yellow-500",
	CONFIRMED: "bg-blue-500/10 text-blue-500",
	ACTIVE: "bg-green-500/10 text-green-500",
	RETURNED: "bg-gray-500/10 text-gray-500",
	CANCELLED: "bg-red-500/10 text-red-500",
	OVERDUE: "bg-orange-500/10 text-orange-500",
	REJECTED: "bg-red-500/10 text-red-500",
};

export function ReservationStatusBadge({
	status,
}: {
	status: ReservationStatus;
}) {
	return (
		<Badge variant="outline" className={cn("px-1.5", statusColors[status])}>
			{status}
		</Badge>
	);
}
