// 构建后处理：把静态资源引用从本站 /images 改为 COS 加速域名
// 用法：node scripts/rewrite-assets.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
// COS 加速域名（腾讯云上海，公有读）
const COS_BASE = 'https://thesis-music-hk-1303737693.cos.ap-hongkong.myqcloud.com';

const walked = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else walked.push(p);
  }
}
walk(DIST);

let changed = 0;
for (const file of walked) {
  const ext = extname(file);
  if (!['.html', '.css', '.js', '.xml'].includes(ext)) continue;
  let txt = readFileSync(file, 'utf8');
  let out = txt;
  // 图片、视频、音频等静态资源路径 → COS
  // 只替换 /images/ 前缀（本站资源），保留绝对 URL 与相对路径
  out = out.replace(/(["'(])\/images\//g, `$1${COS_BASE}/images/`);
  // CSS 里 url(/images/...) 与 background 引用
  out = out.replace(/url\(\/images\//g, `url(${COS_BASE}/images/`);
  if (out !== txt) {
    writeFileSync(file, out);
    changed++;
  }
}
console.log(`rewrite done: ${changed} files updated → ${COS_BASE}`);
// build cache bust
