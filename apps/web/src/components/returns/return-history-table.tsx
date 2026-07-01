"use client";
import { useState } from "react";
import { ReturnConditionBadge } from "@/components/returns/return-condition-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReturnHistoryRecord } from "@/types/returns";
import ReturnDetailsSheet from "./return-details-sheet";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB");
}

export function ReturnHistoryTable({
  records,
}: {
  records: ReturnHistoryRecord[];
}) {
  const [selectedReturn, setSelectedReturn] =
    useState<ReturnHistoryRecord | null>(null);
  function openDetails(item: ReturnHistoryRecord) {
    setSelectedReturn(item);
  }
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
            <TableRow
              key={record.id}
              onClick={() => setSelectedReturn(record)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetails(record);
                }
              }}
            >
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
      <ReturnDetailsSheet
        returnRecord={selectedReturn}
        open={selectedReturn !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedReturn(null);
        }}
      />
    </div>
  );
}
