export const faultStatuses = [
  "REPORTED",
  "IN_REVIEW",
  "IN_REPAIR",
  "RESOLVED",
  "CLOSED",
] as const;

export type FaultStatus = (typeof faultStatuses)[number];

export interface FaultReport {
  id: string;
  description: string;
  status: FaultStatus;
  resolution?: string;
  createdAt: string;
  equipment: { name: string };
  reporter: { name: string; email: string };
}
