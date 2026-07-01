import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import auth from './auth';
import { EquipmentModule } from './equipment/equipment.module';
import { ReservationModule } from './reservation/reservations.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReturnsModule } from './returns/returns.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule.forRoot({ auth }),
    EquipmentModule,
    ReservationModule,
    ReturnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
