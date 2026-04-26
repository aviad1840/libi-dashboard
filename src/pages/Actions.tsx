import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Chip } from "@/components/common/Chip";
import { actions } from "@/data/mock";
import { getClient } from "@/data/clients";
import { getService } from "@/data/services";
import { ACTION_TYPE_LABELS, CONTENT_WORLDS, PERSONA_LABELS, RISK_LABELS } from "@/data/constants";
import { ChevronDown, ChevronUp, Phone, Calendar, UserRound, X, AlertOctagon, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ActionPriority } from "@/data/types";

const PRIORITY_INFO: Record<ActionPriority, { label: string; tone: "destructive" | "warning" | "info"; threshold: number; iconClass: string }> = {
  high: { label: "עדיפות גבוהה", tone: "destructive", threshold: 72, iconClass: "bg-destructive" },
  medium: { label: "עדיפות בינונית", tone: "warning", threshold: 168, iconClass: "bg-warning" },
  low: { label: "עדיפות נמוכה", tone: "info", threshold: 336, iconClass: "bg-info" },
};

function ActionCard({ actionId }: { actionId: string }) {
  const action = actions.find((a) => a.id === actionId)!;
  const client = getClient(action.clientId)!;
  const [expanded, setExpanded] = useState(action.priority === "high");
  const priority = PRIORITY_INFO[action.priority];
  const typeInfo = ACTION_TYPE_LABELS[action.type];
  const persona = PERSONA_LABELS[client.lev.persona];

  const hoursUntilEsc = priority.threshold - action.hoursOpen;
  const showEscWarn = !action.escalated && hoursUntilEsc > 0 && hoursUntilEsc < 48;

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-lg text-primary-foreground flex items-center justify-center text-lg shrink-0", priority.iconClass)}>
          {typeInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{typeInfo.label}</span>
            <Chip tone={priority.tone}>{priority.label}</Chip>
            {action.escalated && (
              <Chip tone="destructive">
                <AlertOctagon className="w-3 h-3" /> 🔺 הועבר למנהל רשות
              </Chip>
            )}
            {showEscWarn && (
              <Chip tone="warning">
                <Clock className="w-3 h-3" /> ⏰ {hoursUntilEsc} שעות להסלמה
              </Chip>
            )}
          </div>
          <div className="text-base font-bold text-foreground">{action.title}</div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{action.description}</p>

          {/* Client mini-card */}
          <Link to={`/clients/${client.id}`} className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-muted/40 border border-border/60 hover:bg-muted transition-colors">
            <Avatar name={`${client.firstName} ${client.lastName}`} size={40} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm">{client.firstName} {client.lastName}</div>
              <div className="text-xs text-muted-foreground">{client.age} · {client.city}</div>
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground">ארנק</div>
              <div className="font-bold text-foreground tabular-nums text-sm">{client.wallet.balance}/{client.wallet.total}</div>
            </div>
          </Link>

          {/* Suggestion */}
          <div className="mt-3 text-sm text-info bg-info-soft rounded-lg px-3 py-2.5 leading-relaxed">
            💡 {action.suggestion}
          </div>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? "סגור פרטים" : "הצג פרופיל לב + שירותים מומלצים"}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
              {/* Lev profile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">פרסונה</div>
                  <div className="font-semibold text-foreground">{persona.emoji} {persona.label}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">חלום</div>
                  <div className="font-semibold text-foreground">{client.lev.dream}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">בדידות</div>
                  <div className={cn("font-bold tabular-nums", client.lev.lonelinessScore <= 3 ? "text-destructive" : "text-foreground")}>
                    {client.lev.lonelinessScore}/10
                  </div>
                </div>
              </div>

              {client.lev.riskFlags.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-foreground mb-2">דגלי סיכון</div>
                  <div className="flex flex-wrap gap-1.5">
                    {client.lev.riskFlags.map((f) => (
                      <Chip key={f} tone="destructive">{RISK_LABELS[f].icon} {RISK_LABELS[f].label}</Chip>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-foreground mb-2">טיפים למעורבות</div>
                <ul className="space-y-1.5">
                  {client.lev.engagementTips.map((tip, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary">•</span>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Suggested services */}
              <div>
                <div className="text-xs font-semibold text-foreground mb-2">שירותים מומלצים</div>
                <div className="space-y-2">
                  {action.suggestedServiceIds.map((sid) => {
                    const s = getService(sid);
                    const w = CONTENT_WORLDS[s.world];
                    return (
                      <div key={sid} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">{w.emoji}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground text-sm">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{w.label} · {s.subsidy}% סבסוד</div>
                        </div>
                        <div className="text-sm font-bold text-foreground tabular-nums">{s.units} יח׳</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
                  <Phone className="w-4 h-4" /> התקשרי
                </button>
                <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-success text-success-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Calendar className="w-4 h-4" /> תזמני שירות
                </button>
                <Link to={`/clients/${client.id}`} className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
                  <UserRound className="w-4 h-4" /> לפרופיל
                </Link>
                <button className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors mr-auto">
                  <X className="w-4 h-4" /> סגירה
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Actions() {
  const grouped = {
    high: actions.filter((a) => a.priority === "high"),
    medium: actions.filter((a) => a.priority === "medium"),
    low: actions.filter((a) => a.priority === "low"),
  };

  const sectionLabel = { high: "עדיפות גבוהה", medium: "עדיפות בינונית", low: "עדיפות נמוכה" };
  const sectionTone = { high: "bg-destructive", medium: "bg-warning", low: "bg-info" };

  return (
    <AppLayout title="פעולות לב" subtitle={`${actions.filter((a) => a.status !== "completed").length} פעולות פתוחות · ${actions.filter((a) => a.escalated).length} בהסלמה`}>
      <div className="space-y-8 max-w-5xl">
        {(["high", "medium", "low"] as const).map((p) => (
          <section key={p}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-1.5 h-6 rounded-full", sectionTone[p])} />
              <h2 className="text-lg font-bold text-foreground">{sectionLabel[p]}</h2>
              <span className="text-xs text-muted-foreground">({grouped[p].length})</span>
            </div>
            <div className="space-y-3">
              {grouped[p].map((a) => <ActionCard key={a.id} actionId={a.id} />)}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
