import type { NestExpressApplication } from "@nestjs/platform-express";
import { ApiErrorFilter } from "./api-error.filter.js";
import { configureApiDocs } from './api-docs.js';

export function configureApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ApiErrorFilter());
  app.useBodyParser('json', { limit: '16kb' });
  configureApiDocs(app);
}
