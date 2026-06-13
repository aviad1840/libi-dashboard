import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { Avatar } from "@/components/common/Avatar";
import { ProgressBar } from "@/components/common/ProgressBar";
import { stats, kpis, sarahChangelog, PILOT } from "@/data/dashboard";
import { schedule, actions, alerts, attentionRows } from "@/data/mock";
import { getClient } from "@/data/clients";
import { getService } from "@/data/services";
import { ACTION_TYPE_LABELS, NURSING_LEVEL_TONE, RISK_LABELS, CONTENT_WORLDS } from "@/data/constants";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, AlertTriangle, Calendar, Bell, Wallet, ArrowUpRight, ArrowDownRight, Home, Phone, Package, FileText, Sparkles, ChevronLeft, Bot, Wifi, Activity } from "lucide-react";
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

type FeedEvent = { id: string; time: string; agent: string; msg: string; type: "alert" | "success" | "info" };

const SEED_EVENTS: FeedEvent[] = [
  { id: "e1", time: "08:12", agent: "סוכן ניטור", msg: "⚠️ שרה כהן לא הגיעה 4 ימים → פעולה דחופה נוצרה", type: "alert" },
  { id: "e2", time: "08:15", agent: "סוכן-על", msg: `${stats.pendingActions} פעולות דחופות הופנו למתאמת שרית`, type: "info" },
  { id: "e3", time: "08:20", agent: "סוכן גילוי", msg: `${PILOT.services} שירותים פעילים · מצא 3 ספקים חדשים`, type: "success" },
  { id: "e4", time: "08:31", agent: "סוכן התאמה", msg: `חישב ${PILOT.citizens} ציוני התאמה · עדכן 14 המלצות`, type: "info" },
  { id: "e5", time: "08:45", agent: "סוכן חיזוק", msg: "שלח 8 הזמנות לחוגים · 5 תגובות חיוביות", type: "success" },
];

const LIVE_EVENTS: FeedEvent[] = [
  { id: "l1", time: "עכשיו", agent: "סוכן התאמה", msg: "יוסף לוי (c2): המלצה חדשה — פיזיותרפיה בבית, 97% התאמה", type: "info" },
  { id: "l2", time: "עכשיו", agent: "סוכן גילוי", msg: "ספק חדש אושר: 'אופק' — ליווי רגשי בגבעתיים", type: "success" },
  { id: "l3", time: "עכשיו", agent: "סוכן ניטור", msg: "12 אזרחים: יתרה תפוג ב-30 יום → התראה לצוות", type: "alert" },
  { id: "l4", time: "עכשיו", agent: "סוכן-על", msg: "בוצעה אופטימיזציית סל ל-23 מטופלים — ניצול צפוי +8%", type: "success" },
  { id: "l5", time: "עכשיו", agent: "סוכן חיזוק", msg: "מרים גבאי: ציון חיבור חברתי עלה מ-4 ל-6 ✨", type: "success" },
];

function AgentsPanel() {
  const [events, setEvents] = useState<FeedEvent[]>(SEED_EVENTS);
  const [liveIdx, setLiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = LIVE_EVENTS[liveIdx % LIVE_EVENTS.length];
      const id = `live-${Date.now()}`;
      setEvents(prev => [{ ...next, id, time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) }, ...prev].slice(0, 7));
      setLiveIdx(i => i + 1);
    }, 7000);
    return () => clearInterval(timer);
  }, [liveIdx]);

  const dotColor = { alert: "bg-destructive", success: "bg-success", info: "bg-info" };
  const textColor = { alert: "text-destructive", success: "text-success", info: "text-info" };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">סוכני לב — Live Feed</div>
            <div className="text-[11px] text-muted-foreground">Amazon Bedrock · Lambda · DynamoDB</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
          <Activity className="w-3 h-3" />
          5/5 פעילים
        </div>
      </div>

      {/* Agent status pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { name: "גילוי", icon: "🔍", ok: true },
          { name: "התאמה", icon: "🎯", ok: true },
          { name: "ניטור", icon: "⚠️", ok: false },
          { name: "חיזוק", icon: "🔔", ok: true },
          { name: "סוכן-על", icon: "👑", ok: true },
        ].map((a) => (
          <div key={a.name} className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full border",
            a.ok ? "bg-success-soft text-success border-success/20" : "bg-destructive-soft text-destructive border-destructive/20"
          )}>
            <span>{a.icon}</span>
            <span>{a.name}</span>
            <span className={cn("w-1.5 h-1.5 rounded-full", a.ok ? "bg-success" : "bg-destructive animate-pulse")} />
          </div>
        ))}
      </div>

      {/* Live feed */}
      <div className="space-y-2 max-h-[260px] overflow-hidden">
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-card/80 border border-border/50"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5", dotColor[ev.type])} />
              <div className="flex-1 min-w-0">
                <div className={cn("text-[11px] font-semibold", textColor[ev.type])}>{ev.agent}</div>
                <div className="text-[11px] text-foreground/80 mt-0.5 leading-relaxed">{ev.msg}</div>
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{ev.time}</div>
            </motion.div>
          ))}
        </AnimatePresence>
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

const STAT_CARDS = (s: typeof stats) => [
  { icon: Users, label: "אזרחים בפיילוט", value: s.totalClients, sub: `${s.activeClients} פעילים · ירושלים`, tone: "primary" as const },
  { icon: AlertTriangle, label: "בסיכון", value: s.atRisk, sub: "דורשים התערבות", tone: "destructive" as const },
  { icon: Calendar, label: "הזמנות", value: s.bookings, sub: `${s.bookingsCompleted} הושלמו`, tone: "info" as const },
  { icon: Bell, label: "התראות", value: s.alertsTotal, sub: `${s.alertsUnread} חדשות`, tone: "warning" as const },
  { icon: Wallet, label: "ניצול סל", value: `${s.walletUtilization}%`, sub: `יעד: ${s.walletTarget}%`, tone: "success" as const },
];

export default function Index() {
  return (
    <AppLayout title="בוקר טוב, שרית 👋" subtitle="הנה מה שמחכה לך היום — 3 פעולות דחופות, 5 מטופלים דורשים תשומת לב.">
      {/* 5 stat cards — stagger animate */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {STAT_CARDS(stats).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* 3 + 2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <SarahSpotlight />
          <DailySchedule />
          <CrmActions />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <AgentsPanel />
          <KpiPanel />
          <AlertsPanel />
          <AttentionTable />
        </div>
      </div>
    </AppLayout>
  );
}
