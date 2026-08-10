const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HTML = path.resolve(__dirname, 'fde-million-salary-slides-V1.1.html');
const OUT_DIR = path.join(__dirname, 'fde-slides-screenshots');

// 16:9 viewport，x2 deviceScaleFactor -> 每张 2560x1440
const VW = 1280, VH = 720;

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: VW, height: VH },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('file://' + HTML, { waitUntil: 'load' });

  // 字体就绪
  try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
  await page.waitForTimeout(800);

  // 强制亮色主题，清掉 localStorage 偏好
  await page.evaluate(() => {
    try { localStorage.removeItem('fde-theme'); } catch (e) {}
    document.documentElement.setAttribute('data-theme', 'light');
  });

  // 隐藏所有导航/控件 UI，让截图干净；禁用滚动条；统一背景
  await page.addStyleTag({ content: `
    .progress, .slide-number, .nav-hint, .nav-arrow,
    .theme-toggle, .nav-bar { display: none !important; }
    .slide::-webkit-scrollbar { width: 0 !important; }
    .slide { scrollbar-width: none !important; }
  ` });

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('slides:', total);

  for (let i = 0; i < total; i++) {
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach((s) => { s.classList.remove('active'); s.style.transform = ''; s.style.transition = 'none'; });
      slides[idx].classList.add('active');
    }, i);

    // 重新启用过渡，等动画结束
    await page.evaluate(() => {
      document.querySelectorAll('.slide').forEach((s) => { s.style.transition = ''; });
    });
    await page.waitForTimeout(350);

    // 溢出检测
    const info = await page.evaluate((idx) => {
      const el = document.querySelectorAll('.slide')[idx];
      return { sh: el.scrollHeight, ch: el.clientHeight, sw: el.scrollWidth, cw: el.clientWidth };
    }, i);
    const overflow = info.sh > info.ch + 1 || info.sw > info.cw + 1;
    console.log(`slide ${String(i + 1).padStart(2, '0')}  h=${info.sh}/${info.ch} w=${info.sw}/${info.cw} ${overflow ? '⚠️ OVERFLOW' : 'ok'}`);

    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: path.join(OUT_DIR, `slide-${num}.png`) });
  }

  await browser.close();
  console.log('done ->', OUT_DIR);
})();
