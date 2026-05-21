/**
 * Static reference data for the inter-ministerial prototype (national view).
 *
 * Sourced from the קול קורא ‎3.0 document — Israel National Digital
 * Headquarters + AI HQ joint call, published 06.05.2026.
 */

export interface Ministry {
  id: string;
  name: string;
  role: string;
  data: string;
  status: "lead" | "partner" | "ecosystem" | "data_only";
  statusLabel: string;
}

export const MINISTRIES: Ministry[] = [
  {
    id: "btl",
    name: "ביטוח לאומי",
    role: "תשתית נימבוס, מודל זכאות, ניהול פיילוט",
    data: "נתוני זכאות, תביעות, רמות סיעוד",
    status: "lead",
    statusLabel: "מוביל",
  },
  {
    id: "welfare",
    name: "משרד הרווחה",
    role: "מודל ליווי בשטח, מלוות, פרוטוקול טיפול",
    data: "נתוני רווחה, מיפוי צרכים, שירותים קהילתיים",
    status: "partner",
    statusLabel: "שותף",
  },
  {
    id: "health",
    name: "משרד הבריאות",
    role: "פרופיל תפקודי, מדדי בריאות, מניעה",
    data: "נתוני בריאות, אשפוזים, תפקוד",
    status: "partner",
    statusLabel: "שותף",
  },
  {
    id: "treasury",
    name: "משרד האוצר",
    role: "מסגרת תקציבית, מדידת ROI, מודל מימון",
    data: "נתוני עלות, תקצוב, ניתוח כלכלי",
    status: "partner",
    statusLabel: "שותף",
  },
];

export const ECOSYSTEM: Ministry[] = [
  {
    id: "jerusalem",
    name: "עיריית ירושלים",
    role: "רשות מקומית מיישמת, תשתית קהילתית",
    data: "מתנ\"סים, ספקי שטח, מפעיל פיילוט פסגת זאב",
    status: "ecosystem",
    statusLabel: "מפעיל שטח",
  },
  {
    id: "hmo",
    name: "קופות החולים",
    role: "ממשק קליני, שירותי מניעה",
    data: "כללית, מכבי, מאוחדת, לאומית — שותפות נתונים בלבד",
    status: "data_only",
    statusLabel: "נתונים בלבד",
  },
  {
    id: "joint",
    name: "ג'וינט-אשל",
    role: "ידע מקצועי בהזדקנות, מודלים קהילתיים",
    data: "מחקר, ידע יישומי",
    status: "ecosystem",
    statusLabel: "ידע מקצועי",
  },
  {
    id: "ey",
    name: "EY",
    role: "מחקר מלווה, מדידת אימפקט, ניתוח כלכלי",
    data: "מחקר שטח, מתודולוגיית מדידה",
    status: "ecosystem",
    statusLabel: "מדידה",
  },
];

export interface AILayer {
  id: string;
  number: number;
  name: string;
  role: string;
  rationale: string;
  status: "active" | "developing" | "planned";
  statusLabel: string;
}

export const AI_LAYERS: AILayer[] = [
  {
    id: "nlp_ocr",
    number: 1,
    name: "NLP + OCR על תיקי תביעה",
    role: "פרופיל תפקודי אוטומטי — בסיס לקביעת זכאות",
    rationale: "240,000 תיקים, 1.7 מיליון מסמכים — לא ניתן ידנית",
    status: "active",
    statusLabel: "MVP פעיל",
  },
  {
    id: "matching",
    number: 2,
    name: "Matching Engine",
    role: "התאמת סל + מלווה + ספקים לפרופיל האישי",
    rationale: "שוק ספקים דינמי, אלפי פרופילים שונים",
    status: "developing",
    statusLabel: "בפיתוח מתקדם",
  },
  {
    id: "early_warning",
    number: 3,
    name: "Early Warning",
    role: "זיהוי סיכון הידרדרות לפני המשבר",
    rationale: "מעקב רציף אחרי אלפי לקוחות — בלתי אפשרי ידנית",
    status: "developing",
    statusLabel: "בפיתוח",
  },
  {
    id: "outcomes",
    number: 4,
    name: "Outcome Monitoring",
    role: "מה עובד, מה לא — התאמת הסל לאורך זמן",
    rationale: "Feedback loop שמשפר את כל המערכת",
    status: "planned",
    statusLabel: "מתוכנן",
  },
  {
    id: "policy",
    number: 5,
    name: "Policy Intelligence",
    role: "תמיכת החלטות רכש ותכנון לאומי",
    rationale: "ערך שלא ניתן לייצר ידנית בכל היקף",
    status: "planned",
    statusLabel: "מתוכנן",
  },
];

