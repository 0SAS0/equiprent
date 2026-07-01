import { cookies } from "next/headers";
// import FaultReportDialog from "@/components/returns/faults/fault-report-dialog";
// import FaultReportsTable from "@/components/returns/faults/fault-reports-table";
import ProcessReturnDialog from "@/components/returns/process-return-dialog";
import { ReturnHistoryTable } from "@/components/returns/return-history-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import type { Reservation } from "@/types/reservation";
import type { ReturnHistoryRecord } from "@/types/returns";
// import type { FaultReport } from "@/types/returns";

export default async function ReturnsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const reservations = await apiFetch<Reservation[]>("/reservations", {
    headers: { cookie: cookieHeader },
  });

  const activeReservations = reservations.filter((r) => r.status === "ACTIVE");

  const equipmentIds = [...new Set(reservations.map((r) => r.equipmentId))];
  const returnHistoryByEquipment = await Promise.all(
    equipmentIds.map((id) =>
      apiFetch<ReturnHistoryRecord[]>(`/returns/history/${id}`, {
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
      <div>
        <h1 className="text-2xl font-semibold">Returns</h1>
        <p className="text-sm text-muted-foreground">
          Manage equipment returns and fault reports.
        </p>
      </div>

      <Tabs defaultValue="returns">
        <TabsList>
          <TabsTrigger value="returns">Return History</TabsTrigger>
          <TabsTrigger value="faults">Fault Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="returns" className="mt-4">
          <div className="flex justify-end mb-4">
            <ProcessReturnDialog reservation={activeReservations} />
          </div>
          <ReturnHistoryTable records={returnHistory} />
        </TabsContent>

        <TabsContent value="faults" className="mt-4">
          <div className="flex justify-end mb-4">
            {/* <FaultReportDialog equipment={equipment} /> */}
          </div>
          {/* <FaultReportsTable faults={faults} /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
