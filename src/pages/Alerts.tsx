import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { clients } from "@/data/clients";
import { PERSONA_LABELS } from "@/data/constants";
import { CheckCircle2, BellOff, ChevronDown, ChevronUp, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RiskFlag, Client } from "@/data/types";

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

type GenAlert = {
  id: string;
  clientId: string;
  clientName: string;
  severity: "critical" | "warning" | "info";
  flag: RiskFlag;
  title: string;
  description: string;
  agent: string;
  agentEmoji: string;
  confidence: number;
  trend: number[];
  trendLabel: string;
  reasoning: string[];
  action: string;
  read: boolean;
  resolved: boolean;
  hoursAgo: number;
};

const FLAG_CONFIG: Record<RiskFlag, { severity: "critical" | "warning" | "info"; agent: string; agentEmoji: string; priority: number }> = {
  loneliness:         { severity: "critical", agent: "סוכן ניטור בדידות",      agentEmoji: "💔", priority: 1 },
  fall_risk:          { severity: "critical", agent: "סוכן ניטור בריאות",      agentEmoji: "🦯", priority: 2 },
  functional_decline: { severity: "critical", agent: "סוכן ניטור תפקוד",       agentEmoji: "⚠️", priority: 3 },
  inactive:           { severity: "warning",  agent: "סוכן חיזוק ומעורבות",    agentEmoji: "🔄", priority: 4 },
  expiring_balance:   { severity: "warning",  agent: "סוכן ניהול ארנק",        agentEmoji: "⏳", priority: 5 },
  low_balance:        { severity: "info",     agent: "סוכן ניהול ארנק",        agentEmoji: "📉", priority: 6 },
};

function buildTitle(flag: RiskFlag, c: Client): string {
  const name = `${c.firstName} ${c.lastName}`;
  const inactive_days = Math.max(14, c.daysSinceActivity);
  switch (flag) {
    case "loneliness":         return `ירידה בציון בדידות — ${name} (${c.lev.lonelinessScore}/10)`;
    case "fall_risk":          return `סיכון נפילה גבוה — ${name}`;
    case "functional_decline": return `ירידה תפקודית זוהתה — ${name}`;
    case "inactive":           return `לא פעיל/ה ${inactive_days} ימים — ${name}`;
    case "expiring_balance":   return `ארנק פג בקרוב — ${name} (${c.wallet.balance} יח')`;
    case "low_balance":        return `יתרה נמוכה — ${name} (${c.wallet.balance}/${c.wallet.total} יח')`;
  }
}

function buildDesc(flag: RiskFlag, c: Client): string {
  switch (flag) {
    case "loneliness":         return `ציון בדידות ${c.lev.lonelinessScore}/10. פעילות אחרונה: ${c.lastActivity}.`;
    case "fall_risk":          return `ניידות ${c.functional.mobility}/5 — מתחת לסף הבטיחות. גיל ${c.age}.`;
    case "functional_decline": return `ירידה בפרמטרים תפקודיים. דורש הערכה מחדש.`;
    case "inactive":           return `אין הזמנות פעילות. פעילות אחרונה: ${c.lastActivity}. ארנק: ${c.wallet.balance}/${c.wallet.total}.`;
    case "expiring_balance":   return `${c.wallet.balance} יחידות לא מנוצלות. סיכון: יתרה תפוג ללא שימוש.`;
    case "low_balance":        return `${c.wallet.balance} מתוך ${c.wallet.total} יחידות נותרו. מעקב שגרתי מומלץ.`;
  }
}

