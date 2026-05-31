import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ReservationService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Role } from '@equiprent/db';
import type auth from '../auth';

@Controller('reservations')
@UseGuards(AuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(@Body() dto: CreateReservationDto, @Session() session: UserSession) {
    return this.reservationService.create(dto, session.user.id);
  }

  @Get()
  findAll(@Session() session: UserSession<typeof auth>) {
    const role = session.user.role;
    if (
      role !== Role.STUDENT &&
      role !== Role.STAFF &&
      role !== Role.EQUIPMENT_MANAGER &&
      role !== Role.ADMIN
    ) {
      throw new UnauthorizedException('Access denied');
    }

    return this.reservationService.findAll(session.user.id, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Session() session: UserSession) {
    return this.reservationService.cancel(id, session.user.id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @Session() session: UserSession) {
    const role = Array.isArray(session.user.role)
      ? session.user.role[0]
      : session.user.role;

    if (role !== Role.ADMIN && role !== Role.EQUIPMENT_MANAGER) {
      throw new ForbiddenException('Only managers can confirm reservations');
    }

    return this.reservationService.confirm(id);
  }
}
