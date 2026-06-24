#!/usr/bin/env tsx
import { readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer, { type Page } from "puppeteer";
import { SCREENSHOT_REFERENCE_URL } from "../src/siteConstants";
import { ANALYSE_FINISH_FUNNEL_BUTTON_ID } from "../src/userscript/mountAnalyseFinishFunnelButton";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(rootDir, "public/images/screenshot.png");
const userscriptPath = resolve(rootDir, "dist/finish-funnel.user.js");
const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 1400;

type ScreenshotClip = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function removeThirdPartyOverlays(page: Page): Promise<void> {
  await page.evaluate(() => {
    const selectorsToHide = [
      "#reciteme",
      "[id*='recite' i]",
      "[class*='recite' i]",
      "[id*='cookie' i]",
      "[class*='cookie' i]",
      "[id*='consent' i]",
      "[class*='consent' i]",
    ];

    for (const selector of selectorsToHide) {
      for (const element of document.querySelectorAll(selector)) {
        (element as HTMLElement).style.display = "none";
      }
    }
  });
}

async function injectUserscript(page: Page, scriptPath: string): Promise<void> {
  await page.addScriptTag({ path: scriptPath });
}

async function scrollMetricsToViewportTop(page: Page): Promise<void> {
  await page.evaluate(() => {
    const metrics = document.querySelector("#finish-funnel-metrics");
    if (!(metrics instanceof HTMLElement)) {
      throw new Error("Finish Funnel metrics section not found.");
    }

    const topOffset = 72;
    const scrollTop =
      window.scrollY + metrics.getBoundingClientRect().top - topOffset;
    window.scrollTo(0, Math.max(0, scrollTop));
  });
}

async function waitForPanelMetricsAndChart(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const metrics = document.querySelector("#finish-funnel-metrics");
      const chart = document.querySelector("#finish-funnel-queue-chart");
      const legend = document.querySelector(
        "#finish-funnel-chart-legend-mount",
      );
      return (
        metrics instanceof HTMLElement &&
        metrics.childElementCount > 0 &&
        chart instanceof HTMLCanvasElement &&
        chart.width > 0 &&
        legend instanceof HTMLElement &&
        legend.childElementCount > 0
      );
    },
    { timeout: 60_000 },
  );
}

async function getMetricsThroughChartClip(page: Page): Promise<ScreenshotClip> {
  const clip = await page.evaluate(
    ({ viewportWidth, viewportHeight }) => {
      const metrics = document.querySelector("#finish-funnel-metrics");
      const legend = document.querySelector(
        "#finish-funnel-chart-legend-mount",
      );
      const chart = document.querySelector("#finish-funnel-queue-chart");
      const endElement = legend ?? chart;

      if (
        !(metrics instanceof HTMLElement) ||
        !(endElement instanceof HTMLElement)
      ) {
        return null;
      }

      const metricsBox = metrics.getBoundingClientRect();
      const endBox = endElement.getBoundingClientRect();
      const padding = 16;
      const x = Math.max(0, Math.min(metricsBox.left, endBox.left) - padding);
      const y = Math.max(0, metricsBox.top - padding);
      const right = Math.max(metricsBox.right, endBox.right) + padding;
      const bottom = endBox.bottom + padding;

      return {
        x: Math.floor(x),
        y: Math.floor(y),
        width: Math.min(viewportWidth, Math.ceil(right - x)),
        height: Math.min(viewportHeight, Math.ceil(bottom - y)),
      };
    },
    { viewportWidth: VIEWPORT_WIDTH, viewportHeight: VIEWPORT_HEIGHT },
  );

  if (!clip) {
    throw new Error(
      "Could not determine screenshot clip for metrics through queue chart.",
    );
  }

  return clip;
}

async function main(): Promise<void> {
  console.log(`Opening ${SCREENSHOT_REFERENCE_URL}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

  await page.goto(SCREENSHOT_REFERENCE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });

  await page.waitForSelector("table.Results-table.js-ResultsTable", {
    timeout: 60_000,
  });

  await removeThirdPartyOverlays(page);

  try {
    await readFile(userscriptPath, "utf8");
  } catch {
    throw new Error(
      `Missing ${userscriptPath}. Run npm run build:userscript first.`,
    );
  }

  await injectUserscript(page, userscriptPath);

  await page.waitForSelector(`#${ANALYSE_FINISH_FUNNEL_BUTTON_ID}`, {
    timeout: 60_000,
  });
  await page.click(`#${ANALYSE_FINISH_FUNNEL_BUTTON_ID}`);

  await page.waitForSelector("#finish-funnel-panel", { timeout: 60_000 });
  await waitForPanelMetricsAndChart(page);

  await scrollMetricsToViewportTop(page);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 800));
  await removeThirdPartyOverlays(page);

  const clip = await getMetricsThroughChartClip(page);

  await mkdir(dirname(outputPath), { recursive: true });
  await page.screenshot({
    path: outputPath as `${string}.png`,
    clip,
  });
  await browser.close();

  console.log(`Wrote ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
