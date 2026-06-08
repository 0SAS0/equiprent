export interface Equipment {
	id: string;
	name: string;
	category: string;
	serialNumber: string;
	manufacturer?: string;
	model?: string;
	locationBuilding?: string;
	locationRoom?: string;
	status: string;
	maxRentalDays: number;
	active: boolean;
	createdAt: string;
}
