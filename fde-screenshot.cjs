const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  const file = path.resolve('fde-million-salary-long.html');
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  // 长截图
  await page.screenshot({ path: 'fde-million-salary-long-screenshot.png', fullPage: true });
  console.log('long screenshot done');

  // 每页单页截图
  const outDir = path.join(path.dirname(file), 'fde-slides-screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
  for (let i = 0; i < count; i++) {
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide')[idx].scrollIntoView({ block: 'start' });
    }, i);
    await page.waitForTimeout(350);
    const rect = await page.evaluate((idx) => {
      const el = document.querySelectorAll('.slide')[idx];
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, i);
    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: path.join(outDir, `slide-${num}.png`), clip: rect });
  }
  console.log('per-slide screenshots done:', count);

  await browser.close();
})();
