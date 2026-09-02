import { EquipmentCategory } from '@equiprent/db';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsJSON,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  name!: string;

  @IsEnum(EquipmentCategory)
  category!: string;

  @IsString()
  serialNumber!: string;

  @IsString()
  @IsOptional()
  manufacturer!: string;

  @IsString()
  @IsOptional()
  model!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  locationBuilding!: string;

  @IsString()
  @IsOptional()
  locationRoom!: string;

  @IsString()
  @IsOptional()
  locationDetail!: string;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsJSON()
  @IsOptional()
  technicalSpec!: string | null;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsDateString()
  @IsOptional()
  purchaseDate!: string | null;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsDateString()
  @IsOptional()
  warrantyUntil!: string | null;

  @IsInt()
  maxRentalDays!: number;
}
