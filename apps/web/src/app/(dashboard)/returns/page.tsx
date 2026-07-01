import { cookies } from "next/headers";
import ProcessReturnDialog from "@/components/returns/process-return-dialog";
import {
  type ReturnHistoryRecord,
  ReturnHistoryTable,
} from "@/components/returns/return-history-table";
import { apiFetch } from "@/lib/api";
import type { Reservation } from "@/types/reservation";

export default async function ReturnsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const reservations = await apiFetch<Reservation[]>("/reservations", {
    headers: { cookie: cookieHeader },
  });
  const activeReservations = reservations.filter((r) => r.status === "ACTIVE");
  const equipmentIds = [...new Set(reservations.map((r) => r.equipmentId))];
  const returnHistoryByEquipment = await Promise.all(
    equipmentIds.map((equipmentId) =>
      apiFetch<ReturnHistoryRecord[]>(`/returns/history/${equipmentId}`, {
        headers: { cookie: cookieHeader },
      }),
    ),
  );
  const returnHistory = returnHistoryByEquipment
    .flat()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Returns</h1>
          <p className="text-sm text-muted-foreground">
            Manage equipment returns.
          </p>
        </div>
        <ProcessReturnDialog reservation={activeReservations} />
      </div>
      <ReturnHistoryTable records={returnHistory} />
    </div>
  );
}
