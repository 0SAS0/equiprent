"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/types/equipment";
import { EquipmentStatusBadge } from "./equipment-status-badge";

type EquipmentTableProps = {
  equipment: Equipment[];
  onEdit?: (equipment: Equipment) => void;
};

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLocation(item: Equipment) {
  return (
    [item.locationBuilding, item.locationRoom].filter(Boolean).join(", ") || "-"
  );
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("pl-PL") : "-";
}

function formatTechnicalSpec(value: Equipment["technicalSpec"]) {
  if (!value) return "-";
  return JSON.stringify(value, null, 2);
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="grid gap-1 border-b pb-3 last:border-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || "-"}</dd>
    </div>
  );
}

export function EquipmentTable({ equipment, onEdit }: EquipmentTableProps) {
  const router = useRouter();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  function openDetails(item: Equipment) {
    setSelectedEquipment(item);
  }

  async function deleteEquipment(item: Equipment) {
    const confirmed = window.confirm(
      `Are you sure you want to delete „${item.name}”?`,
    );

    if (!confirmed) return;

    setIsDeleting(item.id);

    try {
      await apiFetch<Equipment>(`/equipment/${item.id}`, { method: "DELETE" });
      setSelectedEquipment((current) =>
        current?.id === item.id ? null : current,
      );
      toast.success("The equipment has been removed");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove hardware",
      );
    } finally {
      setIsDeleting(null);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow
                key={item.id}
                tabIndex={0}
                className="cursor-pointer focus-visible:bg-muted focus-visible:outline-none"
                onClick={() => openDetails(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDetails(item);
                  }
                }}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{formatCategory(item.category)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {item.serialNumber}
                </TableCell>
                <TableCell>{getLocation(item)}</TableCell>
                <TableCell>
                  <EquipmentStatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit ? onEdit(item) : openDetails(item);
                      }}
                    >
                      <PencilIcon data-icon="inline-start" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting === item.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        void deleteEquipment(item);
                      }}
                    >
                      <Trash2Icon data-icon="inline-start" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {equipment.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No equipment found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={selectedEquipment !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEquipment(null);
        }}
      >
        <SheetContent className="sm:max-w-md">
          {selectedEquipment && (
            <>
              <SheetHeader>
                <div className="pr-10">
                  <SheetTitle>{selectedEquipment.name}</SheetTitle>
                  <SheetDescription>
                    {selectedEquipment.serialNumber}
                  </SheetDescription>
                </div>
              </SheetHeader>

              <dl className="grid gap-3 overflow-y-auto px-4">
                <Detail
                  label="Category"
                  value={formatCategory(selectedEquipment.category)}
                />
                <Detail
                  label="Manufacturer"
                  value={selectedEquipment.manufacturer}
                />
                <Detail label="Model" value={selectedEquipment.model} />
                <Detail
                  label="Description"
                  value={selectedEquipment.description}
                />
                <Detail
                  label="Building"
                  value={selectedEquipment.locationBuilding}
                />
                <Detail label="Room" value={selectedEquipment.locationRoom} />
                <Detail
                  label="Location details"
                  value={selectedEquipment.locationDetail}
                />
                <Detail
                  label="Purchase date"
                  value={formatDate(selectedEquipment.purchaseDate)}
                />
                <Detail
                  label="Warranty until"
                  value={formatDate(selectedEquipment.warrantyUntil)}
                />
                <Detail
                  label="Maximum rental period"
                  value={`${selectedEquipment.maxRentalDays} days`}
                />
                <div className="grid gap-1 border-b pb-3">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Technical specification
                  </dt>
                  <dd>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                      {formatTechnicalSpec(selectedEquipment.technicalSpec)}
                    </pre>
                  </dd>
                </div>
                <div className="grid gap-1 border-b pb-3">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Status
                  </dt>
                  <dd>
                    <EquipmentStatusBadge status={selectedEquipment.status} />
                  </dd>
                </div>
                <Detail
                  label="Created"
                  value={new Date(
                    selectedEquipment.createdAt,
                  ).toLocaleDateString("pl-PL")}
                />
              </dl>

              <SheetFooter className="flex-row justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEdit?.(selectedEquipment)}
                  disabled={!onEdit}
                >
                  <PencilIcon data-icon="inline-start" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting === selectedEquipment.id}
                  onClick={() => void deleteEquipment(selectedEquipment)}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Delete
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
