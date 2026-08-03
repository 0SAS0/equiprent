import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import auth from './auth';
import { EquipmentModule } from './equipment/equipment.module';
import { ReservationModule } from './reservation/reservations.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReturnsModule } from './returns/returns.module';
import { UsersModule } from './users/users.module';
import { NotificationModule } from './notification/notification.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule.forRoot({ auth }),
    EquipmentModule,
    ReservationModule,
    ReturnsModule,
    UsersModule,
    NotificationModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
