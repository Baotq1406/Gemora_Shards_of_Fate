import { defineConfig } from '@playwright/test';

const database = process.env.TEST_DATABASE_URL;
if (database && !new URL(database).pathname.endsWith('_test')) {
  throw new Error('Browser tests require a separate _test database.');
}
export default defineConfig({
  testDir: './test',
  workers: 1,
  use: {
    baseURL: 'http://localhost:8080',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    headless: true,
  },
  webServer: [
    {
      command: 'node test/serve.mjs',
      url: 'http://localhost:8080',
      reuseExistingServer: false,
    },
    ...(database ? [{
      command: 'node ../game-server/dist/src/index.js',
      url: 'http://127.0.0.1:3000/api/v1/health/ready',
      env: { DATABASE_URL: database, APP_ORIGIN: 'http://localhost:8080', HOST: '127.0.0.1', PORT: '3000' },
      reuseExistingServer: false,
    }] : []),
  ],
});
