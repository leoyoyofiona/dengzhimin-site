// dengzhimin-guestbook-api — Cloudflare Worker
// 留言板 + 建议墙 + 全站访问统计，数据存 KV（免费，免绑卡）
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const MAX_MESSAGES = 200;
const MAX_TEXT = 500;
const MAX_NAME = 20;
const MAX_SEEN = 5000;
const MAX_SUGGESTIONS = 300;

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.GUESTBOOK_KV;
    try {
      if (request.method === 'GET' && path === '/api/health') {
        const msgs = await readJson(kv, 'guestbook:list', []);
        return json({ ok: true, messages: msgs.length });
      }
      if (path === '/api/guestbook') {
        if (request.method === 'GET') {
          const list = await readJson(kv, 'guestbook:list', []);
          return json(list.slice().reverse());
        }
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const text = String(body.text || '').trim().slice(0, MAX_TEXT);
          if (!text) return json({ error: '留言内容不能为空' }, 400);
          const name = String(body.name || '').trim().slice(0, MAX_NAME) || '匿名';
          const list = await readJson(kv, 'guestbook:list', []);
          list.push({ name, text, time: Date.now() });
          await kv.put('guestbook:list', JSON.stringify(list.slice(-MAX_MESSAGES)));
          return json({ ok: true });
        }
      }
      if (path === '/api/visits') {
        if (request.method === 'GET') {
          const v = await readJson(kv, 'visits:data', { visitors: 0, views: 0 });
          return json({ visitors: v.visitors || 0, views: v.views || 0 });
        }
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const uid = String(body.uid || '').trim().slice(0, 64);
          let v = await readJson(kv, 'visits:data', null);
          if (!v || typeof v !== 'object') v = { visitors: 0, views: 0, seen: {} };
          if (!v.seen || typeof v.seen !== 'object') v.seen = {};
          v.views = (v.views || 0) + 1;
          if (uid && !v.seen[uid]) {
            v.seen[uid] = true;
            v.visitors = (v.visitors || 0) + 1;
            const keys = Object.keys(v.seen);
            if (keys.length > MAX_SEEN) {
              for (const k of keys.slice(0, MAX_SEEN / 2)) delete v.seen[k];
            }
          }
          await kv.put('visits:data', JSON.stringify(v));
          return json({ visitors: v.visitors, views: v.views });
        }
      }
      if (path === '/api/favorites') {
        // 每个访客的收藏与浏览足迹，按 uid 存 KV（与访问统计同 uid）
        if (request.method === 'GET') {
          const uid = String(url.searchParams.get('uid') || '').trim().slice(0, 64);
          if (!uid) return json({ favs: [], history: [] });
          const d = await readJson(kv, 'fav:' + uid, null);
          return json({
            favs: (d && Array.isArray(d.favs)) ? d.favs : [],
            history: (d && Array.isArray(d.history)) ? d.history : [],
          });
        }
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const uid = String(body.uid || '').trim().slice(0, 64);
          if (!uid) return json({ error: '缺少 uid' }, 400);
          const favs = Array.isArray(body.favs) ? body.favs.slice(0, 300) : [];
          const history = Array.isArray(body.history) ? body.history.slice(0, 100) : [];
          await kv.put('fav:' + uid, JSON.stringify({ favs, history, updated: Date.now() }));
          return json({ ok: true });
        }
      }
      if (path === '/api/suggestions') {
        // 建议墙：公开透明，任何人提交的建议所有访客可见
        if (request.method === 'GET') {
          const list = await readJson(kv, 'suggestions:list', []);
          return json(list.slice().reverse());
        }
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const text = String(body.text || '').trim().slice(0, MAX_TEXT);
          if (!text) return json({ error: '建议内容不能为空' }, 400);
          const name = String(body.name || '').trim().slice(0, MAX_NAME) || '匿名';
          const list = await readJson(kv, 'suggestions:list', []);
          list.push({ name, text, time: Date.now() });
          await kv.put('suggestions:list', JSON.stringify(list.slice(-MAX_SUGGESTIONS)));
          return json({ ok: true });
        }
      }
      return json({ error: 'Not Found' }, 404);
    } catch (e) {
      return json({ error: 'Internal Error' }, 500);
    }
  },
};
async function readJson(kv, key, fallback) {
  try {
    const val = await kv.get(key);
    if (!val) return fallback;
    const parsed = JSON.parse(val);
    return parsed;
  } catch {
    return fallback;
  }
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}
