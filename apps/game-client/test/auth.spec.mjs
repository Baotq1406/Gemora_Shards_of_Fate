import { test, expect } from '@playwright/test';

const user = { id: 'player', email: 'player@example.test', role: 'PLAYER', onboardingState: 'READY', player: { id: 'profile', playerName: '<img src=x onerror=alert(1)>', avatarKey: 'moon', onboardingCompletedAt: '2026-11-09T00:00:00Z' }, profile: { id: 'profile', displayName: '<img src=x onerror=alert(1)>' }, authMethods: { password: true, google: false } };
const password = 'A long test password 2026!';

async function mockApi(page, overrides = {}) {
  await page.route('**/api/v1/players/me/home', route => route.fulfill({ json: { player: user.player } }));
  let signedIn = false;
  await page.route('**/api/v1/auth/**', async route => {
    const path = new URL(route.request().url()).pathname.split('/').pop();
    if (overrides[path]) return overrides[path](route);
    let status = 200;
    let body;
    if (path === 'providers') body = { password: true, google: true };
    if (path === 'me') { status = signedIn ? 200 : 401; body = signedIn ? { user } : { message: 'Please sign in.' }; }
    if (path === 'register') { status = 201; body = { user }; }
    if (path === 'login') { signedIn = true; body = { user }; }
    if (path === 'logout') { signedIn = false; status = 204; }
    await route.fulfill({ status, ...(status === 204 ? {} : { json: body }) });
  });
}
async function openLogin(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Now', exact: true }).click();
}
async function fillLogin(page) {
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(password);
}

test('email registration is not a session; login, reload and logout; safe display name', async ({ page }) => {
  let payload;
  await mockApi(page, { register: async route => { payload = route.request().postDataJSON(); await route.fulfill({ status: 201, json: { user } }); } });
  await openLogin(page);
  await page.getByRole('tab', { name: 'Sign up' }).click();
  await fillLogin(page);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  expect(payload).toEqual({ email: user.email, password });
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toHaveCount(0);
  await fillLogin(page);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('.g-player-card')).toContainText(user.player.playerName);
  await expect(page.locator('.g-player-card strong img')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play Now', exact: true })).toBeEnabled();
});

for (const status of [400, 401, 403, 409, 429, 503]) {
  test(`failed login ${status} never displays a signed-in account`, async ({ page }) => {
    await mockApi(page, { login: route => route.fulfill({ status, json: { message: `Request rejected ${status}` } }) });
    await openLogin(page);
    await fillLogin(page);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.locator('.status-message')).not.toBeEmpty();
    await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
  });
}

test('late login response does not reopen a closed modal and blocks duplicate requests', async ({ page }) => {
  let release;
  let calls = 0;
  const gate = new Promise(resolve => { release = resolve; });
  await mockApi(page, { login: async route => { calls++; await gate; await route.fulfill({ json: { user } }); } });
  await openLogin(page);
  await fillLogin(page);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Processing…', exact: true })).toBeDisabled();
  await expect(page.getByRole('tab', { name: 'Sign up' })).toBeDisabled();
  await page.getByRole('button', { name: 'Close sign-in dialog' }).click();
  release();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(calls).toBe(1);
});

test('startup network failure offers retry, not an expired-session claim', async ({ page }) => {
  let offline = true;
  await mockApi(page, { me: route => offline ? route.abort('failed') : route.fulfill({ status: 401, json: {} }) });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Retry connection' })).toBeVisible();
  offline = false;
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page.getByRole('button', { name: 'Play Now', exact: true })).toBeEnabled();
});

test('Google success URL alone cannot authenticate; callback query is removed', async ({ page }) => {
  await mockApi(page);
  await page.goto('/?auth=success&keep=yes');
  await expect(page.locator('#account-notice')).toContainText('did not create an active session');
  await expect(page).toHaveURL(/\?keep=yes$/);
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toHaveCount(0);
});

test('Google linking confirms password and handles conflict safely', async ({ page }) => {
  let payload;
  await mockApi(page, { link: async route => { payload = route.request().postDataJSON(); await route.fulfill({ status: 409, json: { message: 'Cannot link this account.' } }); } });
  await openLogin(page);
  await fillLogin(page);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'Link Google account', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Continue to Google' }).click();
  await expect(page.locator('.status-message')).toHaveText('Cannot link this account.');
  expect(payload).toEqual({ password });
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
});

test('real database: register, login, reload, logout and independent browser sessions', async ({ page, browser }) => {
  test.skip(!process.env.TEST_DATABASE_URL, 'Requires migrated _test database and built backend.');
  const email = `browser-${Date.now()}@example.test`;
  await openLogin(page);
  await page.getByRole('tab', { name: 'Sign up' }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill('B' + Date.now());
  await page.getByRole('button', { name: "Let's play" }).click();
  await expect(page).toHaveURL(/\/home$/);
  const second = await browser.newContext();
  const other = await second.newPage();
  await other.goto('http://localhost:8080');
  await other.getByRole('button', { name: 'Play Now', exact: true }).click();
  await other.getByLabel('Email', { exact: true }).fill(email);
  await other.getByLabel('Password', { exact: true }).fill(password);
  await other.getByRole('button', { name: 'Sign in', exact: true }).click();
  await other.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(other.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play Now', exact: true })).toBeEnabled();
  await other.reload();
  await other.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(other.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await other.getByRole('button', { name: 'Sign out', exact: true }).click();
  await second.close();
});

test('password validation matches server Unicode length and Google can be unavailable', async ({ page }) => {
  await mockApi(page, { providers: route => route.fulfill({ json: { password: true, google: false } }) });
  await openLogin(page);
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Sign up' }).click();
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('😀'.repeat(8));
  await page.getByLabel('Confirm password').fill('😀'.repeat(8));
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.locator('#password-error')).toContainText('15 and 128');
});

test('logout network failure retains account and allows retry', async ({ page }) => {
  await mockApi(page, { logout: route => route.abort('failed') });
  await openLogin(page);
  await fillLogin(page);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('could not be confirmed');
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeEnabled();
});

test('lost login response restores the committed session without retrying login', async ({ page }) => {
  let signedIn = false;
  let calls = 0;
  await mockApi(page, {
    login: route => { calls++; signedIn = true; return route.abort('failed'); },
    me: route => route.fulfill({ status: signedIn ? 200 : 401, json: signedIn ? { user } : {} }),
  });
  await openLogin(page);
  await fillLogin(page);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(calls).toBe(1);
});

test('session revoked elsewhere is detected on returning to the tab', async ({ page }) => {
  let expired = false;
  await mockApi(page, { me: route => route.fulfill({ status: expired ? 401 : 200, json: expired ? {} : { user } }) });
  await page.goto('/');
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  expired = true;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('button', { name: 'Play Now', exact: true })).toBeEnabled();
  await expect(page.locator('#account-status')).not.toContainText(user.email);
});

test('mobile registration fits viewport and captures the connected form', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page);
  await openLogin(page);
  await page.getByRole('tab', { name: 'Sign up' }).click();
  await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('registration-mobile.png'), fullPage: true, animations: 'disabled' });
});
