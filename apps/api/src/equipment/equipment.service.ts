import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Equipment, EquipmentCategory, EquipmentStatus } from '@equiprent/db';
import { NotFoundException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}
  findAll(filters?: {
    status?: EquipmentStatus;
    category?: EquipmentCategory;
    search?: string;
  }): Promise<Equipment[]> {
    return this.prisma.client.equipment.findMany({
      where: {
        active: true,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { serialNumber: { contains: filters.search, mode: 'insensitive' } },
            {
              locationBuilding: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        faultReports: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment with id ${id} not found`);
    }
    return equipment;
  }

  async create(dto: CreateEquipmentDto, userId: string): Promise<Equipment> {
    return this.prisma.client.equipment
      .findUnique({
        where: { serialNumber: dto.serialNumber },
      })
      .then((existing) => {
        if (existing) {
          throw new ConflictException(
            `Equipment with serial number ${dto.serialNumber} already exists`,
          );
        }
        return this.prisma.client.equipment.create({
          data: {
            name: dto.name,
            createdBy: userId,
            category: dto.category as EquipmentCategory,
            serialNumber: dto.serialNumber,
            manufacturer: dto.manufacturer,
            model: dto.model,
            description: dto.description,
            locationBuilding: dto.locationBuilding,
            locationRoom: dto.locationRoom,
            maxRentalDays: dto.maxRentalDays,
          },
        });
      });
  }

  async update(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findOne(id);
    if (!equipment) {
      throw new NotFoundException(`Equipment with id ${id} not found`);
    }
    return this.prisma.client.equipment.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category as EquipmentCategory,
        serialNumber: dto.serialNumber,
        manufacturer: dto.manufacturer,
        model: dto.model,
        description: dto.description,
        locationBuilding: dto.locationBuilding,
        locationRoom: dto.locationRoom,
        maxRentalDays: dto.maxRentalDays,
        status: dto.status,
      },
    });
  }
  async remove(id: string): Promise<Equipment> {
    const equipment = await this.findOne(id);
    if (!equipment) {
      throw new NotFoundException(`Equipment with id ${id} not found`);
    }
    return this.prisma.client.equipment.update({
      where: { id },
      data: { active: false },
    });
  }
  async getStats() {
    const [total, available, rented, reserved] = await Promise.all([
      this.prisma.client.equipment.count(),
      this.prisma.client.equipment.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.client.equipment.count({ where: { status: 'RENTED' } }),
      this.prisma.client.equipment.count({ where: { status: 'RESERVED' } }),
    ]);
    return {
      total,
      available,
      rented,
      reserved,
    };
  }
}
