import { CreateEquipmentDto } from './create-equipment.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { EquipmentStatus } from '@equiprent/db';

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {
  @IsEnum(EquipmentStatus)
  @IsOptional()
  status!: EquipmentStatus;
}
