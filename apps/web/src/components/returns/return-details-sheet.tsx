import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ReturnHistoryRecord } from "@/types/returns";
import { ReturnConditionBadge } from "./return-condition-badge";

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="grid gap-1 border-b pb-3 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-sm">{value || "-"}</div>
    </div>
  );
}

type ReturnDetailsSheetProps = {
  returnRecord: ReturnHistoryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ReturnDetailsSheet({
  returnRecord,
  open,
  onOpenChange,
}: ReturnDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {returnRecord && (
          <>
            <SheetHeader>
              <SheetTitle>{returnRecord.reservation.equipment.name}</SheetTitle>
              <SheetDescription>Details of the return record</SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
              <Detail
                label="Equipment"
                value={returnRecord.reservation.equipment.name}
              />
              <Detail
                label="Serial number"
                value={returnRecord.reservation.equipment.serialNumber}
              />
              <Detail label="User" value={returnRecord.reservation.user.name} />
              <Detail
                label="Email"
                value={returnRecord.reservation.user.email}
              />
              <Detail
                label="Condition"
                value={
                  <ReturnConditionBadge condition={returnRecord.condition} />
                }
              />
              <Detail label="Notes" value={returnRecord.notes || "—"} />
              <Detail
                label="Date"
                value={new Date(returnRecord.createdAt).toLocaleDateString(
                  "en-GB",
                )}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
