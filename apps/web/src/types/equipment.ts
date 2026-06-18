export type equipmetStatus =
  |"AVAILABLE"
  |"RESERVED"
  |"RENTED"
  |"MAINTENANCE"
  |"DAMAGED"
  |"RETIRED"

export interface Equipment {
	id: string;
	name: string;
	category: string;
	serialNumber: string;
	manufacturer?: string;
	model?: string;
	locationBuilding?: string;
	locationRoom?: string;
	status: equipmetStatus;
	maxRentalDays: number;
	active: boolean;
	createdAt: string;
}
