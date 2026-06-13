import { useState } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Chip } from "@/components/common/Chip";
import { actions } from "@/data/mock";
import { getClient } from "@/data/clients";
import { getService } from "@/data/services";
import { services } from "@/data/services";
import { ACTION_TYPE_LABELS, CONTENT_WORLDS, PERSONA_LABELS, RISK_LABELS } from "@/data/constants";
import { ChevronDown, ChevronUp, Phone, Calendar, UserRound, X, AlertOctagon, Clock, Brain, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ActionPriority, CrmAction } from "@/data/types";
import type { Client } from "@/data/types";

const PRIORITY_INFO: Record<ActionPriority, { label: string; tone: "destructive" | "warning" | "info"; threshold: number; iconClass: string }> = {
  high: { label: "עדיפות גבוהה", tone: "destructive", threshold: 72, iconClass: "bg-destructive" },
  medium: { label: "עדיפות בינונית", tone: "warning", threshold: 168, iconClass: "bg-warning" },
  low: { label: "עדיפות נמוכה", tone: "info", threshold: 336, iconClass: "bg-info" },
};

// AI reasoning chains per action type
function buildReasoning(action: CrmAction, client: Client): { step: string; result: string }[] {
  const loneScore = client.lev.lonelinessScore;
  const walletPct = Math.round((client.wallet.balance / client.wallet.total) * 100);
  const persona = PERSONA_LABELS[client.lev.persona];
  const baseReasoning: Record<string, { step: string; result: string }[]> = {
    loneliness_intervention: [
      { step: "ניתוח ציון בדידות", result: `${loneScore}/10 · ירידה מ-${loneScore + 2} ב-14 ימים` },
      { step: "זיהוי פרסונה", result: `${persona.emoji} ${persona.label}` },
      { step: "התאמת שירות", result: `חוג שירה — 94% התאמה לפרסונה ולמשמעות` },
      { step: "החלטת התערבות", result: `דחיפות גבוהה · הפעלת התראה לטיפול` },
    ],
    wallet_optimization: [
      { step: "ניתוח ניצול ארנק", result: `${walletPct}% בלבד · יתרה: ${client.wallet.balance}/${client.wallet.total} יח׳` },
      { step: "זיהוי סיכון", result: `יתרה צפויה לפוג בעוד 90 יום` },
      { step: "המלצת שירותים", result: `4-6 יחידות/שבוע בעולם שייכות ומשמעות` },
      { step: "תוחלת השפעה", result: `ניצול צפוי: 85%+ · ± 3.5 ימי עצמאות` },
    ],
    expiring_balance: [
      { step: "בדיקת תפוגה", result: `יתרה פגה ב-30 יום · ${client.wallet.balance} יח׳` },
      { step: "מיפוי עדיפויות", result: `שירותי בריאות ותפקוד — 100% סבסוד` },
      { step: "תזמון אוטומטי", result: `מומלץ להזמין עד ה-30 לחודש` },
      { step: "התראה למתאמת", result: `נשלחה התראה דחופה · 3 שירותים מוכנים להזמנה` },
    ],
    functional_decline: [
      { step: "זיהוי ירידה תפקודית", result: `ניידות: ${client.functional.mobility}/5 · קוגניציה: ${client.functional.cognition}/5` },
      { step: "ניתוח מגמה", result: `ירידה של 0.8 נקודות ב-60 יום` },
      { step: "המלצת שירות", result: `פיזיותרפיה בבית · שעון חירום עם GPS` },
      { step: "הפניה מקצועית", result: `דרוש הערכת ICF מחודשת תוך 7 ימים` },
    ],
    reactivation: [
      { step: "זיהוי חוסר פעילות", result: `${client.daysSinceActivity} ימים ללא כניסה למערכת` },
      { step: "ניתוח גורמי חסם", result: `ייתכן: ליקוי שמיעה / קושי דיגיטלי` },
      { step: "אסטרטגיית החזרה", result: `שיחת טלפון אישית → ביקור בית → חוג פנים-אל-פנים` },
      { step: "הסתברות הצלחה", result: `87% החזרה לפעילות בגישה אישית` },
    ],
    family_engagement: [
      { step: "מיפוי רשת תמיכה", result: `איש קשר: ${client.emergencyContact.name} (${client.emergencyContact.relation})` },
      { step: "הצעת מעורבות", result: `הדרכת משפחה לניצול ארנק השירותים` },
      { step: "ערוץ תקשורת", result: `SMS + שיחה · עדיף בין 17:00-19:00` },
      { step: "מטרה", result: `הגדלת רשת תמיכה → הפחתת בדידות 2 נקודות` },
    ],
  };
  return baseReasoning[action.type] ?? baseReasoning.loneliness_intervention;
}

