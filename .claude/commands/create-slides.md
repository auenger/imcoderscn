# 创建演示幻灯片

根据用户提供的内容生成演示幻灯片。**默认只生成&#x20;**`{prefix}-long.html`**&#x20;供 review，确认后再按需产出交互版和截图。**

## 核心原则：默认只做 long.html

客户没有明确要求的情况下，只生成 `{prefix}-long.html` 一个文件。长页面版内容完整、布局清晰，最适合快速 review。不要一上来就同时生成 slides.html 和截图——既慢又难聚焦在内容修改上。

## 输入

用户会提供：

* 主题/标题

* 幻灯片内容（可能是大纲、markdown 文章、或口述要点）

* 可选：输出文件名前缀（默认用主题关键词）

## 输出文件（分阶段，按需产出）

**默认阶段（必做）：**

1. `{prefix}-long.html` — 静态长页面（仅浅色主题，用于 review 内容）

**可选阶段（用户要求或确认内容后再做）：**\
2. `{prefix}-slides.html` — 交互式幻灯片（深色/浅色主题切换，键盘/触摸/点击导航）\
3. Playwright 长截图：`{prefix}-long-screenshot.png`（整页长图）\
4. Playwright 单页截图：`slides-screenshots/slide-XX.png`（每页 2x 高清）

## 设计规范

### 配色系统（CSS 自定义属性）

交互版同时支持 dark 和 light 主题，长页面版只用 light。

```css
[data-theme="dark"] {
  --bg: #0b0b14;
  --bg2: #0f0f1c;
  --surface: #161628;
  --surface2: #1c1c36;
  --surface3: #22223e;
  --border: rgba(255,255,255,0.06);
  --border-strong: rgba(255,255,255,0.12);
  --text: #e6e6f2;
  --text2: #9090ac;
  --text3: #606078;
  --accent: #7b6cf0;
  --accent2: #a8a0ff;
  --green: #00d4aa;
  --green-bg: rgba(0,212,170,0.08);
  --green-border: rgba(0,212,170,0.2);
  --red: #ff6b6b;
  --red-bg: rgba(255,107,107,0.08);
  --red-border: rgba(255,107,107,0.2);
  --orange: #f0b848;
  --orange-bg: rgba(240,184,72,0.08);
  --orange-border: rgba(240,184,72,0.2);
  --accent-bg: rgba(123,108,240,0.08);
  --accent-border: rgba(123,108,240,0.18);
  --code-bg: #111124;
  --code-border: rgba(123,108,240,0.12);
  --code-text: #00d4aa;
  --shadow: 0 2px 16px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --quote-bg: rgba(123,108,240,0.06);
  --quote-border: var(--accent);
  --key-bg: linear-gradient(135deg, rgba(123,108,240,0.1), rgba(0,212,170,0.06));
  --key-border: rgba(123,108,240,0.18);
  --progress-bg: linear-gradient(90deg, #7b6cf0, #00d4aa);
}

[data-theme="light"] {
  --bg: #f4f4fb;
  --bg2: #eaeaf4;
  --surface: #ffffff;
  --surface2: #f0f0fa;
  --surface3: #e6e6f2;
  --border: rgba(0,0,0,0.07);
  --border-strong: rgba(0,0,0,0.12);
  --text: #1a1a30;
  --text2: #5a5a78;
  --text3: #9898ac;
  --accent: #5b4cc4;
  --accent2: #7b6cf0;
  --green: #009a7c;
  --green-bg: rgba(0,154,124,0.06);
  --green-border: rgba(0,154,124,0.18);
  --red: #d44040;
  --red-bg: rgba(212,64,64,0.06);
  --red-border: rgba(212,64,64,0.18);
  --orange: #b88020;
  --orange-bg: rgba(184,128,32,0.06);
  --orange-border: rgba(184,128,32,0.18);
  --accent-bg: rgba(91,76,196,0.06);
  --accent-border: rgba(91,76,196,0.15);
  --code-bg: #1a1a30;
  --code-border: rgba(91,76,196,0.12);
  --code-text: #00d4aa;
  --shadow: 0 2px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
  --quote-bg: rgba(91,76,196,0.04);
  --quote-border: var(--accent);
  --key-bg: linear-gradient(135deg, rgba(91,76,196,0.06), rgba(0,154,124,0.04));
  --key-border: rgba(91,76,196,0.12);
  --progress-bg: linear-gradient(90deg, #5b4cc4, #009a7c);
}
```

### 字体

```css
font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
```

通过 Google Fonts 引入：

```html
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');
```

代码字体：

```css
font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
```

### 可用组件

以下是所有可用的 UI 组件，按需选用：

1. `.tag` — 标签（配合 `.tag-lesson`、`.tag-section`、`.tag-red`、`.tag-orange`）

