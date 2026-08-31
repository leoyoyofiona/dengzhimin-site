import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const urls = [
  ['31-5', 'https://ebs.publicnow.com/view/8F1D0AD5C08F32445B71E723D0258ECC0DEF1D4D'],
  ['31-3', 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/'],
];
for (const [key, url] of urls) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `public/images/digest/src-${key}.png` });
    const fs = await import('fs');
    console.log(`${key}: 整页截图 ${fs.statSync(`public/images/digest/src-${key}.png`).size}B`);
  } catch (e) {
    console.log(`${key}: 错误 ${e.message.slice(0, 60)}`);
  }
}
await browser.close();
