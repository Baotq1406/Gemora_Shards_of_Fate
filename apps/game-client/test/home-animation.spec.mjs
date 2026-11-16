import { test, expect } from "@playwright/test";

test("companions animate independently, pause for dialogs and remember motion setting", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/?preview=home");
  await expect(page.locator("[data-companion][data-ready]")).toHaveCount(4);
  const gem = page.locator('[data-companion="crystal"]');
  await expect.poll(() => gem.getAttribute("data-frame")).not.toBe("0");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.locator("#app")).toHaveAttribute("inert", "");
  const paused = await gem.getAttribute("data-frame");
  await page.waitForTimeout(650);
  await expect(gem).toHaveAttribute("data-frame", paused);
  await page.getByRole("checkbox", { name: /Creature animations/ }).uncheck();
  await page.keyboard.press("Escape");
  await expect(gem).toHaveAttribute("data-frame", "0");
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: /Creature animations/ }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: /Creature animations/ }).check();
  await page.keyboard.press("Escape");
  await expect(gem).toHaveAttribute("data-ready", "true");
  await expect.poll(() => gem.getAttribute("data-frame")).not.toBe("0");
  await page
    .getByRole("button", { name: "Adventure PvE", exact: true })
    .click();
  await expect(page.locator(".d-campaign")).toBeVisible();
  await page.goBack();
  await expect(page.locator("[data-companion][data-ready]")).toHaveCount(4);
  await expect.poll(() => gem.getAttribute("data-frame")).not.toBe("0");
});

test("reduced motion, failed atlases and offscreen creatures keep a usable still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 500 });
  const atlases = [];
  page.on("request", (request) => {
    if (/animated\/\w+-v1(?:-small)?\.webp/.test(request.url()))
      atlases.push(request.url());
  });
  await page.goto("/?preview=home");
  const leaf = page.locator('[data-companion="leaf"]');
  const fire = page.locator('[data-companion="fire"]');
  await expect(leaf.locator("img")).toBeVisible();
  expect(atlases).toHaveLength(0);
  await page.route(/\/animated\/leaf-v1(?:-small)?\.webp/, (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator('[data-companion="crystal"]')).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(leaf.locator("img")).toBeVisible();
  await expect(leaf).not.toHaveAttribute("data-ready");
  await expect(fire).not.toHaveAttribute("data-ready");
  await page.locator(".h-scene").evaluate((scene) => {
    scene.scrollTop = scene.scrollHeight;
  });
  await expect(fire).toHaveAttribute("data-ready", "true");
  await expect
    .poll(() => fire.getAttribute("data-frame"), { timeout: 7000 })
    .not.toBe("0");
});

test("responsive layouts keep companions separate from signs and navigation reachable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [360, 640],
    [390, 844],
    [430, 932],
    [700, 800],
    [768, 1024],
    [1024, 768],
    [1099, 768],
    [1100, 768],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/?preview=home");
    await page.locator(".h-island").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const issues = await page.evaluate(() => {
      const bad = [];
      const pets = [...document.querySelectorAll("[data-companion]")].map((e) =>
        e.getBoundingClientRect(),
      );
      const signs = [...document.querySelectorAll(".h-sign")].map((e) =>
        e.getBoundingClientRect(),
      );
      const overlap = (a, b) =>
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;
      if (document.documentElement.scrollWidth > innerWidth)
        bad.push("horizontal overflow");
      if (document.documentElement.scrollHeight > innerHeight + 1)
        bad.push("outer page scroll");
      for (const pet of pets) {
        if (pet.left < 0 || pet.right > innerWidth)
          bad.push("clipped companion");
        if (signs.some((sign) => overlap(pet, sign)))
          bad.push("companion overlaps a sign");
      }
      for (let i = 0; i < pets.length; i++)
        for (let j = i + 1; j < pets.length; j++)
          if (overlap(pets[i], pets[j])) bad.push("companions overlap");
      const dock = document.querySelector(".h-dock").getBoundingClientRect();
      if (dock.top < 0 || dock.bottom > innerHeight)
        bad.push("dock outside viewport");
      return bad;
    });
    expect(issues, `${width}x${height}`).toEqual([]);
    for (const name of ["Pets", "Forge", "Arena PvP"]) {
      await page
        .getByRole("button", { name, exact: true })
        .locator(".h-sign")
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    }
    await page.getByRole("button", { name: "Bag", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Bag", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
});
