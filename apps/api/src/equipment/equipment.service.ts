import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Equipment, EquipmentCategory, EquipmentStatus } from '@equiprent/db';
import { NotFoundException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import type { PaginationOptions } from '../common/pagination';

function parseTechnicalSpec(value?: string | null) {
  if (value === null) return null;
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    throw new BadRequestException('Technical specification must be valid JSON');
  }
}

function parseOptionalDate(value?: string | null) {
  if (value === null) return null;
  return value ? new Date(value) : undefined;
}

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}
  findAll(
    filters?: {
      status?: EquipmentStatus;
      category?: EquipmentCategory;
      search?: string;
    },
    pagination?: PaginationOptions,
  ): Promise<Equipment[]> {
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
      take: pagination?.take,
      skip: pagination?.skip,
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
            technicalSpec: parseTechnicalSpec(dto.technicalSpec),
            locationBuilding: dto.locationBuilding,
            locationRoom: dto.locationRoom,
            locationDetail: dto.locationDetail,
            purchaseDate: parseOptionalDate(dto.purchaseDate),
            warrantyUntil: parseOptionalDate(dto.warrantyUntil),
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
        technicalSpec: parseTechnicalSpec(dto.technicalSpec),
        locationBuilding: dto.locationBuilding,
        locationRoom: dto.locationRoom,
        locationDetail: dto.locationDetail,
        purchaseDate: parseOptionalDate(dto.purchaseDate),
        warrantyUntil: parseOptionalDate(dto.warrantyUntil),
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
  async buildMonthlyReservationCounts(reservations: { createdAt: Date }[]) {
    const months: { month: string; count: number }[] = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      months.push({
        month: date.toLocaleString('en-US', { month: 'short' }),
        count: 0,
      });
    }

    for (const reservation of reservations) {
      const month = reservation.createdAt.toLocaleString('en-US', {
        month: 'short',
      });

      const found = months.find((item) => item.month === month);

      if (found) {
        found.count += 1;
      }
    }

    return months;
  }

  async getStats() {
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
    sevenMonthsAgo.setDate(1);
    sevenMonthsAgo.setHours(0, 0, 0, 0);

    const [
      total,
      available,
      rented,
      reserved,
      pending,
      activeReservations,
      byCategory,
      reservations,
    ] = await Promise.all([
      this.prisma.client.equipment.count({
        where: { active: true },
      }),

      this.prisma.client.equipment.count({
        where: { active: true, status: 'AVAILABLE' },
      }),

      this.prisma.client.equipment.count({
        where: { active: true, status: 'RENTED' },
      }),

      this.prisma.client.equipment.count({
        where: { active: true, status: 'RESERVED' },
      }),

      this.prisma.client.reservation.count({
        where: { status: 'PENDING' },
      }),

      this.prisma.client.reservation.count({
        where: { status: 'ACTIVE' },
      }),

      this.prisma.client.equipment.groupBy({
        by: ['category'],
        where: { active: true },
        _count: { _all: true },
      }),

      this.prisma.client.reservation.findMany({
        select: { createdAt: true },
        where: {
          createdAt: {
            gte: sevenMonthsAgo,
          },
        },
      }),
    ]);

    return {
      equipment: {
        total,
        available,
        rented,
        reserved,
      },

      equipmentStructure: byCategory.map((item) => ({
        category: item.category,
        count: item._count._all,
      })),

      rentalMonthly: await this.buildMonthlyReservationCounts(reservations),

      reservations: {
        pending,
        active: activeReservations,
      },
    };
  }
}