2. `.key-point` — 要点卡片（渐变背景 + 边框）

3. `.flow`**&#x20;+&#x20;**`.flow-item`**&#x20;+&#x20;**`.flow-arrow` — 流程图（flex 横排，flow-item 支持 `.green`、`.red`、`.orange`、`.accent`）

4. `.cols`**&#x20;+&#x20;**`.col-card` — 双栏布局（col-card 支持 `.green-card`、`.red-card`、`.orange-card`、`.accent-card`）

5. `.steps`**&#x20;+&#x20;**`.step-card`**&#x20;+&#x20;**`.step-label`**&#x20;+&#x20;**`.step-body` — 步骤列表（step-label 支持 `.waterfall`、`.agile` 或自定义颜色）

6. `.challenge-list`**&#x20;+&#x20;**`.challenge-item`**&#x20;+&#x20;**`.challenge-num`**&#x20;+&#x20;**`.challenge-body` — 带编号的挑战卡片

7. `.map-table`**&#x20;+&#x20;**`.map-row`**&#x20;+&#x20;**`.map-challenge`**&#x20;+&#x20;**`.map-arrow`**&#x20;+&#x20;**`.map-solution` — 问题→解法映射表

8. `.loop-card` — 循环卡片（左侧绿色边框）

9. `.quote` — 引用块（左侧边框 + 浅色背景，可含 `.attr` 标注来源）

10. `pre > code` — 代码块（深色背景）

11. `.vs-block`**&#x20;+&#x20;**`.vs-side` — 对比块（红/绿双栏）

12. `.slide-badge` — 幻灯片编号（右上角）

13. `.end-cols`**&#x20;+&#x20;**`.end-left`**&#x20;+&#x20;**`.end-right`**&#x20;+&#x20;**`.qr-card` — 收尾页左右布局 + 二维码卡片

### 交互版额外 UI 元素

* 顶部进度条 `.progress`

* 右下角页码 `.slide-number`

* 左下角操作提示 `.nav-hint`

* 左右导航箭头 `.nav-arrow`

* 底部主题切换按钮 `.theme-toggle`（太阳/月亮图标 SVG）

* 水印文字 `.lesson-watermark`（可选）

## 交互版结构（`{prefix}-slides.html`）

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{标题}</title>
  <style>
    /* 所有 CSS（含 dark/light 主题变量） */
    /* 交互版用 clamp() 做响应式字号 */
    /* 幻灯片用 absolute 定位，.active 控制显示 */
  </style>
</head>
<body>
  <div class="progress" id="progress"></div>
  <div class="slide-number" id="slideNum"></div>
  <div class="nav-hint">← → 键 / 点击两侧 / 滑动切换</div>

  <div class="nav-arrow nav-left flash" id="navLeft">
    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
  </div>
  <div class="nav-arrow nav-right flash" id="navRight">
    <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
  </div>

  <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
    <!-- 太阳/月亮 SVG -->
  </button>

  <div class="slides" id="slides">
    <!-- 幻灯片内容，每个 .slide 用 .active 控制可见性 -->
  </div>

  <script>
    // 导航逻辑：键盘(←→/Space)、触摸滑动、点击左右区域
    // 主题切换 + localStorage 持久化
    // 进度条更新
    // 导航箭头闪烁提示
  </script>
</body>
</html>
```

交互版关键 JS 逻辑：

* 幻灯片切换用 `opacity` + `translateX` 动画（0.45s ease）

* 切换时 `isAnimating` 防抖

* 键盘监听 ArrowRight/ArrowLeft/Space

* 触摸滑动检测（dx > 50px）

* 点击区域：左侧 35% 上一页，右侧 35% 下一页

* 主题切换存储到 localStorage

## 长页面版结构（`{prefix}-long.html`）

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{标题} — 长截图</title>
  <style>
    /* 只保留 light 主题变量 */
    /* 固定宽度 1200px，每页 min-height: 675px */
  </style>
</head>
<body>
  <div class="slides-container">
    <!-- 所有幻灯片垂直堆叠，用 border-top 分隔 -->
  </div>
  <!-- 如果最后一页有二维码，引入 qrcode-generator -->
  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
  <script>
    // 二维码生成逻辑（如果需要）
  </script>
</body>
</html>
```

长页面版关键区别：

* 只有 light 主题

* 宽度固定 1200px（截图用，不需要响应式）

* 每页 min-height: 675px，padding: 48px 96px

* 内容区 max-width: 920px

* 幻灯片间用 1px border-top 分隔

* 字号用固定 px/rem（不用 clamp）

* 封面 h1 用 `line-height: 1.35`（防止多行重叠）

* **默认开启可编辑模式**：在 `</body>` 前注入一小段编辑器代码（见下方「可编辑模式」）

