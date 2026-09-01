const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('https://dengzhimin-site.onrender.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => { window.sessionStorage.setItem('dengzhimin-access', 'ok'); window.location.reload(); });
  await page.waitForTimeout(6000);
  const r = await page.evaluate(() => {
    const music = document.getElementById('ambient-music');
    const weather = document.getElementById('ambient-weather');
    const bg = document.getElementById('weather-bg');
    return {
      musicExists: !!music,
      musicIcon: document.getElementById('am-icon')?.textContent,
      weatherText: weather && !weather.hidden ? weather.querySelector('.aw-text').textContent : 'hidden',
      bgChildren: bg ? bg.children.length : 0,
      clock: document.getElementById('ambient-clock')?.textContent,
    };
  });
  console.log('LIVE_VERIFY:', JSON.stringify(r));
  await browser.close();
})().catch((e) => { console.error('ERR:', e.message); process.exit(0); });
