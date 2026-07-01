import { ReturnConditionBadge } from "@/components/returns/return-condition-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ReturnHistoryRecord = {
  id: string;
  condition: "PERFECT" | "GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE" | "BROKEN";
  notes: string | null;
  createdAt: string;
  reservation: {
    id: string;
    user: { name: string; email: string };
    equipment: { name: string; serialNumber: string };
  };
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB");
}

export function ReturnHistoryTable({
  records,
}: {
  records: ReturnHistoryRecord[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Serial</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.reservation.equipment.name}</TableCell>
              <TableCell>{record.reservation.equipment.serialNumber}</TableCell>
              <TableCell>{formatDate(record.createdAt)}</TableCell>
              <TableCell>{record.reservation.user.name}</TableCell>
              <TableCell>
                <ReturnConditionBadge condition={record.condition} />
              </TableCell>
              <TableCell>{record.notes ?? "—"}</TableCell>
            </TableRow>
          ))}
          {records.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No return records yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
