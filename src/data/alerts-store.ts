import { useCallback, useSyncExternalStore } from "react";
import type { Alert } from "./types";
import { alerts as seedAlerts } from "./mock";
import { loadJSON, saveJSON } from "@/lib/storage";

const STORAGE_KEY = "alerts-overrides";

interface AlertOverride {
  read?: boolean;
  resolved?: boolean;
  updatedAt: string;
}

type Overrides = Record<string, AlertOverride>;

let overrides: Overrides = loadJSON<Overrides>(STORAGE_KEY, {});
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  saveJSON(STORAGE_KEY, overrides);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let cached: Alert[] | null = null;
let cachedKey = "";

function getSnapshot(): Alert[] {
  const k = JSON.stringify(overrides);
  if (cached && cachedKey === k) return cached;
  cached = seedAlerts.map((a) => {
    const o = overrides[a.id];
    if (!o) return a;
    return { ...a, read: o.read ?? a.read, resolved: o.resolved ?? a.resolved };
  });
  cachedKey = k;
  return cached;
}

export function markAlertRead(id: string) {
  overrides = { ...overrides, [id]: { ...overrides[id], read: true, updatedAt: new Date().toISOString() } };
  persist();
}

export function resolveAlert(id: string) {
  overrides = {
    ...overrides,
    [id]: { ...overrides[id], read: true, resolved: true, updatedAt: new Date().toISOString() },
  };
  persist();
}

export function resetAlerts() {
  overrides = {};
  persist();
}

export function useAlerts() {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const open = all.filter((a) => !a.resolved);
  const unread = all.filter((a) => !a.read);
  return {
    all,
    open,
    unread,
    markRead: useCallback(markAlertRead, []),
    resolve: useCallback(resolveAlert, []),
    reset: useCallback(resetAlerts, []),
  };
}
