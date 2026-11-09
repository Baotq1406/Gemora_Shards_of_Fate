import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('Swagger Execute uses browser cookies through the game proxy', async ({ page, context }) => {
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.goto('/api/docs');
  await expect(page.getByRole('heading', { name: 'Gemora API', exact: false })).toBeVisible();
  await expect(page.locator('.opblock')).toHaveCount(13);
  const suffix = randomUUID().replaceAll('-', '').slice(0, 10);
  const credentials = { email: `swagger-${suffix}@example.test`, password: 'Gemora browser test password!' };
  const opened = new Set();
  async function execute(id, path, status, body) {
    const operation = page.locator(`#operations-${id}`);
    if (!opened.has(id)) {
      await operation.locator('.opblock-summary').click();
      await operation.getByRole('button', { name: 'Try it out', exact: true }).click();
      opened.add(id);
    }
    if (body !== undefined) await operation.locator('textarea').fill(JSON.stringify(body));
    const pending = page.waitForResponse(response => new URL(response.url()).pathname === path);
    await operation.getByRole('button', { name: 'Execute', exact: true }).click();
    const response = await pending;
    expect(response.status()).toBe(status);
    await expect(operation.locator('.live-responses-table .response-col_status:not(.col_header)')).toHaveText(String(status));
    return status === 204 ? null : response.json();
  }
  await execute('Auth-AuthController_me', '/api/v1/auth/me', 401);
  await execute('Auth-AuthController_register', '/api/v1/auth/register', 201, credentials);
  const login = await execute('Auth-AuthController_login', '/api/v1/auth/login', 200, credentials);
  expect(login.user.email).toBe(credentials.email);
  expect((await context.cookies()).find(cookie => cookie.name === 'gemora_session')?.httpOnly).toBe(true);
  const me = await execute('Auth-AuthController_me', '/api/v1/auth/me', 200);
  expect(me.user.id).toBe(login.user.id);
  await execute('Players-PlayersController_onboarding', '/api/v1/players/me/onboarding', 200, { playerName: `Test${suffix}` });
  await execute('Players-PlayersController_home', '/api/v1/players/me/home', 200);
  await execute('Players-PlayersController_changeAvatar', '/api/v1/players/me/avatar', 400, { avatarKey: 'invalid' });
  const avatar = await execute('Players-PlayersController_changeAvatar', '/api/v1/players/me/avatar', 200, { avatarKey: 'moon' });
  expect(avatar.player.avatarKey).toBe('moon');
  await execute('Auth-AuthController_logout', '/api/v1/auth/logout', 204, {});
  await execute('Auth-AuthController_me', '/api/v1/auth/me', 401);
  expect((await context.cookies()).some(cookie => cookie.name === 'gemora_session')).toBe(false);
  expect(browserErrors).toEqual([]);
});
