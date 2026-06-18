import { cookies } from "next/headers";
import { Suspense } from "react";
import CreateReservationDialog from "@/components/reservations/create-reservation-dialog";
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationsTable } from "@/components/reservations/reservations-table";
import { apiFetch } from "@/lib/api";
import { getServerSession } from "@/lib/server-session";
import type { Equipment } from "@/types/equipment";
import type { Reservation } from "@/types/reservation";

type EquipmentPageProps = {
	searchParams: Promise<{
		search?: string | string[];
		status?: string | string[];
	}>;
};

export default async function ReservationsPage({
	searchParams,
}: EquipmentPageProps) {
	const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
	const cookieHeader = cookieStore.toString();
	const session = await getServerSession();
	const search =
		typeof params.search === "string" ? params.search.trim().toLowerCase() : "";
	const status =
		typeof params.status === "string" ? params.status.trim().toUpperCase() : "";
	const [equipment, reservations] = await Promise.all([
		apiFetch<Equipment[]>("/equipment?status=AVAILABLE", {
			headers: { cookie: cookieHeader },
		}),
		apiFetch<Reservation[]>(`/reservations`, {
			headers: { cookie: cookieHeader },
		}),
	]);

	const filteredReservations = reservations.filter((reservation) => {
		const matchesSearch =
			!search ||
			reservation.equipment.name.toLowerCase().includes(search) ||
			reservation.equipment.serialNumber.toLowerCase().includes(search) ||
			reservation.user.name.toLowerCase().includes(search) ||
			reservation.user.email.toLowerCase().includes(search);

		const matchesStatus = !status || reservation.status === status;

		return matchesSearch && matchesStatus;
	});

	const canConfirm =
		session?.user.role === "ADMIN" ||
		session?.user.role === "EQUIPMENT_MANAGER";
	return (
		<div className="flex flex-col gap-6 py-2">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Reservations</h1>
					<p className="text-sm text-muted-foreground">
						Manage equipment reservations.
					</p>
				</div>

				<CreateReservationDialog equipment={equipment} />
			</div>

			<Suspense fallback={<div className="h-8" />}>
				<ReservationFilters />
			</Suspense>

			<ReservationsTable
				reservations={filteredReservations}
				currentUserId={session?.user.id ?? ""}
				canConfirm={canConfirm}
			/>
		</div>
	);
}
