import type { NestExpressApplication } from "@nestjs/platform-express";
import { ApiErrorFilter } from "./api-error.filter.js";

export function configureApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ApiErrorFilter());
  app.useBodyParser('json', { limit: '16kb' });
}
