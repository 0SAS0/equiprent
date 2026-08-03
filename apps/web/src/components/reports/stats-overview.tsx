import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ReportStats {
  "reservations-by-status": Record<string, number>;
  "equipment-by-category": Record<string, number>;
  "total-rental-days": number;
  "most-popular-equipment": [string, number][];
  "total-reservations": number;
}

interface StatsOverviewProps {
  stats: ReportStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const reservationsByStatus = Object.entries(
    stats["reservations-by-status"] ?? {},
  );
  const equipmentByCategory = Object.entries(
    stats["equipment-by-category"] ?? {},
  );
  const popularEquipment = stats["most-popular-equipment"] ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-4">
        <MetricCard
          title="Total reservations"
          value={stats["total-reservations"] ?? 0}
          description="Reservations in selected period"
        />
        <MetricCard
          title="Rental days"
          value={stats["total-rental-days"] ?? 0}
          description="Total returned rental days"
        />
        <MetricCard
          title="Statuses"
          value={reservationsByStatus.length}
          description="Reservation status groups"
        />
        <MetricCard
          title="Categories"
          value={equipmentByCategory.length}
          description="Equipment categories"
        />
      </div>

      <ListCard
        title="Reservations by status"
        description="Counts grouped by reservation status"
        items={reservationsByStatus}
        emptyText="No reservations for selected filters."
      />
      <ListCard
        title="Equipment by category"
        description="Current equipment inventory split by category"
        items={equipmentByCategory}
        emptyText="No equipment categories found."
      />
      <ListCard
        title="Most popular equipment"
        description="Top reserved equipment in selected period"
        items={popularEquipment}
        emptyText="No popular equipment data yet."
        className="lg:col-span-2"
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}

function ListCard({
  title,
  description,
  items,
  emptyText,
  className,
}: {
  title: string;
  description: string;
  items: [string, number][];
  emptyText: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {items.map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between p-3"
              >
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
