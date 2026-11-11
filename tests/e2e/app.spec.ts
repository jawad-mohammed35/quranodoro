import { test, expect } from "@playwright/test";
import { defaultDashboard } from "../../src/lib/dashboard";

declare global {
  interface Window {
    qaSources?: string[];
  }
}

test.beforeEach(async ({ page }) => {
  // Guest QA must not depend on the configured external auth server being online.
  await page.route("https://*.supabase.co/**", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "No test session" }),
    }),
  );
});
test("dashboard hides, restores, resizes and persists panels", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Edit dashboard" }).click();
  const panel = page.locator('[data-panel="focus"]');
  const handle = panel.locator(".react-resizable-handle");
  await handle.hover();
  const before = await panel.boundingBox();
  const box = await handle.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + 100, box!.y + 100, { steps: 12 });
  await page.mouse.up();
  await expect
    .poll(async () => (await panel.boundingBox())!.height)
    .toBeGreaterThan(before!.height);
  await page
    .getByRole("button", { name: "Hide Today's focus", exact: true })
    .click();
  await expect(panel).toHaveCount(0);
  await page.reload();
  await expect(panel).toHaveCount(0);
  await page.getByRole("button", { name: "Edit dashboard" }).click();
  await page.getByRole("button", { name: "Add Widgets" }).click();
  await page.getByRole("button", { name: "Add Today's focus" }).click();
  await page.reload();
  await expect(panel).toBeVisible();
});
test("dashboard drag and keyboard reorder save layout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Edit dashboard" }).click();
  const initial =
    (await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quranodoro-settings:guest") || "null")
          ?.state.dashboard.desktop,
    )) || defaultDashboard().desktop;
  const handle = page.getByRole("button", {
    name: "Drag Today's focus",
    exact: true,
  });
  await handle.hover();
  const b = await handle.boundingBox();
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2);
  await page.mouse.down();
  await page.mouse.move(b!.x + 400, b!.y + 300, { steps: 15 });
  await page.mouse.up();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("quranodoro-settings:guest")!).state
            .dashboard.desktop,
      ),
    )
    .not.toEqual(initial);
  await handle.press("ArrowDown");
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("quranodoro-settings:guest")!).state
        .dashboard.desktop,
  );
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quranodoro-settings:guest")!).state
          .dashboard.desktop,
    ),
  ).toEqual(saved);
});
test("tasbih persists count, confirms reset, and offers 100 target", async ({
  page,
}) => {
  await page.goto("/tasbih");
  await page.getByRole("button", { name: "100", exact: true }).click();
  await page.getByRole("button", { name: /tap to count/i }).click();
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("quranodoro-tasbih:guest")!).state
            .count,
      ),
    )
    .toBe(1);
  await page.getByRole("button", { name: "33", exact: true }).click();
  await page.getByRole("button", { name: /reset counter/i }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quranodoro-tasbih:guest")!).state
          .count,
    ),
  ).toBe(1);
});
test("timer survives reload, pauses, resumes, and stops", async ({ page }) => {
  await page.goto("/pomodoro");
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start focus", exact: true }),
  ).toBeVisible();
});
test("dashboard reset restores defaults across both layouts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Edit dashboard" }).click();
  await page.getByRole("button", { name: "Hide Current streak" }).click();
  await page.getByRole("button", { name: "Reset Layout" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-panel="streak"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Reset Layout" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.reload();
  await expect(page.locator('[data-panel="streak"]')).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quranodoro-settings:guest")!).state
          .dashboard,
    ),
  ).toEqual(defaultDashboard());
});
test("all routes fit representative widths and navigation has active solid icon", async ({
  page,
}) => {
  for (const width of [320, 375, 430, 768, 1024, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/pomodoro",
      "/quran",
      "/tasbih",
      "/farm",
      "/settings",
      "/analytics",
    ]) {
      await page.goto(path);
      await expect(page.locator("#main-content")).toBeVisible();
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          { message: `${path} width ${width}` },
        )
        .toBeTruthy();
    }
  }
  await expect(page.locator('nav [aria-current="page"] svg')).toHaveAttribute(
    "fill",
    "currentColor",
  );
});
test("theme and mobile drawer keyboard behavior", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Navigation" })).toHaveCount(0);
});

