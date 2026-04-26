import type { CrmAction, Alert, Booking, ScheduleItem } from "./types";
import { clients } from "./clients";

export const schedule: ScheduleItem[] = [
  { id: "sc1", time: "08:30", type: "assessment", title: "בקשת מענה דחוף — שרה כהן", note: "ירידה בציון בדידות, יש לפתוח שיחה אישית הבוקר.", urgent: true },
  { id: "sc2", time: "09:30", type: "visit", title: "ביקור בית — יוסף לוי", note: "הערכה תפקודית עדכנית, רמת ג'." },
  { id: "sc3", time: "11:00", type: "call", title: "שיחת היכרות — רחל מזרחי", note: "התחלת תהליך אונבורדינג ארנק שירותים." },
  { id: "sc4", time: "12:15", type: "vendor", title: "תיאום עם 'מתנ\"ס רמת גן'", note: "פתיחת שני מקומות בחוג שירה לבנות 75+." },
  { id: "sc5", time: "13:30", type: "plan", title: "בניית תכנית התערבות — דוד פרץ", note: "ירידה תפקודית, חיבור לפיזיותרפיה ביתית." },
  { id: "sc6", time: "14:30", type: "family", title: "שיחה עם בן של מרים גבאי", note: "עדכון על תוקף יתרת הארנק לחודש הבא." },
  { id: "sc7", time: "15:30", type: "report", title: "סגירת דוח שבועי לרשות", note: "סטטוס 5 מטופלים בסיכון, סיכום פעולות לב." },
];

export const actions: CrmAction[] = [
  {
    id: "a1",
    clientId: "c1",
    type: "loneliness_intervention",
    typeLabel: "התערבות בבדידות",
    priority: "high",
    title: "שרה לא יצאה מהבית כבר 4 ימים",
    description: "ציון בדידות ירד ל-3/10, ארנק 32/32 לא בשימוש. פרסונה: חברתית-אקטיבית.",
    suggestion: "הציעי לשרה את חוג שירה בציבור — מתחבר לאהבת המוזיקה הישראלית שלה ופותח חברויות.",
    suggestedServiceIds: ["s4", "s1", "s3"],
    status: "pending",
    createdAt: "2025-04-25",
    hoursOpen: 18,
    escalated: false,
  },
  {
    id: "a2",
    clientId: "c1",
    type: "wallet_optimization",
    typeLabel: "אופטימיזציית ארנק",
    priority: "high",
    title: "ארנק שרה — 32/32 ללא שימוש",
    description: "מתחילת הרבעון לא נוצלה אף יחידה. הסיכון: יתרה תפוג ב-3 חודשים.",
    suggestion: "בנו תכנית ניצול שבועית של 4-6 יחידות עם דגש על תוכן 'שייכות ומשמעות'.",
    suggestedServiceIds: ["s2", "s4", "s6"],
    status: "pending",
    createdAt: "2025-04-24",
    hoursOpen: 42,
    escalated: false,
  },
  {
    id: "a3",
    clientId: "c3",
    type: "expiring_balance",
    typeLabel: "יתרה פגה",
    priority: "high",
    title: "יתרת מרים גבאי תפוג בעוד 11 ימים",
    description: "12 יחידות לא מנוצלות. בלי פעולה — ירדו לקופה הציבורית.",
    suggestion: "הציעי שעון חירום + ניקיון בית — שילוב מותאם לפרופיל הביתי שלה.",
    suggestedServiceIds: ["s13", "s15"],
    status: "in_progress",
    createdAt: "2025-04-22",
    hoursOpen: 70,
    escalated: false,
  },
  {
    id: "a4",
    clientId: "c4",
    type: "functional_decline",
    typeLabel: "ירידה תפקודית",
    priority: "medium",
    title: "ירידה במוביליות — דוד פרץ",
    description: "הערכה אחרונה הראתה ירידה מ-4 ל-3 בניידות. סיכון נפילה גבוה.",
    suggestion: "התחילו פיזיותרפיה ביתית והוסיפו מקל הליכה חכם.",
    suggestedServiceIds: ["s5", "s14"],
    status: "pending",
    createdAt: "2025-04-23",
    hoursOpen: 56,
    escalated: false,
  },
  {
    id: "a5",
    clientId: "c5",
    type: "reactivation",
    typeLabel: "החזרה לפעילות",
    priority: "medium",
    title: "יוסף לוי לא פעיל 18 יום",
    description: "אין הזמנות, לא מגיב לשיחות. ארנק 24/32.",
    suggestion: "ביקור בית אישי + שיחה עם בני המשפחה.",
    suggestedServiceIds: ["s3", "s5"],
    status: "pending",
    createdAt: "2025-04-21",
    hoursOpen: 96,
    escalated: true,
  },
  {
    id: "a6",
    clientId: "c6",
    type: "family_engagement",
    typeLabel: "מעורבות משפחה",
    priority: "low",
    title: "חיזוק קשר עם משפחת רחל מזרחי",
    description: "הבת ביקשה לקבל עדכון חודשי על מצב האם.",
    suggestion: "שלחי דוח חודשי קצר + קבעי שיחה רבעונית.",
    suggestedServiceIds: ["s2"],
    status: "pending",
    createdAt: "2025-04-20",
    hoursOpen: 120,
    escalated: false,
  },
  {
    id: "a7",
    clientId: "c7",
    type: "loneliness_intervention",
    typeLabel: "התערבות בבדידות",
    priority: "low",
    title: "מעקב חודשי — אסתר ביטון",
    description: "הצטרפה לחוג בחודש שעבר, לוודא המשכיות.",
    suggestion: "שיחת מעקב קצרה + עידוד להמשיך.",
    suggestedServiceIds: ["s1"],
    status: "completed",
    createdAt: "2025-04-15",
    hoursOpen: 240,
    escalated: false,
  },
];

