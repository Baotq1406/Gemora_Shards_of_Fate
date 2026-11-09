import { Body, Controller, Get, HttpCode, HttpException, Inject, Module, Post, Req, UseGuards } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuthService, publicUser } from '../auth/auth.service.js';
import { AuthSecurity, readToken } from '../auth/auth.security.js';
import { SessionGuard, type AuthenticatedRequest } from '../auth/session.guard.js';
import { objectInput } from '../auth/auth.validation.js';
import { PrismaService } from '../database/prisma.service.js';
import { ApiTags } from '@nestjs/swagger';
import { ApiContract, avatarKey as avatarSchema, homeResponse, object, onboardingBody, playerSchema, userResponse } from '../api-contracts.js';

const avatars = ['crystal-dragon', 'moon', 'sun', 'leaf', 'crystal'];
function fail(status: number, code: string, message: string): never { throw new HttpException({ code, message }, status); }
function avatar(value: unknown): string {
  if (typeof value !== 'string' || !avatars.includes(value)) fail(400, 'INVALID_AVATAR', 'Please choose an available avatar.');
  return value;
}
function nameInput(value: unknown): string {
  if (typeof value !== 'string' || value.length > 128 || /[\p{Cc}\p{Cf}]/u.test(value)) fail(400, 'INVALID_PLAYER_NAME', 'Use 3–16 characters: letters, numbers, spaces or underscores.');
  const name = value.normalize('NFC').trim().replace(/ +/g, ' ');
  if ([...name].length < 3 || [...name].length > 16 || !/^(?:\p{L}\p{M}*|\p{N})(?:\p{L}\p{M}*|\p{N}|_| )*$/u.test(name)) fail(400, 'INVALID_PLAYER_NAME', 'Use 3–16 characters: letters, numbers, spaces or underscores.');
  return name;
}

@Controller('players/me')
@ApiTags('Players')
@UseGuards(AuthSecurity, SessionGuard)
class PlayersController {
  constructor(@Inject(PrismaService) private readonly db: PrismaService, @Inject(AuthService) private readonly auth: AuthService) {}

  @Get('home')
  @ApiContract('Xem dữ liệu Home', { session: true, response: homeResponse, errors: [401, 403, 429] })
  home(@Req() req: AuthenticatedRequest) {
    const user = publicUser(req.auth.user);
    if (!user.player) fail(403, 'PROFILE_REQUIRED', 'Create your player first.');
    return { player: user.player, features: { adventure: 'coming_soon', arena: 'coming_soon', team: 'coming_soon', heroes: 'coming_soon', inventory: 'coming_soon' } };
  }

  @Post('onboarding') @HttpCode(200)
  @ApiContract('Tạo nhân vật', { session: true, body: onboardingBody, response: userResponse, description: 'Avatar mặc định crystal-dragon. Gửi lại cùng tên chuẩn hóa và avatar trả thành công. Không thể đổi tên đã xác nhận. Lỗi: INVALID_PLAYER_NAME, PLAYER_NAME_RESERVED, INVALID_AVATAR, PLAYER_NAME_TAKEN, PROFILE_ALREADY_COMPLETED.', errors: [400, 401, 403, 409, 413, 429] })
  onboarding(@Body() body: unknown, @Req() req: AuthenticatedRequest) { return this.save(body, req, false); }

  @Post('avatar') @HttpCode(200)
  @ApiContract('Đổi avatar nhân vật', { session: true, body: object({ avatarKey: avatarSchema }), response: object({ player: playerSchema }), description: 'Yêu cầu đã tạo nhân vật. Lỗi nghiệp vụ: INVALID_AVATAR hoặc PROFILE_REQUIRED.', errors: [400, 401, 403, 413, 429] })
  changeAvatar(@Body() body: unknown, @Req() req: AuthenticatedRequest) { return this.save(body, req, true); }

  private async save(body: unknown, req: AuthenticatedRequest, avatarOnly: boolean) {
    const input = objectInput(body, avatarOnly ? ['avatarKey'] : ['playerName', 'avatarKey']);
    const avatarKey = avatar(input.avatarKey ?? (avatarOnly ? null : 'crystal-dragon'));
    const playerName = avatarOnly ? '' : nameInput(input.playerName);
    try {
      return await this.db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "AuthSession" WHERE id = ${req.auth.sessionId}::uuid FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${req.auth.user.id}::uuid FOR UPDATE`;
        const current = await this.auth.current(readToken(req), tx);
        let profile = current.user.profile;
        if (avatarOnly) {
          if (!profile?.onboardingCompletedAt) fail(403, 'PROFILE_REQUIRED', 'Create your player first.');
          await tx.playerProfile.update({ where: { id: profile.id }, data: { avatarKey } });
        } else {
          const [row] = await tx.$queryRaw<{ key: string }[]>`SELECT lower(normalize(${playerName}, NFC) COLLATE "pg_catalog"."pg_c_utf8") AS key`;
          const normalizedPlayerName = row!.key;
          if (['admin', 'administrator', 'moderator', 'system', 'support', 'gemora'].includes(normalizedPlayerName)) fail(400, 'PLAYER_NAME_RESERVED', 'Please choose another name.');
          if (profile?.onboardingCompletedAt) {
            if (profile.normalizedPlayerName !== normalizedPlayerName || profile.avatarKey !== avatarKey) fail(409, 'PROFILE_ALREADY_COMPLETED', 'Your player has already been created.');
          } else {
            if (!profile) profile = await tx.playerProfile.create({ data: { userId: current.user.id, displayName: 'Adventurer' } });
            await tx.playerProfile.update({ where: { id: profile.id }, data: { playerName, normalizedPlayerName, avatarKey, onboardingCompletedAt: new Date() } });
          }
        }
        const user = publicUser((await this.auth.current(readToken(req), tx)).user);
        return avatarOnly ? { player: user.player } : { user };
      });
    } catch (error) {
      const e = error as { code?: string };
      if (e.code === 'P2002' && !avatarOnly) {
        const conflicts = await this.db.$queryRaw<{ id: string }[]>`SELECT id FROM "PlayerProfile" WHERE "normalizedPlayerName" = lower(normalize(${playerName}, NFC) COLLATE "pg_catalog"."pg_c_utf8") AND "userId" <> ${req.auth.user.id}::uuid`;
        if (conflicts.length) fail(409, 'PLAYER_NAME_TAKEN', 'This name is already taken.');
      }
      throw error;
    }
  }
}

@Module({ imports: [AuthModule], controllers: [PlayersController] })
export class PlayersModule {}
