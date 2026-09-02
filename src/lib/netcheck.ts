/** 网络连通性自适应探测：Cloudflare API（大陆被墙时连不上）→ 自动进入本地模式 */
export const HEALTH_API = 'https://dengzhimin-guestbook-api.leooelcn.workers.dev/api/health';

const KEY = 'leodeng:api-mode'; // 'cloud' | 'local'
const PROBE_MS = 4000;

/** 快速带超时 fetch，避免大陆被墙时长时间挂起 */
export function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = PROBE_MS): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function readMode(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch (_) {
    return null;
  }
}
function writeMode(m: string) {
  try {
    sessionStorage.setItem(KEY, m);
  } catch (_) {
    /* ignore */
  }
}

/** 探测一次 API 是否可达（成功 → cloud；失败/超时 → local）。结果缓存于 sessionStorage。 */
export async function probeApi(): Promise<'cloud' | 'local'> {
  const cached = readMode();
  if (cached === 'cloud' || cached === 'local') return cached as 'cloud' | 'local';
  let mode: 'cloud' | 'local' = 'local';
  try {
    const res = await fetchWithTimeout(HEALTH_API);
    mode = res.ok ? 'cloud' : 'local';
  } catch (_) {
    mode = 'local';
  }
  writeMode(mode);
  return mode;
}

/** 当前是否本地（受限）模式——已探测过才准确 */
export function isLocalMode(): boolean {
  return readMode() === 'local';
}