function buildReasoning(flag: RiskFlag, c: Client): string[] {
  const persona = PERSONA_LABELS[c.lev.persona];
  const pct = Math.round((c.wallet.balance / c.wallet.total) * 100);
  switch (flag) {
    case "loneliness":
      return [
        `📊 ניתוח 14 יום: ציון בדידות ירד מ-${Math.min(10, c.lev.lonelinessScore + 2)} ל-${c.lev.lonelinessScore}`,
        `🏠 פעילות אחרונה מחוץ לבית: ${c.lastActivity}`,
        `👤 פרסונה "${persona.label}" — ציפייה לקשר חברתי גבוה יותר`,
        `💡 המלצה: שירות שייכות ומשמעות — התאמה גבוהה לפרופיל`,
      ];
    case "fall_risk":
      return [
        `🦵 ציון ניידות: ${c.functional.mobility}/5 — מתחת לסף 3`,
        `👴 גיל ${c.age} — גורם סיכון נוסף לנפילות`,
        `🏠 עיר מגורים: ${c.city} — מומלץ הערכת נגישות ביתית`,
        `💡 המלצה: עזרים לניידות + פיזיותרפיה ביתית דחופה`,
      ];
    case "functional_decline":
      return [
        `📉 ניידות: ${c.functional.mobility}/5 · קוגניציה: ${c.functional.cognition}/5`,
        `😊 מצב רגשי: ${c.functional.emotional}/5 · חברתי: ${c.functional.social}/5`,
        `⏰ מועד הערכה אחרון: לפני 30+ ימים — יש לעדכן`,
        `💡 המלצה: הערכה תפקודית מעודכנת + תכנית שיקום`,
      ];
    case "inactive":
      return [
        `📅 ימים ללא פעילות: ${Math.max(14, c.daysSinceActivity)}`,
        `📞 ניסיונות קשר שנכשלו: ${Math.floor(Math.random() * 2) + 1}`,
        `💰 ארנק זמין: ${c.wallet.balance}/${c.wallet.total} יחידות`,
        `💡 המלצה: ביקור בית אישי + שיחה עם בני משפחה`,
      ];
    case "expiring_balance":
      return [
        `⏳ יתרה: ${c.wallet.balance} יחידות — סיכון פקיעה גבוה`,
        `📊 קצב ניצול נוכחי: 0 יחידות/שבוע`,
        `🗓️ מועד פקיעה משוער: עוד 11-14 ימים`,
        `💡 המלצה: שיחה דחופה + הצעת 2-3 שירותים מותאמים`,
      ];
    case "low_balance":
      return [
        `💰 ${c.wallet.balance} מתוך ${c.wallet.total} יח' נותרו (${pct}%)`,
        `📈 קצב ניצול: תקין יחסית עד כה`,
        `✅ אין סיכון מיידי — מעקב שגרתי`,
        `💡 המלצה: תכנון ניצול יחידות לחודש הבא`,
      ];
  }
}

function buildAction(flag: RiskFlag): string {
  switch (flag) {
    case "loneliness":         return "הצעת שירות שייכות ומשמעות";
    case "fall_risk":          return "הפניה לפיזיותרפיה ביתית";
    case "functional_decline": return "תאמי הערכה תפקודית";
    case "inactive":           return "ביקור בית דחוף";
    case "expiring_balance":   return "שיחת אאוטריץ' + תכנון ניצול";
    case "low_balance":        return "מעקב חודשי";
  }
}

function buildTrend(flag: RiskFlag, c: Client, rng: () => number): { values: number[]; label: string } {
  if (flag === "loneliness") {
    const end = c.lev.lonelinessScore;
    const start = Math.min(10, end + 2 + Math.floor(rng() * 2));
    const values = Array.from({ length: 6 }, (_, i) => {
      const t = i / 5;
      return Math.max(1, Math.min(10, Math.round(start + (end - start) * t + (rng() - 0.5) * 0.8)));
    });
    return { values, label: "ציון בדידות" };
  }
  if (flag === "inactive") {
    const values = Array.from({ length: 6 }, (_, i) =>
      Math.max(0, Math.min(100, Math.round(80 - i * 12 + (rng() - 0.5) * 10)))
    );
    return { values, label: "רמת פעילות %" };
  }
  const pct = Math.round((c.wallet.balance / c.wallet.total) * 100);
  const values = Array.from({ length: 6 }, (_, i) =>
    Math.max(0, Math.min(100, Math.round(Math.min(100, pct + (5 - i) * 4 + (rng() - 0.5) * 5))))
  );
  return { values, label: "% ניצול ארנק" };
}

