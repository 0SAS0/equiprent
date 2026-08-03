"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = ["PENDING", "CONFIRMED", "ACTIVE", "RETURNED", "CANCELLED"];

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    const from = formData.get("from")?.toString();
    const to = formData.get("to")?.toString();
    const status = formData.get("status")?.toString();

    setParam(params, "from", from);
    setParam(params, "to", to);
    setParam(params, "status", status === "all" ? undefined : status);

    router.push(`/reports?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/reports");
  }

  return (
    <form action={updateFilters} className="grid gap-4 md:grid-cols-4">
      <div className="grid gap-2">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          type="date"
          defaultValue={searchParams.get("from") ?? ""}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          type="date"
          defaultValue={searchParams.get("to") ?? ""}
        />
      </div>
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          name="status"
          defaultValue={searchParams.get("status") ?? "all"}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit">Apply</Button>
        <Button type="button" variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </form>
  );
}

function setParam(params: URLSearchParams, key: string, value?: string) {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
}
