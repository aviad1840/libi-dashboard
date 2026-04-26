import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { Avatar } from "@/components/common/Avatar";
import { ProgressBar } from "@/components/common/ProgressBar";
import { stats, kpis, sarahChangelog } from "@/data/dashboard";
import { schedule, actions, alerts, attentionRows } from "@/data/mock";
import { getClient } from "@/data/clients";
import { getService } from "@/data/services";
import { ACTION_TYPE_LABELS, NURSING_LEVEL_TONE, RISK_LABELS, CONTENT_WORLDS } from "@/data/constants";
import { Users, AlertTriangle, Calendar, Bell, Wallet, ArrowUpRight, ArrowDownRight, Home, Phone, Package, FileText, Sparkles, ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const SCHEDULE_ICON_MAP = { visit: Home, call: Phone, vendor: Package, plan: FileText, assessment: AlertTriangle, family: Users, report: FileText };

function StatCard({ icon: Icon, label, value, sub, tone = "primary" }: { icon: any; label: string; value: string | number; sub: string; tone?: "primary" | "warning" | "success" | "info" | "destructive" }) {
  const toneMap = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning-foreground",
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
    destructive: "bg-destructive-soft text-destructive",
  };
  return (
    <div className="libi-stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", toneMap[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
      <div className="text-sm text-foreground mt-0.5">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function SarahSpotlight() {
  const sarah = getClient("c1")!;
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary-soft/40 to-card">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={`${sarah.firstName} ${sarah.lastName}`} size={56} tone="primary" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{sarah.firstName} {sarah.lastName}</h3>
              <Chip tone="destructive">⚠️ בדידות</Chip>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{sarah.age} שנים · {sarah.city} · רמת סיעוד {sarah.nursingLevel}</div>
          </div>
        </div>
        <Link to={`/clients/${sarah.id}`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          לפרופיל המלא <ChevronLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card rounded-lg p-3 border border-border/60">
          <div className="text-xs text-muted-foreground">ארנק</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{sarah.wallet.balance}/{sarah.wallet.total}</div>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border/60">
          <div className="text-xs text-muted-foreground">בדידות</div>
          <div className="text-lg font-bold text-destructive mt-0.5">{sarah.lev.lonelinessScore}/10</div>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border/60">
          <div className="text-xs text-muted-foreground">שירותים</div>
          <div className="text-lg font-bold text-foreground mt-0.5">0</div>
        </div>
      </div>

      <div className="bg-card/70 rounded-lg p-3 border border-border/60">
        <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> שינויים אחרונים
        </div>
        <ul className="space-y-1.5">
          {sarahChangelog.map((c, i) => (
            <li key={i} className="text-xs text-muted-foreground flex gap-2">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span className="font-medium text-foreground/80 min-w-[90px]">{c.date}</span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function DailySchedule() {
  return (
    <Card>
      <CardHeader title="לוח הזמנים היומי" subtitle="יום ראשון, 27 באפריל 2025" />
      <div className="space-y-1">
        {schedule.map((item) => {
          const Icon = SCHEDULE_ICON_MAP[item.type];
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-muted/60",
                item.urgent && "bg-destructive-soft/60 hover:bg-destructive-soft"
              )}
            >
              <div className="text-sm font-semibold text-foreground tabular-nums w-12 shrink-0">{item.time}</div>
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  item.urgent ? "bg-destructive text-destructive-foreground" : "bg-accent text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-semibold", item.urgent ? "text-destructive" : "text-foreground")}>
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CrmActions() {
  const sarahActions = actions.filter((a) => a.clientId === "c1");
  const priorityTone = { high: "destructive", medium: "warning", low: "info" } as const;
  return (
    <Card>
      <CardHeader
        title="פעולות לב מומלצות"
        subtitle="התערבויות מותאמות לשרה כהן"
        action={<Link to="/actions" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">לכל הפעולות <ChevronLeft className="w-3.5 h-3.5" /></Link>}
      />
      <div className="space-y-3">
        {sarahActions.map((action) => {
          const tone = priorityTone[action.priority];
          const borderTone = tone === "destructive" ? "border-r-destructive" : tone === "warning" ? "border-r-warning" : "border-r-info";
          return (
            <div key={action.id} className={cn("p-4 rounded-lg border border-border bg-muted/30 border-r-4", borderTone)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Chip tone={tone}>{ACTION_TYPE_LABELS[action.type].icon} {action.typeLabel}</Chip>
                  <Chip tone="muted">{action.status === "pending" ? "ממתין" : action.status === "in_progress" ? "בתהליך" : "הושלם"}</Chip>
                </div>
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{action.title}</div>
              <div className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{action.description}</div>
              <div className="text-xs text-info bg-info-soft rounded-md px-3 py-2 leading-relaxed">
                💡 {action.suggestion}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function KpiPanel() {
  return (
    <Card>
      <CardHeader title="מדדי ביצוע" subtitle="ממוצע 30 ימים" />
      <div className="space-y-4">
        {kpis.map((k) => {
          const positive = k.invert ? k.trend === "down" : k.trend === "up";
          const TrendIcon = k.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={k.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-medium text-foreground">{k.label}</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-foreground tabular-nums">{k.display ?? `${k.value}%`}</div>
                  <span className={cn("text-[11px] flex items-center gap-0.5 font-medium", positive ? "text-success" : "text-destructive")}>
                    <TrendIcon className="w-3 h-3" />
                    {k.delta}
                  </span>
                </div>
              </div>
              <ProgressBar value={k.value} tone={positive ? "success" : "warning"} size="sm" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AlertsPanel() {
  return (
    <Card>
      <CardHeader title="התראות" subtitle={`${stats.alertsUnread} חדשות`} action={<Link to="/alerts" className="text-xs font-medium text-primary hover:underline">הכל</Link>} />
      <div className="space-y-2">
        {alerts.slice(0, 4).map((a) => (
          <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60">
            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", a.read ? "bg-border" : "bg-info animate-pulse-soft")} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground leading-tight">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AttentionTable() {
  return (
    <Card>
      <CardHeader title="דורשים תשומת לב" subtitle="5 מטופלים בעדיפות" />
      <div className="space-y-1">
        {attentionRows.map((row) => (
          <Link
            key={row.clientId}
            to={`/clients/${row.clientId}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <Avatar name={`${row.client.firstName} ${row.client.lastName}`} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {row.client.firstName} {row.client.lastName}
              </div>
              <div className="text-[11px] text-muted-foreground">{row.client.age} · רמה {row.client.nursingLevel}</div>
            </div>
            <span className={cn("libi-chip", row.tone)}>{row.reason}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default function Index() {
  return (
    <AppLayout title="בוקר טוב, שרית 👋" subtitle="הנה מה שמחכה לך היום — 3 פעולות דחופות, 5 מטופלים דורשים תשומת לב.">
      {/* 5 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Users} label="מטופלים" value={stats.totalClients} sub={`${stats.activeClients} פעילים`} tone="primary" />
        <StatCard icon={AlertTriangle} label="בסיכון" value={stats.atRisk} sub="דורשים התערבות" tone="destructive" />
        <StatCard icon={Calendar} label="הזמנות" value={stats.bookings} sub={`${stats.bookingsCompleted} הושלמו`} tone="info" />
        <StatCard icon={Bell} label="התראות" value={stats.alertsTotal} sub={`${stats.alertsUnread} חדשות`} tone="warning" />
        <StatCard icon={Wallet} label="ניצול סל" value={`${stats.walletUtilization}%`} sub={`יעד: ${stats.walletTarget}%`} tone="success" />
      </div>

      {/* 3 + 2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <SarahSpotlight />
          <DailySchedule />
          <CrmActions />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <KpiPanel />
          <AlertsPanel />
          <AttentionTable />
        </div>
      </div>
    </AppLayout>
  );
}
