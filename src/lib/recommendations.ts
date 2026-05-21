import type { Client, CrmAction, ActionPriority, ActionType, RiskFlag } from "@/data/types";

/**
 * Heuristic recommendation engine.
 *
 * Given a client snapshot, produce a prioritised list of CRM actions for
 * the coordinator. Rules are intentionally explicit and inspectable so
 * the product team can iterate on policy without changing infrastructure.
 *
 * Priority bands and thresholds reflect product policy:
 *  - high:   72h SLA  (urgent intervention)
 *  - medium: 168h SLA (1 week)
 *  - low:    336h SLA (2 weeks)
 */

interface ActionTemplate {
  type: ActionType;
  typeLabel: string;
  priority: ActionPriority;
  title: (c: Client) => string;
  description: (c: Client) => string;
  suggestion: (c: Client) => string;
  services: readonly string[];
  applies: (c: Client) => boolean;
  hoursOpen: (c: Client) => number;
}

const TEMPLATES: ActionTemplate[] = [
  {
    type: "loneliness_intervention",
    typeLabel: "התערבות בבדידות",
    priority: "high",
    applies: (c) =>
      c.lev.lonelinessScore <= 3 || c.lev.riskFlags.includes("loneliness"),
    title: (c) => `${c.firstName} בציון בדידות נמוך (${c.lev.lonelinessScore}/10)`,
    description: (c) =>
      `ציון בדידות ${c.lev.lonelinessScore}/10 — סף התערבות. פרסונה: ${c.lev.persona}. אחרון פעיל ${c.lastActivity}.`,
    suggestion: (c) =>
      c.lev.persona === "social_active"
        ? "מומלץ חוג שירה בציבור או מועדון שכונתי — מתאים לפרסונה החברתית."
        : "מומלץ מתנדב לשיחה שבועית — פתח עדין בלי להציף.",
    services: ["s4", "s1", "s3"],
    hoursOpen: (c) => Math.min(96, c.daysSinceActivity * 6),
  },
  {
    type: "expiring_balance",
    priority: "high",
    typeLabel: "יתרה פגה",
    applies: (c) => c.lev.riskFlags.includes("expiring_balance"),
    title: (c) => `יתרת ${c.firstName} ${c.lastName} תפוג בקרוב`,
    description: (c) =>
      `${c.wallet.balance} מתוך ${c.wallet.total} יחידות לא נוצלו. ללא פעולה — היתרה תחזור לקופה הציבורית.`,
    suggestion: () => "הציעי חבילת ניצול מהיר: ניקיון יסודי + שעון חירום או שירותי בית קצרים.",
    services: ["s13", "s15", "s17"],
    hoursOpen: () => 48,
  },
  {
    type: "functional_decline",
    priority: "high",
    typeLabel: "ירידה תפקודית",
    applies: (c) =>
      c.lev.riskFlags.includes("functional_decline") ||
      c.lev.riskFlags.includes("fall_risk") ||
      c.functional.mobility <= 2,
    title: (c) => `ירידה תפקודית — ${c.firstName} ${c.lastName}`,
    description: (c) =>
      `מוביליות ${c.functional.mobility}/5, סיכון נפילה. נדרשת התערבות פיזיותרפית והתאמת סביבה.`,
    suggestion: () => "פיזיותרפיה ביתית + מקל הליכה חכם עם חיישן נפילה.",
    services: ["s5", "s14"],
    hoursOpen: () => 36,
  },
  {
    type: "wallet_optimization",
    priority: "medium",
    typeLabel: "אופטימיזציית ארנק",
    applies: (c) => c.wallet.total > 0 && c.wallet.balance / c.wallet.total >= 0.85,
    title: (c) => `ארנק ${c.firstName} — ${c.wallet.balance}/${c.wallet.total} ללא שימוש`,
    description: (c) =>
      `נוצלו רק ${c.wallet.total - c.wallet.balance} יחידות. מומלץ לבנות תכנית ניצול שבועית של 4–6 יחידות.`,
    suggestion: (c) =>
      `התאמה לפרסונה: התחל מ"${c.lev.meaningTags[0] ?? "פעילות משמעותית"}" וצרף שירות מסבסוד 100%.`,
    services: ["s2", "s4", "s6"],
    hoursOpen: (c) => 24 + c.daysSinceActivity * 4,
  },
  {
    type: "reactivation",
    priority: "medium",
    typeLabel: "החזרה לפעילות",
    applies: (c) => c.daysSinceActivity >= 14 && !c.active,
    title: (c) => `${c.firstName} ${c.lastName} לא פעיל ${c.daysSinceActivity} ימים`,
    description: (c) =>
      `אחרון פעיל: ${c.lastActivity}. אין הזמנות חדשות, מומלץ ביקור בית או שיחת משפחה.`,
    suggestion: () => "ביקור בית קצר + שיחה עם איש קשר המשפחה לוודא שלום הקשיש.",
    services: ["s3", "s5"],
    hoursOpen: (c) => Math.min(200, c.daysSinceActivity * 8),
  },
  {
    type: "family_engagement",
    priority: "low",
    typeLabel: "מעורבות משפחה",
    applies: (c) =>
      c.lev.persona === "tradition_keeper" || c.lev.persona === "caregiver_dependent",
    title: (c) => `חיזוק קשר משפחתי — ${c.firstName} ${c.lastName}`,
    description: () => "פרסונה מעדיפה ליווי משפחתי. עדכון תקופתי משפר אמון ושמירת רצף טיפול.",
    suggestion: () => "שלחי דוח חודשי קצר לאיש הקשר וקבעי שיחה רבעונית.",
    services: ["s2"],
    hoursOpen: () => 120,
  },
];

