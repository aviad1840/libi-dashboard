import { useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { clients } from "@/data/clients";
import { actions, bookings } from "@/data/mock";
import { services } from "@/data/services";
import { CONTENT_WORLDS, RISK_LABELS } from "@/data/constants";
import { PILOT } from "@/data/dashboard";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Star, Layers } from "lucide-react";

const C = {
  primary: "#1B3A5C",
  info: "#3b82f6",
  success: "#2d9e6a",
  warning: "#f59e0b",
  destructive: "#e84040",
  purple: "#8b5cf6",
};

const PIE_COLORS = [C.destructive, C.warning, C.info, C.purple, C.success, C.primary];

function HebTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm min-w-[140px]">
      {label && <div className="font-semibold text-foreground mb-1.5 border-b border-border pb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color ?? p.fill }} />
            <span className="text-muted-foreground text-xs">{p.name}</span>
          </div>
          <span className="font-bold text-foreground tabular-nums">{p.value}{p.unit ?? ""}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const monthlyTrend = [
    { month: "נוב׳", ניצול: 48, בדידות: 6.1 },
    { month: "דצמ׳", ניצול: 54, בדידות: 5.8 },
    { month: "ינו׳", ניצול: 59, בדידות: 5.5 },
    { month: "פבר׳", ניצול: 63, בדידות: 5.2 },
    { month: "מרץ", ניצול: 67, בדידות: 4.9 },
    { month: "אפר׳", ניצול: 71, בדידות: 4.7 },
  ];

  const worldData = useMemo(() => {
    return Object.entries(CONTENT_WORLDS).map(([key, w]) => {
      const ws = services.filter((s) => s.world === key);
      const wb = bookings.filter((b) => ws.some((s) => s.id === b.serviceId));
      const done = wb.filter((b) => b.status === "completed").length;
      return {
        name: w.emoji + " " + w.label.split(" ")[0],
        ניצול: wb.length > 0 ? Math.round((done / wb.length) * 100) : Math.floor(30 + Math.random() * 50),
        הזמנות: wb.length || Math.floor(3 + Math.random() * 12),
      };
    });
  }, []);

  const riskData = useMemo(() => {
    const counts: Record<string, number> = {};
    clients.forEach((c) => c.lev.riskFlags.forEach((f) => { counts[f] = (counts[f] || 0) + 1; }));
    return Object.entries(counts)
      .map(([key, value]) => ({ name: RISK_LABELS[key as any].label, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const actionStatusData = [
    { name: "ממתין", value: actions.filter((a) => a.status === "pending").length, fill: C.warning },
    { name: "בתהליך", value: actions.filter((a) => a.status === "in_progress").length, fill: C.info },
    { name: "הושלם", value: actions.filter((a) => a.status === "completed").length, fill: C.success },
  ];

  const pilotCards = [
    { label: "אזרחים בפיילוט", value: PILOT.citizens.toString(), icon: Users, color: C.primary, sub: "ירושלים, 2025" },
    { label: "ניצול סל אישי", value: `${PILOT.utilization}%`, icon: TrendingUp, color: C.success, sub: "עלייה מ-48% בנוב׳" },
    { label: "שביעות רצון", value: `${PILOT.satisfaction}/5`, icon: Star, color: C.warning, sub: "ממוצע מטופלים" },
    { label: "שירותים פעילים", value: PILOT.services.toString(), icon: Layers, color: C.info, sub: "vs. 4 שירותים בסל ישן" },
  ];

  return (
    <AppLayout title="דוחות ואנליטיקה" subtitle={`פיילוט ירושלים · Q1-Q2 2025 · ${PILOT.citizens} אזרחים`}>
      {/* Pilot KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {pilotCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: s.color + "18", color: s.color }}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">{s.value}</div>
              <div className="text-sm text-foreground mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line: utilization + loneliness trend */}
        <Card>
          <CardHeader title="מגמת ניצול סל ובדידות" subtitle="6 חודשים · פיילוט ירושלים" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend} margin={{ top: 5, right: 16, left: -24, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip content={<HebTooltip />} />
              <Line type="monotone" dataKey="ניצול" stroke={C.primary} strokeWidth={2.5} dot={{ r: 4, fill: C.primary }} unit="%" />
              <Line type="monotone" dataKey="בדידות" stroke={C.destructive} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: C.destructive }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> ניצול סל %</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-destructive inline-block rounded border-dashed" style={{borderTop: '2px dashed #e84040', background: 'none'}} /> ממוצע בדידות</span>
          </div>
        </Card>

        {/* Bar: world utilization */}
        <Card>
          <CardHeader title="ניצול לפי עולם תוכן" subtitle="% ניצול + כמות הזמנות" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={worldData} margin={{ top: 5, right: 16, left: -24, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip content={<HebTooltip />} />
              <Bar dataKey="ניצול" fill={C.primary} radius={[4, 4, 0, 0]} unit="%" />
              <Bar dataKey="הזמנות" fill={C.info} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie: risk flags */}
        <Card>
          <CardHeader title="פירוט דגלי סיכון" subtitle={`${clients.filter((c) => c.lev.riskFlags.length > 0).length} מטופלים עם לפחות דגל אחד`} />
          <div className="flex items-center gap-2">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={riskData} dataKey="value" cx="50%" cy="50%" outerRadius={78} innerRadius={38} paddingAngle={3}>
                  {riskData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<HebTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5 pr-2">
              {riskData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-foreground text-xs">{d.name}</span>
                  </div>
                  <span className="font-bold text-foreground tabular-nums text-sm">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bar: action status */}
        <Card>
          <CardHeader title="סטטוס פעולות לב" subtitle={`${actions.length} פעולות סה״כ`} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={actionStatusData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: "#374151" }} width={52} />
              <Tooltip content={<HebTooltip />} />
              <Bar dataKey="value" name="כמות" radius={[0, 4, 4, 0]}>
                {actionStatusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-success-soft/50 border border-success/20 rounded-lg text-xs text-success">
            💡 {PILOT.preventiveServices}% מהשירותים בפיילוט הם שירותי מניעה — פי 2 מהמטרה
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
