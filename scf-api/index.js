// dengzhimin-api — 腾讯云 SCF (Node, ap-shanghai)
// 部署形态：函数 URL = CreateTrigger(Type=http)，事件入参 {body, headers, httpMethod, path, queryString}
// 数据持久化：腾讯云 COS (ap-shanghai, bucket dengzhimin-api-data-1303737693)，一个 key 一个 JSON
// 功能：留言板 + 建议弹幕(含管理) + 收藏 + 访问统计 + 敏感词过滤/长度限制
const COS = require('cos-nodejs-sdk-v5');

// 凭证一律来自函数环境变量（勿硬编码——GitHub 密钥扫描会拦截）
const SECRET_ID = process.env.COS_SECRET_ID || '';
const SECRET_KEY = process.env.COS_SECRET_KEY || '';
const BUCKET = process.env.COS_BUCKET || 'dengzhimin-api-data-1303737693';
const REGION = process.env.COS_REGION || 'ap-shanghai';
const ADMIN_PASS = process.env.ADMIN_PASS || 'xz123';

const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
});

// 环境变量未配齐时启动即报错（防止线上静默失败）
if (!SECRET_ID || !SECRET_KEY) {
  throw new Error('缺少 COS 密钥环境变量：COS_SECRET_ID / COS_SECRET_KEY');
}

const MAX_MESSAGES = 200;     // 留言
const MAX_TEXT = 500;         // 单条长度
const MAX_NAME = 20;          // 昵称长度
const MAX_SEEN = 5000;        // 访客去重集
const MAX_SUGGESTIONS = 300;  // 建议弹幕上限

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pass',
  'Access-Control-Expose-Headers': '*',
};

// ===== COS 封装：JSON 读 / 写 =====
function cosGetJSON(key, fallback) {
  return new Promise((resolve) => {
    cos.getObject({ Bucket: BUCKET, Region: REGION, Key: key }, (err, data) => {
      if (err || !data || !data.Body) return resolve(fallback);
      try {
        resolve(JSON.parse(data.Body.toString('utf8')));
      } catch (e) {
        resolve(fallback);
      }
    });
  });
}
function cosPutJSON(key, obj) {
  return new Promise((resolve) => {
    cos.putObject(
      { Bucket: BUCKET, Region: REGION, Key: key, Body: JSON.stringify(obj), ContentType: 'application/json' },
      (err) => resolve(!err),
    );
  });
}
function cosDeleteObject(key) {
  return new Promise((resolve) => {
    cos.deleteObject({ Bucket: BUCKET, Region: REGION, Key: key }, () => resolve(true));
  });
}
function keyOf(name) {
  return 'kv/' + name + '.json';
}

// ===== 敏感词过滤 =====
// 站内公开文本(留言/弹幕)拦截：政治攻击、涉暴、色情、广告引流等粗库
// 命中即拒绝提交(返回 422)。词库可维护；大小写/空白不做降噪（中文场景按原词匹配）
const BANNED_WORDS = [
  '法轮功', '法轮大法', '六四', '天安门事件', '八九学运', '打倒中共', '推翻政府', '共产党灭亡',
  '台独万岁', '藏独', '疆独', '港独', '杀光', '炸掉', '恐怖袭击', '自杀式袭击', '制造炸弹',
  '出售枪支', '迷奸药', '卖淫', '一夜情约炮', '裸聊', '色情片', '黄网', '成人视频',
  '赌博网站', '博彩网址', '加我微信赚钱', '刷单兼职', '高利贷', '代开发票', '代办证件',
  '贷款秒到', '日赚千元', '点击领红包', '免费领取苹果',
];
function checkBanned(text) {
  if (!text) return null;
  for (const w of BANNED_WORDS) {
    if (text.indexOf(w) !== -1) return w;
  }
  return null;
}

function out(status, obj) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
    body: JSON.stringify(obj),
  };
}
function notFound() {
  return out(404, { error: 'Not Found' });
}
function readBodyStr(event) {
  // 函数 URL / API 网关事件 body 可能为 string；若 base64 则解码
  let b = event.body;
  if (b && event.isBase64Encoded) b = Buffer.from(b, 'base64').toString('utf8');
  return typeof b === 'string' ? b : '';
}
function parseQuery(event) {
  const q = event.queryString || event.queryStringParameters || {};
  const outQ = {};
  for (const k of Object.keys(q || {})) outQ[k] = q[k];
  return outQ;
}

