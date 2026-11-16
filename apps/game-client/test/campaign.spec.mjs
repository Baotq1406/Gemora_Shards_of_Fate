import { test, expect } from "@playwright/test";

async function readyArt(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {})),
    );
  });
}
async function previewLockedRealm(page, realm) {
  await page.locator(`[data-realm="${realm}"]`).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "View preview", exact: true }).click();
}

test("minimal world, five realms and 50 challenges retain safe preview actions", async ({
  page,
}, testInfo) => {
  const errors = [],
    mutations = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.method() !== "GET") mutations.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/?preview=home");
  await page.getByRole("button", { name: /Adventure PvE/ }).click();
  await expect(
    page.getByRole("heading", { name: "Adventure", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".d-world-regions button")).toHaveCount(5);
  await expect(page.locator(".d-world-regions .d-island-lock")).toHaveCount(4);
  await expect(page.locator(".d-island-count")).toHaveCount(1);
  await readyArt(page);
  expect(
    await page
      .locator(".d-island-lock")
      .evaluateAll((images) =>
        images.every((image) => image.naturalWidth === 256),
      ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("pve-minimal-world-desktop.png"),
    fullPage: true,
  });
  const names = new Set();
  for (const [index, realm] of [
    "nature",
    "water",
    "fire",
    "light",
    "dark",
  ].entries()) {
    if (index) await previewLockedRealm(page, realm);
    else await page.locator('[data-realm="nature"]').click();
    await expect(page).toHaveURL(new RegExp(`realm=${realm}`));
    await expect(page.locator("[data-stage]")).toHaveCount(10);
    await expect(page.locator(".d-node.elite")).toHaveCount(2);
    await expect(page.locator(".d-node.boss")).toHaveCount(1);
    for (const label of await page
      .locator("[data-stage]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-label"))))
      names.add(label);
    if (index) await expect(page.locator(".d-node.locked")).toHaveCount(10);
    await readyArt(page);
    await expect(
      page.locator(`[data-stage="${index === 0 ? 3 : 0}"]`),
    ).toBeInViewport();
    await page.screenshot({
      path: testInfo.outputPath(`pve-minimal-${realm}-desktop.png`),
    });
    await page.locator('[data-stage="9"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".d-battle")).toBeDisabled();
    await expect(page.locator(".d-unlock")).toContainText(
      index === 0 ? "Clear challenge 9" : "Defeat",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-stage="9"]')).toBeFocused();
  }
  expect(names.size).toBe(50);
  expect(errors).toEqual([]);
  expect(mutations).toEqual([]);
});

test("navigation retains scroll and selections; locked direct URLs explain access", async ({
  page,
}) => {
  await page.goto("/?preview=campaign&realm=nature");
  await expect(page.locator(".d-node.next")).toHaveAttribute("data-stage", "3");
  await page.locator('[data-stage="5"]').click();
  await expect(page.locator(".d-unlock")).toContainText("Clear challenge 5");
  await page.keyboard.press("Escape");
  const top = await page
    .locator(".d-map-scroll")
    .evaluate((el) => el.scrollTop);
  await previewLockedRealm(page, "water");
  await page.goBack();
  await expect(page).toHaveURL(/realm=nature/);
  await expect
    .poll(() => page.locator(".d-map-scroll").evaluate((el) => el.scrollTop))
    .toBe(top);
  await expect(page.locator('[data-stage="5"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page
    .getByRole("button", { name: "Current challenge", exact: true })
    .click();
  await expect(page.locator('[data-stage="3"]')).toBeFocused();
  await page.getByRole("button", { name: "World map", exact: true }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: /Adventure PvE/ }).click();
  await expect(page).toHaveURL(/realm=nature/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Whispering Woods", exact: true }),
  ).toBeVisible();
  await page.goto("/?preview=campaign&realm=fire");
  await expect(page.getByRole("dialog")).toContainText(
    "Defeat Tidecrown to unlock.",
  );
  await expect(page).not.toHaveURL(/realm=fire/);
  await page.getByRole("button", { name: "View preview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Emberfall Peaks", exact: true }),
  ).toBeVisible();
  await page.goto("/?preview=campaign&realm=unknown");
  await expect(
    page.getByRole("heading", { name: "Adventure", exact: true }),
  ).toBeVisible();
});

