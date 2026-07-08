import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, ReservationStatus } from '@equiprent/db';
import { reminderTemplate } from './templates/reminder.template';
import { overdueTemplate } from './templates/overdue.template';

const from = 'EquipRent <onboarding@equiprent.me>';

@Injectable()
export class NotificationService {
  private resend = new Resend(process.env.RESEND_API_KEY);
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  async findForUser(userId: string, take = 20) {
    return this.prisma.client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.client.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.client.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.client.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { ok: true };
  }

  async sendReturnReminders() {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reservations = await this.prisma.client.reservation.findMany({
      where: {
        status: ReservationStatus.ACTIVE,
        reminderSent: false,
        endDate: {
          gte: now,
          lte: in24h,
        },
      },
      include: {
        user: true,
        equipment: true,
      },
    });
    for (const reservation of reservations) {
      await this.sendOne(reservation, 'reminder');
    }
  }

  async sendOverdueNotices() {
    const reservations = await this.prisma.client.reservation.findMany({
      where: {
        status: ReservationStatus.OVERDUE,
        overdueSent: false,
      },
      include: {
        user: true,
        equipment: true,
      },
    });
    for (const reservation of reservations) {
      await this.sendOne(reservation, 'overdue');
    }
  }
  private async sendOne(
    reservation: {
      id: string;
      userId: string;
      endDate: Date;
      user: { email: string; name: string | null };
      equipment: { name: string };
    },
    kind: 'reminder' | 'overdue',
  ) {
    const template = (kind === 'reminder' ? reminderTemplate : overdueTemplate)(
      {
        userName: reservation.user.name ?? reservation.user.email,
        equipmentName: reservation.equipment.name,
        endDate: reservation.endDate,
        reservationId: reservation.id,
      },
    );

    try {
      const { error } = await this.resend.emails.send({
        from,
        to: reservation.user.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) throw new Error(error.message);

      await this.prisma.client.reservation.update({
        where: { id: reservation.id },
        data:
          kind === 'reminder' ? { reminderSent: true } : { overdueSent: true },
      });

      await this.prisma.client.notification.create({
        data: {
          userId: reservation.userId,
          type:
            kind === 'reminder'
              ? NotificationType.REMINDER_RETURN
              : NotificationType.OVERDUE_NOTICE,
          title: template.subject,
          message: `Reservation for ${reservation.equipment.name}`,
          sentEmail: true,
        },
      });

      this.logger.log(`Sent ${kind} email for reservation ${reservation.id}`);
    } catch (err) {
      this.logger.error(
        `Failed to send ${kind} for reservation ${reservation.id}`,
        err,
      );
    }
  }
}