async function handle(event) {
  const method = event.httpMethod || 'GET';
  let path = event.path || event.pathParameters && event.pathParameters.proxy || '/';
  if (path.indexOf('/api') !== 0) path = '/' + path.replace(/^\//, '');
  const query = parseQuery(event);

  // 跨域预检
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  try {
    // ===== 健康检查 =====
    if (method === 'GET' && path === '/api/health') {
      const msgs = await cosGetJSON(keyOf('guestbook:list'), []);
      const sug = await cosGetJSON(keyOf('suggestions:list'), []);
      return out(200, { ok: true, messages: msgs.length, suggestions: sug.length, region: 'ap-shanghai' });
    }

    // ===== 留言板 =====
    if (path === '/api/guestbook') {
      const list = await cosGetJSON(keyOf('guestbook:list'), []);
      if (method === 'GET') {
        return out(200, list.slice().reverse());
      }
      if (method === 'POST') {
        const body = JSON.parse(readBodyStr(event) || '{}');
        const rawText = String(body.text || '').trim().slice(0, MAX_TEXT);
        if (!rawText) return out(400, { error: '留言内容不能为空' });
        const hit = checkBanned(rawText);
        if (hit) return out(422, { error: '内容包含被屏蔽的敏感词，请修改后重试' });
        const name = String(body.name || '').trim().slice(0, MAX_NAME) || '匿名';
        list.push({ name, text: rawText, time: Date.now() });
        await cosPutJSON(keyOf('guestbook:list'), list.slice(-MAX_MESSAGES));
        return out(200, { ok: true });
      }
    }

    // ===== 访问统计 =====
    if (path === '/api/visits') {
      if (method === 'GET') {
        const v = await cosGetJSON(keyOf('visits:data'), { visitors: 0, views: 0 });
        return out(200, { visitors: (v && v.visitors) || 0, views: (v && v.views) || 0 });
      }
      if (method === 'POST') {
        const body = JSON.parse(readBodyStr(event) || '{}');
        const uid = String(body.uid || '').trim().slice(0, 64);
        let v = await cosGetJSON(keyOf('visits:data'), null);
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
        await cosPutJSON(keyOf('visits:data'), v);
        return out(200, { visitors: v.visitors, views: v.views });
      }
    }

    // ===== 收藏/足迹（按 uid） =====
    if (path === '/api/favorites') {
      if (method === 'GET') {
        const uid = String(query.uid || '').trim().slice(0, 64);
        if (!uid) return out(200, { favs: [], history: [] });
        const d = await cosGetJSON(keyOf('fav:' + uid), null);
        return out(200, {
          favs: d && Array.isArray(d.favs) ? d.favs : [],
          history: d && Array.isArray(d.history) ? d.history : [],
        });
      }
      if (method === 'POST') {
        const body = JSON.parse(readBodyStr(event) || '{}');
        const uid = String(body.uid || '').trim().slice(0, 64);
        if (!uid) return out(400, { error: '缺少 uid' });
        const favs = Array.isArray(body.favs) ? body.favs.slice(0, 300) : [];
        const history = Array.isArray(body.history) ? body.history.slice(0, 100) : [];
        await cosPutJSON(keyOf('fav:' + uid), { favs, history, updated: Date.now() });
        return out(200, { ok: true });
      }
    }

    // ===== 建议弹幕：公开 GET/POST + 管理(密码) =====
    if (path === '/api/suggestions' || path === '/api/suggestions/admin') {
      const list = await cosGetJSON(keyOf('suggestions:list'), []);

      if (method === 'GET' && path === '/api/suggestions') {
        return out(200, list.slice().reverse());
      }

      if (method === 'POST' && path === '/api/suggestions') {
        const body = JSON.parse(readBodyStr(event) || '{}');
        const rawText = String(body.text || '').trim().slice(0, MAX_TEXT);
        if (!rawText) return out(400, { error: '建议内容不能为空' });
        const hit = checkBanned(rawText);
        if (hit) return out(422, { error: '内容包含被屏蔽的敏感词，请修改后重试' });
        const name = String(body.name || '').trim().slice(0, MAX_NAME) || '匿名';
        list.push({ name, text: rawText, time: Date.now() });
        await cosPutJSON(keyOf('suggestions:list'), list.slice(-MAX_SUGGESTIONS));
        return out(200, { ok: true });
      }

      // ===== 管理入口：密码校验后 删除某条 / 清空 =====
      if (method === 'POST' && path === '/api/suggestions/admin') {
        const body = JSON.parse(readBodyStr(event) || '{}');
        // 兼容 header 或 body 传入密码
        const pass = String(body.password || event.headers['x-admin-pass'] || '').trim();
        if (pass !== ADMIN_PASS) return out(403, { error: '密码错误' });
        const action = String(body.action || '').trim();
        if (action === 'auth') {
          return out(200, { ok: true });
        }
        if (action === 'clear') {
          await cosPutJSON(keyOf('suggestions:list'), []);
          return out(200, { ok: true, cleared: list.length });
        }
        if (action === 'delete') {
          const time = Number(body.time);
          if (!time) return out(400, { error: '缺少 time' });
          const next = list.filter((it) => Number(it.time) !== time);
          if (next.length === list.length) return out(404, { error: '未找到该条弹幕' });
          await cosPutJSON(keyOf('suggestions:list'), next);
          return out(200, { ok: true, deleted: 1 });
        }
        return out(400, { error: '未知操作' });
      }
    }

    return notFound();
  } catch (e) {
    return out(500, { error: 'Internal Error' });
  }
}

// SCF 入口
exports.main_handler = async function (event, context) {
  return handle(event || {});
};

// 供本地测试
exports.__test = { handle, checkBanned, cosGetJSON, cosPutJSON };
