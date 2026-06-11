import type { ReactNode } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { Reservation } from "@/types/reservation";
import { ReservationStatusBadge } from "./reservation-status-badge";

function Detail({ label, value }: { label: string; value?: ReactNode }) {
	return (
		<div className="grid gap-1 border-b pb-3 last:border-0">
			<span className="text-xs text-muted-foreground">{label}</span>
			<div className="text-sm">{value || "-"}</div>
		</div>
	);
}

type ReservationDetailsSheetProps = {
	reservation: Reservation | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function ReservationDetailsSheet({
	reservation,
	open,
	onOpenChange,
}: ReservationDetailsSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto sm:max-w-md">
				{reservation && (
					<>
						<SheetHeader>
							<SheetTitle>{reservation.equipment.name}</SheetTitle>
							<SheetDescription>Reservation details</SheetDescription>
						</SheetHeader>

						<div className="grid gap-4 px-4">
							<Detail
								label="Status"
								value={<ReservationStatusBadge status={reservation.status} />}
							/>
							<Detail label="Equipment" value={reservation.equipment.name} />
							<Detail
								label="Serial number"
								value={reservation.equipment.serialNumber}
							/>
							<Detail label="User" value={reservation.user.name} />
							<Detail label="Email" value={reservation.user.email} />
							<Detail label="Purpose" value={reservation.purposeNote} />
							<Detail label="Manager Note" value={reservation.managerNote} />
							<Detail
								label="Start date"
								value={new Date(reservation.startDate).toLocaleDateString(
									"en-GB",
								)}
							/>
							<Detail
								label="End date"
								value={new Date(reservation.endDate).toLocaleDateString(
									"en-GB",
								)}
							/>
							<Detail
								label="Created"
								value={new Date(reservation.createdAt).toLocaleDateString(
									"en-GB",
								)}
							/>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
