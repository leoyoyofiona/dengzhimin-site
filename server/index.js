// 留言板 API —— 匿名留言，全站共享
// 存储：内存 + 简单文件持久化（Render 磁盘）
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'guestbook.json');
const PORT = process.env.PORT || 3001;

const MAX_MESSAGES = 200;
const MAX_TEXT = 500;
const MAX_NAME = 20;

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

app.listen(PORT, () => {
  console.log(`Guestbook API running on port ${PORT}`);
});
