import { defineConfig } from '@playwright/test';

const database = process.env.TEST_DATABASE_URL;
if (!database || !new URL(database).pathname.endsWith('_test')) {
  throw new Error('Swagger browser tests require a separate TEST_DATABASE_URL ending in _test.');
}
export default defineConfig({
  testDir: './test-swagger',
  workers: 1,
  use: { baseURL: 'http://localhost:18080', channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true },
  webServer: [
    { command: 'node test-swagger/serve.mjs', url: 'http://localhost:18080', reuseExistingServer: false },
    {
      command: 'node dist/src/index.js', cwd: '../game-server', url: 'http://127.0.0.1:13000/api/v1/health/ready', reuseExistingServer: false,
      env: { DATABASE_URL: database, APP_ORIGIN: 'http://localhost:18080', HOST: '127.0.0.1', PORT: '13000', NODE_ENV: 'test', API_DOCS_ENABLED: 'true', GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', GOOGLE_REDIRECT_URI: '' },
    },
  ],
});
