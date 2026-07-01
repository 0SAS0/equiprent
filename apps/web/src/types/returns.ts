export const equipmentConditions = [
  "PERFECT",
  "GOOD",
  "MINOR_DAMAGE",
  "MAJOR_DAMAGE",
  "BROKEN",
] as const;

export type EquipmentCondition = (typeof equipmentConditions)[number];

export interface ReturnHistoryRecord {
  id: string;
  condition: EquipmentCondition;
  notes: string | null;
  createdAt: string;
  reservation: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    equipment: {
      name: string;
      serialNumber: string;
    };
  };
}
