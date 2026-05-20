import { useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { clients } from "@/data/clients";
import {
  walletUtilizationByLevel,
  personaDistribution,
  lonelinessDistribution,
  riskFlagsSummary,
  bookingsByWorld,
  nursingLevelDistribution,
  ageHistogram,
} from "@/lib/analytics";
import { useActions } from "@/data/actions-store";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Download, FileBarChart2, TrendingUp, Users, AlertTriangle, Sparkles } from "lucide-react";

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
};

function StatBlock({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; hint?: string }) {
  return (
    <div className="libi-stat-card">
      <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-sm text-foreground">{label}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export default function Reports() {
  const { all: actions, open: openActions } = useActions();
  const escalated = actions.filter((a) => a.escalated && a.status !== "completed").length;

  const utilization = useMemo(() => walletUtilizationByLevel(clients), []);
  const personas = useMemo(() => personaDistribution(clients), []);
  const loneliness = useMemo(() => lonelinessDistribution(clients), []);
  const riskFlags = useMemo(() => riskFlagsSummary(clients), []);
  const worlds = useMemo(() => bookingsByWorld(), []);
  const levels = useMemo(() => nursingLevelDistribution(clients), []);
  const ages = useMemo(() => ageHistogram(clients), []);

  const atRisk = clients.filter((c) => c.lev.riskFlags.length > 0).length;
  const avgUtilization = Math.round(
    (clients.reduce((sum, c) => sum + (c.wallet.total - c.wallet.balance), 0) /
      clients.reduce((sum, c) => sum + c.wallet.total, 0)) *
      100,
  );

  return (
    <AppLayout
      title="דוחות וניתוח"
      subtitle={`${clients.length} מטופלים · ${actions.length} פעולות לב · עדכון אחרון: עכשיו`}
      actions={
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> ייצוא PDF
        </button>
      }
    >
      <div className="space-y-6">
        {/* Headline KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBlock icon={Users} label="מטופלים פעילים" value={clients.filter((c) => c.active).length} hint={`מתוך ${clients.length}`} />
          <StatBlock icon={AlertTriangle} label="בסיכון" value={atRisk} hint={`${Math.round((atRisk / clients.length) * 100)}% מהמטופלים`} />
          <StatBlock icon={Sparkles} label="פעולות לב פתוחות" value={openActions.length} hint={escalated > 0 ? `${escalated} בהסלמה` : "—"} />
          <StatBlock icon={TrendingUp} label="ניצול ארנק ממוצע" value={`${avgUtilization}%`} hint="מטרת רבעון: 85%" />
        </section>

        {/* Wallet + Worlds */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="ניצול ארנק לפי רמת סיעוד" subtitle="אחוז יחידות שנוצלו מתוך ההקצאה" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilization} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "ניצול"]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {utilization.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="יחידות שנוצלו לפי עולם תוכן" subtitle="חמשת עולמות התוכן של 'לב'" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={worlds} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    width={140}
                    orientation="right"
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} יח׳`, "יחידות"]} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {worlds.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Persona + Loneliness */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="התפלגות פרסונות" subtitle="פילוח לפי 'פרסונת לב'" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={personas} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={88} paddingAngle={2}>
                    {personas.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} מטופלים`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="התפלגות ציוני בדידות" subtitle="פילוח לפי קבוצות סיכון" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loneliness} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} מטופלים`, ""]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {loneliness.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Risk flags + Age */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="דגלי סיכון פעילים" subtitle="ספירת דגלים בכלל אוכלוסיית המטופלים" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskFlags} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={120} orientation="right" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}`, "מטופלים"]} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {riskFlags.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="התפלגות גילאים" subtitle="מטופלים לפי קבוצת גיל" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ages} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} מטופלים`, ""]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {ages.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Nursing level */}
        <Card>
          <CardHeader title="התפלגות לפי רמת סיעוד" subtitle="ספירת מטופלים בכל רמה" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levels} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} מטופלים`, ""]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {levels.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Download cards (placeholder for backend integration) */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileBarChart2 className="w-4 h-4" aria-hidden="true" /> דוחות זמינים להורדה
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "דוח ניצול הסל הרבעוני", desc: "סקירת ניצול יחידות לפי עולם תוכן ולפי רמת סיעוד.", date: "Q1 2025" },
              { title: "דוח התערבויות מונעות", desc: "כל פעולות לב שהתבצעו והשפעתן על מדדי הבדידות.", date: "אפריל 2025" },
              { title: "דוח שביעות רצון", desc: "ציוני שירות, פידבק ודירוג ספקים.", date: "מרץ 2025" },
            ].map((r) => (
              <Card key={r.title} className="hover:border-primary/30 transition-colors">
                <div className="font-semibold text-foreground">{r.title}</div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" /> הורדה
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
