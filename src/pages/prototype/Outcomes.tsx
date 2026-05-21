import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { RoadmapBadge } from "@/components/prototype/RoadmapBadge";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Workflow, TrendingUp, TrendingDown, RefreshCcw, Lightbulb } from "lucide-react";

const BEFORE = [
  { month: "ינואר", loneliness: 6.2, mobility: 4.0, satisfaction: 5.5 },
  { month: "פברואר", loneliness: 5.8, mobility: 3.9, satisfaction: 5.4 },
  { month: "מרץ", loneliness: 5.4, mobility: 3.7, satisfaction: 5.0 },
  { month: "אפריל", loneliness: 4.9, mobility: 3.6, satisfaction: 4.8 },
  { month: "מאי", loneliness: 4.3, mobility: 3.3, satisfaction: 4.4 },
  { month: "יוני", loneliness: 3.8, mobility: 3.0, satisfaction: 4.0 },
];

const AFTER = [
  { month: "ינואר", loneliness: 4.0, mobility: 3.1, satisfaction: 4.5 },
  { month: "פברואר", loneliness: 4.6, mobility: 3.3, satisfaction: 5.2 },
  { month: "מרץ", loneliness: 5.4, mobility: 3.4, satisfaction: 6.1 },
  { month: "אפריל", loneliness: 6.2, mobility: 3.7, satisfaction: 6.8 },
  { month: "מאי", loneliness: 6.9, mobility: 3.8, satisfaction: 7.3 },
  { month: "יוני", loneliness: 7.3, mobility: 4.0, satisfaction: 7.6 },
];

const INSIGHTS = [
  { icon: TrendingUp, title: "חוג שירה פעל ב-78% מהפרסונה החברתית-אקטיבית", tone: "success" as const },
  { icon: TrendingDown, title: "שירות s12 (מכשיר שמיעה) — אפקטיביות נמוכה לפרסונת homebody", tone: "destructive" as const },
  { icon: Lightbulb, title: "שילוב פיזיותרפיה + מתנדב = שיפור 23% בציון רגשי", tone: "info" as const },
  { icon: RefreshCcw, title: "Matching Engine עודכן: משקל פרסונה עלה ל-18%", tone: "warning" as const },
];

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
};

function MiniChart({ data, title }: { data: typeof BEFORE; title: string }) {
  return (
    <div className="h-56">
      <div className="text-sm font-semibold text-foreground mb-2">{title}</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="loneliness" name="בדידות" stroke="hsl(var(--destructive))" strokeWidth={2} />
          <Line type="monotone" dataKey="mobility" name="ניידות" stroke="hsl(var(--primary))" strokeWidth={2} />
          <Line type="monotone" dataKey="satisfaction" name="שביעות רצון" stroke="hsl(var(--success))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Outcomes() {
  return (
    <AppLayout
      title="Outcome Monitoring · ניטור תוצאות ולמידה"
      subtitle="שכבת AI #4 · Feedback loop שמשפר את המנוע לאורך זמן"
    >
      <div className="space-y-6 max-w-7xl">
        <RoadmapBadge
          milestone="מתוכנן · שלב 2 של MVP (סוף 2027)"
          description="מודל הלמידה ינתח כל פעולה ותוצאה, יזהה דפוסי הצלחה וכישלון, ויעדכן אוטומטית את משקלי ה-Matching Engine."
        />

        {/* Before / After */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-destructive-soft/30 border-destructive/20">
            <MiniChart data={BEFORE} title="לפני התערבות (קבוצת ביקורת)" />
            <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
              <TrendingDown className="w-4 h-4" aria-hidden="true" /> כל המדדים יורדים — הידרדרות טבעית
            </div>
          </Card>
          <Card className="bg-success-soft/30 border-success/20">
            <MiniChart data={AFTER} title="אחרי התערבות (קבוצת טיפול)" />
            <div className="mt-3 flex items-center gap-2 text-xs text-success">
              <TrendingUp className="w-4 h-4" aria-hidden="true" /> שיפור מובהק בכל המדדים תוך 6 חודשים
            </div>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader title="אינסייטים אוטומטיים" subtitle="המודל לומד מאלפי פעולות ומחזיר מסקנות לוועדה" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INSIGHTS.map((ins) => {
              const Icon = ins.icon;
              return (
                <div key={ins.title} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  <Icon className={"w-5 h-5 shrink-0 mt-0.5 text-" + ins.tone} aria-hidden="true" />
                  <div className="text-sm text-foreground leading-relaxed">{ins.title}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Feedback loop */}
        <Card className="bg-info-soft/30 border-info/30">
          <CardHeader title="לולאת המשוב" subtitle="כל פעולה משפרת את המערכת" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {[
              { label: "פעולה", desc: "מתאמת ממליצה שירות" },
              { label: "תוצאה", desc: "נמדדת אוטומטית" },
              { label: "למידה", desc: "המודל מעדכן משקלים" },
              { label: "Policy", desc: "מוצג לוועדת היגוי" },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <div className="bg-card border border-border rounded-xl p-3">
                  <div className="text-[10px] text-muted-foreground">שלב {i + 1}</div>
                  <div className="font-bold text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Chip tone="info"><Workflow className="w-3.5 h-3.5" aria-hidden="true" /> חוזר על עצמו בכל אינטראקציה</Chip>
          </div>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
