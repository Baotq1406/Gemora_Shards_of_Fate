import { Module } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { AuthSettings } from "./auth.settings.js";
import { AuthSecurity } from "./auth.security.js";
import { GoogleProvider } from "./google.provider.js";
import { SessionGuard } from "./session.guard.js";

@Module({
  controllers: [AuthController],
  providers: [PrismaService, AuthService, AuthSettings, AuthSecurity, GoogleProvider, SessionGuard],
  exports: [PrismaService, AuthService, AuthSettings, SessionGuard],
})
export class AuthModule {}
