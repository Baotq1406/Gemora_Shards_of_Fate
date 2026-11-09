import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./database/prisma.service.js";
import { ApiTags } from '@nestjs/swagger';
import { ApiContract, object } from './api-contracts.js';

@Controller("health")
@ApiTags('Health')
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  @ApiContract('Kiểm tra server đang chạy', { response: object({ status: { type: 'string', enum: ['ok'] } }) })
  live(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  @ApiContract('Kiểm tra database sẵn sàng', { response: object({ status: { type: 'string', enum: ['ok'] }, database: { type: 'string', enum: ['ready'] } }), errors: [503] })
  async ready(): Promise<{ status: string; database: string }> {
    try {
      // Verify the migrated tables as well as connectivity, without exposing rows.
      await this.prisma.$queryRaw`
        SELECT 1 FROM "User" LIMIT 0
      `;
      await this.prisma.$queryRaw`SELECT 1 FROM "PlayerProfile" LIMIT 0`;
      await this.prisma.$queryRaw`SELECT 1 FROM "AuthSession" LIMIT 0`;
      await this.prisma.$queryRaw`SELECT 1 FROM "AuthIdentity" LIMIT 0`;
      return { status: "ok", database: "ready" };
    } catch {
      throw new ServiceUnavailableException("The database is not ready. Check the connection and migrations.");
    }
  }
}
