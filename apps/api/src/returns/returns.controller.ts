import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ReturnsService } from './returns.service';
import { CreateReturnReportDto } from './dto/create-return.dto';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { CreateFaultReportDto } from './dto/create-fault-report.dto';
import { FaultStatus } from '@equiprent/db';

@Controller('returns')
@UseGuards(AuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  processReturn(
    @Body() dto: CreateReturnReportDto,
    @Session() session: UserSession,
  ) {
    return this.returnsService.processReturn(dto, session.user.id);
  }

  @Post('/faults')
  reportFault(
    @Body() dto: CreateFaultReportDto,
    @Session() session: UserSession,
  ) {
    return this.returnsService.reportFault(dto, session.user.id);
  }

  @Get('/faults')
  findAllFaults(
    @Query('status') status?: FaultStatus,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.returnsService.findAllFaults({ status, equipmentId });
  }

  @Patch('/faults/:id')
  updateFaultStatus(
    @Param('id') id: string,
    @Body() body: { status: FaultStatus; resolution?: string },
    @Session() session: UserSession,
  ) {
    const role = Array.isArray(session.user.role)
      ? session.user.role[0]
      : session.user.role;
    if (role !== 'EQUIPMENT_MANAGER' && role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only equipment managers and admins can update fault status',
      );
    }
    return this.returnsService.updateFaultStatus(
      id,
      body.status,
      body.resolution,
    );
  }

  @Get('/history/:equipmentId')
  getReturnHistory(@Param('equipmentId') equipmentId: string) {
    return this.returnsService.getReturnHistory(equipmentId);
  }
}