// Booking modal
function BookingModal({ action, client, onClose }: { action: CrmAction; client: Client; onClose: () => void }) {
  const [selectedService, setSelectedService] = useState(action.suggestedServiceIds[0] ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [done, setDone] = useState(false);

  const availableServices = action.suggestedServiceIds
    .map((id) => getService(id))
    .filter(Boolean);

  const handleConfirm = () => {
    if (!selectedService || !date) {
      toast.error("נא לבחור שירות ותאריך");
      return;
    }
    setDone(true);
    const s = getService(selectedService);
    setTimeout(() => {
      toast.success(`הזמנה נוצרה בהצלחה!`, {
        description: `${s?.name} · ${client.firstName} ${client.lastName} · ${date} ${time}`,
        duration: 5000,
      });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground text-lg">תזמון שירות</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{client.firstName} {client.lastName} · {client.wallet.balance} יח׳ זמינות</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Service selection */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">בחירת שירות מומלץ</label>
            <div className="space-y-2">
              {availableServices.map((s) => {
                const w = CONTENT_WORLDS[s.world];
                const selected = selectedService === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right",
                      selected ? "border-primary bg-primary-soft/50 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0", w.colorClass)}>
                      {w.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{w.label} · {s.subsidy}% סבסוד · {s.units} יח׳</div>
                    </div>
                    {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">תאריך</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">שעה</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary"
              >
                {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={done}
            className={cn(
              "flex-1 h-10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
              done ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground hover:bg-primary-glow"
            )}
          >
            {done ? <><Check className="w-4 h-4" /> מתזמן...</> : <><Calendar className="w-4 h-4" /> אישור הזמנה</>}
          </button>
          <button onClick={onClose} className="px-4 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ actionId }: { actionId: string }) {
  const action = actions.find((a) => a.id === actionId)!;
  const client = getClient(action.clientId)!;
  const [expanded, setExpanded] = useState(action.priority === "high");
  const [showReasoning, setShowReasoning] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const priority = PRIORITY_INFO[action.priority];
  const typeInfo = ACTION_TYPE_LABELS[action.type];
  const persona = PERSONA_LABELS[client.lev.persona];
  const reasoning = buildReasoning(action, client);

  const hoursUntilEsc = priority.threshold - action.hoursOpen;
  const showEscWarn = !action.escalated && hoursUntilEsc > 0 && hoursUntilEsc < 48;

  if (dismissed) return null;

  return (
    <>
      {showBooking && (
        <BookingModal action={action} client={client} onClose={() => setShowBooking(false)} />
      )}
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

            {/* AI Reasoning toggle */}
            <button
              onClick={() => setShowReasoning((v) => !v)}
              className="mt-3 text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <Brain className="w-3.5 h-3.5" />
              {showReasoning ? "הסתר" : "הצג"} נימוק סוכן AI
              {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showReasoning && (
              <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/15 space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                  🤖 Amazon Bedrock · סוכן התאמה
                </div>
                {reasoning.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-muted-foreground">{r.step}: </span>
                      <span className="font-semibold text-foreground">{r.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

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

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => toast.success(`מתחברת לשיחה עם ${client.firstName} ${client.lastName}`, { description: `${client.phone} · ${action.title}`, duration: 4000 })}
                    className="flex items-center gap-2 px-3 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors"
                  >
                    <Phone className="w-4 h-4" /> התקשרי
                  </button>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="flex items-center gap-2 px-3 h-9 rounded-lg bg-success text-success-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Calendar className="w-4 h-4" /> תזמני שירות
                  </button>
                  <Link to={`/clients/${client.id}`} className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
                    <UserRound className="w-4 h-4" /> לפרופיל
                  </Link>
                  <button
                    onClick={() => { setDismissed(true); toast.info("הפעולה סומנה כסגורה", { description: action.title }); }}
                    className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors mr-auto"
                  >
                    <X className="w-4 h-4" /> סגירה
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
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
