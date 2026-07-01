"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";
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

interface FaultReportDialogProps {
	equipment: { id: string; name: string }[];
}
const schema = z.object({
	equipmentId: z.string().min(1, "Select equipment"),
	description: z.string().min(10, "Description must be at least 10 characters"),
});

type FaultReportFormData = z.infer<typeof schema>;

export default function FaultReportDialog({
	equipment,
}: FaultReportDialogProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const {
		control,
		reset,
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FaultReportFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			equipmentId: "",
			description: "",
		},
	});
	async function onSubmit(data: FaultReportFormData) {
		try {
			await apiFetch("/returns/faults", {
				method: "POST",
				body: JSON.stringify(data),
			});
			toast.success("Fault reported successfully");
			reset();
			setOpen(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to report fault",
			);
		}
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button">
					<PlusIcon data-icon="inline-start" />
					Report Fault
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Report Fault</DialogTitle>
					<DialogDescription>
						Report a fault for the equipment. Please provide a detailed
						description of the issue.
					</DialogDescription>
				</DialogHeader>
				<form noValidate onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 sm:grid-cols-2">
						<Controller
							control={control}
							name="equipmentId"
							render={({ field }) => (
								<Field data-invalid={Boolean(errors.equipmentId)}>
									<FieldLabel htmlFor="equipmentId">Equipment</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger
											id="equipmentId"
											className="w-full"
											aria-invalid={Boolean(errors.equipmentId)}
										>
											<SelectValue placeholder="Select Equipment" />
										</SelectTrigger>
										<SelectContent>
											{equipment.map((item) => (
												<SelectItem key={item.id} value={item.id}>
													{item.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[errors.equipmentId]} />
								</Field>
							)}
						/>
						<Field className="sm:col-span-2">
							<FieldLabel htmlFor="description">Description</FieldLabel>
							<Textarea
								id="description"
								placeholder="Description"
								{...register("description")}
							/>
							<FieldError errors={[errors.description]} />
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
							disabled={isSubmitting || equipment.length === 0}
						>
							{isSubmitting ? "Reporting..." : "Report Fault"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
