import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@equiprent/db';

@Injectable()
export class ReservationStatusCronService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/1 * * * *')
  async syncReservationStatuses() {
    const now = new Date();

    await this.prisma.client.reservation.updateMany({
      where: {
        status: ReservationStatus.CONFIRMED,
        startDate: { lte: now },
      },
      data: {
        status: ReservationStatus.ACTIVE,
      },
    });

    await this.prisma.client.reservation.updateMany({
      where: {
        status: ReservationStatus.ACTIVE,
        endDate: { lt: now },
      },
      data: {
        status: ReservationStatus.OVERDUE,
      },
    });
  }
}
