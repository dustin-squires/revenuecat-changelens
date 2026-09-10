import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";

const siteUrl = "http://127.0.0.1:4173";
let server;

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

  const markers = await page.$$(".event-marker");
  await markers[0].click();
  await page.waitForFunction(() => document.querySelector(".drawer-header h2")?.textContent?.includes("Experiment"));

  const paywallRow = await page.$$("button.table-row");
  await paywallRow[1].click();
  await page.waitForFunction(() => document.body.textContent?.includes("2 monetization changes"));

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

  console.log(JSON.stringify({ initial, filtered, selectedTitle, simplifiedDrawer, mobile }, null, 2));
} finally {
  await browser.close();
  server?.kill();
}
