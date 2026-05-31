import { cookies } from "next/headers";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { apiFetch } from "@/lib/api";

export default async function Page() {
	interface Stats {
		equipment: {
			total: number;
			available: number;
			rented: number;
			reserved: number;
		};
		reservations: { pending: number; active: number };
	}
	interface Reservation {
		id: string;
		equipmentId: string;
		userId: string;
		status: string;
		startDate: string;
		endDate: string;
		equipment: { name: string };
		user: { name: string; email: string };
	}
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();

	const [stats, reservations] = await Promise.all([
		apiFetch<Stats>("/equipment/stats", { headers: { cookie: cookieHeader } }),
		apiFetch<Reservation[]>("/reservations?limit=5", {
			headers: { cookie: cookieHeader },
		}),
	]);
	return (
		<div className="flex flex-col gap-6 py-4 md:py-6">
			<StatsCards
				equipment={stats.equipment}
				reservations={stats.reservations}
			/>
			{/* wykres */}
			{/* tabela ostatnich rezerwacji */}
		</div>
	);
}
