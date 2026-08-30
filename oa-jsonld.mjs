import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const urls = [
  ['27-1', 'https://openai.com/index/what-students-gain-from-chatgpt-critical-thinking-training/'],
  ['26-2', 'https://openai.com/index/bringing-chatgpt-for-teachers-to-more-us-school-districts/'],
  ['28-1', 'https://openai.com/index/supporting-next-generation-ai-startups-thailand/'],
];
for (const [key, url] of urls) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(1000);
    const info = await page.evaluate(() => {
      const ld = document.querySelectorAll('script[type="application/ld+json"]');
      const jsonld = [...ld].map(s => s.textContent.slice(0, 500));
      // 找大图
      const imgs = [...document.querySelectorAll('img')].map(i => i.src).filter(s => s && (s.includes('oaidalle') || s.includes('cdn') || s.includes('image'))).slice(0, 5);
      const bg = document.querySelector('meta[property="og:image:secure_url"]');
      return { jsonld: jsonld.slice(0, 2), imgs, bg: bg?.content };
    });
    console.log(`=== ${key} ===`);
    console.log('imgs:', JSON.stringify(info.imgs));
    const m = info.jsonld.join('').match(/"image"\s*:\s*"[^"]*"/);
    console.log('jsonld image:', m ? m[0] : 'none');
  } catch (e) {
    console.log(`${key}: 错误 ${e.message.slice(0, 60)}`);
  }
}
await browser.close();
