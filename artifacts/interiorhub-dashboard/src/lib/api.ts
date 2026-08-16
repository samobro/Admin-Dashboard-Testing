export type Role = 'Admin' | 'Engineer';
export type Session = { accessToken: string; refreshToken?: string; expiresAt?: number; role: Role; engineerId?: string; email?: string; name?: string };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7268';
let session: Session | null = null;
let refreshPromise: Promise<Session | null> | null = null;

function decodeJwt(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return {}; }
}
function claimsFromToken(token: string) {
  const claims = decodeJwt(token);
  const role = claims.role || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const engineerId = claims.EngineerId || claims.engineerId || claims['EngineerID'];
  return {
    role: String(role || '').toLowerCase() === 'admin' ? 'Admin' as Role : 'Engineer' as Role,
    engineerId: engineerId ? String(engineerId) : undefined,
    email: String(claims.email || claims.sub || ''),
    name: String(claims.name || claims.preferred_username || claims.email || ''),
  };
}
export function getSession(): Session | null {
  if (session) return session;
  try {
    const raw = sessionStorage.getItem('interiorhub.session');
    if (raw) session = JSON.parse(raw) as Session;
  } catch { /* unavailable storage */ }
  return session;
}
export function saveSession(value: Session | null) {
  session = value;
  try {
    if (value) sessionStorage.setItem('interiorhub.session', JSON.stringify(value));
    else sessionStorage.removeItem('interiorhub.session');
  } catch { /* unavailable storage */ }
}
export function isLoggedIn() { return !!getSession()?.accessToken; }
export function getRole() { return getSession()?.role; }

export async function login(email: string, password: string): Promise<Session> {
  const body = new URLSearchParams({ grant_type: 'password', username: email, password, scope: 'offline_access' });
  const response = await fetch(`${API_BASE_URL}/connect/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(await response.text() || 'The credentials were not accepted.');
  const data = await response.json();
  const claims = claimsFromToken(data.access_token);
  const value = { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined, ...claims };
  saveSession(value);
  return value;
}
async function refresh(): Promise<Session | null> {
  const current = getSession();
  if (!current?.refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: current.refreshToken || '', scope: 'offline_access' });
      const response = await fetch(`${API_BASE_URL}/connect/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!response.ok) { saveSession(null); return null; }
      const data = await response.json();
      const value = { ...current, accessToken: data.access_token, refreshToken: data.refresh_token || current.refreshToken, expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined, ...claimsFromToken(data.access_token) };
      saveSession(value);
      return value;
    })().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}
export async function logout() {
  const current = getSession();
  if (current?.accessToken) await fetch(`${API_BASE_URL}/connect/revoke`, { method: 'POST', headers: { Authorization: `Bearer ${current.accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: current.accessToken }) }).catch(() => undefined);
  saveSession(null);
}
export type RequestOptions = RequestInit & { retry?: boolean };
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const current = getSession();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (current?.accessToken) headers.set('Authorization', `Bearer ${current.accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 401 && options.retry !== false && current?.refreshToken) {
    const next = await refresh();
    if (next) return apiRequest<T>(path, { ...options, retry: false });
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const error = await response.json(); message = error.message || error.title || error.detail || (Array.isArray(error.errors) ? error.errors.join(', ') : message); } catch { const text = await response.text().catch(() => ''); if (text) message = text; }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export function upload<T>(path: string, file: File, fields: Record<string, string> = {}) {
  const form = new FormData(); form.append('file', file); Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  return apiRequest<T>(path, { method: 'POST', body: form });
}
export function normalizePage<T>(payload: unknown): { items: T[]; totalCount: number; totalPages: number } {
  const value = (payload || {}) as Record<string, unknown>;
  const items = (value.items || value.data || value.results || (Array.isArray(payload) ? payload : [])) as T[];
  const totalCount = Number(value.totalCount ?? value.total ?? items.length);
  const totalPages = Number(value.totalPages ?? Math.max(1, Math.ceil(totalCount / Math.max(items.length, 1))));
  return { items: Array.isArray(items) ? items : [], totalCount, totalPages };
}