import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ReservationService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Role } from '@equiprent/db';
import type auth from '../auth';
import { assertRole, getUserRole } from '../common/authorization';
import { parsePagination } from '../common/pagination';

@Controller('reservations')
@UseGuards(AuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(@Body() dto: CreateReservationDto, @Session() session: UserSession) {
    return this.reservationService.create(dto, session.user.id);
  }

  @Get()
  findAll(
    @Session() session: UserSession<typeof auth>,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const role = session.user.role;
    if (
      role !== Role.STUDENT &&
      role !== Role.STAFF &&
      role !== Role.EQUIPMENT_MANAGER &&
      role !== Role.ADMIN
    ) {
      throw new UnauthorizedException('Access denied');
    }

    return this.reservationService.findAll(
      session.user.id,
      role,
      parsePagination({ limit, offset }),
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
  ) {
    return this.reservationService.findOne(id, {
      userId: session.user.id,
      role: getUserRole(session),
    });
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Session() session: UserSession) {
    return this.reservationService.cancel(id, session.user.id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @Session() session: UserSession) {
    assertRole(
      session,
      [Role.ADMIN, Role.EQUIPMENT_MANAGER],
      'Only managers can confirm reservations',
    );

    return this.reservationService.confirm(id);
  }
}