## 可编辑模式（long.html 默认开启）

long.html 用于 review，所以默认开启「点击即改」：用户直接点击文字就能编辑，改动自动存 localStorage，刷新不丢；改完点「导出 HTML」下载一份干净的新 long.html 覆盖原文件。

### 哪些元素设为 `contenteditable="true"`

原则：**给承载文案的叶子块加，父加了子就不重复加**（避免嵌套编辑混乱）。具体：

* 裸文本块直接加：`h1` `h2` `h3` `h4` `p` `li` `td` `th` `code`（`pre>code` 整块加在 `code` 上）`.tag` `.quote`

* 结构化组件**整体**加在容器上：`.key-point` `.col-card` `.loop-card` `.icon-card` `.flow-item` `.step-card` `.challenge-item` `.score-label` `.score-fill` `.vs-side`

* **不要**给 `.slide` 本身、布局容器（`.cols` `.flow` `.steps` `.icon-grid` `.vs-block`）加

### 注入代码（放在 `</body>` 前）

```html
<!-- 可编辑模式：注入到 </body> 前，导出时会自动剥离 -->
<style id="ce-style">
  [contenteditable="true"] { outline: none; border-radius: 4px; transition: box-shadow 0.15s; }
  [contenteditable="true"]:hover { box-shadow: 0 0 0 2px rgba(91,76,196,0.22); }
  [contenteditable="true"]:focus { box-shadow: 0 0 0 2px var(--accent); background: var(--accent-bg); }
  #ce-bar {
    position: fixed; right: 16px; bottom: 16px; z-index: 9999;
    display: flex; gap: 8px; align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
  #ce-status { font-size: 12px; color: var(--text2); background: var(--surface);
    border: 1px solid var(--border); padding: 6px 12px; border-radius: 20px; box-shadow: var(--shadow); }
  #ce-status.dirty { color: var(--orange); border-color: var(--orange-border); }
  #ce-export { font-size: 13px; font-weight: 600; cursor: pointer;
    background: var(--accent); color: #fff; border: none;
    padding: 8px 16px; border-radius: 20px; box-shadow: var(--shadow); transition: opacity 0.15s; }
  #ce-export:hover { opacity: 0.9; }
  #ce-export:disabled { opacity: 0.4; cursor: default; }
  #ce-reset { font-size: 12px; cursor: pointer; background: var(--surface);
    color: var(--text2); border: 1px solid var(--border); padding: 6px 12px; border-radius: 20px; }
</style>
<div id="ce-bar">
  <span id="ce-status">可编辑：点击文字直接修改</span>
  <button id="ce-reset" type="button">还原</button>
  <button id="ce-export" type="button" disabled>导出 HTML</button>
</div>
<script id="ce-script">
(function () {
  var STORAGE_KEY = 'ce-edits:' + location.pathname;
  var editables = Array.prototype.slice.call(document.querySelectorAll('[contenteditable="true"]'));
  var status = document.getElementById('ce-status');
  var exportBtn = document.getElementById('ce-export');
  var resetBtn = document.getElementById('ce-reset');

  // key = 所属 .slide 索引 + 该 slide 内 contenteditable 索引，比全文索引更稳
  editables.forEach(function (el) {
    var slide = el.closest('.slide');
    el.dataset.ceKey = (slide ? Array.prototype.indexOf.call(document.querySelectorAll('.slide'), slide) : 'x')
      + ':' + Array.prototype.indexOf.call(slide ? slide.querySelectorAll('[contenteditable="true"]') : editables, el);
  });

  function loadEdits() {
    var raw; try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return; }
    if (!raw) return;
    var edits; try { edits = JSON.parse(raw); } catch (e) { return; }
    editables.forEach(function (el) {
      var v = edits[el.dataset.ceKey];
      if (v != null) el.innerHTML = v;
    });
  }
  function saveEdits() {
    var edits = {};
    editables.forEach(function (el) { edits[el.dataset.ceKey] = el.innerHTML; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(edits)); } catch (e) {}
  }
  function markDirty(label) {
    status.textContent = label || '有未导出的修改';
    status.classList.add('dirty'); exportBtn.disabled = false;
  }
  function markClean() {
    status.textContent = '可编辑：点击文字直接修改';
    status.classList.remove('dirty'); exportBtn.disabled = true;
  }

  editables.forEach(function (el) {
    el.addEventListener('input', function () { saveEdits(); markDirty(); });
  });

  exportBtn.addEventListener('click', function () {
    var clone = document.documentElement.cloneNode(true);
    ['ce-style', 'ce-script'].forEach(function (id) {
      var n = clone.querySelector('#' + id); if (n) n.remove();
    });
    var bar = clone.querySelector('#ce-bar'); if (bar) bar.remove();
    clone.querySelectorAll('[contenteditable]').forEach(function (n) {
      n.removeAttribute('contenteditable');
      n.removeAttribute('data-ce-key');
    });
    var html = '<!DOCTYPE html>\n' + clone.outerHTML;
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (location.pathname.split('/').pop() || 'slides-long.html');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    markClean();
  });

  resetBtn.addEventListener('click', function () {
    if (!confirm('清除本地修改并还原到原始内容？')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  });

  loadEdits();
  try { if (localStorage.getItem(STORAGE_KEY)) markDirty('已恢复上次修改（未导出）'); } catch (e) {}
})();
</script>
```

