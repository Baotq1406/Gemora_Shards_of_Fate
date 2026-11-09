import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Test } from '@nestjs/testing';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { AuthSettings } from '../src/auth/auth.settings.js';
import { configureApp } from '../src/configure-app.js';
import { docsEnabled } from '../src/api-docs.js';

test('docs configuration defaults to private in production and rejects invalid flags', () => {
  assert.equal(docsEnabled({}), true);
  assert.equal(docsEnabled({ NODE_ENV: 'production' }), false);
  assert.equal(docsEnabled({ NODE_ENV: 'production', API_DOCS_ENABLED: 'true' }), true);
  assert.equal(docsEnabled({ API_DOCS_ENABLED: 'false' }), false);
  assert.throws(() => docsEnabled({ API_DOCS_ENABLED: 'yes' }));
});

test('OpenAPI covers the real routes, payloads, cookies, redirects and disabled endpoints', async () => {
  const previous = process.env.API_DOCS_ENABLED;
  try {
    for (const enabled of [true, false]) {
      process.env.API_DOCS_ENABLED = String(enabled);
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(PrismaService).useValue({})
        .overrideProvider(AuthSettings).useValue({ origin: 'http://localhost:8080', secure: false, ttlMs: 60000, google: null })
        .compile();
      const app = module.createNestApplication<NestExpressApplication>(new ExpressAdapter(), { logger: false });
      try {
        configureApp(app);
        await app.listen(0, '127.0.0.1');
        const base = await app.getUrl();
        for (const path of ['/api/docs', '/api/docs/', '/api/docs-json', '/api/docs/swagger-ui-init.js', '/api/docs/swagger-ui-bundle.js']) {
          assert.equal((await fetch(base + path)).status, enabled ? 200 : 404, path);
        }
        assert.equal((await fetch(base + '/api/docs-yaml')).status, 404);
        if (!enabled) continue;
        const spec = await (await fetch(base + '/api/docs-json')).json();
        assert.deepEqual(Object.entries(spec.paths).flatMap(([path, methods]) => Object.keys(methods as object).map(method => `${method} ${path}`)).sort(), [
          'get /api/v1/health', 'get /api/v1/health/ready',
          'get /api/v1/auth/providers', 'post /api/v1/auth/register', 'post /api/v1/auth/login',
          'get /api/v1/auth/me', 'post /api/v1/auth/logout', 'get /api/v1/auth/google/start',
          'get /api/v1/auth/google/callback', 'post /api/v1/auth/google/link',
          'get /api/v1/players/me/home', 'post /api/v1/players/me/onboarding', 'post /api/v1/players/me/avatar',
        ].sort());
        assert.equal(spec.servers[0].url, 'http://localhost:8080');
        assert.deepEqual(spec.components.securitySchemes.session, { type: 'apiKey', in: 'cookie', name: 'gemora_session' });
        const register = spec.paths['/api/v1/auth/register'].post;
        assert.deepEqual(register.requestBody.content['application/json'].schema.required, ['email', 'password']);
        assert.ok(register.responses['201'].content['application/json'].schema.properties.user.properties.player.nullable);
        assert.deepEqual(spec.paths['/api/v1/auth/me'].get.security, [{ session: [] }]);
        assert.ok(spec.paths['/api/v1/auth/google/start'].get.responses['302'].headers.Location);
        assert.ok(spec.paths['/api/v1/auth/google/callback'].get.responses['303']);
        assert.equal(spec.paths['/api/v1/auth/logout'].post.responses['204'].content, undefined);
        assert.ok(spec.paths['/api/v1/players/me/onboarding'].post.responses['409']);
        // Existing guards must still reject missing sessions and untrusted origins.
        assert.equal((await fetch(base + '/api/v1/auth/me')).status, 401);
        assert.equal((await fetch(base + '/api/v1/auth/login', { method: 'POST', headers: { Origin: 'http://untrusted.test', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
      } finally { await app.close(); }
    }
  } finally {
    if (previous === undefined) delete process.env.API_DOCS_ENABLED;
    else process.env.API_DOCS_ENABLED = previous;
  }
});
