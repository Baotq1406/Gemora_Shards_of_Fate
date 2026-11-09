import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { HealthController } from "./health.controller.js";
import { PlayersModule } from "./players/players.module.js";

@Module({ imports: [AuthModule, PlayersModule], controllers: [HealthController] })
export class AppModule {}
