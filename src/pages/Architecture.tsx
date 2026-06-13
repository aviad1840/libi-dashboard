import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { clients } from "@/data/clients";
import { PILOT } from "@/data/dashboard";

const AGENTS = [
  { emoji: "🔍", name: "גילוי שירותים", model: "Sonnet 4.6", color: "#3b82f6", desc: `סרק ${PILOT.services} שירותים` },
  { emoji: "🎯", name: "התאמה",         model: "Sonnet 4.6", color: "#8b5cf6", desc: `${PILOT.citizens} ציוני התאמה` },
  { emoji: "💔", name: "ניטור בדידות",  model: "Sonnet 4.6", color: "#e84040", desc: `${clients.filter(c=>c.lev.riskFlags.includes("loneliness")).length} מקרים זוהו` },
  { emoji: "🔔", name: "חיזוק ומעורבות", model: "Haiku 4.5", color: "#f59e0b", desc: "12 הזמנות נשלחו" },
];

const STACK = [
  { layer: "Frontend", color: "#1B3A5C", items: ["React + TypeScript", "Tailwind CSS (RTL)", "framer-motion"] },
  { layer: "AI Layer",  color: "#8b5cf6", items: ["Amazon Bedrock", "Claude Opus 4.8 (Orchestrator)", "Claude Sonnet 4.6 / Haiku 4.5"] },
  { layer: "Backend",   color: "#2d9e6a", items: ["AWS Lambda (serverless)", "Amazon DynamoDB", "Amazon EventBridge"] },
  { layer: "Data",      color: "#f59e0b", items: ["פרופילי מטופלים", "ציוני התאמה (vector)", "לוגים + מטריקות"] },
];

function Arrow() {
  return (
    <div className="flex items-center justify-center my-1">
      <svg width="24" height="24" viewBox="0 0 24 24" className="text-muted-foreground/40">
        <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Architecture() {
  return (
    <AppLayout title="ארכיטקטורה" subtitle="5 סוכני AI על Amazon Bedrock">
      <div className="max-w-5xl space-y-8">

        {/* Super Agent Orchestration */}
        <Card className="border-primary/30 bg-primary-soft/20">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">👑</div>
            <div className="font-bold text-lg text-foreground">סוכן-על (Orchestrator)</div>
            <div className="text-sm text-muted-foreground">Claude Opus 4.8 — מתאם את כל הסוכנים ומציג פעולות למתאמת</div>
          </div>

          {/* Agents row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <div className="rounded-xl border-2 p-3 text-center" style={{ borderColor: a.color + "40", background: a.color + "08" }}>
                  <div className="text-2xl mb-1">{a.emoji}</div>
                  <div className="font-semibold text-sm text-foreground">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.model}</div>
                  <div
                    className="mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: a.color + "15", color: a.color }}
                  >
                    {a.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Flow diagram */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
            {["אזרח", "→", "App", "→", "Lambda", "→", "Bedrock", "→", "DynamoDB", "→", "מתאמת"].map((s, i) => (
              <span
                key={i}
                className={s === "→"
                  ? "text-muted-foreground/50 font-light"
                  : "px-3 py-1.5 rounded-lg bg-card border border-border font-semibold text-foreground text-xs"
                }
              >{s}</span>
            ))}
          </div>
        </Card>

        {/* Tech Stack */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-4">מחסנית טכנולוגית</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STACK.map((s, i) => (
              <motion.div key={s.layer} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full">
                  <div
                    className="w-full h-1.5 rounded-full mb-3"
                    style={{ background: s.color }}
                  />
                  <div className="font-bold text-foreground mb-2 text-sm">{s.layer}</div>
                  <ul className="space-y-1.5">
                    {s.items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Data flow */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-4">זרימת נתונים — מהאזרח להחלטה</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "קלט",
                color: "#3b82f6",
                items: [
                  "פרופיל תפקודי (6 ממדים)",
                  "היסטוריית שירותים",
                  "ציון בדידות + פרסונה",
                  "יתרת ארנק ועולמות תוכן",
                ],
              },
              {
                step: "2",
                title: "עיבוד AI",
                color: "#8b5cf6",
                items: [
                  "Bedrock: embedding פרופיל",
                  "חישוב ציוני התאמה לכל שירות",
                  "זיהוי דפוסי סיכון בזמן אמת",
                  "יצירת נימוק מוסבר (XAI)",
                ],
              },
              {
                step: "3",
                title: "פלט",
                color: "#2d9e6a",
                items: [
                  "המלצות שירות מדורגות",
                  "התראות לפי דחיפות",
                  "פעולות לב למתאמת",
                  "נוף אישי לאזרח",
                ],
              },
            ].map((s) => (
              <Card key={s.step}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ background: s.color }}
                  >
                    {s.step}
                  </div>
                  <div className="font-bold text-foreground">{s.title}</div>
                </div>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full shrink-0 bg-muted-foreground/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Compliance banner */}
        <Card className="border-success/20 bg-success-soft/20">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-2xl">🔐</div>
            <div className="flex-1">
              <div className="font-bold text-foreground">אבטחה ופרטיות</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                AWS IAM roles נפרדים לכל סוכן · הצפנת נתונים אישיים (AES-256) · תאימות לחוק הגנת פרטיות ישראלי
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["AWS IAM", "AES-256", "HTTPS/TLS", "GDPR-like"].map((t) => (
                <span key={t} className="libi-chip bg-success-soft text-success text-xs border border-success/20">{t}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
