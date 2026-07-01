import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EquipmentCondition =
  | "PERFECT"
  | "GOOD"
  | "MINOR_DAMAGE"
  | "MAJOR_DAMAGE"
  | "BROKEN";

const conditionColors: Record<EquipmentCondition, string> = {
  PERFECT: "bg-green-500/10 text-green-500",
  GOOD: "bg-emerald-500/10 text-emerald-500",
  MINOR_DAMAGE: "bg-yellow-500/10 text-yellow-500",
  MAJOR_DAMAGE: "bg-orange-500/10 text-orange-500",
  BROKEN: "bg-red-500/10 text-red-500",
};

function conditionLabel(condition: EquipmentCondition) {
  return condition
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ReturnConditionBadge({
  condition,
}: {
  condition: EquipmentCondition;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("px-1.5", conditionColors[condition])}
    >
      {conditionLabel(condition)}
    </Badge>
  );
}
