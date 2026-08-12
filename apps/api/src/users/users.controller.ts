import {
  UseGuards,
  Controller,
  Get,
  Query,
  Param,
  Body,
  Patch,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UsersService } from './users.service';
import { Role, User } from '@equiprent/db';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type auth from '../auth';
import { parsePagination } from '../common/pagination';

function assertAdmin(session: UserSession<typeof auth>) {
  if (session.user.role !== Role.ADMIN) {
    throw new ForbiddenException('Only admins can manage users');
  }
}

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Session() session: UserSession<typeof auth>,
    @Query('role') role?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<User[]> {
    assertAdmin(session);
    return this.usersService.findAll(
      {
        role: role as Role,
        active: active === undefined ? undefined : active === 'true',
        search,
      },
      parsePagination({ limit, offset }),
    );
  }

  @Get('/stats')
  getStats(@Session() session: UserSession<typeof auth>) {
    assertAdmin(session);
    return this.usersService.getStats();
  }

  @Get('/me')
  findMe(@Session() session: UserSession<typeof auth>): Promise<User> {
    return this.usersService.findOne(session.user.id);
  }

  @Patch('/me')
  updateMe(
    @Body() dto: UpdateProfileDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<User> {
    return this.usersService.updateProfile(session.user.id, dto);
  }

  @Get('/:id')
  findOne(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<User> {
    assertAdmin(session);
    return this.usersService.findOne(id);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<User> {
    assertAdmin(session);
    return this.usersService.update(id, dto);
  }

  @Delete('/:id')
  remove(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<User> {
    assertAdmin(session);
    return this.usersService.remove(id);
  }
}
