import { cookies } from "next/headers";
import EquipmentStructureChart from "@/components/dashboard/equipment-structure-chart";
import RecentReservations from "@/components/dashboard/recent-reservations";
import RentalChart from "@/components/dashboard/rental-chart";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { apiFetch } from "@/lib/api";

interface Stats {
	equipment: {
		total: number;
		available: number;
		rented: number;
		reserved: number;
	};
	reservations: { pending: number; active: number };
	equipmentStructure: {
		category: string;
		count: number;
	}[];
	rentalMonthly: {
		month: string;
		count: number;
	}[];
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

export default async function Page() {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();

	const [stats, reservation] = await Promise.all([
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

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 lg:px-6">
				<RentalChart data={stats.rentalMonthly} />
				<EquipmentStructureChart
					total={stats.equipment.total}
					data={stats.equipmentStructure}
				/>
			</div>
			<div className="px-4 lg:px-6">
				<RecentReservations reservations={reservation} />
			</div>
		</div>
	);
}
