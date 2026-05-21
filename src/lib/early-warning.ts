import type { Client } from "@/data/types";

export interface TimelinePoint {
  day: number;
  date: string;
  loneliness: number;
  walletUtilization: number;
  visits: number;
}

export interface Prediction {
  daysAhead: number;
  fromLevel: number;
  toLevel: number;
  confidence: number;
}

export interface ModelFeature {
  name: string;
  source: string;
  weight: number;
}

const FEATURES_FOR_CLIENT = (c: Client): ModelFeature[] => [
  { name: "ציון בדידות אחרון", source: "BTL · ביטוח לאומי", weight: 0.18 },
  { name: "ירידה במוביליות", source: "בריאות · קופ\"ח", weight: 0.16 },
  { name: "ניצול ארנק (12 שבועות)", source: "BTL", weight: 0.12 },
  { name: "ימים ללא פעילות", source: "BTL", weight: 0.11 },
  { name: "ביקורי חירום אחרונים", source: "בריאות · אשפוזים", weight: 0.09 },
  { name: "מצב רגשי (PHQ-2)", source: "רווחה", weight: 0.08 },
  { name: "תפקוד קוגניטיבי", source: "בריאות", weight: 0.07 },
  { name: `מצבים רפואיים פעילים (${c.conditions.length})`, source: "בריאות", weight: 0.06 },
  { name: "פרסונת לב", source: "BTL · פיילוט", weight: 0.04 },
  { name: "תמיכה משפחתית", source: "רווחה", weight: 0.04 },
  { name: "עלות שנתית מצטברת", source: "אוצר", weight: 0.03 },
  { name: "גיל", source: "BTL", weight: 0.02 },
];

function pseudoRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function buildTimeline(client: Client, days = 60): TimelinePoint[] {
  const rng = pseudoRandom(client.id.length * 1234 + client.lev.lonelinessScore);
  const declineRate = client.lev.lonelinessScore <= 3 ? 0.06 : 0.025;
  const startLoneliness = Math.min(10, client.lev.lonelinessScore + 4);
  const startUtil = Math.max(20, 80 - client.daysSinceActivity * 1.5);

  const points: TimelinePoint[] = [];
  for (let d = 0; d <= days; d++) {
    const noise = (rng() - 0.5) * 0.6;
    const loneliness = Math.max(1, Math.min(10, startLoneliness - d * declineRate + noise));
    const walletUtilization = Math.max(0, Math.min(100, startUtil - d * 0.55 + noise * 3));
    const baseVisits = Math.max(0, Math.round(3 - d * 0.04 + (rng() - 0.5) * 1.4));
    const today = new Date();
    today.setDate(today.getDate() - (days - d));
    points.push({
      day: d - days,
      date: today.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" }),
      loneliness: Number(loneliness.toFixed(1)),
      walletUtilization: Math.round(walletUtilization),
      visits: baseVisits,
    });
  }
  return points;
}

export function predictDeterioration(client: Client): Prediction {
  const lonelinessRisk = client.lev.lonelinessScore <= 3 ? 0.5 : 0.15;
  const mobilityRisk = client.functional.mobility <= 2 ? 0.3 : 0.05;
  const flagsRisk = client.lev.riskFlags.length * 0.04;
  const base = 0.4 + lonelinessRisk + mobilityRisk + flagsRisk;
  const confidence = Math.round(Math.min(0.95, base) * 100);
  const fromLevel = client.nursingLevel;
  const toLevel = Math.min(3, fromLevel + 1);
  const daysAhead = Math.max(14, Math.round(90 - confidence * 0.55));
  return { daysAhead, fromLevel, toLevel, confidence };
}

export function modelFeatures(client: Client): ModelFeature[] {
  return FEATURES_FOR_CLIENT(client);
}
