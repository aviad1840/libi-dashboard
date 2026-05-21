import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { getClient } from "@/data/clients";
import { buildTimeline, predictDeterioration, modelFeatures } from "@/lib/early-warning";
import { Activity, AlertTriangle, ArrowLeft, Brain, TrendingDown } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from "recharts";

const FEATURED_IDS = ["c1", "c2", "c3", "c4", "c5"];

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
};

export default function EarlyWarning() {
  const [selectedId, setSelectedId] = useState("c1");
  const client = getClient(selectedId);
  const featured = useMemo(
    () =>
      FEATURED_IDS.map((id) => getClient(id)).filter((c): c is NonNullable<typeof c> => !!c),
    [],
  );
  const timeline = useMemo(() => (client ? buildTimeline(client, 60) : []), [client]);
  const prediction = useMemo(() => (client ? predictDeterioration(client) : null), [client]);
  const features = useMemo(() => (client ? modelFeatures(client) : []), [client]);

  if (!client || !prediction) {
    return (
      <AppLayout title="Early Warning">
        <Card>בחר/י מטופל מהרשימה.</Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Early Warning · זיהוי הידרדרות מוקדם"
      subtitle="שכבת AI #3 · מבוסס 12-23 פיצ׳רים מ-4 משרדים · מודל סיווג הסתברותי"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Client selector */}
        <Card>
          <CardHeader title="בחירת מטופל לדמו" subtitle="5 מטופלים בולטים מתוך 75 בפיילוט" />
          <div className="flex flex-wrap gap-2">
            {featured.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={
                  selectedId === c.id
                    ? "px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                    : "px-4 h-10 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
                }
                aria-pressed={selectedId === c.id}
              >
                {c.firstName} {c.lastName} · {c.age}
              </button>
            ))}
          </div>
        </Card>

        {/* Prediction headline */}
        <Card className="bg-gradient-to-l from-destructive to-destructive/80 text-destructive-foreground">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <TrendingDown className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider opacity-80">תחזית AI</div>
              <div className="text-2xl md:text-3xl font-bold mt-1">
                סיכון ירידת רמת סיעוד {prediction.fromLevel} → {prediction.toLevel} בעוד {prediction.daysAhead} ימים
              </div>
              <div className="text-sm opacity-90 mt-2">
                מבוסס {features.length} פיצ׳רים מ-4 משרדים · ביטחון מודל {prediction.confidence}%
              </div>
            </div>
            <div className="text-left shrink-0">
              <div className="text-5xl md:text-6xl font-bold tabular-nums">{prediction.confidence}%</div>
              <div className="text-xs opacity-80 mt-1">confidence</div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader
            title="טיים-ליין 60 ימים אחרונים"
            subtitle={`${client.firstName} ${client.lastName} · ציון בדידות · ניצול ארנק · ביקורים`}
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={9} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 10]} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine yAxisId="left" y={3} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: "סף סיכון", fill: "hsl(var(--destructive))", fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="loneliness" name="ציון בדידות (1-10)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="walletUtilization" name="ניצול ארנק (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="visits" name="ביקורים בשבוע" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Features + Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardHeader title="פיצ׳רים מובילים במודל" subtitle="משקלים בולטים · 4 משרדים תורמים נתונים" />
            <div className="space-y-2">
              {features.map((f) => (
                <div key={f.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40">
                  <div className="w-1.5 h-8 rounded-full bg-primary" aria-hidden="true" style={{ opacity: 0.3 + f.weight * 3 }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground">{f.source}</div>
                  </div>
                  <div className="text-sm font-bold text-primary tabular-nums">{(f.weight * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="bg-info-soft/40 border-info/30">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-info shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-bold text-foreground">איך זה עובד</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    מודל סיווג הסתברותי שמתעדכן רבעונית. הפיצ׳רים נשלפים מ-4 משרדים שותפים על נימבוס.
                    שיתוף הדאטה מנוהל ע"י Data & Responsible AI Review.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-warning" aria-hidden="true" />
                <div className="font-bold text-foreground">פעולה מומלצת</div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                פתח/י תוכנית מניעה מותאמת לפרופיל: שילוב התערבות בבדידות + שירותי מניעה.
                <strong className="text-foreground"> אין פעולה אוטומטית</strong> — מלווה מקצועי מאשר.
              </p>
              <Link
                to="/actions"
                className="w-full flex items-center justify-center gap-2 px-3 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors"
              >
                <Activity className="w-4 h-4" aria-hidden="true" /> פתחי תוכנית מניעה
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Card>

            <Card>
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>פרופיל קיים</span>
                  <Chip tone="muted">רמה {client.nursingLevel}</Chip>
                </div>
                <div className="flex justify-between">
                  <span>ציון בדידות</span>
                  <strong className="text-foreground tabular-nums">{client.lev.lonelinessScore}/10</strong>
                </div>
                <div className="flex justify-between">
                  <span>ניידות</span>
                  <strong className="text-foreground tabular-nums">{client.functional.mobility}/5</strong>
                </div>
                <div className="flex justify-between">
                  <span>אחרונה</span>
                  <span className="text-foreground">{client.lastActivity}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
