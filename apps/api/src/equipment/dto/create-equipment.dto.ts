import { EquipmentCategory } from '@equiprent/db';
import { IsInt, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  name: string;

  @IsEnum(EquipmentCategory)
  category: string;

  @IsString()
  serialNumber: string;

  @IsString()
  @IsOptional()
  manufacturer: string;

  @IsString()
  @IsOptional()
  model: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  locationBuilding: string;

  @IsString()
  @IsOptional()
  locationRoom: string;

  @IsInt()
  maxRentalDays: number;
}
