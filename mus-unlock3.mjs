import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1280, height: 700 } });
p.on('console', (m) => { const t = m.text(); if (t.includes('play(') || t.includes('RESOLVED') || t.includes('REJECTED')) console.log('[log]', t.slice(0, 150)); });
p.on('pageerror', (e) => console.log('PAGEERR:', String(e).slice(0, 200)));
await p.addInitScript(() => {
  try { sessionStorage.setItem('dengzhimin-access', 'ok'); } catch (e) {}
  const origPlay = HTMLAudioElement.prototype.play;
  HTMLAudioElement.prototype.play = function () {
    const pr = origPlay.call(this);
    console.log('play() src=' + (this.src ? this.src.slice(0, 70) : '(empty)'));
    if (pr && pr.then) pr.then(() => console.log('  RESOLVED')).catch(e => console.log('  REJECTED:', String(e).slice(0, 90)));
    return pr;
  };
});
await p.goto('http://127.0.0.1:8804/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1200);
await p.evaluate(() => document.querySelector('#am-toggle').click());
await p.waitForTimeout(9000);
const s = await p.evaluate(() => ({
  song: document.querySelector('#am-song')?.textContent?.slice(0, 55),
  title: document.querySelector('#am-title')?.textContent,
  playing: document.querySelector('#am-toggle')?.classList.contains('playing'),
  cur: document.querySelector('audio')?.currentTime?.toFixed(2),
  audioCount: document.querySelectorAll('audio').length,
}));
console.log('STATE:', JSON.stringify(s));
await b.close();
