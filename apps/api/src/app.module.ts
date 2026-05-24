import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import auth from './auth';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
  imports: [AuthModule.forRoot({ auth }), EquipmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
