import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Chip } from "@/components/common/Chip";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getClient } from "@/data/clients";
import { bookings } from "@/data/mock";
import { getService } from "@/data/services";
import { CONTENT_WORLDS, NURSING_LEVEL_TONE, PERSONA_LABELS, RISK_LABELS, BOOKING_STATUS } from "@/data/constants";
import { Phone, MapPin, UserRound, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Wallet, Activity, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { services as allServices } from "@/data/services";
import { toast } from "sonner";

const TABS = [
  { id: "functional", label: "פרופיל תפקודי", icon: Activity },
  { id: "wallet", label: "ארנק", icon: Wallet },
  { id: "basket", label: "סל אישי", icon: Sparkles },
  { id: "bookings", label: "הזמנות", icon: ClipboardList },
] as const;

function matchScore(client: ReturnType<typeof getClient> & object, svcId: string): number {
  // Simple deterministic score based on client id + service id
  const hash = (client.id + svcId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 60 + (hash % 35);
}

function BasketTab({ client }: { client: NonNullable<ReturnType<typeof getClient>> }) {
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const unitsUsed = Object.keys(added).reduce((sum, id) => {
    const s = allServices.find(s => s.id === id);
    return sum + (s?.units ?? 0);
  }, 0);
  const remaining = client.wallet.balance - unitsUsed;

  return (
    <div className="space-y-5">
      {/* Budget header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">יתרה זמינה לסל</div>
            <div className="text-3xl font-bold text-primary tabular-nums mt-1">{remaining}</div>
            <div className="text-xs text-muted-foreground">מתוך {client.wallet.total} יח׳ · {unitsUsed} נבחרו</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">ניצול מוצע</div>
            <div className="text-2xl font-bold text-success tabular-nums">
              {Math.min(100, Math.round((unitsUsed / client.wallet.total) * 100))}%
            </div>
          </div>
        </div>
        <ProgressBar value={unitsUsed} max={client.wallet.total} tone="primary" className="mt-3" />
      </Card>

      {/* Services by world */}
      {Object.entries(CONTENT_WORLDS).map(([worldKey, world]) => {
        const worldSvcs = allServices.filter(s => s.world === worldKey);
        return (
          <Card key={worldKey} padded={false}>
            <div className={cn("flex items-center gap-3 px-5 py-3 border-b border-border", world.colorClass.replace("text-", "bg-").split(" ")[0] + "/10")}>
              <span className="text-xl">{world.emoji}</span>
              <div>
                <div className="font-semibold text-foreground text-sm">{world.label}</div>
                <div className="text-xs text-muted-foreground">{world.subsidy}% סבסוד</div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {worldSvcs.map(svc => {
                const score = matchScore(client, svc.id);
                const isAdded = added[svc.id];
                const canAfford = remaining >= svc.units || isAdded;
                return (
                  <div key={svc.id} className={cn("flex items-center gap-4 px-5 py-3 transition-colors", isAdded && "bg-success-soft/30")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{svc.name}</span>
                        {score >= 85 && (
                          <span className="text-[10px] bg-primary-soft text-primary px-1.5 py-0.5 rounded-full font-bold">
                            AI ✓ {score}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{svc.description} · {svc.vendor}</div>
                    </div>
                    <div className="text-sm font-bold text-foreground tabular-nums shrink-0">{svc.units} יח׳</div>
                    <button
                      onClick={() => {
                        if (isAdded) {
                          setAdded(p => { const n = { ...p }; delete n[svc.id]; return n; });
                          toast.info(`${svc.name} הוסר מהסל`);
                        } else if (canAfford) {
                          setAdded(p => ({ ...p, [svc.id]: true }));
                          toast.success(`${svc.name} נוסף לסל האישי`, { description: `${svc.units} יחידות · ${svc.subsidy}% סבסוד` });
                        } else {
                          toast.error("לא מספיק יחידות בארנק");
                        }
                      }}
                      className={cn(
                        "shrink-0 px-3 h-8 rounded-lg text-xs font-semibold transition-all",
                        isAdded
                          ? "bg-success text-success-foreground"
                          : canAfford
                          ? "bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {isAdded ? "✓ נוסף" : "+ הוסף"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const client = getClient(id!);
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("functional");

  if (!client) {
    return (
      <AppLayout title="מטופל/ת לא נמצא/ה">
        <Link to="/clients" className="text-primary hover:underline">חזרה לרשימת המטופלים</Link>
      </AppLayout>
    );
  }

  const persona = PERSONA_LABELS[client.lev.persona];
  const clientBookings = bookings.filter((b) => b.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppLayout
      title={`${client.firstName} ${client.lastName}`}
      subtitle={`${client.age} שנים · ${client.city} · רמת סיעוד ${client.nursingLevel}`}
      actions={
        <Link to="/clients" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ChevronRight className="w-4 h-4" /> חזרה
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="lg:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center pb-5 border-b border-border">
            <Avatar name={`${client.firstName} ${client.lastName}`} size={88} tone="primary" />
            <h2 className="text-xl font-bold text-foreground mt-3">{client.firstName} {client.lastName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn("libi-chip", NURSING_LEVEL_TONE[client.nursingLevel])}>רמה {client.nursingLevel}</span>
              {client.lev.riskFlags.slice(0, 1).map((f) => (
                <Chip key={f} tone="destructive">{RISK_LABELS[f].icon} {RISK_LABELS[f].label}</Chip>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-5 text-sm">
            <div className="flex items-center gap-3 text-foreground/80">
              <UserRound className="w-4 h-4 text-muted-foreground" />
              <span>{client.age} שנים</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{client.city}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span dir="ltr">{client.phone}</span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1.5">איש קשר לחירום</div>
              <div className="text-sm font-medium text-foreground">{client.emergencyContact.name}</div>
              <div className="text-xs text-muted-foreground">{client.emergencyContact.relation} · <span dir="ltr">{client.emergencyContact.phone}</span></div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tab nav */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium transition-colors",
                    tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {tab === "functional" && (
            <div className="space-y-5">
              {/* ICF verification */}
              <Card className={cn("border-2", client.functional.verified ? "border-success/40 bg-success-soft/30" : "border-warning/40 bg-warning-soft/30")}>
                <div className="flex items-start gap-3">
                  {client.functional.verified ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-foreground text-sm">
                      אימות פרופיל תפקודי (ICF) {client.functional.verified ? "— מאומת" : "— ממתין לאימות"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {client.functional.verified
                        ? "הפרופיל אומת על ידי המתאמת בתאריך 20.04.25."
                        : "יש לאמת את הפרופיל תוך 7 ימים מהערכה הראשונית."}
                    </p>
                    <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
                      <input type="checkbox" defaultChecked={client.functional.verified} className="w-4 h-4 accent-primary" />
                      <span className="text-foreground">אימתתי את הפרופיל ICF</span>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Persona verification */}
              <Card>
                <CardHeader title="פרסונת לב" subtitle="מבוסס על אינטראקציות והעדפות" />
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-soft/40 border border-primary/15">
                  <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center text-2xl shrink-0 border border-border">
                    {persona.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{persona.label}</div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{persona.description}</p>
                    <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> טיפים למעורבות
                      </div>
                      <ul className="space-y-1">
                        {client.lev.engagementTips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-glow transition-colors">
                        ✓ אישור פרסונה
                      </button>
                      <button className="px-3 h-8 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
                        עריכה ידנית
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Radar chart */}
              <Card>
                <CardHeader title="מפת תפקוד" subtitle="ויזואליזציה של 6 מדדים תפקודיים" />
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={220}>
                    <RadarChart data={[
                      { subject: "ניידות", value: client.functional.mobility, fullMark: 5 },
                      { subject: "קוגניציה", value: client.functional.cognition, fullMark: 5 },
                      { subject: "רגשי", value: client.functional.emotional, fullMark: 5 },
                      { subject: "חברתי", value: client.functional.social, fullMark: 5 },
                      { subject: "ראייה", value: client.functional.vision, fullMark: 5 },
                      { subject: "שמיעה", value: client.functional.hearing, fullMark: 5 },
                    ]}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Radar name="פרופיל" dataKey="value" stroke="#1B3A5C" fill="#1B3A5C" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip formatter={(v) => [`${v}/5`, "ציון"]} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {([
                      ["mobility", "ניידות"],
                      ["cognition", "קוגניציה"],
                      ["emotional", "רגשי"],
                      ["social", "חברתי"],
                      ["vision", "ראייה"],
                      ["hearing", "שמיעה"],
                    ] as const).map(([key, label]) => {
                      const v = client.functional[key];
                      const tone = v >= 4 ? "text-success" : v >= 3 ? "text-primary" : v >= 2 ? "text-warning" : "text-destructive";
                      return (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground text-xs">{label}</span>
                          <span className={cn("font-bold tabular-nums text-sm", tone)}>{v}/5</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Functional metrics */}
              <Card>
                <CardHeader title="מדדים תפקודיים" subtitle="סקאלה 1-5 (5 = מצוין)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {([
                    ["mobility", "ניידות"],
                    ["cognition", "קוגניציה"],
                    ["emotional", "רגשי"],
                    ["social", "חברתי"],
                    ["vision", "ראייה"],
                    ["hearing", "שמיעה"],
                  ] as const).map(([key, label]) => {
                    const v = client.functional[key];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-foreground">{label}</span>
                          <span className="text-sm font-bold text-foreground tabular-nums">{v}/5</span>
                        </div>
                        <ProgressBar value={v} max={5} tone={v >= 4 ? "success" : v >= 3 ? "primary" : v >= 2 ? "warning" : "destructive"} />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card>
                  <CardHeader title="מצבים רפואיים" />
                  <div className="flex flex-wrap gap-2">
                    {client.conditions.map((c) => (
                      <Chip key={c} tone="muted">{c}</Chip>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHeader title="העדפות ותחביבים" />
                  <div className="flex flex-wrap gap-2">
                    {client.preferences.map((p) => (
                      <Chip key={p} tone="primary">{p}</Chip>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "wallet" && (
            <div className="space-y-5">
              <Card className="text-center py-8">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">יתרה זמינה</div>
                <div className="text-6xl font-bold text-primary tabular-nums">{client.wallet.balance}</div>
                <div className="text-sm text-muted-foreground mt-1">מתוך {client.wallet.total} יחידות</div>
                <div className="max-w-md mx-auto mt-5">
                  <ProgressBar value={client.wallet.balance} max={client.wallet.total} tone="primary" />
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-5">
                <Card>
                  <div className="text-xs text-muted-foreground">סה״כ הקצאה</div>
                  <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{client.wallet.total} יח׳</div>
                </Card>
                <Card>
                  <div className="text-xs text-muted-foreground">נוצלו</div>
                  <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{client.wallet.total - client.wallet.balance} יח׳</div>
                </Card>
              </div>
              <Card className="bg-success-soft/50 border-success/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success text-success-foreground flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">יחידות 'הזדקנות מיטבית'</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {client.wallet.optimalAgingUnits} יחידות בונוס מותאמות לפרופיל שלך — מומלץ לנצלן עד סוף הרבעון.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === "basket" && (
            <BasketTab client={client} />
          )}

          {tab === "bookings" && (
            <Card padded={false}>
              {clientBookings.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">לא קיימות הזמנות עדיין.</div>
              ) : (
                <div className="divide-y divide-border">
                  {clientBookings.map((b) => {
                    const service = getService(b.serviceId);
                    const status = BOOKING_STATUS[b.status];
                    const world = CONTENT_WORLDS[service.world];
                    const [y, m, d] = b.date.split("-");
                    return (
                      <div key={b.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-muted text-foreground flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold leading-none tabular-nums">{d}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{m}/{y.slice(2)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{service.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>{b.time}</span>
                            <span>·</span>
                            <span className={cn("libi-chip", world.colorClass)}>{world.emoji} {world.label}</span>
                          </div>
                        </div>
                        <span className={cn("libi-chip", status.tone)}>{status.label}</span>
                        <div className="text-sm font-bold text-foreground tabular-nums w-16 text-left">{b.units} יח׳</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
