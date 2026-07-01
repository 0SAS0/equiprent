import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FaultReport } from "@/types/fault";
import { FaultStatusBadge } from "./fault-status-badge";

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="grid gap-1 border-b pb-3 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-sm">{value || "-"}</div>
    </div>
  );
}
interface FaultDetailsSheetProps {
  fault: FaultReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function FaultDetailsSheet({
  fault,
  open,
  onOpenChange,
}: FaultDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {fault && (
          <>
            <SheetHeader>
              <SheetTitle>{fault.equipment.name}</SheetTitle>
              <SheetDescription>Details of the return record</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 px-4">
              <Detail label="Equipment" value={fault.equipment.name} />
              <Detail label="Reported by" value={fault.reporter.name} />
              <Detail label="Description" value={fault.description} />
              <Detail
                label="Status"
                value={<FaultStatusBadge status={fault.status} />}
              />
              <Detail
                label="Date reported"
                value={new Date(fault.createdAt).toLocaleDateString("en-GB")}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