test("lock interactions, mobile map, resource names and focus restoration", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?preview=campaign");
  await readyArt(page);
  await page.screenshot({
    path: testInfo.outputPath("pve-minimal-world-mobile.png"),
    fullPage: true,
  });
  const water = page.locator('[data-realm="water"]');
  await water.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Defeat Elderbloom to unlock.");
  await page.screenshot({
    path: testInfo.outputPath("pve-minimal-lock-mobile.png"),
  });
  await page.keyboard.press("Escape");
  await expect(water).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Go to boss", exact: true }).click();
  await expect(page.locator('[data-stage="9"]')).toBeFocused();
  await expect(page).toHaveURL(/realm=nature/);
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Current challenge", exact: true })
    .click();
  await readyArt(page);
  const current = page.locator('[data-stage="3"]');
  await expect(current).toBeInViewport();
  await page.screenshot({
    path: testInfo.outputPath("pve-minimal-nature-mobile.png"),
  });
  await current.click();
  await expect(dialog.getByRole("heading")).toHaveText("The grove guardian");
  await expect(page.locator(".d-battle")).toBeDisabled();
  await page.getByRole("button", { name: /Hero EXP, sample reward/ }).click();
  await expect(page.getByRole("status")).toContainText("Hero EXP");
  await page.screenshot({
    path: testInfo.outputPath("pve-minimal-details-mobile.png"),
  });
  await page.keyboard.press("Escape");
  await expect(current).toBeFocused();
  await page.getByRole("button", { name: "About this preview" }).click();
  await expect(dialog).toContainText("Progress and rewards are samples.");
  await dialog.getByRole("button", { name: "Close details" }).click();
  await expect(
    page.getByRole("button", { name: "About this preview" }),
  ).toBeFocused();
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "World map", exact: true }).click();
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.locator('[data-realm="fire"]').click();
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(current).toBeFocused();
});

test("authenticated locked realm cannot bypass via URL, reload or tabs", async ({
  page,
}) => {
  const user = {
    id: "campaign-player",
    email: "player@example.test",
    role: "PLAYER",
    profile: { id: "profile", displayName: "Moonleaf" },
    player: {
      id: "profile",
      playerName: "Moonleaf",
      avatarKey: "crystal-dragon",
      onboardingCompletedAt: "2026-11-12T00:00:00Z",
    },
    onboardingState: "READY",
    authMethods: { password: true, google: false },
  };
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/providers"))
      return route.fulfill({ json: { password: true, google: false } });
    if (path.endsWith("/auth/me")) return route.fulfill({ json: { user } });
    if (path.endsWith("/home"))
      return route.fulfill({ json: { player: user.player } });
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto("/campaign?realm=fire");
  await expect(page.getByRole("dialog")).toContainText(
    "Defeat Tidecrown to unlock.",
  );
  await expect(page.getByRole("button", { name: "View preview" })).toHaveCount(
    0,
  );
  await expect(page.locator("[data-stage]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page).toHaveURL(/\/campaign$/);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Whispering Woods", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Water realm, locked", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Defeat Elderbloom to unlock.",
  );
  await expect(page.getByRole("button", { name: "View preview" })).toHaveCount(
    0,
  );
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page).toHaveURL(/\/campaign\?realm=nature$/);
  await page.getByRole("button", { name: "World map", exact: true }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  user.onboardingState = "NEEDS_PROFILE";
  user.player = null;
  await page.goto("/campaign?realm=dark");
  await expect(page).toHaveURL(/\/create-player$/);
});

test("island art responds to hover and keyboard, empty sky does not intercept clicks", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/?preview=campaign");
  await readyArt(page);
  await expect(page.locator(".d-island-art")).toHaveCount(5);
  const island = page.locator('[data-realm="nature"]');
  const visual = island.locator(".d-island-visual");
  const box = await island.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect
    .poll(() => visual.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe("none");
  await page.screenshot({
    path: testInfo.outputPath("pve-islands-hover-desktop.png"),
  });
  await page.mouse.move(box.x + 2, box.y + 2);
  await expect
    .poll(() => visual.evaluate((el) => getComputedStyle(el).transform))
    .toBe("none");
  const hit = await page.evaluate(
    ({ x, y }) =>
      document
        .elementFromPoint(x, y)
        ?.closest("[data-realm]")
        ?.getAttribute("data-realm"),
    { x: box.x + 2, y: box.y + 2 },
  );
  expect(hit).toBeFalsy();
  await island.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/realm=nature/);
  await page.goto("/?preview=campaign");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .locator('[data-realm="nature"] .d-island-hit')
    .hover({ position: { x: box.width / 2, y: box.height / 2 } });
  await expect
    .poll(() =>
      page
        .locator('[data-realm="nature"] .d-island-visual')
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .toBe("none");
});

test("touch selects islands immediately without retaining hover", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("http://localhost:8080/?preview=campaign");
  await page.locator('[data-realm="water"] .d-island-name').tap();
  await expect(page.getByRole("dialog")).toContainText("Defeat Elderbloom");
  await page.getByRole("button", { name: "Close details" }).tap();
  await expect(page.locator('[data-realm="water"] .d-island-visual')).toHaveCSS(
    "transform",
    "none",
  );
  await page.locator('[data-realm="nature"] .d-island-name').tap();
  await expect(page).toHaveURL(/realm=nature/);
  await context.close();
});
