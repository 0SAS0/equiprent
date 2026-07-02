import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  type FaultReport,
  type FaultStatus,
  faultStatuses,
} from "@/types/fault";
import { FaultStatusBadge } from "./fault-status-badge";

type UserRole = "STUDENT" | "STAFF" | "EQUIPMENT_MANAGER" | "ADMIN";

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    ["STUDENT", "STAFF", "EQUIPMENT_MANAGER", "ADMIN"].includes(value)
  );
}

function isFaultStatus(value: string): value is FaultStatus {
  return faultStatuses.includes(value as FaultStatus);
}

function statusLabel(status: FaultStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState(fault.status);
  const [resolution, setResolution] = useState(fault.resolution ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roleCandidate =
    session?.user && "role" in session.user
      ? (session.user as Record<string, unknown>).role
      : undefined;
  const userRole = isUserRole(roleCandidate) ? roleCandidate : undefined;

  const canUpdate = userRole === "ADMIN" || userRole === "EQUIPMENT_MANAGER";

  async function handleUpdate() {
    setIsSubmitting(true);
    try {
      await apiFetch(`/returns/faults/${fault.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, resolution: resolution || undefined }),
      });
      toast.success("Status updated successfully");
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
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
              {canUpdate && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                    <div>
                      <h3 className="text-sm font-medium">Update status</h3>
                      <p className="text-xs text-muted-foreground">
                        Only managers and admins can update fault status.
                      </p>
                    </div>

                    <div className="grid gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        New status
                      </span>
                      <Select
                        value={status}
                        onValueChange={(value) => {
                          if (isFaultStatus(value)) {
                            setStatus(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {faultStatuses.map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusLabel(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(status === "RESOLVED" || status === "CLOSED") && (
                      <div className="grid gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          Resolution
                        </span>
                        <Textarea
                          placeholder="Describe how the issue was resolved..."
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button onClick={handleUpdate} disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Save changes"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