### 注意事项

* **key 稳定性**：改动以「slide 内位置」为 key，页面内**结构大改**会让旧改动错位；改文字/数字/措辞没问题，结构变了就重新生成。导出后即固化。

* **导出会自动剥离** `contenteditable`、`data-ce-key`、编辑器 `<style>`/`<script>`/`#ce-bar`，导出物与原始 long.html 形态一致，可直接覆盖原文件。

* **localStorage 在&#x20;**`file://`**&#x20;下**通常可用；禁用时已 try/catch 容错，编辑仍可用但刷新会丢，直接导出即可。

* **截图前**先「还原」或用导出后的干净文件截，避免残留。

* 用户明确不要可编辑模式（如直接截图）就不注入，非强制。

## Playwright 截图

> **按需执行**：截图只在用户明确要求时才跑。默认阶段只产出 long.html，不要自动安装 Playwright 或生成截图。

生成 HTML 后，用 Playwright 截图。**必须先安装 Playwright**：

```bash
npx playwright install chromium
```

### 长截图脚本

```javascript
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2  // 2x 高清
  });
  const page = await context.newPage();
  const filePath = path.resolve('{prefix}-long.html');
  await page.goto('file://' + filePath, { waitUntil: 'load' });

  // 等待字体和二维码加载
  await page.waitForTimeout(2000);

  // 长截图
  await page.screenshot({
    path: '{prefix}-long-screenshot.png',
    fullPage: true
  });

  await browser.close();
})();
```

### 单页截图脚本

```javascript
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
  const filePath = path.resolve('{prefix}-long.html');
  await page.goto('file://' + filePath, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // 获取所有幻灯片的边界框
  const slideBounds = await page.evaluate(() => {
    const slides = document.querySelectorAll('.slide');
    return Array.from(slides).map((slide, i) => {
      slide.scrollIntoView();
      const rect = slide.getBoundingClientRect();
      return {
        index: i,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
    });
  });

  // 为每张幻灯片截图
  const outDir = path.join(path.dirname(filePath), 'slides-screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < slideBounds.length; i++) {
    const b = slideBounds[i];
    // 先滚动到对应位置
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide')[idx].scrollIntoView();
    }, i);
    await page.waitForTimeout(300);

    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({
      path: path.join(outDir, `slide-${num}.png`),
      clip: { x: b.x, y: b.y, width: b.width, height: b.height }
    });
  }

  await browser.close();
})();
```

## 工作流程

1. 根据用户提供的内容，规划幻灯片结构（通常 8-12 页）

2. **只生成&#x20;**`{prefix}-long.html`（长页面版，用于 review）

3. 把 long.html 交给用户 review，等用户反馈

4. 根据反馈迭代 long.html，直到内容确认无误

5. 内容确认后，**提醒用户可选的后续产出**（见下方），按用户要求再生成 slides.html 和/或截图

6. 若生成 slides.html，保持与 long.html 内容一致，只改布局和样式

## review 完成后的提醒

long.html 内容确认后，向用户说明可以继续做的可选产出（不要默认全做）：

> 内容已确认。接下来如果需要，我可以帮你：\
> 需要哪些？或者内容还要再改？\
> \
> **生成长截图** `{prefix}-long-screenshot.png`（整页长图，适合分享/预览）\
> **生成单页截图** `slides-screenshots/`（每页 2x 高清 PNG，适合逐页查看）\
> **生成交互版** `{prefix}-slides.html`（深色/浅色主题切换，键盘/触摸导航，用于现场演示）

只有用户明确说要某项，才执行对应步骤。

## 注意事项

* 封面页标题如果超过一行，`h1` 的 `line-height` 要设为 `1.35`，防止重叠

* Playwright 用 `waitUntil: 'load'`（不要用 `networkidle`，CDN 加载可能超时）

* 单页截图前要用 `scrollIntoView` 把目标幻灯片滚到可视区域

* 二维码用 `qrcode-generator` 库在 canvas 上绘制，不要用图片

* 交互版和长页面版同时存在时，内容要保持一致；但默认只生成长页面版，确认内容后再按需生成交互版

⠀