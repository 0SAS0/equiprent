import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  equipmentId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  purposeNote: string;
}
