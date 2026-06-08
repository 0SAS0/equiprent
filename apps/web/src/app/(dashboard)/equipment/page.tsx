import { cookies } from "next/headers";
import { Suspense } from "react";
import { AddEquipmentDialog } from "@/components/equipment/add-equipment-dialog";
import { EquipmentFilters } from "@/components/equipment/equipment-filters";
import { EquipmentTable } from "@/components/equipment/equipment-table";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/types/equipment";

const categories = [
	"LAPTOP",
	"PROJECTOR",
	"CAMERA",
	"AUDIO",
	"TABLET",
	"PRINTER_3D",
	"ELECTRONICS",
	"ACCESSORY",
	"OTHER",
];

type EquipmentPageProps = {
	searchParams: Promise<{
		search?: string | string[];
		status?: string | string[];
		category?: string | string[];
	}>;
};

function getStringParam(value: string | string[] | undefined) {
	return typeof value === "string" ? value : undefined;
}

export default async function EquipmentPage({
	searchParams,
}: EquipmentPageProps) {
	const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
	const query = new URLSearchParams();

	const search = getStringParam(params.search)?.trim();
	const status = getStringParam(params.status);
	const category = getStringParam(params.category);

	if (search) query.set("search", search);
	if (status) query.set("status", status);
	if (category) query.set("category", category);

	const queryString = query.toString();
	const equipment = await apiFetch<Equipment[]>(
		`/equipment${queryString ? `?${queryString}` : ""}`,
		{
			headers: { cookie: cookieStore.toString() },
			cache: "no-store",
		},
	);

	return (
		<div className="flex flex-col gap-6 py-2">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Equipment</h1>
					<p className="text-sm text-muted-foreground">
						Manage equipment, availability and inventory details.
					</p>
				</div>
				<AddEquipmentDialog />
			</div>

			<Suspense fallback={<div className="h-8" />}>
				<EquipmentFilters categories={categories} />
			</Suspense>

			<EquipmentTable equipment={equipment} />
		</div>
	);
}
