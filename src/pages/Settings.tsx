import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Bell, Globe, Lock, UserCog, Zap, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { clients } from "@/data/clients";
import { PILOT } from "@/data/dashboard";

const AGENTS = [
  {
    id: "discovery",
    emoji: "🔍",
    name: "סוכן גילוי שירותים",
    description: "סורק ספקי שירות, מנתח זמינות ומעדכן קטלוג השירותים.",
    status: "active" as const,
    model: "Claude Sonnet 4.6",
    lastRun: "לפני 3 שעות",
    runs24h: 8,
    confidenceThreshold: 85,
    servicesFound: PILOT.services,
  },
  {
    id: "matching",
    emoji: "🎯",
    name: "סוכן התאמת שירותים",
    description: "מחשב ציוני התאמה בין מטופלים לשירותים על בסיס פרופיל לב.",
    status: "active" as const,
    model: "Claude Sonnet 4.6",
    lastRun: "לפני 12 דקות",
    runs24h: 47,
    confidenceThreshold: 80,
    servicesFound: PILOT.citizens,
  },
  {
    id: "loneliness",
    emoji: "💔",
    name: "סוכן ניטור בדידות",
    description: "מנטר ציוני בדידות, מזהה ירידות ומפעיל התראות בזמן אמת.",
    status: "active" as const,
    model: "Claude Sonnet 4.6",
    lastRun: "לפני 42 דקות",
    runs24h: 34,
    confidenceThreshold: 75,
    servicesFound: clients.filter((c) => c.lev.riskFlags.includes("loneliness")).length,
  },
  {
    id: "reinforcement",
    emoji: "🔔",
    name: "סוכן חיזוק ומעורבות",
    description: "שולח הזמנות מותאמות, מעקב מענה ומייצר פעולות חיזוק.",
    status: "active" as const,
    model: "Claude Haiku 4.5",
    lastRun: "לפני שעתיים",
    runs24h: 22,
    confidenceThreshold: 70,
    servicesFound: 12,
  },
  {
    id: "super",
    emoji: "👑",
    name: "סוכן-על (Orchestrator)",
    description: "מתאם את כל 4 הסוכנים, קובע עדיפויות ומציג ל-מתאמת.",
    status: "active" as const,
    model: "Claude Opus 4.8",
    lastRun: "לפני 2 דקות",
    runs24h: 156,
    confidenceThreshold: 90,
    servicesFound: null,
  },
];

const SYSTEM_SECTIONS = [
  { icon: UserCog, title: "פרופיל משתמש", desc: "פרטי המתאמת, חתימה ופרטי קשר." },
  { icon: Bell,    title: "ערוצי התראה",  desc: "ניהול: דוא״ל, SMS ופוש." },
  { icon: Globe,   title: "שפה ואזור",    desc: "שפת ממשק (עברית), אזור זמן ופורמט תאריך." },
  { icon: Lock,    title: "פרטיות ואבטחה", desc: "סיסמה, אימות דו-שלבי וניהול הרשאות." },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors shrink-0",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span className={cn(
        "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-[-1.375rem]" : "translate-x-[-0.25rem]"
      )} />
    </button>
  );
}

function ThresholdSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range" min={50} max={99} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 accent-primary"
      />
      <span className="text-sm font-bold text-foreground w-9 text-left tabular-nums">{value}%</span>
    </div>
  );
}

export default function Settings() {
  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(AGENTS.map((a) => [a.id, true]))
  );
  const [thresholds, setThresholds] = useState<Record<string, number>>(
    Object.fromEntries(AGENTS.map((a) => [a.id, a.confidenceThreshold]))
  );

  const saveAgent = (id: string) => {
    toast.success("הגדרות הסוכן נשמרו בהצלחה");
  };

  return (
    <AppLayout title="הגדרות" subtitle="תצורת סוכני AI ומערכת">
      <div className="max-w-4xl space-y-8">

        {/* AI Agents Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">סוכני AI — Amazon Bedrock</h2>
            <span className="libi-chip bg-success-soft text-success text-xs">5 פעילים</span>
          </div>

          <div className="space-y-3">
            {AGENTS.map((agent) => (
              <Card key={agent.id} className={cn(
                "transition-colors",
                !agentEnabled[agent.id] && "opacity-60"
              )}>
                <div className="flex items-start gap-4">
                  <div className="text-2xl shrink-0 mt-0.5">{agent.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-semibold text-foreground">{agent.name}</span>
                      <span className="libi-chip bg-muted text-muted-foreground text-[11px]">
                        {agent.model}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-success">
                        <CheckCircle2 className="w-3 h-3" /> פעיל
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>

                    <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-foreground">{agent.runs24h}</div>
                        <div className="text-muted-foreground">ריצות/24ש'</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-foreground">
                          <Clock className="w-3 h-3" /> {agent.lastRun}
                        </div>
                        <div className="text-muted-foreground">ריצה אחרונה</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-foreground">
                          {agent.servicesFound !== null ? agent.servicesFound : "—"}
                        </div>
                        <div className="text-muted-foreground">
                          {agent.id === "matching" ? "ציוני התאמה" :
                           agent.id === "loneliness" ? "מקרים זוהו" :
                           agent.id === "reinforcement" ? "הזמנות נשלחו" :
                           agent.id === "super" ? "—" : "שירותים"}
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="text-xs text-muted-foreground mb-1.5">סף ביטחון להפעלת התראה</div>
                      <ThresholdSlider
                        value={thresholds[agent.id]}
                        onChange={(v) => setThresholds((prev) => ({ ...prev, [agent.id]: v }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <Toggle
                      checked={agentEnabled[agent.id]}
                      onChange={(v) => setAgentEnabled((prev) => ({ ...prev, [agent.id]: v }))}
                    />
                    <button
                      onClick={() => saveAgent(agent.id)}
                      className="text-xs px-3 h-8 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                    >
                      שמור
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* System Settings */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3">הגדרות מערכת</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} className="hover:border-primary/30 cursor-pointer transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{s.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
