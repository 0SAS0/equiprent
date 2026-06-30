import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReservationService } from './reservations.service';
import { ReservationController } from './reservations.controller';
import { ReservationStatusCronService } from './reservation-status-cron.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationStatusCronService],
  exports: [ReservationService],
})
export class ReservationModule {}
