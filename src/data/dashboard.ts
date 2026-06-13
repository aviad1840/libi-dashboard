import { actions, alerts } from "./mock";
import { clients } from "./clients";

// Real Jerusalem pilot numbers (Q2 2025)
export const PILOT = {
  citizens: 286,
  services: 102,
  utilization: 71,
  satisfaction: 4.7,
  preventiveServices: 54,
  independenceDaysGain: 3.5,
  fiscalSavingsB: 2,
};

export const stats = {
  totalClients: PILOT.citizens,
  activeClients: 234,
  atRisk: clients.filter((c) => c.lev.riskFlags.length > 0).length,
  atRiskRequiringIntervention: clients.filter((c) => c.lev.riskFlags.some((f) => f === "loneliness" || f === "functional_decline" || f === "fall_risk")).length,
  bookings: 12,
  bookingsCompleted: 8,
  alertsTotal: alerts.filter((a) => !a.resolved).length,
  alertsUnread: alerts.filter((a) => !a.read).length,
  walletUtilization: PILOT.utilization,
  walletTarget: 85,
  pendingActions: actions.filter((a) => a.status === "pending").length,
};

export const kpis = [
  { id: "k1", label: "ניצול הסל", value: 71, target: 85, trend: "up" as const, delta: "+4%" },
  { id: "k2", label: "שירותי מניעה", value: 54, target: 70, trend: "up" as const, delta: "+12%" },
  { id: "k3", label: "משתמשים לא פעילים", value: 12, target: 8, trend: "down" as const, delta: "-3%", invert: true },
  { id: "k4", label: "פעילויות קבוצתיות", value: 58, target: 70, trend: "up" as const, delta: "+6%" },
  { id: "k5", label: "דירוג ספקים", value: 94, target: 90, trend: "up" as const, delta: "4.7⭐", display: "4.7" },
];

export const sarahChangelog = [
  { date: "היום, 08:12", text: "ציון בדידות עודכן: 5 → 3 (התראה אוטומטית)" },
  { date: "אתמול", text: "לא בוצעה כניסה לאפליקציה כבר 4 ימים" },
  { date: "לפני 3 ימים", text: "המלצת לב: 'חוג שירה בציבור' — בהמתנה" },
  { date: "השבוע", text: "ארנק 32/32 — לא נוצלה יחידה ברבעון" },
];
