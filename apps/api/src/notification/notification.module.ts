import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ReminderCron } from './cron/reminder.cron';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, ReminderCron],
  exports: [NotificationService],
})
export class NotificationModule {}
