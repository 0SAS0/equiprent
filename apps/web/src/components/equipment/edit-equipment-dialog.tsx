"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/types/equipment";

const categories = [
  "LAPTOP",
  "PROJECTOR",
  "CAMERA",
  "AUDIO",
  "TABLET",
  "PRINTER_3D",
  "ELECTRONICS",
  "ACCESSORY",
  "OTHER",
] as const;

const statuses = [
  "AVAILABLE",
  "RESERVED",
  "RENTED",
  "MAINTENANCE",
  "DAMAGED",
  "RETIRED",
] as const;

const optionalText = z.string().trim().optional();
const optionalDate = z.string().optional();
const jsonText = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Technical specification must be valid JSON" },
  );

const equipmentSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters"),
  category: z.enum(categories, { message: "Select a category" }),
  serialNumber: z.string().trim().min(1, "Serial number is required"),
  manufacturer: optionalText,
  model: optionalText,
  description: optionalText,
  technicalSpec: jsonText,
  locationBuilding: optionalText,
  locationRoom: optionalText,
  locationDetail: optionalText,
  purchaseDate: optionalDate,
  warrantyUntil: optionalDate,
  status: z.enum(statuses, { message: "Select a status" }),
  maxRentalDays: z
    .number({ message: "Enter the maximum rental period" })
    .int("Rental period must be a whole number")
    .min(1, "Rental period must be at least 1 day"),
});

type EditEquipmentDialogProps = {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EquipmentFormData = z.infer<typeof equipmentSchema>;

function categoryLabel(category: string) {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusLabel(status: string) {
  return categoryLabel(status);
}

function formatDateInput(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatTechnicalSpec(value: Equipment["technicalSpec"]) {
  if (!value) return "";
  return JSON.stringify(value, null, 2);
}

export function EditEquipmentDialog({
  equipment,
  open,
  onOpenChange,
}: EditEquipmentDialogProps) {
  const router = useRouter();
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      manufacturer: "",
      model: "",
      description: "",
      technicalSpec: "",
      status: "AVAILABLE",
      locationBuilding: "",
      locationRoom: "",
      locationDetail: "",
      purchaseDate: "",
      warrantyUntil: "",
      maxRentalDays: 7,
    },
  });

  useEffect(() => {
    if (!equipment) return;

    reset({
      name: equipment.name,
      category: equipment.category as EquipmentFormData["category"],
      serialNumber: equipment.serialNumber,
      manufacturer: equipment.manufacturer ?? "",
      model: equipment.model ?? "",
      description: equipment.description ?? "",
      technicalSpec: formatTechnicalSpec(equipment.technicalSpec),
      status: equipment.status as EquipmentFormData["status"],
      locationBuilding: equipment.locationBuilding ?? "",
      locationRoom: equipment.locationRoom ?? "",
      locationDetail: equipment.locationDetail ?? "",
      purchaseDate: formatDateInput(equipment.purchaseDate),
      warrantyUntil: formatDateInput(equipment.warrantyUntil),
      maxRentalDays: equipment.maxRentalDays,
    });
  }, [equipment, reset]);

  async function onSubmit(data: EquipmentFormData) {
    if (!equipment) return;

    try {
      await apiFetch(`/equipment/${equipment.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      toast.success("Equipment updated");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update equipment",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit equipment</DialogTitle>
          <DialogDescription>
            Edit the details of an existing equipment item.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="equipment-name">Name</FieldLabel>
              <Input
                id="equipment-name"
                autoComplete="off"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.category)}>
                  <FieldLabel htmlFor="equipment-category">Category</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="equipment-category"
                      className="w-full"
                      aria-invalid={Boolean(errors.category)}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {categoryLabel(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.category]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.status)}>
                  <FieldLabel htmlFor="equipment-status">Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="equipment-status"
                      className="w-full"
                      aria-invalid={Boolean(errors.status)}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.status]} />
                </Field>
              )}
            />

            <Field data-invalid={Boolean(errors.serialNumber)}>
              <FieldLabel htmlFor="equipment-serial-number">
                Serial number
              </FieldLabel>
              <Input
                id="equipment-serial-number"
                autoComplete="off"
                aria-invalid={Boolean(errors.serialNumber)}
                {...register("serialNumber")}
              />
              <FieldError errors={[errors.serialNumber]} />
            </Field>

            <Field data-invalid={Boolean(errors.maxRentalDays)}>
              <FieldLabel htmlFor="equipment-max-rental-days">
                Maximum rental days
              </FieldLabel>
              <Input
                id="equipment-max-rental-days"
                type="number"
                min={1}
                aria-invalid={Boolean(errors.maxRentalDays)}
                {...register("maxRentalDays", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.maxRentalDays]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-manufacturer">
                Manufacturer
              </FieldLabel>
              <Input
                id="equipment-manufacturer"
                {...register("manufacturer")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-model">Model</FieldLabel>
              <Input id="equipment-model" {...register("model")} />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="equipment-description">
                Description
              </FieldLabel>
              <Textarea
                id="equipment-description"
                rows={3}
                {...register("description")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-building">Building</FieldLabel>
              <Input
                id="equipment-building"
                {...register("locationBuilding")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-room">Room</FieldLabel>
              <Input id="equipment-room" {...register("locationRoom")} />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="equipment-location-detail">
                Location details
              </FieldLabel>
              <Input
                id="equipment-location-detail"
                placeholder="Shelf, cabinet, notes"
                {...register("locationDetail")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-purchase-date">
                Purchase date
              </FieldLabel>
              <Input
                id="equipment-purchase-date"
                type="date"
                {...register("purchaseDate")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-warranty-until">
                Warranty until
              </FieldLabel>
              <Input
                id="equipment-warranty-until"
                type="date"
                {...register("warrantyUntil")}
              />
            </Field>

            <Field
              className="sm:col-span-2"
              data-invalid={Boolean(errors.technicalSpec)}
            >
              <FieldLabel htmlFor="equipment-technical-spec">
                Technical specification JSON
              </FieldLabel>
              <Textarea
                id="equipment-technical-spec"
                rows={5}
                placeholder={'{"cpu":"Intel i7","ram":"16 GB"}'}
                aria-invalid={Boolean(errors.technicalSpec)}
                {...register("technicalSpec")}
              />
              <FieldError errors={[errors.technicalSpec]} />
            </Field>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
