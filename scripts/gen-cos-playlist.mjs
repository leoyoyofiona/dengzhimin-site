// 生成 COS 音乐播放清单（香港桶 thesis-music-hk-1303737693）
// 输出：1) 站点 public/music/playlist.json（随站点发布，播放器首选，无 CORS）
//       2) 上传 COS music/playlist.json（播放器备用）
// 用法：TENCENT_SECRET_ID=... TENCENT_SECRET_KEY=... node scripts/gen-cos-playlist.mjs
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUCKET = 'thesis-music-hk-1303737693';
const REGION = 'ap-hongkong';
const ENDPOINT = `cos.${REGION}.myqcloud.com`;
const CONFIG = '/tmp/cosconfig.yaml';
const OUT_SITE = join(__dirname, '../public/music/playlist.json');

const secretId = process.env.TENCENT_SECRET_ID;
const secretKey = process.env.TENCENT_SECRET_KEY;
if (!secretId || !secretKey) {
  console.error('请设置 TENCENT_SECRET_ID / TENCENT_SECRET_KEY 环境变量');
  process.exit(1);
}
writeFileSync(CONFIG, `cos:\n  base:\n    secretid: ${secretId}\n    secretkey: ${secretKey}\n    sessiontoken: ""\n`);

console.log('扫描 COS music/ …');
const out = execSync(`/tmp/coscli ls cos://${BUCKET}/music/ -c ${CONFIG} -e ${ENDPOINT} -r`, { encoding: 'utf8' });
const tracks = [];
for (const line of out.split('\n')) {
  const parts = line.trim().split(/\s{2,}/);
  if (parts.length < 2) continue;
  const key = parts[0];
  if (parts[1] === 'DIR') continue;
  if (!/\.(mp3|ogg|m4a|wav|flac)$/i.test(key)) continue;
  const name = key.split('/').pop().replace(/\.[^.]+$/, '');
  tracks.push({ url: `https://${BUCKET}.${ENDPOINT}/${key}`, title: name });
}
if (!tracks.length) {
  console.log('music/ 下暂无音频文件。');
  process.exit(0);
}
const json = JSON.stringify({ generated: new Date().toISOString(), tracks }, null, 2);
mkdirSync(dirname(OUT_SITE), { recursive: true });
writeFileSync(OUT_SITE, json);
console.log(`✅ public/music/playlist.json 已生成：${tracks.length} 首（提交后随站点发布）`);
try {
  writeFileSync('/tmp/playlist.json', json);
  execSync(`/tmp/coscli cp /tmp/playlist.json cos://${BUCKET}/music/playlist.json -c ${CONFIG} -e ${ENDPOINT}`, { encoding: 'utf8' });
  console.log('✅ 已上传 COS music/playlist.json（远程备用）');
} catch (e) {
  console.log('（COS 上传失败可忽略，站点同源清单已足够）');
}
console.log('前 5 首：');
for (const t of tracks.slice(0, 5)) console.log(' -', t.title);