function generateAlerts(): GenAlert[] {
  const generated: GenAlert[] = [];
  let counter = 0;
  const orderedFlags: RiskFlag[] = ["loneliness", "fall_risk", "functional_decline", "inactive", "expiring_balance", "low_balance"];
  const limits: Record<RiskFlag, number> = {
    loneliness: 8, fall_risk: 4, functional_decline: 4, inactive: 6, expiring_balance: 4, low_balance: 3,
  };

  for (const flag of orderedFlags) {
    const matching = clients.filter((c) => c.lev.riskFlags.includes(flag)).slice(0, limits[flag]);
    for (const c of matching) {
      if (generated.length >= 22) break;
      counter++;
      const rng = seeded(parseInt(c.id.slice(1) || "1") * 17 + counter * 3);
      const { values, label } = buildTrend(flag, c, rng);
      generated.push({
        id: `gen_${counter}`,
        clientId: c.id,
        clientName: `${c.firstName} ${c.lastName}`,
        severity: FLAG_CONFIG[flag].severity,
        flag,
        title: buildTitle(flag, c),
        description: buildDesc(flag, c),
        agent: FLAG_CONFIG[flag].agent,
        agentEmoji: FLAG_CONFIG[flag].agentEmoji,
        confidence: Math.floor(rng() * 14 + 83),
        trend: values,
        trendLabel: label,
        reasoning: buildReasoning(flag, c),
        action: buildAction(flag),
        read: rng() > 0.55,
        resolved: false,
        hoursAgo: Math.floor(rng() * 23 + 1),
      });
    }
  }

  return generated.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    const sev = { critical: 0, warning: 1, info: 2 };
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
    return a.hoursAgo - b.hoursAgo;
  });
}

