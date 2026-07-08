import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification.service';

@Injectable()
export class ReminderCron {
  private readonly logger = new Logger(ReminderCron.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleReminders() {
    this.logger.log('Checking upcoming return reminders...');
    await this.notificationService.sendReturnReminders();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdue() {
    this.logger.log('Checking overdue notices...');
    await this.notificationService.sendOverdueNotices();
  }
}
