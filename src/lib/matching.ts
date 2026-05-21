import type { Client, Service, Persona, ContentWorld } from "@/data/types";
import { services } from "@/data/services";

export interface ScoredService {
  service: Service;
  score: number;
  reasons: string[];
}

export interface ScoredCompanion {
  id: string;
  name: string;
  score: number;
  reasons: string[];
  experience: number;
  speciality: string;
}

/**
 * Explainable matching engine.
 *
 * Given a client, score every service in the catalog using a weighted
 * combination of:
 *  - persona affinity for the content world
 *  - wallet headroom + subsidy level
 *  - functional profile fit
 *  - whether the service addresses an active risk flag
 *
 * Every score is paired with a human-readable rationale so the UI can
 * surface "why".
 */

const PERSONA_WORLD_AFFINITY: Record<Persona, Partial<Record<ContentWorld, number>>> = {
  social_active: { belonging_meaning: 0.4, health_function: 0.15, resilience: 0.1 },
  homebody: { home_services: 0.35, health_function: 0.2, assistive_tech: 0.15 },
  tech_curious: { assistive_tech: 0.4, resilience: 0.15 },
  tradition_keeper: { belonging_meaning: 0.3, home_services: 0.2 },
  caregiver_dependent: { health_function: 0.35, home_services: 0.25 },
};

function affinityReason(persona: Persona, world: ContentWorld): string | null {
  const score = PERSONA_WORLD_AFFINITY[persona]?.[world];
  if (!score || score < 0.15) return null;
  const labels: Record<ContentWorld, string> = {
    belonging_meaning: "שייכות ומשמעות",
    health_function: "בריאות ותפקוד",
    resilience: "חוסן",
    assistive_tech: "טכנולוגיה מסייעת",
    home_services: "שירותי בית",
  };
  return `התאמת פרסונה גבוהה ל"${labels[world]}"`;
}

function scoreService(client: Client, service: Service): ScoredService {
  let score = 50;
  const reasons: string[] = [];

  const affinity = PERSONA_WORLD_AFFINITY[client.lev.persona]?.[service.world] ?? 0;
  score += affinity * 100;
  const affReason = affinityReason(client.lev.persona, service.world);
  if (affReason) reasons.push(affReason);

  if (service.subsidy === 100) {
    score += 12;
    reasons.push("סבסוד מלא — אין עומס תקציבי");
  } else if (service.subsidy >= 50) {
    score += 5;
  }

  const headroom = client.wallet.balance - service.units;
  if (headroom >= 0) {
    score += 8;
  } else {
    score -= 20;
    reasons.push("⚠ אין יתרת ארנק מספקת");
  }

  if (service.world === "belonging_meaning" && client.lev.lonelinessScore <= 4) {
    score += 18;
    reasons.push(`מטפל ישירות בבדידות (ציון ${client.lev.lonelinessScore}/10)`);
  }
  if (service.world === "health_function" && client.functional.mobility <= 3) {
    score += 12;
    reasons.push(`תומך בשיפור ניידות (${client.functional.mobility}/5)`);
  }
  if (service.world === "assistive_tech" && (client.functional.hearing <= 3 || client.functional.vision <= 3)) {
    score += 10;
    reasons.push("מתאים למצב חושי נוכחי");
  }
  if (service.world === "home_services" && client.lev.persona === "homebody") {
    score += 8;
  }

  for (const tag of client.lev.meaningTags) {
    if (service.description.includes(tag) || service.name.includes(tag)) {
      score += 6;
      reasons.push(`מתחבר לתג משמעות "${tag}"`);
      break;
    }
  }

  if (client.lev.riskFlags.includes("expiring_balance") && service.units <= client.wallet.balance) {
    score += 8;
    reasons.push("מנצל יתרה שעלולה לפוג");
  }
  if (client.lev.riskFlags.includes("fall_risk") && /נפילה|הליכה|פיזיו/.test(service.name + service.description)) {
    score += 12;
    reasons.push("מענה לסיכון נפילה פעיל");
  }

  if (reasons.length === 0) reasons.push("התאמה כללית לפרופיל");

  return { service, score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

export function rankServices(client: Client, limit = 3): ScoredService[] {
  return services
    .map((s) => scoreService(client, s))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const COMPANIONS: Omit<ScoredCompanion, "score" | "reasons">[] = [
  { id: "m1", name: "מירב כהן", experience: 8, speciality: "ליווי קהילתי דתי" },
  { id: "m2", name: "גלית פרץ", experience: 5, speciality: "ליווי חברתי קהילתי" },
  { id: "m3", name: "תמר בן-עמי", experience: 12, speciality: "פיזיותרפיה ושיקום" },
  { id: "m4", name: "אורית לוי", experience: 3, speciality: "טכנולוגיה מסייעת" },
  { id: "m5", name: "נעמה אזולאי", experience: 7, speciality: "תמיכה רגשית ובדידות" },
];

export function rankCompanions(client: Client, limit = 2): ScoredCompanion[] {
  return COMPANIONS.map((c) => {
    let score = 60 + Math.min(15, c.experience * 1.5);
    const reasons: string[] = [`${c.experience} שנות ניסיון`];

    if (client.lev.lonelinessScore <= 4 && c.speciality.includes("רגשית")) {
      score += 18;
      reasons.push("מתמחה בליווי לבדידות וצרכים רגשיים");
    }
    if (client.lev.persona === "tradition_keeper" && c.speciality.includes("דתי")) {
      score += 15;
      reasons.push("רקע תרבותי מתאים לפרסונה");
    }
    if (client.lev.persona === "social_active" && c.speciality.includes("חברתי")) {
      score += 14;
      reasons.push("התאמה לפרסונה חברתית-אקטיבית");
    }
    if (client.functional.mobility <= 3 && c.speciality.includes("שיקום")) {
      score += 16;
      reasons.push("מתמחה בליווי שיקומי לניידות מוגבלת");
    }
    if (client.lev.persona === "tech_curious" && c.speciality.includes("טכנולוגיה")) {
      score += 15;
      reasons.push("התאמה לפרסונה סקרנית-טכנולוגית");
    }

    return { ...c, score: Math.min(100, Math.round(score)), reasons };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
