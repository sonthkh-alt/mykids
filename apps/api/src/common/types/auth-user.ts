import type { Role } from '@ai-academy/types';

/** Payload đính kèm vào request sau khi xác thực JWT thành công. */
export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  /** Học sinh đang được thao tác (student tự đăng nhập, hoặc parent chọn con). */
  studentId?: string;
}

/** Cấu trúc claim trong access token. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  studentId?: string;
}
