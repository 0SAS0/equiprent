import { ForbiddenException } from '@nestjs/common';
import { Role } from '@equiprent/db';

type SessionWithRole = {
  user: {
    role?: string | string[] | null;
  };
};

export function getUserRole(session: SessionWithRole): Role {
  const role = session.user.role;
  return (Array.isArray(role) ? role[0] : role) as Role;
}

export function assertRole(
  session: SessionWithRole,
  allowedRoles: Role[],
  message = 'Access denied',
): void {
  const role = getUserRole(session);
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenException(message);
  }
}
