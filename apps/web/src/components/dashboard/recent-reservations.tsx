import Link from "next/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";

interface Reservation {
	id: string;
	status: string;
	startDate: string;
	endDate: string;
	equipment: { name: string };
	user: { name: string; email: string };
}

interface RecentReservationsProps {
	reservations: Reservation[];
}
function getStatusColor(status: string) {
	const colors: Record<string, string> = {
		PENDING: "bg-yellow-500/10 text-yellow-500",
		CONFIRMED: "bg-blue-500/10 text-blue-500",
		ACTIVE: "bg-green-500/10 text-green-500",
		CANCELLED: "bg-red-500/10 text-red-500",
		RETURNED: "bg-gray-500/10 text-gray-500",
	};
	return colors[status] ?? "bg-gray-500/10 text-gray-500";
}
function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}
export default function RecentReservations({
	reservations,
}: RecentReservationsProps) {
	return (
		<div className="rounded-xl border p-5 bg-card col-span-1 shadow-sm">
			<div className="mb-4 flex items-center justify-between gap-4">
				<h2 className="text-base font-semibold text-white">
					Latest Reservations
				</h2>

				<Link
					href="/reservations"
					className="shrink-0 text-sm text-blue-400 hover:text-blue-300"
				>
					View all →
				</Link>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Equipment</TableHead>
						<TableHead>User</TableHead>
						<TableHead>From</TableHead>
						<TableHead>To</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reservations.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="font-mono text-xs text-muted-foreground">
								{item.id.slice(0, 8)}...
							</TableCell>
							<TableCell className="font-medium">
								{item.equipment.name}
							</TableCell>
							<TableCell>{item.user.name}</TableCell>
							<TableCell>{formatDate(item.startDate)}</TableCell>
							<TableCell>{formatDate(item.endDate)}</TableCell>
							<TableCell>
								<span
									className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
								>
									{item.status}
								</span>
							</TableCell>
						</TableRow>
					))}
					{reservations.length === 0 && (
						<TableRow>
							<TableCell
								colSpan={6}
								className="text-center py-8 text-muted-foreground"
							>
								No reservations yet
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
