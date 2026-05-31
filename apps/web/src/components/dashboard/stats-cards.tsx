import {
	BoxIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
	equipment: {
		total: number;
		available: number;
		rented: number;
		reserved: number;
	};
	reservations: {
		pending: number;
		active: number;
	};
}
export function StatsCards({ equipment, reservations }: StatsCardsProps) {
	const cards = [
		{
			title: "Total Equipment",
			value: equipment.total, // ← destrukturyzowane propsy
			description: "All registered equipment",
			icon: <BoxIcon className="size-4 text-muted-foreground" />,
		},
		{
			title: "Available",
			value: equipment.available,
			description: "Ready to rent",
			icon: <CheckCircleIcon className="size-4 text-muted-foreground" />,
		},
		{
			title: "Rented",
			value: equipment.rented,
			description: "Currently rented out",
			icon: <ClockIcon className="size-4 text-muted-foreground" />,
		},
		{
			title: "Pending Reservations",
			value: reservations.pending,
			description: "Waiting for confirmation",
			icon: <CalendarIcon className="size-4 text-muted-foreground" />,
		},
	];
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 lg:px-6">
			{cards.map((card) => (
				<Card key={card.title}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{card.title}
						</CardTitle>
						{card.icon}
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{card.value}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{card.description}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
