import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";

const siteUrl = "http://127.0.0.1:4173";
let server;

async function clickMarker(page, index) {
  await page.evaluate((markerIndex) => {
    const marker = document.querySelectorAll(".event-marker")[markerIndex];
    if (!marker) throw new Error(`Marker ${markerIndex} was not found`);
    marker.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, index);
}

try {
  const response = await fetch(siteUrl);
  if (!response.ok) throw new Error("Local server returned an error");
} catch {
  server = spawn("python3", ["-m", "http.server", "4173", "--directory", "out"], {
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    try {
      const response = await fetch(siteUrl);
      if (response.ok) break;
    } catch {
      if (attempt === 19) throw new Error("Could not start the local static server");
    }
  }
}

const browser = await puppeteer.launch({
  browser: "firefox",
  executablePath: "/usr/bin/firefox",
  headless: true,
  userDataDir: "/tmp/changelens-puppeteer-profile",
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 1024, deviceScaleFactor: 1 });
  await page.goto(siteUrl, { waitUntil: "networkidle0" });
  await page.waitForSelector(".recharts-line-curve", { timeout: 10_000 });

  const initial = await page.evaluate(() => ({
    markers: document.querySelectorAll(".event-marker").length,
    rows: document.querySelectorAll("button.table-row").length,
    drawer: Boolean(document.querySelector(".detail-drawer")),
    groupedEventText: document.body.textContent?.includes("2 monetization changes") ?? false,
  }));

  if (initial.markers !== 4 || initial.rows !== 5 || !initial.drawer || !initial.groupedEventText) {
    throw new Error(`Unexpected initial UI state: ${JSON.stringify(initial)}`);
  }

  const markerResults = [];
  for (let index = 0; index < initial.markers; index += 1) {
    await clickMarker(page, index);
    await page.waitForFunction(
      (selectedIndex) => document.querySelectorAll(".event-marker")[selectedIndex]?.classList.contains("selected"),
      {},
      index,
    );
    markerResults.push(await page.evaluate(() => ({
      title: document.querySelector(".drawer-header h2")?.textContent,
      conversion: document.querySelector('[data-impact-metric="Conversion to paying"] strong')?.textContent,
      windowX: Math.round(document.querySelector(".comparison-window")?.getBoundingClientRect().x ?? -1),
    })));
  }
  if (new Set(markerResults.map((result) => result.conversion)).size !== initial.markers) {
    throw new Error(`Markers reused impact data: ${JSON.stringify(markerResults)}`);
  }
  if (new Set(markerResults.map((result) => result.windowX)).size !== initial.markers) {
    throw new Error(`Comparison window did not move: ${JSON.stringify(markerResults)}`);
  }

  await clickMarker(page, 1);
  await page.waitForFunction(() => document.body.textContent?.includes("2 monetization changes"));
  const timestamp = await page.$eval(".drawer-header p", (element) => element.textContent);
  if (timestamp !== "Sep 3, 2024, 11:42 AM") throw new Error(`Unexpected timestamp: ${timestamp}`);

  const simplifiedDrawer = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".drawer-card h3")].map((heading) => heading.textContent);
    return {
      hasTabs: Boolean(document.querySelector(".drawer-tabs")),
      hasMiniChart: Boolean(document.querySelector(".compact-chart")),
      changesBeforeImpact: cards.indexOf("Key changes") < cards.indexOf("Observed impact"),
      comparisonLabel: document.body.textContent?.includes("7 days before vs. 7 days after") ?? false,
    };
  });
  if (simplifiedDrawer.hasTabs || simplifiedDrawer.hasMiniChart || !simplifiedDrawer.changesBeforeImpact || !simplifiedDrawer.comparisonLabel) {
    throw new Error(`Unexpected simplified drawer state: ${JSON.stringify(simplifiedDrawer)}`);
  }

  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector(".detail-drawer"));
  await clickMarker(page, 1);
  await page.waitForSelector(".detail-drawer");
  await page.click(".close-button");
  await page.waitForFunction(() => !document.querySelector(".detail-drawer"));
  await clickMarker(page, 1);
  await page.waitForSelector(".detail-drawer");

  await page.screenshot({ path: "/tmp/changelens-hydrated.png", fullPage: true });

  const offeringFilter = await page.$$(".filter-pill");
  await offeringFilter[2].click();
  await page.waitForFunction(() => document.querySelectorAll("button.table-row").length === 1);

  const filtered = await page.evaluate(() => ({
    markers: document.querySelectorAll(".event-marker").length,
    rows: document.querySelectorAll("button.table-row").length,
    drawer: Boolean(document.querySelector(".detail-drawer")),
  }));

  const row = await page.$("button.table-row");
  await row.click();
  await page.waitForSelector(".detail-drawer");
  const selectedTitle = await page.$eval(".drawer-header h2", (element) => element.textContent);

  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await mobilePage.goto(siteUrl, { waitUntil: "networkidle0" });
  await mobilePage.waitForSelector(".recharts-line-curve", { timeout: 10_000 });
  await mobilePage.click(".close-button");
  const mobile = await mobilePage.evaluate(() => {
    const sidebar = document.querySelector(".sidebar");
    const menuButton = document.querySelector(".mobile-menu-button");
    return {
      sidebarHidden: sidebar ? sidebar.getBoundingClientRect().right <= 0 : false,
      menuVisible: menuButton ? getComputedStyle(menuButton).display !== "none" : false,
      fitsViewport: document.documentElement.scrollWidth <= window.innerWidth,
    };
  });
  if (!mobile.sidebarHidden || !mobile.menuVisible || !mobile.fitsViewport) {
    throw new Error(`Unexpected mobile UI state: ${JSON.stringify(mobile)}`);
  }
  await mobilePage.screenshot({ path: "/tmp/changelens-mobile.png", fullPage: true });

  console.log(JSON.stringify({ initial, markerResults, timestamp, filtered, selectedTitle, simplifiedDrawer, mobile }, null, 2));
} finally {
  await browser.close();
  server?.kill();
}
