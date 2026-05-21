import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { RoadmapBadge } from "@/components/prototype/RoadmapBadge";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { Avatar } from "@/components/common/Avatar";
import { getClient } from "@/data/clients";
import { services } from "@/data/services";
import { CONTENT_WORLDS, PERSONA_LABELS } from "@/data/constants";
import { Brain, Sparkles, UserCheck, ArrowLeft } from "lucide-react";

const FEATURED_MATCHES = [
  { serviceId: "s4", score: 94, reasons: ["פרסונה: חברתית-אקטיבית", "אהבת מוזיקה ישראלית", "סבסוד 100%"] },
  { serviceId: "s1", score: 88, reasons: ["מועדון שכונתי בקרבת בית", "מפגש שבועי קבוע", "סבסוד 100%"] },
  { serviceId: "s3", score: 81, reasons: ["מתאים לפתיחת קשר עדינה", "פעם בשבוע — לא מציף", "סבסוד 100%"] },
];

const FEATURED_COMPANIONS = [
  { name: "מירב כהן", score: 92, reasons: ["ניסיון של 8 שנים בקהילה דתית", "שורשים תרבותיים דומים"] },
  { name: "גלית פרץ", score: 87, reasons: ["מומחית בליווי חברתי קהילתי", "זמינות בבוקר"] },
];

export default function Matching() {
  const sarah = getClient("c1");
  const persona = sarah ? PERSONA_LABELS[sarah.lev.persona] : null;

  return (
    <AppLayout
      title="Matching Engine · התאמת סל ומלווה לפרופיל"
      subtitle="שכבת AI #2 · התאמה רב-ממדית · שקיפות מלאה ברציונל"
    >
      <div className="space-y-6 max-w-7xl">
        <RoadmapBadge
          milestone="בפיתוח מתקדם · MVP בפיילוט פעיל"
          description="האלגוריתם מבסס top-3 התאמות לכל קשיש על בסיס פרסונה, פרופיל תפקודי, יתרת ארנק, היסטוריית שירותים והעדפות."
        />

        {/* Selected client */}
        {sarah && persona && (
          <Card className="bg-primary-soft/40 border-primary/20">
            <div className="flex items-start gap-4">
              <Avatar name={`${sarah.firstName} ${sarah.lastName}`} size={64} tone="primary" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">מטופל נבחר לדמו</div>
                <div className="text-xl font-bold text-foreground">{sarah.firstName} {sarah.lastName}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Chip tone="primary">{persona.emoji} {persona.label}</Chip>
                  <Chip tone="muted">רמה {sarah.nursingLevel}</Chip>
                  <Chip tone="destructive">בדידות {sarah.lev.lonelinessScore}/10</Chip>
                  <Chip tone="warning">ארנק {sarah.wallet.balance}/{sarah.wallet.total}</Chip>
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs text-muted-foreground">חלום</div>
                <div className="text-sm font-semibold text-foreground max-w-xs">{sarah.lev.dream}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Service matches */}
        <Card>
          <CardHeader
            title="Top-3 שירותים מומלצים"
            subtitle="ציון התאמה מבוסס 14 פיצ׳רים · רציונל גלוי לעין"
          />
          <div className="space-y-3">
            {FEATURED_MATCHES.map((m, i) => {
              const s = services.find((x) => x.id === m.serviceId);
              if (!s) return null;
              const w = CONTENT_WORLDS[s.world];
              return (
                <div key={m.serviceId} className="p-4 rounded-xl border-2 border-primary/20 bg-card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted text-foreground flex flex-col items-center justify-center shrink-0 font-bold">
                      <div className="text-[10px] text-muted-foreground">#</div>
                      <div className="text-lg leading-none">{i + 1}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{s.name}</h3>
                        <span className={"libi-chip " + w.colorClass}>{w.emoji} {w.label}</span>
                        <Chip tone="muted">{s.subsidy}% סבסוד</Chip>
                      </div>
                      <div className="text-xs text-muted-foreground">{s.description} · ספק: {s.vendor}</div>
                      <div className="mt-3">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">למה זה מתאים</div>
                        <ul className="space-y-1">
                          {m.reasons.map((r) => (
                            <li key={r} className="text-xs text-foreground flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-primary shrink-0" aria-hidden="true" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="text-3xl font-bold text-primary tabular-nums">{m.score}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">score</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Companion matches */}
        <Card>
          <CardHeader title="Top-2 מלוות מותאמות" subtitle="ניסיון · פרופיל · זמינות · רקע תרבותי" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURED_COMPANIONS.map((c) => (
              <div key={c.name} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size={48} tone="primary" />
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">מלווה מאושרת · משרד הרווחה</div>
                  </div>
                  <div className="text-2xl font-bold text-primary tabular-nums">{c.score}</div>
                </div>
                <ul className="mt-3 space-y-1">
                  {c.reasons.map((r) => (
                    <li key={r} className="text-xs text-foreground flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary shrink-0" aria-hidden="true" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* How it works */}
        <Card className="bg-info-soft/40 border-info/30">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-info shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-foreground">איך זה עובד</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                המנוע מקבל את הפרופיל המלא של הקשיש (פרסונה, רמת סיעוד, יתרה, פרופיל תפקודי, העדפות) ועובר על
                כל הספקים והמלוות הזמינים. כל זוג מקבל ציון מבוסס משקלים. תוצאות ה-Top-3/Top-2 מוצגות עם
                רציונל מלא — שקיפות הסבר היא יסוד במודל.
              </p>
            </div>
          </div>
        </Card>

        {/* Approval CTA */}
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-success" aria-hidden="true" />
              <div>
                <div className="font-bold text-foreground">אישור מלווה נדרש</div>
                <div className="text-xs text-muted-foreground">המערכת לא תבצע הזמנות ללא חתימת המתאמת</div>
              </div>
            </div>
            <button type="button" className="flex items-center gap-2 px-4 h-10 rounded-lg bg-success text-success-foreground text-sm font-semibold">
              אישור והעברה לתיאום ספק <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
