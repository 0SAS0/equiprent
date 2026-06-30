import { cookies } from "next/headers";
import ProcessReturnDialog from "@/components/returns/process-return-dialog";
import { apiFetch } from "@/lib/api";
import type { Reservation } from "@/types/reservation";

export default async function ReturnsPage() {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();
	const reservations = await apiFetch<Reservation[]>("/reservations", {
		headers: { cookie: cookieHeader },
	});
	const activeReservations = reservations.filter((r) => r.status === "ACTIVE");

	return <ProcessReturnDialog reservation={activeReservations} />;
}
