/** 网络连通性自适应探测：SCF API（大陆可直连）→ 连不上时自动进入本地模式 */
import { API_BASE } from './site';

export const HEALTH_API = API_BASE + '/api/health';

const KEY = 'leodeng:api-mode'; // 'cloud' | 'local'
const PROBE_MS = 4000;
// local(受限)模式只短暂缓存，避免一次网络抖动导致整个会话一直显示"1人"等降级态
const LOCAL_TTL = 20000;

/** 快速带超时 fetch，避免大陆被墙时长时间挂起 */
export function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = PROBE_MS): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function readMode(): { mode: string; at: number } | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return { mode: p.mode, at: Number(p.at) || 0 };
  } catch (_) {
    return null;
  }
}
function writeMode(m: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ mode: m, at: Date.now() }));
  } catch (_) {
    /* ignore */
  }
}

/** 探测一次 API 是否可达（成功 → cloud；失败/超时 → local）。
 *  cloud 结果整个会话有效；local 结果 20 秒后失效，允许网络恢复后自动切回。 */
export async function probeApi(): Promise<'cloud' | 'local'> {
  const cached = readMode();
  const now = Date.now();
  if (cached) {
    if (cached.mode === 'cloud') return 'cloud';
    if (now - cached.at < LOCAL_TTL) return 'local'; // 短期仍视为 local
    // local 超时：重新探测
  }
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
  const c = readMode();
  if (!c) return false;
  if (c.mode === 'cloud') return false;
  // 超过 20s 的 local 不再视为受限（允许重试）
  if (Date.now() - c.at >= LOCAL_TTL) return false;
  return true;
}
