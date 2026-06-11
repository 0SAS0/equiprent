import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation, Role } from '@equiprent/db';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a reservation with validation and equipment availability check
  async create(
    dto: CreateReservationDto,
    userId: string,
  ): Promise<Reservation> {
    const existing = await this.prisma.client.reservation.findFirst({
      where: {
        equipmentId: dto.equipmentId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Equipment is already reserved for the selected dates',
      );
    }
    const equipment = await this.prisma.client.equipment.findUnique({
      where: { id: dto.equipmentId },
    });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }
    if (equipment.status !== 'AVAILABLE') {
      throw new ConflictException('Equipment is not available for reservation');
    }
    if (dto.endDate <= dto.startDate)
      throw new BadRequestException('End date must be after start date');

    // Calculate rental days and check against maxRentalDays
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (days > equipment.maxRentalDays) {
      throw new BadRequestException(
        `Rental period exceeds maximum of ${equipment.maxRentalDays} days`,
      );
    }
    // Use a transaction to ensure atomicity of reservation creation and equipment status update
    return this.prisma.client.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          ...dto,
          startDate: new Date(dto.startDate), // ← konwersja
          endDate: new Date(dto.endDate), // ← konwersja
          userId,
          status: 'PENDING',
        },
      });
      await tx.equipment.update({
        where: { id: dto.equipmentId },
        data: { status: 'RESERVED' },
      });
      return reservation;
    });
  }
  // Find all reservations, with role-based access control
  findAll(userId: string, role: string): Promise<Reservation[]> {
    const canSeeAll = role === Role.ADMIN || role === Role.EQUIPMENT_MANAGER;
    return this.prisma.client.reservation.findMany({
      where: canSeeAll ? {} : { userId },
      include: {
        equipment: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  // Find a single reservation by ID, with access control
  async findOne(id: string): Promise<Reservation> {
    const reservationUnique = await this.prisma.client.reservation.findUnique({
      where: { id },
      include: {
        equipment: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!reservationUnique) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }
    return reservationUnique;
  }
  async cancel(id: string, userId: string) {
    const reservation = await this.findOne(id);
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }
    if (
      reservation.status === 'CONFIRMED' ||
      reservation.status === 'PENDING'
    ) {
      return this.prisma.client.$transaction(async (tx) => {
        const updated = await tx.reservation.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });
        await tx.equipment.update({
          where: { id: reservation.equipmentId },
          data: { status: 'AVAILABLE' },
        });
        return updated;
      });
    } else {
      throw new ForbiddenException(
        'Only pending or confirmed reservations can be cancelled',
      );
    }
  }
  async confirm(id: string) {
    const reservation = await this.findOne(id);
    if (reservation.status !== 'PENDING') {
      throw new ConflictException('Only pending reservations can be confirmed');
    } else {
      return this.prisma.client.reservation.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      });
    }
  }
}
