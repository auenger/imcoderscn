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

  // Force light theme, hide footer UI, show all slides stacked vertically
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

    // Stack all slides vertically
    const slides = document.querySelectorAll('.slide');
    const container = document.getElementById('slides');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = 'auto';
    container.style.overflow = 'visible';

    slides.forEach(s => {
      s.style.position = 'relative';
      s.style.opacity = '1';
      s.style.transform = 'none';
      s.style.pointerEvents = 'auto';
      s.style.width = '100%';
      s.style.height = '720px';
      s.style.minHeight = '720px';
      s.style.maxHeight = '720px';
      s.style.overflow = 'hidden';
    });

    document.documentElement.style.overflow = 'visible';
    document.body.style.overflow = 'visible';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';
  });

  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.resolve(__dirname, 'harness-100x-team-v2-long-screenshot.png'),
    fullPage: true
  });

  await browser.close();
  console.log('Done!');
})();
