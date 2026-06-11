"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/types/equipment";

type CreateReservationDialogProps = {
	equipment: Equipment[];
};

const reservationSchema = z
	.object({
		equipmentId: z.string().min(1, "Select equipment"),
		startDate: z.string().min(1, "Select start date"),
		endDate: z.string().min(1, "Select end date"),
		purposeNote: z.string().trim().optional(),
	})
	.refine((data) => new Date(data.endDate) > new Date(data.startDate), {
		message: "End date must be after start date",
		path: ["endDate"],
	});

type ReservationFormData = z.infer<typeof reservationSchema>;

export default function CreateReservationDialog({
	equipment,
}: CreateReservationDialogProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ReservationFormData>({
		resolver: zodResolver(reservationSchema),
		defaultValues: {
			equipmentId: "",
			startDate: "",
			endDate: "",
			purposeNote: "",
		},
	});

	async function onSubmit(data: ReservationFormData) {
		try {
			await apiFetch("/reservations", {
				method: "POST",
				body: JSON.stringify({
					...data,
					startDate: new Date(data.startDate).toISOString(),
					endDate: new Date(data.endDate).toISOString(),
				}),
			});
			toast.success("Reservation created successfully");
			reset();
			setOpen(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add reservation",
			);
		}
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button">
					<PlusIcon data-icon="inline-start" />
					Add reservation
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add reservation</DialogTitle>
					<DialogDescription>
						Add a new reservation for the selected equipment.
					</DialogDescription>
				</DialogHeader>
				<form noValidate onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 sm:grid-cols-2">
						<Controller
							control={control}
							name="equipmentId"
							render={({ field }) => (
								<Field data-invalid={Boolean(errors.equipmentId)}>
									<FieldLabel htmlFor="equipment-id">Equipment</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger
											id="equipment-id"
											className="w-full"
											aria-invalid={Boolean(errors.equipmentId)}
										>
											<SelectValue placeholder="Select equipment" />
										</SelectTrigger>
										<SelectContent>
											{equipment.map((item) => (
												<SelectItem key={item.id} value={item.id}>
													{item.name} - {item.serialNumber}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[errors.equipmentId]} />
								</Field>
							)}
						/>
						<Field data-invalid={Boolean(errors.startDate)}>
							<FieldLabel htmlFor="start-date">Start date</FieldLabel>
							<Input
								id="start-date"
								type="date"
								min={new Date().toISOString().split("T")[0]}
								aria-invalid={Boolean(errors.startDate)}
								{...register("startDate")}
							/>
							<FieldError errors={[errors.startDate]} />
						</Field>

						<Field data-invalid={Boolean(errors.endDate)}>
							<FieldLabel htmlFor="end-date">End date</FieldLabel>
							<Input
								id="end-date"
								type="date"
								aria-invalid={Boolean(errors.endDate)}
								{...register("endDate")}
							/>
							<FieldError errors={[errors.endDate]} />
						</Field>

						<Field className="sm:col-span-2">
							<FieldLabel htmlFor="purpose-note">Purpose</FieldLabel>
							<Input
								id="purpose-note"
								placeholder="Reason for reservation"
								{...register("purposeNote")}
							/>
							<FieldError errors={[errors.purposeNote]} />
						</Field>
					</div>
					<DialogFooter className="mt-6">
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isSubmitting}>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" disabled={equipment.length === 0}>
							{isSubmitting ? "Adding..." : "Add reservation"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
