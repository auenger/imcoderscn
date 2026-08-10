const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const htmlPath = path.resolve(__dirname, '../thingjs-architecture-slides.html');
  const tmpPath = path.resolve(__dirname, '../thingjs-architecture-slides-light.html');
  const outputPath = path.resolve(__dirname, '../thingjs-architecture-long-screenshot.png');

  // Create temp copy with light theme hardcoded, remove localStorage override
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace('data-theme="dark"', 'data-theme="light"');
  // Remove the IIFE that reads localStorage and overrides theme
  html = html.replace(/(function\(\)\s*\{\s*const\s+saved\s*=\s*localStorage[\s\S]*?\}\)\(\);)/, '');
  // Remove theme toggle saving
  html = html.replace(/localStorage\.setItem\('slide-theme',\s*next\);/, '');
  fs.writeFileSync(tmpPath, html);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('file://' + tmpPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Transform slides: stack vertically, all visible
  await page.evaluate(() => {
    // Remove fixed/absolute elements that would overlap
    const progress = document.getElementById('progress');
    const slideNum = document.getElementById('slideNum');
    const navHint = document.querySelector('.nav-hint');
    const watermark = document.getElementById('lessonWatermark');
    const navLeft = document.getElementById('navLeft');
    const navRight = document.getElementById('navRight');
    const themeToggle = document.getElementById('themeToggle');
    if (progress) progress.style.display = 'none';
    if (slideNum) slideNum.style.display = 'none';
    if (navHint) navHint.style.display = 'none';
    if (watermark) watermark.style.display = 'none';
    if (navLeft) navLeft.style.display = 'none';
    if (navRight) navRight.style.display = 'none';
    if (themeToggle) themeToggle.style.display = 'none';

    // Change slides container to flex column
    const slidesContainer = document.getElementById('slides');
    slidesContainer.style.position = 'relative';
    slidesContainer.style.width = '100%';

    // Make all slides visible and stack them
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
      slide.style.position = 'relative';
      slide.style.opacity = '1';
      slide.style.transform = 'none';
      slide.style.pointerEvents = 'auto';
      slide.style.width = '100%';
      slide.style.minHeight = '100vh';
      slide.style.display = 'flex';
      slide.style.flexDirection = 'column';
      slide.style.justifyContent = 'center';
      slide.style.alignItems = 'center';
      slide.style.padding = '80px 100px';
      slide.style.boxSizing = 'border-box';
    });

    // Allow body scroll
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';
  });

  await page.waitForTimeout(500);

  // Take full page screenshot
  await page.screenshot({
    path: outputPath,
    fullPage: true,
  });

  console.log('Long screenshot saved to:', outputPath);
  fs.unlinkSync(tmpPath); // clean up temp file
  await browser.close();
})();