test("audio controls recover from loading failures and use the selected source", async ({
  page,
}) => {
  // Windows WebKit's native media backend bypasses network route interception.
  // Reject at the media API boundary so all engines exercise the same failure.
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      (window.qaSources ??= []).push(this.src);
      return Promise.reject(
        new DOMException("Connection interrupted", "NetworkError"),
      );
    };
  });
  await page.goto("/quran");
  await page.getByLabel("Reciter", { exact: true }).selectOption("husary");
  await page.getByLabel("Surah", { exact: true }).selectOption("114");
  await page
    .getByRole("button", { name: "Play recitation", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Could not load" }),
  ).toBeVisible({ timeout: 20000 });
  expect(
    (await page.evaluate(() => window.qaSources || [])).some((url) =>
      url.includes("mahmoud-husary/r1/114.mp3"),
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "Play recitation", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Stop recitation", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Could not load" }),
  ).toHaveCount(0);
});

test("stalled media times out and remains retryable", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => new Promise(() => {});
  });
  await page.clock.install();
  await page.goto("/quran");
  await page
    .getByRole("button", { name: "Play recitation", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Loading recitation" }),
  ).toBeVisible();
  await page.clock.fastForward(16000);
  await expect(
    page.getByRole("alert").filter({ hasText: "Could not load" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play recitation", exact: true }),
  ).toBeEnabled();
});

test("planting and timer completion persist farm growth without duplicate multi-tab rewards", async ({
  page,
  context,
}) => {
  await page.goto("/farm");
  await page.getByRole("button", { name: /^Barhi/ }).click();
  await page.getByRole("button", { name: "Plant Barhi", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("quranodoro-farm:guest") || "null")
            ?.state.trees.length,
      ),
    )
    .toBe(1);
  await page.goto("/pomodoro");
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  const other = await context.newPage();
  await other.goto("/pomodoro");
  await page.evaluate(() => {
    const key = "quranodoro-timer:guest";
    const state = JSON.parse(localStorage.getItem(key)!);
    state.state.endAt = Date.now() - 1000;
    localStorage.setItem(key, JSON.stringify(state));
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem("quranodoro-sessions:guest") || "null",
          )?.state.sessions.length,
      ),
    )
    .toBe(1);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quranodoro-farm:guest")!).state
          .trees[0].gp,
    ),
  ).toBe(10);
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quranodoro-sessions:guest")!).state
          .sessions.length,
    ),
  ).toBe(1);
});

test("dashboard touch drag persists the mobile arrangement", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "CDP touch injection is available only in Chromium; physical-device touch QA is still recommended.",
  );
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "Edit dashboard" }).click();
  const handle = page.getByRole("button", {
    name: "Drag Today's focus",
    exact: true,
  });
  await handle.scrollIntoViewIfNeeded();
  const b = await handle.boundingBox();
  const session = await context.newCDPSession(page);
  const x = b!.x + 40,
    y = b!.y + 20;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 12; i++)
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y + i * 30 }],
    });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("quranodoro-settings:guest")),
    )
    .not.toBeNull();
  await context.close();
});

test("half-screen menu anchors to its trigger and navigates into Settings", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 800, height: 700 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu" });
  const anchor = await trigger.boundingBox();
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Navigation" });
  await expect(menu).toBeVisible();
  const bounds = await menu.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(anchor!.y + anchor!.height);
  expect(
    Math.abs(bounds!.x + bounds!.width - anchor!.x - anchor!.width),
  ).toBeLessThan(5);
  await menu.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.locator("main h3").nth(0)).toHaveText("Account");
  await expect(page.locator("main h3").nth(1)).toHaveText("Profile");
  await expect(page.locator("main h3").nth(2)).toHaveText("Appearance");
  await page.getByRole("link", { name: "About the Developer" }).click();
  await expect(page).toHaveURL(/settings\/about$/);
  await page
    .locator("main")
    .getByRole("link", { name: /Settings/ })
    .click();
  await expect(page).toHaveURL(/settings$/);
  await page.goto("/about");
  await expect(page).toHaveURL(/settings\/about$/);
  expect(errors).toEqual([]);
});

test("desktop presets follow recitation and dark pages share the scroll background", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 850 });
  await page.goto("/pomodoro");
  const card = (title: string) =>
    page.getByRole("heading", { name: title, exact: true }).locator("../..");
  const player = await card("Recitation").boundingBox();
  const presets = await card("Presets").boundingBox();
  expect(presets!.x).toBe(player!.x);
  expect(presets!.y - player!.y - player!.height).toBeCloseTo(24, 0);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  for (const route of ["/settings", "/"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveClass(/dark/);
    for (const position of [0, 500, 1500]) {
      const background = await page.evaluate((y) => {
        window.scrollTo({ top: y, behavior: "instant" });
        return [
          getComputedStyle(document.body).backgroundColor,
          getComputedStyle(document.documentElement).backgroundColor,
          getComputedStyle(document.body).backgroundImage,
        ];
      }, position);
      expect(background[0]).toBe(background[1]);
      expect(background[2]).toBe("none");
    }
  }
});
