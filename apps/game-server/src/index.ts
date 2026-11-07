import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { databaseUrl, serverAddress } from "./config.js";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ExpressAdapter } from "@nestjs/platform-express";
import { configureApp } from "./configure-app.js";

async function bootstrap(): Promise<void> {
  databaseUrl();
  const { host, port } = serverAddress();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), { abortOnError: false, logger: false });
  configureApp(app);
  app.enableShutdownHooks();
  await app.listen(port, host);
  console.log(`Gemora API: http://${host}:${port}/api/v1/health`);
}

bootstrap().catch(() => {
  // Do not print driver errors: they can include connection details or secrets.
  console.error("Không thể khởi động backend. Kiểm tra .env, PORT và PostgreSQL; chạy npm run db:check.");
  process.exitCode = 1;
});