const SLA_HOURS: Record<ActionPriority, number> = { high: 72, medium: 168, low: 336 };

const STORYLINE_OVERRIDE: Record<string, Partial<CrmAction>> = {
  // Sarah Cohen — flagship pilot demo
  "auto-c1-loneliness_intervention": {
    title: "שרה לא יצאה מהבית כבר 4 ימים",
    description:
      "ציון בדידות ירד ל-3/10, ארנק 32/32 לא בשימוש. פרסונה: חברתית-אקטיבית.",
    suggestion:
      "הציעי לשרה את חוג שירה בציבור — מתחבר לאהבת המוזיקה הישראלית שלה ופותח חברויות.",
    hoursOpen: 18,
  },
};

export function recommendForClient(client: Client): CrmAction[] {
  return TEMPLATES.filter((t) => t.applies(client)).map((t) => {
    const id = `auto-${client.id}-${t.type}`;
    const override = STORYLINE_OVERRIDE[id] ?? {};
    return {
      id,
      clientId: client.id,
      type: t.type,
      typeLabel: t.typeLabel,
      priority: t.priority,
      title: t.title(client),
      description: t.description(client),
      suggestion: t.suggestion(client),
      suggestedServiceIds: [...t.services],
      status: "pending" as const,
      createdAt: new Date().toISOString().slice(0, 10),
      hoursOpen: t.hoursOpen(client),
      escalated: t.hoursOpen(client) > SLA_HOURS[t.priority],
      ...override,
    };
  });
}

export function recommendForAll(clients: readonly Client[]): CrmAction[] {
  const PRIORITY_RANK: Record<ActionPriority, number> = { high: 0, medium: 1, low: 2 };
  return clients
    .flatMap(recommendForClient)
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.hoursOpen - a.hoursOpen);
}

export function summarizeRecommendations(actions: readonly CrmAction[]) {
  const byPriority: Record<ActionPriority, number> = { high: 0, medium: 0, low: 0 };
  const byType = new Map<ActionType, number>();
  let escalated = 0;
  for (const a of actions) {
    byPriority[a.priority]++;
    byType.set(a.type, (byType.get(a.type) ?? 0) + 1);
    if (a.escalated) escalated++;
  }
  return { byPriority, byType, escalated, total: actions.length };
}

export function riskFlagWeight(flag: RiskFlag): number {
  switch (flag) {
    case "fall_risk":
    case "functional_decline":
      return 3;
    case "loneliness":
    case "expiring_balance":
      return 2;
    case "low_balance":
    case "inactive":
      return 1;
  }
}
