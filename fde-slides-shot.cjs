const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('file://' + path.resolve('fde-million-salary-slides.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  // dark 封面（默认）
  await page.screenshot({ path: 'fde-slides-cover-dark.png' });

  // light 封面
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'fde-slides-cover-light.png' });

  // dark 第 9 页（最密集：金句+4数据+证言）
  await page.evaluate(() => {
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.slide')[8].classList.add('active');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'fde-slides-p9-dark.png' });

  await browser.close();
  console.log('slides screenshots done');
})();
