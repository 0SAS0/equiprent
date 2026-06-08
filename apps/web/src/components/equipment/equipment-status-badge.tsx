import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getStatusColor(status: string) {
	const colors: Record<string, string> = {
		AVAILABLE: "bg-green-500/10 text-green-500",
		RESERVED: "bg-yellow-500/10 text-yellow-500",
		RENTED: "bg-blue-500/10 text-blue-500",
		MAINTENANCE: "bg-purple-500/10 text-purple-500",
		DAMAGED: "bg-red-500/10 text-red-500",
		RETIRED: "bg-gray-500/10 text-gray-500",
	};
	return colors[status] ?? "bg-gray-500/10 text-gray-500";
}
export function EquipmentStatusBadge({ status }: { status: string }) {
	return (
		<Badge variant="outline" className={cn("px-1.5", getStatusColor(status))}>
			{status}
		</Badge>
	);
}
