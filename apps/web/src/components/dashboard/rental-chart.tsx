"use client";
import { ArrowUpFromDot } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

interface RentalChartProps {
	data: {
		month: string;
		count: number;
	}[];
}
const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "#2563eb",
	},
	mobile: {
		label: "Mobile",
		color: "#60a5fa",
	},
} satisfies ChartConfig;

export default function RentalChart({ data }: RentalChartProps) {
	const previousMonth = data.at(-2)?.count ?? 0;
	const currentMonth = data.at(-1)?.count ?? 0;

	const percentChange =
		previousMonth > 0
			? Math.round(((currentMonth - previousMonth) / previousMonth) * 100)
			: currentMonth > 0
				? 100
				: 0;
	const isPositive = percentChange >= 0;
	return (
		<div className="rounded-xl border p-5 bg-card col-span-2 shadow-sm">
			<div className="mb-5 flex items-start justify-between">
				<div>
					<h2 className="text-base font-semibold text-white">
						Renting Monthly
					</h2>
					<p className="mt-1 text-xs text-slate-500">Last 7 Months</p>
				</div>

				<div
					className={
						isPositive
							? "rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400"
							: "rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400"
					}
				>
					{isPositive ? "+" : ""}
					{percentChange}%
				</div>
			</div>
			<ChartContainer config={chartConfig} className="h-55 w-full">
				<BarChart
					data={data}
					margin={{
						top: 10,
						right: 8,
						left: -20,
						bottom: 0,
					}}
					barCategoryGap="28%"
				>
					<CartesianGrid
						vertical={false}
						strokeDasharray="3 3"
						stroke="transparent"
					/>

					<XAxis
						dataKey="month"
						axisLine={false}
						tickLine={false}
						tickMargin={10}
						tick={{
							fill: "#64748b",
							fontSize: 12,
						}}
					/>
					<YAxis hide domain={[0, 100]} />

					<ChartTooltip content={<ChartTooltipContent hideLabel />} />
					<Bar
						dataKey="count"
						fill="white"
						radius={[6, 6, 2, 2]}
						className="opacity-90"
					></Bar>
				</BarChart>
			</ChartContainer>
		</div>
	);
}
