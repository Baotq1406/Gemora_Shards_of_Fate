import { test, expect } from '@playwright/test';

test('landing, home and campaign use decodable WebP without missing art', async ({ page }) => {
  const failures = [];
  const legacy = [];
  page.on('response', response => {
    if (response.url().includes('/art/') && response.status() >= 400) failures.push(response.url());
  });
  page.on('request', request => {
    if (/\/art\/.*\.(png|jpe?g)(?:\?|$)/.test(request.url())) legacy.push(request.url());
  });
  for (const url of ['/', '/?preview=home', '/?preview=campaign']) {
    await page.goto(url);
    await expect(page.locator('#app')).not.toBeEmpty();
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(async () => {
      const bad = [];
      for (const image of document.images) {
        try { await image.decode(); } catch { bad.push(image.currentSrc || image.src); }
      }
      return bad;
    });
    expect(broken).toEqual([]);
  }
  expect(failures).toEqual([]);
  expect(legacy).toEqual([]);
});

test('companion atlas follows rendered pixels and releases backgrounds when disabled', async ({ browser }) => {
  for (const dpr of [1, 2]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: dpr });
    const page = await context.newPage();
    await page.goto('/?preview=home');
    await expect(page.locator('[data-companion][data-ready]')).toHaveCount(4);
    const wrong = await page.locator('[data-companion]').evaluateAll(pets => pets.filter(pet => {
      const small = pet.getBoundingClientRect().width * devicePixelRatio <= 128;
      return pet.querySelector('.h-pet-sprite').style.backgroundImage.includes('-small.webp') !== small;
    }).map(pet => pet.dataset.companion));
    expect(wrong).toEqual([]);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('checkbox', { name: /Creature animations/ }).uncheck();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-companion][data-ready]')).toHaveCount(0);
    expect(await page.locator('.h-pet-sprite').evaluateAll(sprites => sprites.every(sprite => !sprite.style.backgroundImage))).toBe(true);
    await context.close();
  }
});
