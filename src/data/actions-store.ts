import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ActionStatus, CrmAction } from "./types";
import { clients } from "./clients";
import { recommendForAll } from "@/lib/recommendations";
import { loadJSON, saveJSON } from "@/lib/storage";

const STORAGE_KEY = "actions-overrides";

interface ActionOverride {
  status?: ActionStatus;
  note?: string;
  updatedAt: string;
}

type Overrides = Record<string, ActionOverride>;

const generated: CrmAction[] = recommendForAll(clients);

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

function snapshot(): CrmAction[] {
  return generated.map((a) => {
    const o = overrides[a.id];
    return o?.status ? { ...a, status: o.status } : a;
  });
}

let cached: CrmAction[] | null = null;
let cachedKey = "";

function getSnapshot(): CrmAction[] {
  const k = JSON.stringify(overrides);
  if (cached && cachedKey === k) return cached;
  cached = snapshot();
  cachedKey = k;
  return cached;
}

export function setActionStatus(id: string, status: ActionStatus, note?: string) {
  overrides = {
    ...overrides,
    [id]: { status, note, updatedAt: new Date().toISOString() },
  };
  persist();
}

export function resetActions() {
  overrides = {};
  persist();
}

export function useActions() {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const byClient = useCallback(
    (clientId: string) => all.filter((a) => a.clientId === clientId),
    [all],
  );

  const open = useMemo(() => all.filter((a) => a.status !== "completed"), [all]);

  return { all, open, byClient, setStatus: setActionStatus, reset: resetActions };
}
