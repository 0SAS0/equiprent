export type NotificationType =
	| "RESERVATION_CONFIRMED"
	| "RESERVATION_REJECTED"
	| "REMINDER_RETURN"
	| "OVERDUE_NOTICE"
	| "FAULT_STATUS_CHANGE";

export interface AppNotification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	read: boolean;
	createdAt: string;
}
