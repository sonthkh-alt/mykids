import { SetMetadata } from '@nestjs/common';
import type { Role } from '@ai-academy/types';

export const ROLES_KEY = 'roles';

/** Giới hạn endpoint theo vai trò RBAC. Ví dụ: @Roles('ADMIN'). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
