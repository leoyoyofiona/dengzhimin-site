// 录制作品站点交互 → 连续截图 → PIL 合成 GIF
// 用法: node record-demo.mjs <url> <outdir> <seconds>
import { chromium } from 'playwright';
import { mkdirSync, existsSync, rmSync } from 'fs';

const url = process.argv[2];
const outdir = process.argv[3] || '/tmp/demo-shots';
const seconds = parseInt(process.argv[4] || '6', 10);

if (existsSync(outdir)) rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  let frame = 0;
  const shot = async () => {
    await page.screenshot({ path: `${outdir}/f${String(frame++).padStart(3, '0')}.png` });
  };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    await shot();
    // 交互：滚动 + 鼠标移动 + 悬停
    await page.mouse.move(400, 300);
    await page.waitForTimeout(300);
    await shot();
    for (let i = 0; i < Math.min(seconds, 5); i++) {
      await page.mouse.wheel(0, 280);
      await page.waitForTimeout(350);
      await shot();
      await page.mouse.move(300 + i * 70, 250 + i * 50);
      await page.waitForTimeout(300);
      await shot();
    }
    await page.mouse.wheel(0, -280);
    await page.waitForTimeout(400);
    await shot();
  } catch (e) {
    console.error('页面访问失败:', e.message);
  }
  await browser.close();
  console.log(`录制完成: ${frame} 帧 → ${outdir}`);
})().catch((e) => {
  console.error('错误:', e.message);
  process.exit(1);
});
