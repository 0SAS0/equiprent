import {
  EquipmentCondition,
  EquipmentStatus,
  FaultReport,
  FaultStatus,
  ReservationStatus,
} from '@equiprent/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnReportDto } from './dto/create-return.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFaultReportDto } from './dto/create-fault-report.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}
  private getEquipmentStatusFromCondition(
    condition: EquipmentCondition,
  ): EquipmentStatus {
    switch (condition) {
      case EquipmentCondition.PERFECT:
      case EquipmentCondition.GOOD:
        return EquipmentStatus.AVAILABLE;

      case EquipmentCondition.MINOR_DAMAGE:
      case EquipmentCondition.MAJOR_DAMAGE:
        return EquipmentStatus.MAINTENANCE;

      case EquipmentCondition.BROKEN:
        return EquipmentStatus.DAMAGED;

      default:
        return EquipmentStatus.MAINTENANCE;
    }
  }
  async processReturn(dto: CreateReturnReportDto, processedByUserId: string) {
    const existingReservation = await this.prisma.client.reservation.findUnique(
      {
        where: { id: dto.reservationId },
        include: { equipment: true, returnRecord: true },
      },
    );
    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (existingReservation.status !== ReservationStatus.ACTIVE) {
      throw new ConflictException('Reservation is not active');
    }
    if (existingReservation.returnRecord) {
      throw new ConflictException(
        'Return has already been processed for this reservation',
      );
    }
    return this.prisma.client.$transaction(async (tx) => {
      const returnRecord = await tx.returnRecord.create({
        data: {
          reservationId: dto.reservationId,
          condition: dto.condition,
          notes: dto.notes,
          processedBy: processedByUserId,
        },
      });
      await tx.reservation.update({
        where: { id: dto.reservationId },
        data: {
          status: ReservationStatus.RETURNED,
          actualReturnDate: new Date(),
        },
      });
      await tx.equipment.update({
        where: { id: existingReservation.equipmentId },
        data: { status: this.getEquipmentStatusFromCondition(dto.condition) },
      });
      return returnRecord;
    });
  }
  async reportFault(dto: CreateFaultReportDto, userId: string) {
    const existingEquipment = await this.prisma.client.equipment.findUnique({
      where: { id: dto.equipmentId },
    });
    if (!existingEquipment) {
      throw new NotFoundException('Equipment not found');
    }
    return this.prisma.client.faultReport.create({
      data: {
        equipmentId: dto.equipmentId,
        description: dto.description,
        reportedBy: userId,
        status: 'REPORTED',
      },
    });
  }
  async findAllFaults(filters?: {
    status?: FaultStatus;
    equipmentId?: string;
  }): Promise<FaultReport[]> {
    return this.prisma.client.faultReport.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.equipmentId ? { equipmentId: filters.equipmentId } : {}),
      },
      include: {
        equipment: true,
        reporter: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findOne(id: string): Promise<FaultReport> {
    const faultReport = await this.prisma.client.faultReport.findUnique({
      where: { id },
      include: {
        equipment: true,
        reporter: true,
      },
    });
    if (!faultReport) {
      throw new NotFoundException(`Fault report with id ${id} not found`);
    }
    return faultReport;
  }
  async updateFaultStatus(
    id: string,
    status: FaultStatus,
    resolution?: string,
  ) {
    const fault = await this.findOne(id);
    if (!fault) {
      throw new NotFoundException(`Fault report with id ${id} not found`);
    }
    return this.prisma.client.faultReport.update({
      where: { id },
      data: {
        status,
        resolution,
      },
    });
  }

  getReturnHistory(equipmentId: string) {
    return this.prisma.client.returnRecord.findMany({
      where: { reservation: { equipmentId } },
      include: {
        reservation: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