export interface Milestone {
  date: string;
  title: string;
  status: "done" | "current" | "future";
}

export const ROADMAP: Milestone[] = [
  { date: "מאי 2026", title: "פרסום קול קורא 3.0", status: "done" },
  { date: "יוני 2026", title: "אישור עקרוני מהשותפים + פגישת גיבוש", status: "current" },
  { date: "יולי 2026", title: "הגשה לקול קורא (דדליין 30/07)", status: "future" },
  { date: "ספטמבר 2026", title: "אישור ועדת היגוי + פרסום זוכים", status: "future" },
  { date: "דצמבר 2026", title: "אישור תקציבי + kick-off רשמי", status: "future" },
  { date: "יוני 2027", title: "MVP פעיל ב-5 פיילוטים + מנוע AI ראשוני חי", status: "future" },
  { date: "דצמבר 2027", title: "הרחבה לאומית + Policy Intelligence Layer", status: "future" },
];

export interface NationalKpi {
  label: string;
  target: string;
  measure: string;
}

export const NATIONAL_KPIS: NationalKpi[] = [
  {
    label: "מניעת הידרדרות",
    target: "דחייה של 3 חודשים ברמת סיעוד",
    measure: "מדידה רבעונית מול קבוצת ביקורת (KPI מוכח בפיילוט)",
  },
  {
    label: "חיסכון למשק",
    target: "מעל 2 מיליארד ₪/שנה",
    measure: "240,000 × ₪12-18K × 20% דחיית הידרדרות",
  },
  {
    label: "ניצול סל שירותים",
    target: "+85% מהסל המוקצה",
    measure: "יחידות שנוצלו / שהוקצו",
  },
  {
    label: "שירותי מניעה",
    target: "+60% מכלל ההזמנות",
    measure: "הזמנות מניעה / סה\"כ הזמנות",
  },
  {
    label: "קיצור זמן קביעת זכאות",
    target: "50% קיצור",
    measure: "OCR אוטומטי מול ועדה ידנית",
  },
  {
    label: "אוכלוסייה מושפעת",
    target: "6,204 → 240,000 ארצי",
    measure: "זכאים פעילים בתכנית",
  },
];

export interface ScalabilityRow {
  domain: string;
  basket: string;
  objective: string;
}

export const SCALABILITY: ScalabilityRow[] = [
  {
    domain: "סיעוד (עכשיו)",
    basket: "סל הזדקנות מיטבית — מניעת הידרדרות",
    objective: "KPI: דחיית הידרדרות, חיסכון +2 מיליארד ₪",
  },
  {
    domain: "נכות ואיבה",
    basket: "סל שיקום אישי מותאם",
    objective: "חזרה לעצמאות, מניעת תלות",
  },
  {
    domain: "אבטלה-תעסוקה",
    basket: "סל תעסוקה מותאם לפרופיל",
    objective: "חזרה לשוק העבודה",
  },
  {
    domain: "ילדים בסיכון",
    basket: "סל התפתחות והתערבות מוקדמת",
    objective: "מניעה ותוצאות ארוכות טווח",
  },
];

export interface PilotSite {
  id: string;
  name: string;
  city: string;
  status: "active" | "planned";
  participants?: number;
  targetGroup?: number;
}

export const PILOTS: PilotSite[] = [
  { id: "pisgat", name: "פסגת זאב", city: "ירושלים", status: "active", participants: 286, targetGroup: 1692 },
  { id: "ramat-gan", name: "רמת גן", city: "רמת גן", status: "planned" },
  { id: "haifa", name: "חיפה", city: "חיפה", status: "planned" },
  { id: "beersheva", name: "באר שבע", city: "באר שבע", status: "planned" },
  { id: "petach", name: "פתח תקווה", city: "פתח תקווה", status: "planned" },
];

export const PROPOSAL_BUDGET = {
  total: 10,
  awardShare: 6,
  matchingShare: 4,
  items: [
    { label: "תשתית AI + נימבוס", award: 3, matching: 0 },
    { label: "פיתוח שכבות AI", award: 2, matching: 1 },
    { label: "הטמעה ב-5 פיילוטים", award: 1, matching: 2 },
    { label: "מדידה + Policy layer", award: 0, matching: 1 },
  ],
};

export const DEFAULT_ROI = {
  eligiblePopulation: 240_000,
  costPerYearPerPerson: 15_000,
  defaultDeteriorationDelay: 20,
};
