import {
  UseGuards,
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { EquipmentService } from './equipment.service';
import { Equipment, Role } from '@equiprent/db';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { assertRole } from '../common/authorization';

@Controller('equipment')
@UseGuards(AuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Promise<Equipment[]> {
    return this.equipmentService.findAll({
      status: status as any,
      category: category as any,
      search,
    });
  }

  @Get('/stats')
  getStats() {
    return this.equipmentService.getStats();
  }

  @Get('/:id')
  findOne(@Param('id') id: string): Promise<Equipment> {
    return this.equipmentService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateEquipmentDto,
    @Session() session: UserSession,
  ): Promise<Equipment> {
    assertRole(
      session,
      [Role.EQUIPMENT_MANAGER, Role.ADMIN],
      'Only equipment managers and admins can create equipment',
    );
    return this.equipmentService.create(dto, session.user.id);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentDto,
    @Session() session: UserSession,
  ): Promise<Equipment> {
    assertRole(
      session,
      [Role.EQUIPMENT_MANAGER, Role.ADMIN],
      'Only equipment managers and admins can update equipment',
    );
    return this.equipmentService.update(id, dto);
  }

  @Delete('/:id')
  remove(
    @Param('id') id: string,
    @Session() session: UserSession,
  ): Promise<Equipment> {
    assertRole(
      session,
      [Role.EQUIPMENT_MANAGER, Role.ADMIN],
      'Only equipment managers and admins can delete equipment',
    );
    return this.equipmentService.remove(id);
  }
}
