// 留言板 API —— 匿名留言，全站共享
// 存储：内存 + 简单文件持久化（Render 磁盘）
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'guestbook.json');
const VISITS_FILE = process.env.VISITS_FILE || path.join(__dirname, 'data', 'visits.json');
const PORT = process.env.PORT || 3001;

const MAX_MESSAGES = 200;
const MAX_TEXT = 500;
const MAX_NAME = 20;
const MAX_SEEN = 5000; // 访客去重表上限

// 确保数据目录存在
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function save(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

// ===== 访问统计 =====
// 数据结构：{ visitors: 人数, views: 次数, seen: { [uid]: true } }
function loadVisits() {
  try {
    return JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
  } catch {
    return { visitors: 0, views: 0, seen: {} };
  }
}

function saveVisits(v) {
  fs.writeFileSync(VISITS_FILE, JSON.stringify(v));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// 读取留言
app.get('/api/guestbook', (_req, res) => {
  const list = load();
  res.json(list.slice().reverse());
});

// 发布留言
app.post('/api/guestbook', (req, res) => {
  const text = String(req.body?.text || '').trim().slice(0, MAX_TEXT);
  if (!text) {
    return res.status(400).json({ error: '留言内容不能为空' });
  }
  const name = String(req.body?.name || '').trim().slice(0, MAX_NAME) || '匿名';
  const list = load();
  list.push({ name, text, time: Date.now() });
  save(list.slice(-MAX_MESSAGES));
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, messages: load().length });
});

// 读取访问统计
app.get('/api/visits', (_req, res) => {
  const v = loadVisits();
  res.json({ visitors: v.visitors || 0, views: v.views || 0 });
});

// 上报一次访问（views+1；新 uid → visitors+1）
app.post('/api/visits', (req, res) => {
  const uid = String(req.body?.uid || '').trim().slice(0, 64);
  const v = loadVisits();
  v.views = (v.views || 0) + 1;
  if (uid && !v.seen[uid]) {
    v.seen[uid] = true;
    v.visitors = (v.visitors || 0) + 1;
    // 去重表过大时清理一半，防止文件无限膨胀
    const keys = Object.keys(v.seen);
    if (keys.length > MAX_SEEN) {
      for (const k of keys.slice(0, MAX_SEEN / 2)) delete v.seen[k];
    }
  }
  saveVisits(v);
  res.json({ visitors: v.visitors, views: v.views });
});

app.listen(PORT, () => {
  console.log(`Guestbook API running on port ${PORT}`);
});
