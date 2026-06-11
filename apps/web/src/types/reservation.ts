export type ReservationStatus =
	| "PENDING"
	| "CONFIRMED"
	| "ACTIVE"
	| "RETURNED"
	| "CANCELLED"
	| "OVERDUE"
	| "REJECTED";

export interface Reservation {
	id: string;
	userId: string;
	equipmentId: string;
	status: ReservationStatus;
	startDate: string;
	endDate: string;
	purposeNote: string | null;
	managerNote: string | null;
	createdAt: string;
	equipment: {
		id: string;
		name: string;
		serialNumber: string;
	};
	user: {
		name: string;
		email: string;
	};
}
