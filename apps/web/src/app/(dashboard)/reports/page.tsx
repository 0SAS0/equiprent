import { cookies } from "next/headers";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { ExportButton } from "@/components/reports/export-button";
import {
  type ReportStats,
  StatsOverview,
} from "@/components/reports/stats-overview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

interface ReportsPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    status?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const filters = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const params = new URLSearchParams();

  if (filters.from) {
    params.set("from", filters.from);
  }
  if (filters.to) {
    params.set("to", filters.to);
  }

  const query = params.toString();
  const stats = await apiFetch<ReportStats>(
    `/reports/stats${query ? `?${query}` : ""}`,
    {
      headers: { cookie: cookieHeader },
    },
  );

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analyze reservation statistics and export reservation data to CSV.
          </p>
        </div>
        <ExportButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter statistics by reservation date range. CSV export also
            supports status filtering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangePicker />
        </CardContent>
      </Card>

      <StatsOverview stats={stats} />
    </div>
  );
}
