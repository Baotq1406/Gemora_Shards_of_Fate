import { test, expect } from '@playwright/test';

async function setup(page, lost = false) {
  let user = { id: 'new-player', email: 'player@example.test', role: 'PLAYER', profile: { id: 'profile', displayName: 'Adventurer' }, player: null, onboardingState: 'NEEDS_PROFILE', authMethods: { password: true, google: false } };
  let calls = 0;
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/providers')) return route.fulfill({ json: { password: true, google: false } });
    if (path.endsWith('/auth/me')) return route.fulfill({ json: { user } });
    if (path.endsWith('/home')) return route.fulfill({ json: { player: user.player } });
    if (path.endsWith('/onboarding')) {
      calls++;
      const body = route.request().postDataJSON();
      if (body.playerName === 'Taken') return route.fulfill({ status: 409, json: { code: 'PLAYER_NAME_TAKEN', message: 'This name is already taken.' } });
      user = { ...user, onboardingState: 'READY', player: { id: 'profile', playerName: body.playerName, avatarKey: body.avatarKey, onboardingCompletedAt: new Date().toISOString() } };
      if (lost) return route.abort('failed');
      return route.fulfill({ json: { user } });
    }
    if (path.endsWith('/avatar')) { user.player.avatarKey = route.request().postDataJSON().avatarKey; return route.fulfill({ json: { player: user.player } }); }
    return route.fulfill({ status: 404, json: {} });
  });
  return () => calls;
}

test('new player preserves draft on focus, handles taken names, and persists avatar after reload', async ({ page }, testInfo) => {
  await setup(page);
  await page.goto('/home');
  await expect(page).toHaveURL(/\/create-player$/);
  await page.getByLabel('Name', { exact: true }).fill('Taken');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Taken');
  await page.getByRole('button', { name: "Let's play" }).click();
  await expect(page.locator('#g-name-error')).toHaveText('This name is already taken.');
  await page.getByLabel('Name', { exact: true }).fill('Moonleaf');
  await page.screenshot({ path: testInfo.outputPath('create-connected.png'), fullPage: true });
  await page.getByRole('button', { name: "Let's play" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText('Welcome, Moonleaf!', { exact: true })).toBeVisible();
  await expect(page.locator('.g-currency, .g-level, .g-objective')).toHaveCount(0);
  await page.getByRole('button', { name: /Moonleaf/ }).click();
  await page.getByRole('button', { name: 'Change avatar', exact: true }).click();
  await page.getByRole('button', { name: 'Sun', exact: true }).click();
  await expect(page.locator('.g-player-card .gold')).toBeVisible();
  await page.reload();
  await expect(page.locator('.g-player-card .gold')).toBeVisible();
  await expect(page.getByText('Welcome back, Moonleaf!', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('home-connected.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('lost onboarding response restores the committed player without another POST', async ({ page }) => {
  const calls = await setup(page, true);
  await page.goto('/create-player');
  await page.getByLabel('Name', { exact: true }).fill('Starlight');
  await page.getByRole('button', { name: "Let's play" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.locator('.g-player-card')).toContainText('Starlight');
  expect(calls()).toBe(1);
});
