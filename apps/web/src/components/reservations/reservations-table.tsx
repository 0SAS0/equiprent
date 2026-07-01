"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { Reservation } from "@/types/reservation";
import ReservationDetailsSheet from "./reservation-details-sheet";
import { ReservationStatusBadge } from "./reservation-status-badge";

type ReservationsTableProps = {
  reservations: Reservation[];
  currentUserId: string;
  canConfirm: boolean;
};
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB");
}
export function ReservationsTable({
  reservations,
  currentUserId,
  canConfirm,
}: ReservationsTableProps) {
  const router = useRouter();
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isCanceling, setIsCanceling] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);

  function openDetails(item: Reservation) {
    setSelectedReservation(item);
  }

  // Cancel reservation
  async function cancelReservation(item: Reservation) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel "${item.equipment.name}" reservation?`,
    );
    if (!confirmed) return;
    setIsCanceling(item.id);
    try {
      await apiFetch<Reservation>(`/reservations/${item.id}/cancel`, {
        method: "PATCH",
      });
      setSelectedReservation((current) =>
        current?.id === item.id ? null : current,
      );
      toast.success("Reservation cancelled successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel reservation",
      );
    } finally {
      setIsCanceling(null);
    }
  }
  // Confirm reservation
  async function confirmReservation(reservation: Reservation) {
    setIsConfirming(reservation.id);
    try {
      await apiFetch<Reservation>(`/reservations/${reservation.id}/confirm`, {
        method: "PATCH",
      });
      toast.success("Reservation confirmed successfully");
      setSelectedReservation(null);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to confirm reservation",
      );
    } finally {
      setIsConfirming(null);
    }
  }
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow
              key={reservation.id}
              tabIndex={0}
              className="cursor-pointer focus-visible:bg-muted focus-visible:outline-none"
              onClick={() => setSelectedReservation(reservation)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetails(reservation);
                }
              }}
            >
              <TableCell>{reservation.equipment.name}</TableCell>
              <TableCell>{reservation.equipment.serialNumber}</TableCell>
              <TableCell>{reservation.user.name}</TableCell>
              <TableCell>{formatDate(reservation.startDate)}</TableCell>
              <TableCell>{formatDate(reservation.endDate)}</TableCell>
              <TableCell>
                <ReservationStatusBadge status={reservation.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {canConfirm && reservation.status === "PENDING" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isConfirming !== null || isCanceling !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        void confirmReservation(reservation);
                      }}
                    >
                      {isConfirming === reservation.id
                        ? "Confirming..."
                        : "Confirm"}
                    </Button>
                  )}
                  {reservation.userId === currentUserId &&
                    (reservation.status === "PENDING" ||
                      reservation.status === "CONFIRMED") && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isConfirming !== null || isCanceling !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          void cancelReservation(reservation);
                        }}
                      >
                        {isCanceling === reservation.id
                          ? "Cancelling..."
                          : "Cancel"}
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {reservations.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground"
              >
                No reservations found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ReservationDetailsSheet
        reservation={selectedReservation}
        open={selectedReservation !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedReservation(null);
        }}
      />
    </div>
  );
}
