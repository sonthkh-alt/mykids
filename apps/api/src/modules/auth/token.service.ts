import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import type { AuthTokens } from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { JwtPayload } from '../../common/types/auth-user';

/** Phát hành & xoay vòng token. Refresh token lưu dạng HASH (không lưu plaintext). */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseTtlSeconds(ttl: string): number {
    const m = /^(\d+)([smhd])$/.exec(ttl);
    if (!m) return 900;
    const value = Number(m[1]);
    const unit = m[2];
    const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
    return value * mult;
  }

  async issueTokens(
    payload: JwtPayload,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthTokens> {
    const accessTtl = this.config.getOrThrow<string>('jwt.accessTtl');
    const refreshTtl = this.config.getOrThrow<string>('jwt.refreshTtl');

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });

    // Refresh token: chuỗi ngẫu nhiên (không phải JWT) → lưu hash trong DB.
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshSeconds = this.parseTtlSeconds(refreshTtl);
    await this.prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: this.hash(refreshToken),
        expiresAt: new Date(Date.now() + refreshSeconds * 1000),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseTtlSeconds(accessTtl),
    };
  }

  /** Xác thực refresh token, xoay vòng (thu hồi cũ, phát hành mới). */
  async rotate(
    refreshToken: string,
    buildPayload: (userId: string) => Promise<JwtPayload>,
  ): Promise<AuthTokens> {
    const tokenHash = this.hash(refreshToken);
    const record = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!record) {
      throw new Error('Refresh token không hợp lệ hoặc đã hết hạn.');
    }
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    const payload = await buildPayload(record.userId);
    return this.issueTokens(payload);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeOne(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(refreshToken) },
      data: { revokedAt: new Date() },
    });
  }

  hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  verifyPassword(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
