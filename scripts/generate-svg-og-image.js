/**
 * SVG 模板封面图生成器
 * 在构建时自动为文章生成专业的 SVG 封面图
 *
 * 使用方法：
 * node scripts/generate-svg-og-image.js "文章标题" "标签" "输出文件名.png"
 */

// 配置
const CONFIG = {
  width: 1200,
  height: 630,
  backgroundColor: '#0a0a0f',
  primaryColor: '#d4af37',
  textColor: '#f0f0f0',
  subtitleColor: '#a0a0a0',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
};

/**
 * 生成 SVG 封面图
 */
function generateSvgOGImage(title, tag = 'Technology', author = 'Ryan') {
  // 处理长标题，自动换行
  const maxCharsPerLine = 20;
  const lines = [];
  let currentLine = '';

  for (const char of title) {
    if (currentLine.length < maxCharsPerLine) {
      currentLine += char;
    } else {
      lines.push(currentLine);
      currentLine = char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // 限制最多 3 行
  const displayLines = lines.slice(0, 3);
  if (lines.length > 3) {
    displayLines[2] = displayLines[2].slice(0, -3) + '...';
  }

  // 计算垂直位置
  const startY = 250;
  const lineHeight = 70;
  const totalHeight = displayLines.length * lineHeight;
  const firstLineY = startY - (totalHeight / 2) + (lineHeight / 2);

  // 生成 SVG
  const svg = `
<svg width="${CONFIG.width}" height="${CONFIG.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f5c842;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffd700;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>

  <!-- 装饰圆 -->
  <circle cx="100" cy="100" r="200" fill="${CONFIG.primaryColor}" opacity="0.05"/>
  <circle cx="1100" cy="530" r="150" fill="${CONFIG.primaryColor}" opacity="0.05"/>

  <!-- 边框 -->
  <rect x="20" y="20" width="${CONFIG.width - 40}" height="${CONFIG.height - 40}"
        fill="none" stroke="${CONFIG.primaryColor}" stroke-width="2" opacity="0.3" rx="10"/>

  <!-- 左侧装饰条 -->
  <rect x="60" y="150" width="4" height="330" fill="url(#goldGradient)" rx="2"/>

  <!-- 标签 -->
  <text x="100" y="190" font-family="${CONFIG.fontFamily}" font-size="24" fill="${CONFIG.primaryColor}" font-weight="600" letter-spacing="2">
    ${tag.toUpperCase()}
  </text>

  <!-- 标题 -->
  ${displayLines.map((line, index) => `
  <text x="100" y="${firstLineY + (index * lineHeight)}"
        font-family="${CONFIG.fontFamily}" font-size="48" fill="${CONFIG.textColor}" font-weight="700">
    ${escapeXml(line)}
  </text>`).join('')}

  <!-- 底部信息 -->
  <text x="100" y="550" font-family="${CONFIG.fontFamily}" font-size="20" fill="${CONFIG.subtitleColor}">
    By ${author}
  </text>

  <text x="${CONFIG.width - 100}" y="550" font-family="${CONFIG.fontFamily}" font-size="20"
        fill="${CONFIG.subtitleColor}" text-anchor="end">
    imcoders.cn
  </text>

  <!-- Logo -->
  <image x="${CONFIG.width - 140}" y="40" width="100" height="100" href="https://imcoders.cn/monket-snow2.png" opacity="0.9"/>
</svg>`;

  return svg;
}

/**
 * 转义 XML 特殊字符
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 将 SVG 转换为 PNG（使用 Canvas）
 */
async function svgToPng(svgString, outputFile) {
  // 在浏览器中使用
  if (typeof window !== 'undefined') {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = CONFIG.width;
      canvas.height = CONFIG.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = outputFile;
        a.click();
      });
    };

    img.src = url;
  } else {
    // Node.js 环境，保存 SVG 文件
    const fs = await import('fs');
    fs.writeFileSync(outputFile.replace('.png', '.svg'), svgString);
    console.log(`✅ SVG 文件已保存: ${outputFile.replace('.png', '.svg')}`);
    console.log('💡 提示：可以使用在线工具将 SVG 转换为 PNG');
  }
}

// 命令行使用
if (typeof process !== 'undefined' && require.main === module) {
  const args = process.argv.slice(2);
  const title = args[0] || '文章标题';
  const tag = args[1] || 'Technology';
  const output = args[2] || 'og-image.png';

  const svg = generateSvgOGImage(title, tag);
  console.log(svg);
  svgToPng(svg, output);
}

// 导出供其他模块使用
export { generateSvgOGImage, svgToPng };
