import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Đánh dấu endpoint không cần xác thực (login, register...). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
