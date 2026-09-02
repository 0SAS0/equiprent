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
  maxRentalDays: z
    .number({ message: "Enter the maximum rental period" })
    .int("Rental period must be a whole number")
    .min(1, "Rental period must be at least 1 day"),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

function categoryLabel(category: string) {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AddEquipmentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
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
      locationBuilding: "",
      locationRoom: "",
      locationDetail: "",
      purchaseDate: "",
      warrantyUntil: "",
      maxRentalDays: 7,
    },
  });

  async function onSubmit(data: EquipmentFormData) {
    try {
      await apiFetch<Equipment>("/equipment", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Equipment added successfully");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add equipment",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <PlusIcon data-icon="inline-start" />
          Add equipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add equipment</DialogTitle>
          <DialogDescription>
            Add a new item to the equipment inventory.
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
              {isSubmitting ? "Adding..." : "Add equipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
