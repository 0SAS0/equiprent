import { CalendarDaysIcon } from "lucide-react";
import Link from "next/link";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ReservationStatus } from "@/types/reservation";
import type { ProfileReservation } from "@/types/users";

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export function ProfileReservations({
	reservations,
}: {
	reservations: ProfileReservation[];
}) {
	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Recent reservations</CardTitle>
				<Link
					href="/reservations"
					className="text-sm text-primary hover:underline"
				>
					View all →
				</Link>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Equipment</TableHead>
							<TableHead>From</TableHead>
							<TableHead>To</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{reservations.map((reservation) => (
							<TableRow key={reservation.id}>
								<TableCell className="font-medium">
									{reservation.equipment.name}
								</TableCell>
								<TableCell>{formatDate(reservation.startDate)}</TableCell>
								<TableCell>{formatDate(reservation.endDate)}</TableCell>
								<TableCell>
									<ReservationStatusBadge
										status={reservation.status as ReservationStatus}
									/>
								</TableCell>
							</TableRow>
						))}
						{reservations.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={4}
									className="py-10 text-center text-muted-foreground"
								>
									<div className="flex flex-col items-center gap-2">
										<CalendarDaysIcon className="size-6" />
										No reservations yet
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
