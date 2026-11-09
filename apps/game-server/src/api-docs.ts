import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthSettings } from './auth/auth.settings.js';
import { SESSION_COOKIE } from './auth/auth.security.js';

export function docsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.API_DOCS_ENABLED !== undefined && !['true', 'false'].includes(env.API_DOCS_ENABLED)) {
    throw new Error('API_DOCS_ENABLED must be true or false.');
  }
  return env.API_DOCS_ENABLED === undefined ? env.NODE_ENV !== 'production' : env.API_DOCS_ENABLED === 'true';
}

export function configureApiDocs(app: NestExpressApplication): void {
  if (!docsEnabled()) return;
  const { origin } = app.get(AuthSettings);
  const config = new DocumentBuilder()
    .setTitle('Gemora API')
    .setVersion('1.0')
    .setDescription(`Tài liệu và trang thử API Gemora. Mở **${origin}/api/docs** qua giao diện game để Origin và cookie khớp cấu hình.

**Execute gọi API thật và có thể lưu dữ liệu.** Dùng tài khoản thử nghiệm.

Thứ tự: register → login → me → onboarding → home → avatar → logout. Đăng ký chưa tạo phiên. Sau login, trình duyệt tự gửi cookie HttpOnly; không nhập cookie vào Authorize.

Google: [mở đăng nhập Google](${origin}/api/v1/auth/google/start) bằng điều hướng trình duyệt. Callback dành cho Google, không chạy độc lập bằng Execute. Khi quay lại, mở trang tài liệu và gọi me để kiểm tra phiên.`)
    .addServer(origin, 'Cùng địa chỉ với game (cookie và Origin)')
    .addCookieAuth(SESSION_COOKIE, { type: 'apiKey', in: 'cookie' }, 'session')
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, config), {
    jsonDocumentUrl: '/api/docs-json',
    raw: ['json'],
    customSiteTitle: 'Gemora — API Docs',
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: false,
      filter: true,
      docExpansion: 'list',
      displayRequestDuration: true,
      validatorUrl: null,
    },
  });
}
