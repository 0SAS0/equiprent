"use client";

import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { FaultReport } from "@/types/fault";
import FaultDetailsSheet from "./fault-details-sheet";
import { FaultStatusBadge } from "./fault-status-badge";

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-GB");
}

export function FaultReportsTable({ faults }: { faults: FaultReport[] }) {
	const [selectedFault, setSelectedFault] = useState<FaultReport | null>(null);
	function openDetails(item: FaultReport) {
		setSelectedFault(item);
	}
	return (
		<div className="overflow-hidden rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Equipment</TableHead>
						<TableHead>Reported by</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{faults.map((fault) => (
						<TableRow
							key={fault.id}
							className="cursor-pointer"
							onClick={() => setSelectedFault(fault)}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									openDetails(fault);
								}
							}}
						>
							<TableCell>{fault.equipment.name}</TableCell>
							<TableCell>{fault.reporter.name}</TableCell>
							<TableCell>{`${fault.description.slice(0, 50)}...`}</TableCell>
							<TableCell>
								<FaultStatusBadge status={fault.status} />
							</TableCell>
							<TableCell>{formatDate(fault.createdAt)}</TableCell>
							<TableCell>
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation(); 
										setSelectedFault(fault);
									}}
								>
									<EyeIcon className="size-4" />
									View
								</Button>
							</TableCell>
						</TableRow>
					))}
					{faults.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="text-center">
								No records found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			{selectedFault && (
				<FaultDetailsSheet
					fault={selectedFault}
					open={selectedFault !== null}
					onOpenChange={(open) => {
						if (!open) setSelectedFault(null);
					}}
				/>
			)}
		</div>
	);
}
