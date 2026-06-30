import { EquipmentCondition } from '@equiprent/db';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateReturnReportDto {
  @IsString()
  reservationId: string;

  @IsEnum(EquipmentCondition)
  condition: EquipmentCondition;

  @IsString()
  @IsOptional()
  notes: string;
}
