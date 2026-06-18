"use client";

import { useState } from "react";
import type { Equipment } from "@/types/equipment";
import { EditEquipmentDialog } from "./edit-equipment-dialog";
import { EquipmentTable } from "./equipment-table";

type EquipmentManagerProps = {
	equipment: Equipment[];
};

export function EquipmentManager({ equipment }: EquipmentManagerProps) {
	const [editedEquipment, setEditedEquipment] = useState<Equipment | null>(
		null,
	);

	return (
		<>
			<EquipmentTable equipment={equipment} onEdit={setEditedEquipment} />

			<EditEquipmentDialog
				equipment={editedEquipment}
				open={editedEquipment !== null}
				onOpenChange={(open) => {
					if (!open) setEditedEquipment(null);
				}}
			/>
		</>
	);
}