function Sparkline({ values, severity }: { values: number[]; severity: "critical" | "warning" | "info" }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const w = 72, h = 26, pad = 3;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const color = severity === "critical" ? "#e84040" : severity === "warning" ? "#f59e0b" : "#3b82f6";
  const [lx, ly] = pts.split(" ").pop()!.split(",");
  return (
    <svg width={w} height={h} className="shrink-0 opacity-80">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

const SEV_LABEL = { critical: "קריטי", warning: "אזהרה", info: "מידע" };
const SEV_TONE = {
  critical: "bg-destructive-soft text-destructive border-destructive/20",
  warning:  "bg-warning-soft text-warning-foreground border-warning/20",
  info:     "bg-info-soft text-info border-info/20",
};
const SEV_BORDER = { critical: "border-r-destructive", warning: "border-r-warning", info: "border-r-info" };

type FilterTab = "all" | "critical" | "warning" | "info";

export default function Alerts() {
  const base = useMemo(() => generateAlerts(), []);
  const [items, setItems] = useState<GenAlert[]>(base);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const open     = items.filter((a) => !a.resolved);
  const resolved = items.filter((a) => a.resolved);
  const unread   = open.filter((a) => !a.read).length;
  const counts   = { critical: 0, warning: 0, info: 0 } as Record<string, number>;
  open.forEach((a) => counts[a.severity]++);

  const filtered = filter === "all" ? open : open.filter((a) => a.severity === filter);

  const resolve = (id: string) => {
    setItems((arr) => arr.map((a) => (a.id === id ? { ...a, resolved: true, read: true } : a)));
    toast.success("ההתראה נסגרה");
  };
  const markRead = (id: string) => setItems((arr) => arr.map((a) => (a.id === id ? { ...a, read: true } : a)));
  const toggle   = (id: string) => {
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const TABS: { id: FilterTab; label: string; count: number }[] = [
    { id: "all",      label: "הכל",    count: open.length        },
    { id: "critical", label: "קריטי",  count: counts.critical    },
    { id: "warning",  label: "אזהרה",  count: counts.warning     },
    { id: "info",     label: "מידע",   count: counts.info        },
  ];

  return (
    <AppLayout title="התראות" subtitle={`${open.length} פתוחות · ${unread} חדשות`}>
      <div className="max-w-4xl space-y-5">

        {/* Loneliness Agent Header */}
        <Card className="border-primary/20 bg-primary-soft/30">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl shrink-0">
              🧠
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground">סוכני ניטור AI — Amazon Bedrock</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                סרקו {clients.length} מטופלים · זיהו {open.length} התראות · ממוצע ביטחון: 91%
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {(["critical", "warning", "info"] as const).map((s) => (
                <div key={s} className={cn(
                  "px-3 py-1.5 rounded-lg text-center border",
                  s === "critical" ? "bg-destructive/10 border-destructive/20" :
                  s === "warning"  ? "bg-warning/10 border-warning/20" :
                                     "bg-info/10 border-info/20"
                )}>
                  <div className={cn(
                    "text-lg font-bold",
                    s === "critical" ? "text-destructive" : s === "warning" ? "text-warning-foreground" : "text-info"
                  )}>{counts[s]}</div>
                  <div className="text-[10px] font-medium text-muted-foreground">{SEV_LABEL[s]}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                "px-4 h-9 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                filter === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span className={cn(
                "min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center",
                filter === t.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card className="text-center py-10 text-muted-foreground text-sm">אין התראות בקטגוריה זו 🎉</Card>
          )}
          <AnimatePresence>
            {filtered.map((a, i) => {
              const exp = expanded.has(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.035, duration: 0.22 }}
                >
                  <Card
                    className={cn("border-r-4 transition-colors", SEV_BORDER[a.severity])}
                    padded={false}
                  >
                    {/* Main row */}
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer"
                      onClick={() => { markRead(a.id); toggle(a.id); }}
                    >
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full mt-2 shrink-0",
                        !a.read ? "bg-primary animate-pulse-soft" : "bg-border"
                      )} />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className={cn("libi-chip border text-[11px] font-semibold", SEV_TONE[a.severity])}>
                            {SEV_LABEL[a.severity]}
                          </span>
                          <span className="libi-chip bg-muted text-muted-foreground text-[11px]">
                            {a.agentEmoji} {a.agent}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {a.hoursAgo === 1 ? "לפני שעה" : `לפני ${a.hoursAgo} שעות`}
                          </span>
                        </div>
                        <div className="font-semibold text-foreground text-sm leading-snug">{a.title}</div>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Brain className="w-3 h-3" />
                            ביטחון: <strong className="text-foreground ml-0.5">{a.confidence}%</strong>
                          </span>
                          <Sparkline values={a.trend} severity={a.severity} />
                          <span className="text-[10px] text-muted-foreground">{a.trendLabel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); resolve(a.id); }}
                          className="flex items-center gap-1 px-2.5 h-8 rounded-lg bg-success text-success-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> סגור
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                          onClick={(e) => { e.stopPropagation(); markRead(a.id); toggle(a.id); }}
                        >
                          {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded reasoning */}
                    <AnimatePresence>
                      {exp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-2 mb-3">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="text-xs font-semibold text-primary">ניתוח הסוכן — Amazon Bedrock</span>
                            </div>
                            <div className="space-y-2 mb-3">
                              {a.reasoning.map((r, j) => (
                                <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                    {j + 1}
                                  </span>
                                  <span>{r}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="px-3 py-2 rounded-lg bg-primary-soft text-primary text-xs font-semibold">
                                ✅ פעולה מומלצת: {a.action}
                              </div>
                              <Link
                                to={`/clients/${a.clientId}`}
                                className="text-xs text-info hover:underline shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                פרופיל מלא ←
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Resolved */}
        {resolved.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <BellOff className="w-4 h-4" /> נסגרו ({resolved.length})
            </h2>
            <div className="space-y-2 opacity-60">
              {resolved.map((a) => (
                <Card key={a.id} className="flex items-center gap-3 py-3">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span className="text-sm text-muted-foreground line-through truncate">{a.title}</span>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
