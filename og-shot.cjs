const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HTML = path.resolve(__dirname, 'og-default.html');
const OUT = path.join(__dirname, 'public', 'og-default.png');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto('file://' + HTML, { waitUntil: 'load' });
  try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  console.log('og image ->', OUT);
})();
