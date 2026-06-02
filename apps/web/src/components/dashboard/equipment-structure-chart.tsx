"use client";
import { Pie, PieChart, Sector } from "recharts";

const categoryColors: Record<string, string> = {
	LAPTOP: "#2563eb",
	PROJECTOR: "#f59e0b",
	CAMERA: "#9333ea",
	AUDIO: "#22c55e",
	TABLET: "#06b6d4",
	PRINTER_3D: "#ef4444",
	ELECTRONICS: "#84cc16",
	ACCESSORY: "#ec4899",
	OTHER: "#6b7280",
};

interface EquipmentStructureChartProps {
	total: number;
	data: {
		category: string;
		count: number;
	}[];
}
function DonutSegment(props: any) {
	return <Sector {...props} fill={props.payload.color} />;
}
export default function EquipmentStructureChart({
	data,
	total,
}: EquipmentStructureChartProps) {
	const chartData = data.map((item) => ({
		name: item.category,
		value: item.count,
		color: categoryColors[item.category] ?? "#6b7280",
	}));

	return (
		<div className="col-span-1 md:col-span-2 rounded-xl border p-5 bg-card shadow-sm">
			<div className="mb-6">
				<h2 className="text-base font-semibold text-white">
					Structure of Equipment
				</h2>
				<p className="mt-1 text-xs text-slate-500">Division by category</p>
			</div>

			<div className="flex h-55 items-center justify-between gap-8">
				<div className="relative h-42.5 w-42.5 shrink-0">
					<PieChart width={170} height={170}>
						<Pie
							data={chartData}
							dataKey="value"
							innerRadius={52}
							outerRadius={72}
							paddingAngle={0}
							stroke="none"
							shape={<DonutSegment />}
						/>
					</PieChart>

					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<div className="text-2xl font-bold text-white">{total}</div>
						<div className="text-xs text-muted-foreground">Devices</div>
					</div>
				</div>

				<div className="flex w-65 flex-col gap-3">
					{chartData.map((item) => {
						const percent =
							total > 0 ? Math.round((item.value / total) * 100) : 0;

						return (
							<div
								key={item.name}
								className="grid grid-cols-[130px_20px] items-center gap-6 text-sm"
							>
								<div className="flex items-center gap-3 text-muted-foreground">
									<span
										className="h-3 w-3 rounded-sm"
										style={{ backgroundColor: item.color }}
									/>
									<span>{item.name}</span>
								</div>

								<span className="text-right font-semibold text-white">
									{percent}%
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
