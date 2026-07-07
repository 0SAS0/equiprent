import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getRoleColor(role: string) {
	const colors: Record<string, string> = {
		STUDENT: "bg-blue-500/10 text-blue-500",
		STAFF: "bg-yellow-500/10 text-yellow-500",
		EQUIPMENT_MANAGER: "bg-purple-500/10 text-purple-500",
		ADMIN: "bg-red-500/10 text-red-500",
	};
	return colors[role] ?? "bg-gray-500/10 text-gray-500";
}

function roleLabel(role: string) {
	return role
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function UserRoleBadge({ role }: { role: string }) {
	return (
		<Badge variant="outline" className={cn("px-1.5", getRoleColor(role))}>
			{roleLabel(role)}
		</Badge>
	);
}
