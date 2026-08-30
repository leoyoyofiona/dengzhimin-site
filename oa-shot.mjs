import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const urls = [
  ['23-2', 'https://openai.com/index/chatgpt-app-desktop/'],
  ['23-4', 'https://openai.com/index/introducing-ai-futures/'],
  ['25-2', 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/'],
  ['26-2', 'https://openai.com/index/bringing-chatgpt-for-teachers-to-more-us-school-districts/'],
  ['26-3', 'https://openai.com/index/learning-never-stops/'],
  ['27-1', 'https://openai.com/index/what-students-gain-from-chatgpt-critical-thinking-training/'],
  ['27-3', 'https://openai.com/index/expanding-our-presence-in-brazil/'],
  ['28-1', 'https://openai.com/index/supporting-next-generation-ai-startups-thailand/'],
  ['28-3', 'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/'],
  ['29-2', 'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/'],
  ['30-3', 'https://openai.com/index/supporting-next-generation-ai-startups-thailand/'],
  ['30-4', 'https://openai.com/index/what-students-gain-from-chatgpt-critical-thinking-training/'],
  ['25-4', 'https://www.canada.ca/en/department-finance/news/2026/08/canada-announces-targeted-retaliation-us-tariffs.html'],
  ['26-4', 'https://journals.sagepub.com/doi/10.1177/10778004261468239'],
  ['24-5', 'https://help.openai.com/en/articles/6825453'],
  ['26-5', 'https://arxiv.org/abs/2608.24214'],
  ['25-5', 'https://news.fsu.edu/news/science-technology/2026/08/24/fsu-economics-professor-awarded-grant-study-ai-impact-hiring/'],
  ['30-5', 'https://www.anthropic.com/news/claude-for-teachers'],
];
for (const [key, url] of urls) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2500);
    // 截取首屏（文章标题区）
    await page.screenshot({ path: `public/images/digest/src-${key}.png`, clip: { x: 0, y: 0, width: 1200, height: 800 } });
    const fs = await import('fs');
    const sz = fs.statSync(`public/images/digest/src-${key}.png`).size;
    console.log(`${key}: 截图 ${sz}B`);
  } catch (e) {
    console.log(`${key}: 错误 ${e.message.slice(0, 50)}`);
  }
}
await browser.close();
