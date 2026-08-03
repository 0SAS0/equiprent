"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://equiprent.me:3001";

export function ExportButton() {
  const searchParams = useSearchParams();
  const csvUrl = new URL("/reports/csv", BASE_URL);

  for (const key of ["from", "to", "status"]) {
    const value = searchParams.get(key);
    if (value) {
      csvUrl.searchParams.set(key, value);
    }
  }

  return (
    <Button asChild>
      <a href={csvUrl.toString()} download="report.csv">
        <Download />
        Export CSV
      </a>
    </Button>
  );
}
