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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import type { Reservation } from "@/types/reservation";

type ProcessReturnDialogProps = {
	reservation: Reservation[];
};

const ReturnDialogSchema = z.object({
	reservationId: z.string().min(1, "Choose a reservation"),
	condition: z.enum([
		"PERFECT",
		"GOOD",
		"MINOR_DAMAGE",
		"MAJOR_DAMAGE",
		"BROKEN",
	]),
	notes: z.string().trim().optional(),
});

type ReturnDialogFormData = z.infer<typeof ReturnDialogSchema>;

export default function ProcessReturnDialog({
	reservation,
}: ProcessReturnDialogProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ReturnDialogFormData>({
		resolver: zodResolver(ReturnDialogSchema),
		defaultValues: {
			reservationId: "",
			condition: "GOOD",
			notes: "",
		},
	});

	async function onSubmit(data: ReturnDialogFormData) {
		try {
			await apiFetch("/returns", {
				method: "POST",
				body: JSON.stringify(data),
			});
			toast.success("Return processed successfully");
			reset();
			setOpen(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to process return",
			);
		}
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button">
					<PlusIcon data-icon="inline-start" />
					Register Return
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Register Return</DialogTitle>
					<DialogDescription>
						Add a new return for the selected equipment.
					</DialogDescription>
				</DialogHeader>
				<form noValidate onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 sm:grid-cols-2">
						<Controller
							control={control}
							name="reservationId"
							render={({ field }) => (
								<Field data-invalid={Boolean(errors.reservationId)}>
									<FieldLabel htmlFor="reservation-id">Reservation</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger
											id="reservation-id"
											className="w-full"
											aria-invalid={Boolean(errors.reservationId)}
										>
											<SelectValue placeholder="Select reservation" />
										</SelectTrigger>
										<SelectContent>
											{reservation.map((item) => (
												<SelectItem key={item.id} value={item.id}>
													{item.equipment.name} ({item.equipment.serialNumber})
													— {item.user.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[errors.reservationId]} />
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="condition"
							render={({ field }) => (
								<Field data-invalid={Boolean(errors.condition)}>
									<FieldLabel htmlFor="condition">Condition</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger
											id="condition"
											aria-invalid={Boolean(errors.condition)}
										>
											<SelectValue placeholder="Select condition" />
										</SelectTrigger>
										<SelectContent>
											{[
												"PERFECT",
												"GOOD",
												"MINOR_DAMAGE",
												"MAJOR_DAMAGE",
												"BROKEN",
											].map((item) => (
												<SelectItem key={item} value={item}>
													{item}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[errors.condition]} />
								</Field>
							)}
						/>

						<Field className="sm:col-span-2">
							<FieldLabel htmlFor="notes">Notes</FieldLabel>
							<Textarea
								id="notes"
								placeholder="Optional notes"
								{...register("notes")}
							/>
							<FieldError errors={[errors.notes]} />
						</Field>
					</div>

					<DialogFooter className="mt-6">
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isSubmitting}>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={isSubmitting || reservation.length === 0}
						>
							{isSubmitting ? "Adding..." : "Register return"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
