export type EquipmentStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "RENTED"
  | "MAINTENANCE"
  | "DAMAGED"
  | "RETIRED";

export type EquipmentTechnicalSpec = Record<string, unknown> | null;

export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  manufacturer?: string | null;
  model?: string | null;
  description?: string | null;
  technicalSpec?: EquipmentTechnicalSpec;
  locationBuilding?: string | null;
  locationRoom?: string | null;
  locationDetail?: string | null;
  status: EquipmentStatus;
  purchaseDate?: string | null;
  warrantyUntil?: string | null;
  maxRentalDays: number;
  active: boolean;
  createdAt: string;
}
