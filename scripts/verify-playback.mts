import { chromium } from "@playwright/test";
import { RECITERS } from "../src/data/reciters";

declare global {
  interface Window {
    qaAudio?: HTMLAudioElement;
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
const errors: string[] = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript(() => {
  const NativeAudio = window.Audio;
  window.Audio = class extends NativeAudio {
    constructor(src?: string) {
      super(src);
      window.qaAudio = this;
    }
  };
});
let passed = 0;
try {
  await page.goto(
    `${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000"}/quran`,
  );
  await page.getByLabel("Surah", { exact: true }).selectOption("114");
  for (const reciter of RECITERS) {
    await page.getByLabel("Reciter", { exact: true }).selectOption(reciter.id);
    await page
      .getByRole("button", { name: "Play recitation", exact: true })
      .click();
    try {
      await page.waitForFunction(
        () => Boolean(window.qaAudio && window.qaAudio.currentTime > 0.2),
        {},
        { timeout: 25000 },
      );
      console.log(`${reciter.id}: decoded audio and advanced playback`);
      passed++;
    } catch {
      console.error(`${reciter.id}: playback failed`);
    }
    await page
      .getByRole("button", { name: "Stop recitation", exact: true })
      .click();
  }
  console.log(
    JSON.stringify({ passed, total: RECITERS.length, pageErrors: errors }),
  );
} finally {
  await browser.close();
}
process.exitCode = passed === RECITERS.length && !errors.length ? 0 : 1;
