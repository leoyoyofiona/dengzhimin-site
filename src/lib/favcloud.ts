/** 收藏/足迹云端同步 —— 与访问统计同 uid（leodeng:visitor-uid），存 Cloudflare KV */
export const FAV_API = 'https://dengzhimin-guestbook-api.leooelcn.workers.dev/api/favorites';
export const FAV_KEY = 'leodeng:favs';
export const HIST_KEY = 'leodeng:history';

export function getUid(): string {
  try {
    let uid = localStorage.getItem('leodeng:visitor-uid');
    if (!uid) {
      uid =
        (crypto.randomUUID && crypto.randomUUID()) ||
        'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('leodeng:visitor-uid', uid);
    }
    return uid;
  } catch (_) {
    return '';
  }
}

export function readLocal(key: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '') || [];
  } catch (_) {
    return [];
  }
}

export function writeLocal(key: string, v: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch (_) {
    /* ignore */
  }
}

/** 从云端拉取当前访客的收藏 + 足迹 */
export async function fetchCloud(): Promise<{ favs: any[]; history: any[] }> {
  try {
    const uid = getUid();
    if (!uid) return { favs: [], history: [] };
    const res = await fetch(FAV_API + '?uid=' + encodeURIComponent(uid), { mode: 'cors' });
    if (!res.ok) return { favs: [], history: [] };
    const d = await res.json();
    return {
      favs: Array.isArray(d.favs) ? d.favs : [],
      history: Array.isArray(d.history) ? d.history : [],
    };
  } catch (_) {
    return { favs: [], history: [] };
  }
}

/** 把当前访客的收藏 + 足迹推送到云端（失败静默，下次仍会同步） */
export function pushCloud(favs: any[], history: any[]) {
  try {
    const uid = getUid();
    if (!uid) return;
    fetch(FAV_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, favs: favs.slice(0, 300), history: history.slice(0, 100) }),
      mode: 'cors',
    }).catch(() => {});
  } catch (_) {
    /* ignore */
  }
}

/**
 * 安全推送：先拉取云端并合并本地，再用合并结果推送。
 * 防止页面加载早期（云端数据尚未合并到本地）用空/残缺本地数据
 * 覆盖云端，导致收藏/足迹"清零"。返回合并后的 { favs, history }。
 */
export async function syncCloud(localFavs: any[], localHist: any[], opts: { push?: boolean } = {}) {
  const cloud = await fetchCloud();
  const merged = mergeCloud(localFavs, localHist, cloud);
  if (opts.push !== false) pushCloud(merged.favs, merged.history);
  return merged;
}

/** 合并云端数据到本地：收藏按 url 去重（云端优先保留），足迹按 url 去重（云端优先） */
export function mergeCloud(localFavs: any[], localHist: any[], cloud: { favs: any[]; history: any[] }) {
  const byUrl = (list: any[]) => new Map(list.map((r) => [r.url, r]));
  const favMap = byUrl(localFavs);
  for (const r of cloud.favs || []) {
    if (r && r.url) favMap.set(r.url, r);
  }
  const histMap = byUrl(localHist);
  for (const r of cloud.history || []) {
    if (r && r.url) histMap.set(r.url, r);
  }
  const favs = Array.from(favMap.values());
  const history = Array.from(histMap.values()).slice(0, 60);
  return { favs, history };
}
