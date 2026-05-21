import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { PROPOSAL_BUDGET, NATIONAL_KPIS, ROADMAP, SCALABILITY } from "@/data/national";
import { Printer, CheckCircle2, CircleDot, Circle, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

function MilestoneIcon({ status }: { status: "done" | "current" | "future" }) {
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />;
  if (status === "current") return <CircleDot className="w-4 h-4 text-primary" aria-hidden="true" />;
  return <Circle className="w-4 h-4 text-muted-foreground" aria-hidden="true" />;
}

export default function Proposal() {
  return (
    <AppLayout
      title="תקציר הצעה לוועדת היגוי"
      subtitle="קול קורא 3.0 · מערך הדיגיטל הלאומי × המטה הלאומי ל-AI"
      actions={
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" aria-hidden="true" /> ייצוא PDF
        </button>
      }
    >
      <div className="space-y-6 max-w-4xl print:space-y-3">
        {/* Headline */}
        <Card className="bg-gradient-to-l from-primary to-primary-glow text-primary-foreground">
          <div className="text-xs uppercase tracking-wider opacity-80">תשתית AI לשירות ציבורי מותאם אישית לאזרח</div>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">הרחבה לאומית של מודל שטח מוכח</h2>
          <div className="text-sm opacity-90 mt-2">מניעת הידרדרות והזדקנות מיטבית</div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <div className="text-xs opacity-80">תקציב מבוקש</div>
              <div className="text-xl font-bold tabular-nums">6 מיליון ₪</div>
            </div>
            <div>
              <div className="text-xs opacity-80">Matching</div>
              <div className="text-xl font-bold tabular-nums">50% (4 מיליון)</div>
            </div>
            <div>
              <div className="text-xs opacity-80">מועד הגשה</div>
              <div className="text-xl font-bold tabular-nums">30/07/2026</div>
            </div>
          </div>
        </Card>

        {/* Why now */}
        <Card>
          <CardHeader title="א. למה עכשיו" />
          <p className="text-sm text-foreground leading-relaxed">
            <strong>החלטת ממשלה 127</strong> קבעה את מפת המדדים להזדקנות מיטבית. ועדה בין-משרדית כבר אישרה מעבר
            למודל שירותים וסל אישי בסיעוד (מסגרת תקציבית ~5 מיליארד ₪ שנתי). זו לא תוכנית חדשה — זו החלטה שכבר התקבלה.
            הקול קורא מספק את הכלי AI לממש אותה בסקייל לאומי.
          </p>
        </Card>

        {/* Challenge */}
        <Card>
          <CardHeader title="ב. האתגר הלאומי" />
          <p className="text-sm text-foreground leading-relaxed">
            כ-<strong>240,000 זכאי סיעוד</strong> ברמות 1-3 מקבלים שירות אחיד שאינו מותאם למצבם המשתנה.
            התוצאה: הידרדרות מזוהה מאוחר, עומס על ועדות, ואין מדידת תוצאות רוחבית.
          </p>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-foreground tabular-nums">1,692</div>
              <div className="text-[11px] text-muted-foreground">זכאי יעד בפיילוט</div>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-foreground tabular-nums">286</div>
              <div className="text-[11px] text-muted-foreground">משתתפים פעילים</div>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-foreground tabular-nums">6,204</div>
              <div className="text-[11px] text-muted-foreground">שלב 1 הרחבה</div>
            </div>
            <div className="bg-primary-soft rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-primary tabular-nums">240,000</div>
              <div className="text-[11px] text-muted-foreground">יעד ארצי</div>
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <Card>
          <CardHeader title="ה. אימפקט מדיד · KPIs לוועדה" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-right font-semibold pb-2">מדד</th>
                  <th className="text-right font-semibold pb-2">יעד</th>
                </tr>
              </thead>
              <tbody>
                {NATIONAL_KPIS.map((k) => (
                  <tr key={k.label} className="border-b border-border/50 last:border-0 print:break-inside-avoid">
                    <td className="py-2 font-semibold text-foreground">{k.label}</td>
                    <td className="py-2 text-foreground">{k.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader title="ו. תקציב · 50% Matching" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-right font-semibold pb-2">סעיף</th>
                  <th className="text-right font-semibold pb-2">תקציב זכייה</th>
                  <th className="text-right font-semibold pb-2">תקציב משרדים</th>
                  <th className="text-right font-semibold pb-2">סה"כ</th>
                </tr>
              </thead>
              <tbody>
                {PROPOSAL_BUDGET.items.map((item) => (
                  <tr key={item.label} className="border-b border-border/50 last:border-0">
                    <td className="py-2 text-foreground">{item.label}</td>
                    <td className="py-2 tabular-nums text-foreground">{item.award} מ׳ ₪</td>
                    <td className="py-2 tabular-nums text-foreground">{item.matching} מ׳ ₪</td>
                    <td className="py-2 tabular-nums font-semibold text-foreground">{item.award + item.matching} מ׳ ₪</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-3">סה"כ</td>
                  <td className="py-3 tabular-nums text-primary">{PROPOSAL_BUDGET.awardShare} מ׳ ₪</td>
                  <td className="py-3 tabular-nums">{PROPOSAL_BUDGET.matchingShare} מ׳ ₪</td>
                  <td className="py-3 tabular-nums text-primary">{PROPOSAL_BUDGET.total} מ׳ ₪</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 flex items-start gap-2">
            <Banknote className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span>הארנק עצמו (~₪1,200/אזרח/חודש) ממומן מגמלת הסיעוד הקיימת — לא תקציב חדש.</span>
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader title="ז. לוח זמנים" />
          <ol className="space-y-2">
            {ROADMAP.map((m) => (
              <li key={m.date} className="flex items-center gap-3 print:break-inside-avoid">
                <MilestoneIcon status={m.status} />
                <div className="text-xs text-muted-foreground tabular-nums w-32 shrink-0">{m.date}</div>
                <div className={cn("text-sm", m.status === "current" && "text-primary font-semibold")}>{m.title}</div>
              </li>
            ))}
          </ol>
        </Card>

        {/* Scalability */}
        <Card>
          <CardHeader title="ח. סקיילביליות מעבר לסיעוד" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SCALABILITY.map((s, i) => (
              <div key={s.domain} className={cn("p-3 rounded-lg border", i === 0 ? "bg-success-soft border-success/30" : "bg-muted/30 border-border")}>
                <div className="flex items-center gap-2">
                  <div className="font-bold text-foreground">{s.domain}</div>
                  {i === 0 && <Chip tone="success">פעיל</Chip>}
                </div>
                <div className="text-xs text-foreground/80 mt-1">{s.basket}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{s.objective}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ask */}
        <Card className="bg-warning-soft/40 border-warning/30">
          <CardHeader title="ט. מה מבקשים מכם · עד 15/06/2026" />
          <ol className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2"><span className="font-bold">1.</span> אישור עקרוני להגשה משותפת — ברמת מנכ"ל/סמנכ"ל</li>
            <li className="flex items-start gap-2"><span className="font-bold">2.</span> מינוי איש קשר לצוות הגיבוש (2-3 פגישות עד ההגשה)</li>
            <li className="flex items-start gap-2"><span className="font-bold">3.</span> אישור עקרוני של הלשכה המשפטית לשיתוף דאטה על נימבוס</li>
          </ol>
          <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
            <strong>מה לא צריך עכשיו:</strong> תקציב מאושר (רק מחויבות עקרונית ל-Matching), אפיון מלא
            (יש ליווי מקצועי ממערך הדיגיטל), הסכם חתום (יחתם לקראת ההגשה).
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-l from-primary to-primary-glow text-primary-foreground">
          <div className="text-xl font-bold">20% דחיית הידרדרות = מעל 2 מיליארד ₪ חיסכון לשנה</div>
          <div className="text-sm opacity-90 mt-2">איש קשר: אביעד יצחקי · המוסד לביטוח לאומי</div>
        </Card>
      </div>
    </AppLayout>
  );
}
