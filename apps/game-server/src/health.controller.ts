import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./database/prisma.service.js";

@Controller("health")
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  live(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
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
