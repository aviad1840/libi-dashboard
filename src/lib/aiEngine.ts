import { clients } from "@/data/clients";
import { actions } from "@/data/mock";
import { RISK_LABELS, PERSONA_LABELS, CONTENT_WORLDS } from "@/data/constants";
import { stats, PILOT } from "@/data/dashboard";

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const QUICK_PROMPTS = [
  { label: "מה מצב שרה?", icon: "👤" },
  { label: "מי בסיכון?", icon: "⚠️" },
  { label: "כמה לא מנצלים את הארנק?", icon: "💰" },
  { label: "מה הסוכנים עושים עכשיו?", icon: "🤖" },
];

function bold(text: string) { return `**${text}**`; }

export function generateAiResponse(query: string): string {
  const q = query.trim().toLowerCase();

  // Sarah specifically
  const sarahMatch = q.includes("שרה") || q.includes("cohen") || q.includes("c1");
  if (sarahMatch) {
    const s = clients[0];
    const riskStr = s.lev.riskFlags.map(f => RISK_LABELS[f as keyof typeof RISK_LABELS].icon + " " + RISK_LABELS[f as keyof typeof RISK_LABELS].label).join(", ");
    return [
      `👤 ${bold("שרה כהן")} | ${s.age} שנים | ${s.city} | רמה סיעוד ${s.nursingLevel}`,
      "",
      `📊 ${bold("סטטוס נוכחי:")}`,
      `• בדידות: ${bold(s.lev.lonelinessScore + "/10")} ${s.lev.lonelinessScore <= 3 ? "🔴 קריטי — ירידה מ-5 ב-14 יום" : ""}`,
      `• ארנק: ${bold(s.wallet.balance + "/" + s.wallet.total + " יח׳")} — לא נוצלה אף יחידה ברבעון`,
      `• פעילות: ${s.lastActivity}`,
      `• דגלים: ${riskStr || "—"}`,
      "",
      `🎭 ${bold("פרופיל לב:")} ${PERSONA_LABELS[s.lev.persona].emoji} ${PERSONA_LABELS[s.lev.persona].label}`,
      `💭 חלום: "${s.lev.dream}"`,
      "",
      `💡 ${bold("המלצת הסוכן:")}`,
      `חוג שירה בציבור — ${bold("94% התאמה")}`,
      `טיפ: ${s.lev.engagementTips[0]}`,
    ].join("\n");
  }

  // At-risk clients
  if (q.includes("סיכון") || q.includes("בסיכון") || q.includes("דחוף") || q.includes("מסוכן")) {
    const atRisk = clients
      .filter(c => c.lev.riskFlags.length > 0)
      .sort((a, b) => a.lev.lonelinessScore - b.lev.lonelinessScore)
      .slice(0, 5);
    const lines = atRisk.map((c, i) => {
      const top = c.lev.riskFlags[0] ? RISK_LABELS[c.lev.riskFlags[0] as keyof typeof RISK_LABELS] : null;
      return `${i + 1}. ${bold(c.firstName + " " + c.lastName)} | ${c.age} | ${c.city}\n   ${top ? top.icon + " " + top.label : ""} · בדידות ${c.lev.lonelinessScore}/10 · ארנק ${c.wallet.balance}/${c.wallet.total}`;
    });
    return [
      `⚠️ ${bold("5 מטופלים בסיכון גבוה ביותר")} (מסה״כ ${clients.filter(c => c.lev.riskFlags.length > 0).length}):`,
      "",
      ...lines,
      "",
      `💡 הסוכן זיהה ${actions.filter(a => a.priority === "high").length} פעולות דחופות שמחכות לאישורך.`,
    ].join("\n");
  }

  // Agents
  if (q.includes("סוכנ") || q.includes("ai") || q.includes("agent") || q.includes("בדרוק") || q.includes("bedrock")) {
    return [
      `🤖 ${bold("5 סוכני לב — סטטוס Live:")}`,
      "",
      `🔍 ${bold("סוכן גילוי שירותים")}`,
      `   ${PILOT.services} שירותים פעילים · סרק 23 ספקים הבוקר · מצא 3 חדשים`,
      "",
      `🎯 ${bold("סוכן התאמה")}`,
      `   ${PILOT.citizens} ציוני התאמה עודכנו · ממוצע ${bold("94%")} · זמן חישוב: 1.2 שנ'`,
      "",
      `⚠️ ${bold("סוכן ניטור בדידות")} — ${bold("דחוף!")}`,
      `   שרה כהן לא הגיעה ${bold("4 ימים")} → פעולה דחופה נוצרה`,
      "",
      `🔔 ${bold("סוכן חיזוק ומעורבות")}`,
      `   שלח 12 הזמנות לחוגים · תגובה חיובית: 67% · ${bold("8 תגובות")}`,
      "",
      `👑 ${bold("סוכן-על")}`,
      `   מתאם את כל 4 הסוכנים · ${stats.pendingActions} פעולות ממתינות לאישורך`,
    ].join("\n");
  }

  // Wallet
  if (q.includes("ארנק") || q.includes("יתרה") || q.includes("לא מנוצל") || q.includes("ניצול")) {
    const unused = clients.filter(c => c.wallet.balance / c.wallet.total > 0.8);
    const critical = clients.filter(c => c.lev.riskFlags.includes("expiring_balance"));
    const top3 = unused.slice(0, 3).map((c, i) =>
      `${i + 1}. ${bold(c.firstName + " " + c.lastName)} — ${c.wallet.balance}/${c.wallet.total} יח׳ (${c.city})`
    );
    return [
      `💰 ${bold("ניצול ארנק — פיילוט ירושלים:")}`,
      "",
      `• ניצול ממוצע: ${bold(PILOT.utilization + "%")} ↑ מ-48% בנובמבר`,
      `• ${bold(unused.length)} מטופלים עם ארנק מעל 80% לא מנוצל`,
      `• ${bold(critical.length)} מטופלים עם יתרה קרובה לפקיעה`,
      "",
      `📋 ${bold("3 הדחופים ביותר:")}`,
      ...top3,
      "",
      `💡 ${bold("המלצה:")} שיחת אאוטריץ' שבועית + הצעת תכנית ניצול מוגדרת.`,
      `אסטרטגיה: 4-6 יחידות/שבוע, מתחילים עם שירותי "שייכות ומשמעות" (100% סבסוד).`,
    ].join("\n");
  }

  // Statistics
  if (q.includes("סטטיסטיק") || q.includes("כמה") || q.includes("נתונים") || q.includes("פיילוט")) {
    return [
      `📊 ${bold("נתוני פיילוט ירושלים — Q2 2025:")}`,
      "",
      `👥 אזרחים: ${bold(PILOT.citizens.toString())} (${stats.activeClients} פעילים)`,
      `📈 ניצול סל: ${bold(PILOT.utilization + "%")} ↑ מ-48% בנוב׳`,
      `⭐ שביעות רצון: ${bold(PILOT.satisfaction + "/5")}`,
      `🛍️ שירותים: ${bold(PILOT.services.toString())} (vs. 4 בסל הישן)`,
      `🛡️ שירותי מניעה: ${bold(PILOT.preventiveServices + "%")} מסך השירותים`,
      `🏃 עצמאות: ${bold("+" + PILOT.independenceDaysGain + " ימים")} לאזרח בממוצע`,
      `💵 חיסכון פיסקלי: ${bold("₪" + PILOT.fiscalSavingsB + "B")} צפוי/שנה בהרחבה לאומית`,
      "",
      `🔢 ב-2027: ${bold("220,000")} אזרחים · השקעה שנתית ${bold("₪20B")}`,
    ].join("\n");
  }

  // What can you do / help
  if (q.includes("עזור") || q.includes("מה") || q.includes("אפשר") || q.includes("יכול")) {
    return [
      `👋 ${bold("שלום! אני עוזר לב, מופעל על Amazon Bedrock.")}`,
      "",
      `אני יכולה לעזור לך עם:`,
      `• 👤 מידע על מטופל ספציפי (נסי: "מה מצב שרה?")`,
      `• ⚠️ זיהוי מטופלים בסיכון ("מי בסיכון עכשיו?")`,
      `• 💰 ניתוח ארנקים ("כמה לא מנצלים את הארנק?")`,
      `• 🤖 סטטוס סוכני AI ("מה הסוכנים עושים?")`,
      `• 📊 נתוני פיילוט ("הצגי לי סטטיסטיקות")`,
      "",
      `פשוט שאלי בעברית חופשית!`,
    ].join("\n");
  }

  // Default
  const atRiskCount = clients.filter(c => c.lev.riskFlags.length > 0).length;
  return [
    `📋 ${bold("סיכום יום — " + new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }))}`,
    "",
    `• ${bold(stats.pendingActions + " פעולות לב")} ממתינות לאישורך`,
    `• ${bold(stats.alertsUnread + " התראות")} חדשות שלא נקראו`,
    `• ${bold(atRiskCount + " מטופלים")} עם לפחות דגל סיכון אחד`,
    `• ניצול סל: ${bold(PILOT.utilization + "%")} (יעד: 85%)`,
    "",
    `💡 ${bold("דחוף:")} שרה כהן — ציון בדידות 3/10, לא הגיעה 4 ימים.`,
    ``,
    `נסי: "מה מצב שרה?", "מי בסיכון?", "מה הסוכנים עושים?"`,
  ].join("\n");
}