export const alerts: Alert[] = [
  { id: "al1", clientId: "c1", severity: "critical", title: "ציון בדידות ירד — שרה כהן", description: "מ-5 ל-3 בשבועיים האחרונים. נדרשת התערבות.", read: false, resolved: false, createdAt: "היום, 07:42" },
  { id: "al2", clientId: "c5", severity: "warning", title: "מטופל לא פעיל 18 יום — יוסף לוי", description: "אין הזמנות או שיחות, סף הסלמה מתקרב.", read: false, resolved: false, createdAt: "היום, 06:15" },
  { id: "al3", clientId: "c3", severity: "warning", title: "יתרת ארנק תפוג בעוד 11 ימים — מרים גבאי", description: "12 יחידות לא מנוצלות. מומלץ לפתוח שירותים השבוע.", read: false, resolved: false, createdAt: "אתמול, 16:30" },
  { id: "al4", clientId: "c10", severity: "info", title: "הערכה שנתית מתקרבת — אהרן רוזן", description: "תאריך הערכה: 14.05.25. נא לתאם.", read: true, resolved: false, createdAt: "אתמול, 09:00" },
  { id: "al5", clientId: "c4", severity: "critical", title: "סיכון נפילה גבוה — דוד פרץ", description: "ירידה תפקודית במוביליות, הומלץ על מקל חכם.", read: true, resolved: false, createdAt: "לפני יומיים" },
];

export const bookings: Booking[] = [
  { id: "b1", clientId: "c1", serviceId: "s1", date: "2025-04-28", time: "10:00", status: "scheduled", units: 4 },
  { id: "b2", clientId: "c1", serviceId: "s5", date: "2025-04-15", time: "14:00", status: "completed", units: 5 },
  { id: "b3", clientId: "c2", serviceId: "s15", date: "2025-04-26", time: "09:00", status: "completed", units: 3 },
  { id: "b4", clientId: "c3", serviceId: "s13", date: "2025-04-29", time: "11:30", status: "scheduled", units: 6 },
  { id: "b5", clientId: "c4", serviceId: "s5", date: "2025-04-27", time: "13:00", status: "in_progress", units: 5 },
  { id: "b6", clientId: "c5", serviceId: "s3", date: "2025-04-20", time: "16:00", status: "cancelled", units: 2 },
  { id: "b7", clientId: "c6", serviceId: "s4", date: "2025-04-30", time: "17:00", status: "scheduled", units: 3 },
  { id: "b8", clientId: "c7", serviceId: "s1", date: "2025-04-22", time: "10:00", status: "completed", units: 4 },
  { id: "b9", clientId: "c8", serviceId: "s17", date: "2025-04-26", time: "08:00", status: "completed", units: 2 },
  { id: "b10", clientId: "c9", serviceId: "s6", date: "2025-05-02", time: "15:00", status: "scheduled", units: 4 },
  { id: "b11", clientId: "c10", serviceId: "s12", date: "2025-04-18", time: "11:00", status: "completed", units: 12 },
  { id: "b12", clientId: "c11", serviceId: "s8", date: "2025-04-29", time: "12:00", status: "scheduled", units: 5 },
];

// Pre-compute attention table
export const attentionRows = [
  { clientId: "c1", reason: "בדידות", tone: "bg-destructive-soft text-destructive" },
  { clientId: "c5", reason: "לא פעיל 18 יום", tone: "bg-warning-soft text-warning-foreground" },
  { clientId: "c2", reason: "יתרה נמוכה", tone: "bg-warning-soft text-warning-foreground" },
  { clientId: "c4", reason: "ירידה תפקודית", tone: "bg-destructive-soft text-destructive" },
  { clientId: "c3", reason: "יתרה פגה בקרוב", tone: "bg-warning-soft text-warning-foreground" },
].map((r) => ({ ...r, client: clients.find((c) => c.id === r.clientId)! }));

// Override mock client names for attention rows for narrative consistency
const overrideName = (id: string, first: string, last: string) => {
  const c = clients.find((c) => c.id === id);
  if (c) {
    c.firstName = first;
    c.lastName = last;
  }
};
overrideName("c2", "רחל", "מזרחי");
overrideName("c3", "מרים", "גבאי");
overrideName("c4", "דוד", "פרץ");
overrideName("c5", "יוסף", "לוי");
