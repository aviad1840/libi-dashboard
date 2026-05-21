import type { Client, ContentWorld, NursingLevel, Persona, RiskFlag } from "@/data/types";
import { CONTENT_WORLDS, PERSONA_LABELS, RISK_LABELS } from "@/data/constants";
import { services } from "@/data/services";
import { bookings } from "@/data/mock";

export interface ChartDatum {
  name: string;
  value: number;
  color?: string;
}

const HSL = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

const PALETTE = [
  HSL(212, 55, 35),
  HSL(152, 60, 45),
  HSL(38, 90, 55),
  HSL(0, 75, 60),
  HSL(265, 50, 55),
  HSL(190, 65, 45),
];

export function walletUtilizationByLevel(clients: readonly Client[]): ChartDatum[] {
  const buckets: Record<NursingLevel, { used: number; total: number }> = {
    1: { used: 0, total: 0 },
    2: { used: 0, total: 0 },
    3: { used: 0, total: 0 },
  };
  for (const c of clients) {
    buckets[c.nursingLevel].used += c.wallet.total - c.wallet.balance;
    buckets[c.nursingLevel].total += c.wallet.total;
  }
  return ([1, 2, 3] as NursingLevel[]).map((lvl, i) => ({
    name: `רמה ${lvl}`,
    value: buckets[lvl].total === 0 ? 0 : Math.round((buckets[lvl].used / buckets[lvl].total) * 100),
    color: PALETTE[i],
  }));
}

export function personaDistribution(clients: readonly Client[]): ChartDatum[] {
  const counts = new Map<Persona, number>();
  for (const c of clients) counts.set(c.lev.persona, (counts.get(c.lev.persona) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([p, v], i) => ({
      name: PERSONA_LABELS[p].label,
      value: v,
      color: PALETTE[i % PALETTE.length],
    }));
}

export function lonelinessDistribution(clients: readonly Client[]): ChartDatum[] {
  const buckets = [
    { name: "1-3 (סיכון)", min: 1, max: 3, color: HSL(0, 75, 60) },
    { name: "4-6 (זהירות)", min: 4, max: 6, color: HSL(38, 90, 55) },
    { name: "7-10 (תקין)", min: 7, max: 10, color: HSL(152, 60, 45) },
  ];
  return buckets.map((b) => ({
    name: b.name,
    value: clients.filter((c) => c.lev.lonelinessScore >= b.min && c.lev.lonelinessScore <= b.max).length,
    color: b.color,
  }));
}

export function riskFlagsSummary(clients: readonly Client[]): ChartDatum[] {
  const counts = new Map<RiskFlag, number>();
  for (const c of clients) for (const f of c.lev.riskFlags) counts.set(f, (counts.get(f) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([f, v], i) => ({
      name: RISK_LABELS[f].label,
      value: v,
      color: PALETTE[i % PALETTE.length],
    }));
}

export function bookingsByWorld(): ChartDatum[] {
  const counts = new Map<ContentWorld, number>();
  for (const b of bookings) {
    const s = services.find((x) => x.id === b.serviceId);
    if (!s) continue;
    counts.set(s.world, (counts.get(s.world) ?? 0) + b.units);
  }
  return Array.from(counts.entries()).map(([w, v], i) => ({
    name: CONTENT_WORLDS[w].label,
    value: v,
    color: PALETTE[i % PALETTE.length],
  }));
}

export function nursingLevelDistribution(clients: readonly Client[]): ChartDatum[] {
  const counts: Record<NursingLevel, number> = { 1: 0, 2: 0, 3: 0 };
  for (const c of clients) counts[c.nursingLevel]++;
  return ([1, 2, 3] as NursingLevel[]).map((lvl, i) => ({
    name: `רמה ${lvl}`,
    value: counts[lvl],
    color: PALETTE[i],
  }));
}

export function ageHistogram(clients: readonly Client[]): ChartDatum[] {
  const buckets = [
    { name: "65-69", min: 65, max: 69 },
    { name: "70-74", min: 70, max: 74 },
    { name: "75-79", min: 75, max: 79 },
    { name: "80-84", min: 80, max: 84 },
    { name: "85+", min: 85, max: 150 },
  ];
  return buckets.map((b, i) => ({
    name: b.name,
    value: clients.filter((c) => c.age >= b.min && c.age <= b.max).length,
    color: PALETTE[i % PALETTE.length],
  }));
}
