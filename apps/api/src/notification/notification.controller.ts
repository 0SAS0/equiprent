import {
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Role } from '@equiprent/db';
import type auth from '../auth';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('run-reminders')
  async runReminders(@Session() session: UserSession<typeof auth>) {
    if (session.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can trigger notifications');
    }
    await this.notificationService.sendReturnReminders();
    await this.notificationService.sendOverdueNotices();
    return { ok: true };
  }
}
