/**
 * Lightweight typed localStorage adapter for demo/pilot persistence.
 *
 * This is a stop-gap until a real backend (Supabase or similar) is in
 * place. It exists so single-user demos survive page reloads and the
 * narrative on screen stays consistent during steering-committee
 * walkthroughs.
 *
 * NOT suitable for multi-user pilots — see roadmap.
 */

const NAMESPACE = "libi:v1";

function key(name: string) {
  return `${NAMESPACE}:${name}`;
}

export function loadJSON<T>(name: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key(name));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] failed to load ${name}`, e);
    return fallback;
  }
}

export function saveJSON<T>(name: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch (e) {
    console.warn(`[storage] failed to save ${name}`, e);
  }
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(NAMESPACE)) keys.push(k);
  }
  keys.forEach((k) => window.localStorage.removeItem(k));
}
