import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@equiprent/db';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters?: {
    role?: Role;
    active?: boolean;
    search?: string;
  }): Promise<User[]> {
    return this.prisma.client.user.findMany({
      where: {
        ...(filters?.role && { role: filters.role }),
        ...(filters?.active !== undefined && { active: filters.active }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { studentId: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            equipment: { select: { name: true } },
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    return this.prisma.client.user.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        studentId: dto.studentId,
        role: dto.role,
        active: dto.active,
      },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    await this.findOne(id);
    return this.prisma.client.user.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        studentId: dto.studentId,
      },
    });
  }

  async remove(id: string): Promise<User> {
    await this.findOne(id);
    return this.prisma.client.user.update({
      where: { id },
      data: { active: false },
    });
  }

  async getStats() {
    const [total, active, byRole] = await Promise.all([
      this.prisma.client.user.count(),
      this.prisma.client.user.count({ where: { active: true } }),
      this.prisma.client.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: byRole.map((item) => ({
        role: item.role,
        count: item._count._all,
      })),
    };
  }
}
