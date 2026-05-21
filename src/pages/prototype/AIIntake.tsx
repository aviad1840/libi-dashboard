import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { RoadmapBadge } from "@/components/prototype/RoadmapBadge";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { ScanText, FileText, Stamp, Clock, FileSearch, AlertTriangle } from "lucide-react";

const EXTRACTED = [
  { field: "שם מלא", value: "כהן שרה (ת.ז. ████████)", confidence: 99 },
  { field: "גיל", value: "78", confidence: 99 },
  { field: "ניידות בסיסית", value: "בסיוע קל", confidence: 92 },
  { field: "פעולות יומיומיות (ADL)", value: "5/6 עצמאי", confidence: 88 },
  { field: "מצב קוגניטיבי (MMSE)", value: "28/30", confidence: 95 },
  { field: "אבחנות פעילות", value: "יל\"ד, אוסטיאופורוזיס קלה", confidence: 91 },
  { field: "המלצת רופא", value: "ליווי קהילתי + פיזיותרפיה", confidence: 84 },
  { field: "חוות דעת עו\"ס", value: "סיכון בדידות, נעוריה תרבותיים פעילים", confidence: 79 },
];

export default function AIIntake() {
  return (
    <AppLayout
      title="NLP + OCR · אקסטרקציה אוטומטית מתיקי תביעה"
      subtitle="שכבת AI #1 · 1.7M מסמכים בשנה · 50% קיצור זמן ועדה"
    >
      <div className="space-y-6 max-w-7xl">
        <RoadmapBadge
          milestone="MVP יוני 2027"
          description="MVP בסיסי פעיל היום על 417K הגשות שנתיות. הרחבה לפרופיל תפקודי מלא נכללת ב-roadmap הפיתוח."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card>
            <div className="text-2xl font-bold text-primary tabular-nums">417K</div>
            <div className="text-xs text-muted-foreground">הגשות שנתיות</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-primary tabular-nums">1.7M</div>
            <div className="text-xs text-muted-foreground">מסמכים שנתיים</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-success tabular-nums">50%</div>
            <div className="text-xs text-muted-foreground">קיצור זמן ועדה</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-info tabular-nums">88%</div>
            <div className="text-xs text-muted-foreground">דיוק אקסטרקציה</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Mock document */}
          <Card>
            <CardHeader title="תיק תביעה — מקור" subtitle="PDF סרוק (mockup)" />
            <div className="bg-muted/50 rounded-lg p-6 border-2 border-dashed border-border text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
              <div className="text-sm font-mono text-muted-foreground">claim_24782_cohen_s.pdf</div>
              <div className="mt-4 space-y-2 text-right text-xs text-muted-foreground bg-card rounded p-3 border border-border">
                <div className="h-2 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-full"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-5/6"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-2/3"></div>
                <div className="mt-3 pt-3 border-t border-border">
                  <Chip tone="muted">12 עמודים · 47 שדות</Chip>
                </div>
              </div>
            </div>
          </Card>

          {/* Extracted */}
          <Card>
            <CardHeader title="פרופיל תפקודי — אקסטרקציה" subtitle="NLP + OCR" />
            <div className="space-y-2">
              {EXTRACTED.map((e) => (
                <div key={e.field} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="w-1.5 h-8 rounded-full bg-primary" style={{ opacity: e.confidence / 100 }} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-muted-foreground">{e.field}</div>
                    <div className="text-sm font-semibold text-foreground">{e.value}</div>
                  </div>
                  <Chip tone={e.confidence >= 90 ? "success" : e.confidence >= 80 ? "warning" : "destructive"}>
                    {e.confidence}%
                  </Chip>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Human approval */}
        <Card className="border-warning/40 bg-warning-soft/30">
          <div className="flex items-start gap-4">
            <Stamp className="w-8 h-8 text-warning shrink-0 mt-1" aria-hidden="true" />
            <div className="flex-1">
              <div className="font-bold text-foreground">דרוש אישור מלווה לפני המשך</div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                המודל סימן 2 שדות בביטחון נמוך (חוו"ד עו"ס: 79%, המלצת רופא: 84%). יש לאמת ידנית
                לפני סגירת הזכאות.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  className="px-3 h-9 rounded-lg bg-success text-success-foreground text-sm font-semibold"
                >
                  אישור והעברה לוועדה
                </button>
                <button type="button" className="px-3 h-9 rounded-lg border border-border text-foreground text-sm font-medium">
                  עריכת שדות
                </button>
                <button type="button" className="px-3 h-9 rounded-lg border border-border text-foreground text-sm font-medium">
                  החזרה למבקש
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Process pipeline */}
        <Card>
          <CardHeader title="צינור המידע" subtitle="מהמסמך לפרופיל מובנה" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { icon: FileSearch, title: "1. OCR", desc: "סריקה והפיכת טקסט" },
              { icon: ScanText, title: "2. NLP", desc: "זיהוי ישויות וביטויים" },
              { icon: AlertTriangle, title: "3. דגלים", desc: "סימון לאישור ידני" },
              { icon: Clock, title: "4. ועדה", desc: "50% פחות זמן" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="bg-muted/40 rounded-lg p-4 text-center">
                  <Icon className="w-6 h-6 text-primary mx-auto mb-2" aria-hidden="true" />
                  <div className="font-semibold text-foreground text-sm">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
