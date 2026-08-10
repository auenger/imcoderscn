const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  const filePath = path.resolve(__dirname, 'harness-100x-team-v2-slides.html');
  await page.goto('file://' + filePath, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // Force light theme and hide all footer UI
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    const hideSelectors = [
      '.progress', '.slide-number', '.nav-hint',
      '.theme-toggle', '.nav-arrow', '.lesson-watermark'
    ];
    hideSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.display = 'none';
      });
    });
  });

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`Total slides: ${total}`);

  const outDir = path.resolve(__dirname, 'slides-v2-screenshots');

  for (let i = 0; i < total; i++) {
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach((s, j) => {
        s.classList.toggle('active', j === idx);
      });
    }, i);
    await page.waitForTimeout(400);

    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({
      path: path.join(outDir, `slide-${num}.png`),
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
    console.log(`Captured slide ${num}`);
  }

  await browser.close();
  console.log('Done!');
})();
