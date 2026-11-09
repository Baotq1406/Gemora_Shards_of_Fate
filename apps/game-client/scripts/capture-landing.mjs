import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = fileURLToPath(new URL('../../../docs/previews/play-now/', import.meta.url));
await mkdir(output, { recursive: true });
const server = await createServer({ root, server: { open: false, port: 8082, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/v1/**', route => route.fulfill(
    route.request().url().endsWith('/providers')
      ? { json: { password: true, google: true } }
      : { status: 401, json: { message: 'Please sign in.' } },
  ));
  for (const [label, width, height] of [['desktop', 1440, 960], ['mobile', 390, 844], ['small', 360, 640]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:8082/');
    const play = page.getByRole('button', { name: 'Play Now', exact: true });
    await play.waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
      if (!document.fonts.check('16px Nunito') || !document.fonts.check('40px "Lilita One"')) throw new Error('Fonts did not load');
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const bounds = await play.boundingBox();
    expect(bounds.y + bounds.height).toBeLessThan(height);
    await page.screenshot({ path: output + `landing-${label}.png`, fullPage: true, animations: 'disabled' });
    await play.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: output + `login-${label}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('tab', { name: 'Sign up' }).click();
    await page.getByLabel('Confirm password', { exact: true }).fill('Vietnamese-name-test');
    await page.getByRole('button', { name: 'Create account', exact: true }).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: output + `register-${label}.png`, fullPage: true, animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(play).toBeFocused();
  }
  for (const screen of ['create-player', 'home']) {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`http://localhost:8082/?preview=${screen}`);
    await page.locator('.g-brand').waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
    await page.screenshot({ path: output + `${screen}-desktop.png`, fullPage: true, animations: 'disabled' });
    if (screen === 'create-player') {
      await page.getByLabel('Name', { exact: true }).fill('Ngọc Ánh');
      await page.getByRole('button', { name: "Let's play", exact: true }).click();
      await expect(page.getByRole('button', { name: /Ngọc Ánh/ })).toBeVisible();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  console.log('Captured landing, login and registration at 1440, 390 and 360 px; verified fonts, focus, Vietnamese player name and no horizontal overflow.');
} finally {
  await browser?.close();
  await server.close();
}
