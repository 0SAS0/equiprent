"use client";

import { Download, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://equiprent.me:3001";

export function ExportButton() {
  const searchParams = useSearchParams();
  const csvUrl = buildReportUrl("/reports/csv", searchParams);
  const pdfUrl = buildReportUrl("/reports/pdf", searchParams);

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline">
        <a href={csvUrl.toString()} download="report.csv">
          <Download />
          Export CSV
        </a>
      </Button>
      <Button asChild>
        <a href={pdfUrl.toString()} download="equiprent-report.pdf">
          <FileText />
          Export PDF
        </a>
      </Button>
    </div>
  );
}

function buildReportUrl(path: string, searchParams: URLSearchParams) {
  const url = new URL(path, BASE_URL);

  for (const key of ["from", "to", "status"]) {
    const value = searchParams.get(key);
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}
