import { test, expect } from "@playwright/test";
test("landmarks, collection previews and bag to forge", async ({
  page,
}, info) => {
  const mutations = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") mutations.push(r.url());
  });
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/?preview=home");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((i) => i.decode().catch(() => {})),
    );
  });
  await expect(page.locator(".h-landmark")).toHaveCount(4);
  await page.screenshot({
    path: info.outputPath("home-landmarks-desktop.png"),
  });
  await page.getByRole("button", { name: "Pets", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Sample collection");
  await page.getByRole("button", { name: /Coralfin/ }).click();
  await expect(page.locator(".h-detail h3")).toHaveText("Coralfin");
  await expect(
    page.getByRole("button", { name: "Upgrade", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Pets", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Bag", exact: true }).click();
  await page.getByRole("button", { name: "Materials", exact: true }).click();
  await expect(page.locator(".h-collection button")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Go to Forge" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Equipment", exact: true }).click();
  await page.getByRole("button", { name: /Leafguard/ }).click();
  await page.getByRole("button", { name: "Go to Forge" }).click();
  await expect(
    page.getByRole("heading", { name: "Forge", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".h-detail h3")).toHaveText("Leafguard");
  await expect(
    page.getByRole("button", { name: "Upgrade", exact: true }),
  ).toBeDisabled();
  await page.screenshot({ path: info.outputPath("home-forge-desktop.png") });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Arena PvP", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("PvP is coming soon");
  await page.keyboard.press("Escape");
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: info.outputPath("home-landmarks-mobile.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Bag", exact: true }).click();
  await page.screenshot({ path: info.outputPath("home-bag-mobile.png") });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Adventure PvE", exact: true })
    .click();
  await expect(page.locator(".d-campaign")).toBeVisible();
  expect(mutations).toEqual([]);
});

test("home landmark hover, touch and upgrade dialog keyboard loop", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/?preview=home");
  const portal = page.locator(".h-portal");
  await portal.locator(".h-hit").hover({ position: { x: 150, y: 180 } });
  await expect
    .poll(() =>
      portal
        .locator(".h-building")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe("none");
  await page.mouse.move(5, 90);
  await expect
    .poll(() =>
      portal
        .locator(".h-building")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .toBe("none");
  await page.getByRole("button", { name: "Pets", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: /Emberhorn/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close", exact: true }),
  ).toBeFocused();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await context.newPage();
  await mobile.goto("http://localhost:8080/?preview=home");
  await mobile.getByRole("button", { name: "Bag", exact: true }).tap();
  await expect(
    mobile.getByRole("heading", { name: "Bag", exact: true }),
  ).toBeVisible();
  await mobile.getByRole("button", { name: "Close", exact: true }).tap();
  await mobile.locator(".h-pets .h-sign").tap();
  await expect(
    mobile.getByRole("heading", { name: "Pets", exact: true }),
  ).toBeVisible();
  await context.close();
});
