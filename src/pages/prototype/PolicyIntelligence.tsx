import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { DEFAULT_ROI, NATIONAL_KPIS, ROADMAP, SCALABILITY, PILOTS } from "@/data/national";
import { TrendingUp, Users, Database, Layers, Banknote, CheckCircle2, CircleDot, Circle, MapPin, ArrowLeft, Activity, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = new Intl.NumberFormat("he-IL");

function HeroStat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MilestoneIcon({ status }: { status: "done" | "current" | "future" }) {
  if (status === "done") return <CheckCircle2 className="w-5 h-5 text-success" aria-hidden="true" />;
  if (status === "current") return <CircleDot className="w-5 h-5 text-primary animate-pulse-soft" aria-hidden="true" />;
  return <Circle className="w-5 h-5 text-muted-foreground" aria-hidden="true" />;
}

export default function PolicyIntelligence() {
  const [deteriorationDelay, setDeteriorationDelay] = useState(DEFAULT_ROI.defaultDeteriorationDelay);

  const roi = useMemo(() => {
    const savings = DEFAULT_ROI.eligiblePopulation * DEFAULT_ROI.costPerYearPerPerson * (deteriorationDelay / 100);
    return {
      savings,
      formatted: savings >= 1e9 ? `${(savings / 1e9).toFixed(2)} מיליארד ₪` : `${(savings / 1e6).toFixed(0)} מיליון ₪`,
    };
  }, [deteriorationDelay]);

  return (
    <AppLayout
      title="מבט לאומי · Policy Intelligence"
      subtitle="קול קורא 3.0 · תשתית AI לסיעוד ולהזדקנות מיטבית · בסיס: החלטת ממשלה 127"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Executive hero — the first thing the VP sees */}
        <section className="bg-gradient-to-bl from-primary via-primary to-primary-glow text-primary-foreground rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" aria-hidden="true" />
                קול קורא 3.0 · פעיל עד 30/07/2026
              </div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                תשתית AI לאומית להזדקנות מיטבית
              </h1>
              <p className="text-sm md:text-base opacity-90 mt-3 max-w-2xl leading-relaxed">
                הרחבה של מודל שטח מוכח מפיילוט "עכשיו אני" — מ-286 משתתפים בפסגת זאב ל-240,000 זכאים ארציים,
                באמצעות 5 שכבות AI על נימבוס. שותפות של 4 משרדים. חיסכון פוטנציאלי: 2 מיליארד ₪/שנה.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  to="/national/architecture"
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-white text-primary text-sm font-bold hover:bg-white/95 transition-colors"
                >
                  <Layers className="w-4 h-4" aria-hidden="true" /> ראו את 5 שכבות ה-AI
                </Link>
                <Link
                  to="/national/early-warning"
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-white/15 text-white border border-white/30 text-sm font-semibold hover:bg-white/25 transition-colors"
                >
                  <Activity className="w-4 h-4" aria-hidden="true" /> דמו Early Warning
                </Link>
                <Link
                  to="/national/proposal"
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-white/15 text-white border border-white/30 text-sm font-semibold hover:bg-white/25 transition-colors"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" /> תקציר להגשה
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:max-w-md shrink-0">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold tabular-nums">240K</div>
                <div className="text-xs opacity-90 mt-0.5">זכאי סיעוד ארצי</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold tabular-nums">2 מיליארד ₪</div>
                <div className="text-xs opacity-90 mt-0.5">חיסכון פוטנציאלי/שנה</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold tabular-nums">4</div>
                <div className="text-xs opacity-90 mt-0.5">משרדים שותפים</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold tabular-nums">5</div>
                <div className="text-xs opacity-90 mt-0.5">שכבות AI על נימבוס</div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary stats (kept for detail) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HeroStat icon={Users} value={fmt.format(240_000)} label="זכאי סיעוד ברמות 1-3" />
          <HeroStat icon={Database} value="1.7M" label="מסמכים שנתיים" />
          <HeroStat icon={Layers} value="5" label="שכבות AI על נימבוס" />
          <HeroStat icon={Banknote} value="2 מיליארד ₪" label="חיסכון פוטנציאלי/שנה" />
        </section>

        {/* ROI Calculator */}
        <Card className="bg-gradient-to-bl from-primary-soft/40 to-card border-primary/20">
          <CardHeader title="מחשבון ROI חי" subtitle="דחיית הידרדרות → חיסכון למשק" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="delay-slider" className="text-sm font-semibold text-foreground">
                אחוז דחיית הידרדרות שנתי
              </label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  id="delay-slider"
                  type="range"
                  min={10}
                  max={30}
                  step={1}
                  value={deteriorationDelay}
                  onChange={(e) => setDeteriorationDelay(Number(e.target.value))}
                  className="flex-1 accent-primary"
                  aria-valuemin={10}
                  aria-valuemax={30}
                  aria-valuenow={deteriorationDelay}
                />
                <div className="text-2xl font-bold text-primary tabular-nums w-20 text-left">{deteriorationDelay}%</div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground leading-relaxed bg-card rounded-lg p-3 border border-border">
                <div className="font-mono text-foreground/80" dir="ltr">
                  {fmt.format(DEFAULT_ROI.eligiblePopulation)} × ₪{fmt.format(DEFAULT_ROI.costPerYearPerPerson)} × {deteriorationDelay}%
                </div>
                <div className="mt-1.5">
                  בסיס: ניתוח עם קופ"ח מאוחדת. עלות הידרדרות שנתית ממוצעת ₪12,000-18,000 לזכאי.
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-primary/20 p-6 flex flex-col items-center justify-center text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">חיסכון שנתי לאומי</div>
              <div className="text-5xl md:text-6xl font-bold text-primary mt-2 tabular-nums">{roi.formatted}</div>
              <div className="text-sm text-muted-foreground mt-3">בכפוף ל-{deteriorationDelay}% דחיית הידרדרות</div>
              {deteriorationDelay === 20 && (
                <Chip tone="success" className="mt-3">יעד מוצהר בקול קורא</Chip>
              )}
            </div>
          </div>
        </Card>

        {/* KPIs Table */}
        <Card>
          <CardHeader title="KPIs לוועדת ההיגוי" subtitle="מדדים אופרטיביים מהקול קורא — בסיס המדידה הרבעונית" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-right font-semibold pb-2">מדד</th>
                  <th className="text-right font-semibold pb-2">יעד</th>
                  <th className="text-right font-semibold pb-2">אופן מדידה</th>
                </tr>
              </thead>
              <tbody>
                {NATIONAL_KPIS.map((k) => (
                  <tr key={k.label} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-semibold text-foreground">{k.label}</td>
                    <td className="py-3 text-foreground">{k.target}</td>
                    <td className="py-3 text-muted-foreground text-xs leading-relaxed">{k.measure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Roadmap + Pilots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="לוח זמנים" subtitle="מקול קורא להרחבה לאומית" />
            <ol className="relative border-r-2 border-border pr-5 space-y-4">
              {ROADMAP.map((m) => (
                <li key={m.date} className="relative">
                  <div className="absolute -right-[31px] top-0 w-5 h-5 bg-card flex items-center justify-center">
                    <MilestoneIcon status={m.status} />
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">{m.date}</div>
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      m.status === "done" && "text-success",
                      m.status === "current" && "text-primary",
                      m.status === "future" && "text-foreground",
                    )}
                  >
                    {m.title}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader title="פיילוטים" subtitle={`5 ערים · 1 פעיל (פסגת זאב) · 4 מתוכננים`} />
            <div className="space-y-2">
              {PILOTS.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      p.status === "active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                    )}
                    aria-hidden="true"
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {p.name} · {p.city}
                    </div>
                    {p.status === "active" && p.targetGroup && p.participants ? (
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {fmt.format(p.targetGroup)} זכאי יעד · {fmt.format(p.participants)} משתתפים פעילים
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">מתוכנן — שלב 1 הרחבה</div>
                    )}
                  </div>
                  <Chip tone={p.status === "active" ? "success" : "muted"}>
                    {p.status === "active" ? "פעיל" : "מתוכנן"}
                  </Chip>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Scalability */}
        <Card>
          <CardHeader
            title="סקיילביליות — הרבה מעבר לסיעוד"
            subtitle="הארכיטקטורה גנרית. מימוש ראשון: סיעוד. הרחבה לכל תחום שבו המדינה מחלקת זכויות ולא מודדת תוצאות."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCALABILITY.map((s, i) => (
              <div
                key={s.domain}
                className={cn(
                  "p-4 rounded-xl border",
                  i === 0 ? "bg-success-soft border-success/30" : "bg-muted/30 border-border",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-bold text-foreground">{s.domain}</div>
                  {i === 0 && <Chip tone="success">פעיל</Chip>}
                </div>
                <div className="text-sm text-foreground/80 mt-1 flex items-start gap-2">
                  <ArrowLeft className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>{s.basket}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.objective}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-l from-primary to-primary-glow text-primary-foreground">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-8 h-8 shrink-0 mt-1" aria-hidden="true" />
            <div>
              <div className="text-lg font-bold">20% דחיית הידרדרות = מעל 2 מיליארד ₪ חיסכון לשנה</div>
              <p className="text-sm opacity-90 mt-1 leading-relaxed">
                לא פיילוט AI נוסף — הרחבת מודל שטח מוכח על תשתית לאומית. ההחלטה כבר התקבלה (החלטת ממשלה 127),
                הפיילוט פעיל (פסגת זאב), הארכיטקטורה מאושרת.
              </p>
              <div className="text-xs opacity-80 mt-3">מועד אחרון להגשה: 30/07/2026 · אישור עקרוני נדרש עד 15/06</div>
            </div>
          </div>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
