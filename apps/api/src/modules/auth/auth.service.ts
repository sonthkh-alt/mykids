import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthTokens, AuthUserDto } from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';
import { LoginDto, RegisterParentDto } from './dto/auth.dto';
import type { JwtPayload } from '../../common/types/auth-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  /** Đăng ký phụ huynh (chủ tài khoản, sau đó tạo hồ sơ con). */
  async registerParent(dto: RegisterParentDto): Promise<AuthTokens & { user: AuthUserDto }> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email đã được sử dụng.');

    const passwordHash = await this.tokens.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: 'PARENT',
        fullName: dto.fullName,
        parent: { create: {} },
      },
    });

    return this.buildSession(user.id);
  }

  async login(dto: LoginDto, meta?: { userAgent?: string; ip?: string }) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }
    const valid = await this.tokens.verifyPassword(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');

    return this.buildSession(user.id, meta);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      return await this.tokens.rotate(refreshToken, (userId) =>
        this.buildPayload(userId),
      );
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn.');
    }
  }

  async logout(refreshToken?: string): Promise<{ success: true }> {
    if (refreshToken) await this.tokens.revokeOne(refreshToken);
    return { success: true };
  }

  async me(userId: string): Promise<AuthUserDto> {
    return this.toAuthUser(userId);
  }

  // --- helpers ---

  private async buildPayload(userId: string): Promise<JwtPayload> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { student: true },
    });
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student?.id,
    };
  }

  private async toAuthUser(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { student: true },
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      activeStudentId: user.student?.id,
    };
  }

  private async buildSession(
    userId: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthTokens & { user: AuthUserDto }> {
    const payload = await this.buildPayload(userId);
    const tokens = await this.tokens.issueTokens(payload, meta);
    const user = await this.toAuthUser(userId);
    return { ...tokens, user };
  }
}
