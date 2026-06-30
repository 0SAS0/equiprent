import { IsString } from 'class-validator';

export class CreateFaultReportDto {
  @IsString()
  equipmentId: string;

  @IsString()
  description: string;
}
