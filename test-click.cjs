const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { window.sessionStorage.setItem('dengzhimin-access', 'ok'); window.location.reload(); });
  await page.waitForTimeout(2500);
  // hover 音乐按钮
  await page.hover('#ambient-music');
  await page.waitForTimeout(400);
  const panelState = await page.evaluate(() => {
    const panel = document.getElementById('am-panel');
    const wrap = document.getElementById('ambient-music');
    const btn = document.getElementById('am-toggle');
    const pr = panel.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    return {
      panelHidden: panel.hidden,
      panelRect: { top: Math.round(pr.top), bottom: Math.round(pr.bottom), left: Math.round(pr.left), right: Math.round(pr.right) },
      btnRect: { top: Math.round(br.top), bottom: Math.round(br.bottom) },
      gap: Math.round(br.top - pr.bottom), // 面板底到按钮顶的间隙
    };
  });
  console.log('PANEL_STATE:', JSON.stringify(panelState));
  // 尝试点击播放按钮（面板内的）
  try {
    await page.click('#am-play', { timeout: 3000 });
    console.log('PLAY_CLICKED: true');
  } catch (e) {
    console.log('PLAY_CLICK_FAILED:', e.message.split('\n')[1] || e.message.slice(0, 80));
  }
  await browser.close();
})().catch((e) => { console.error('ERR:', e.message); process.exit(0); });
