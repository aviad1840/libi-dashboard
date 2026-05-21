import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { ScanText, FileText, Stamp, Clock, FileSearch, AlertTriangle, Play, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  source: string;
}

const SAMPLE_DOCS = [
  { id: "doc1", filename: "claim_24782_cohen_s.pdf", pages: 12, fields: 47, client: "כהן שרה" },
  { id: "doc2", filename: "claim_31405_levi_y.pdf", pages: 18, fields: 53, client: "לוי יוסף" },
  { id: "doc3", filename: "claim_28910_peretz_d.pdf", pages: 9, fields: 38, client: "פרץ דוד" },
];

const EXTRACTED_BY_DOC: Record<string, ExtractedField[]> = {
  doc1: [
    { field: "שם מלא + ת.ז.", value: "כהן שרה (ת.ז. ████████)", confidence: 99, source: "כותרת + עמ' 1" },
    { field: "גיל", value: "78", confidence: 99, source: "עמ' 1" },
    { field: "ניידות בסיסית (ADL)", value: "בסיוע קל — 5/6 פעולות עצמאיות", confidence: 92, source: "טופס הערכה תפקודית" },
    { field: "מצב קוגניטיבי (MMSE)", value: "28/30", confidence: 95, source: "הערכת גריאטר" },
    { field: "אבחנות פעילות", value: "יל\"ד · אוסטיאופורוזיס קלה", confidence: 91, source: "סיכום רפואי" },
    { field: "המלצת רופא משפחה", value: "ליווי קהילתי + פיזיותרפיה ביתית", confidence: 84, source: "מכתב רופא" },
    { field: "חוות דעת עו\"ס", value: "סיכון בדידות · נעוריה תרבותיים פעילים", confidence: 79, source: "סיכום עו\"ס" },
    { field: "פרסונה משוערת", value: "חברתית-אקטיבית", confidence: 81, source: "אגרגציה NLP" },
  ],
  doc2: [
    { field: "שם מלא + ת.ז.", value: "לוי יוסף (ת.ז. ████████)", confidence: 99, source: "כותרת" },
    { field: "גיל", value: "82", confidence: 99, source: "עמ' 1" },
    { field: "ניידות בסיסית", value: "בסיוע מלא — מקל הליכה", confidence: 88, source: "הערכה תפקודית" },
    { field: "מצב קוגניטיבי", value: "MMSE 24/30 — ירידה קלה", confidence: 93, source: "גריאטר" },
    { field: "אבחנות פעילות", value: "פוסט-שבץ · יל\"ד · דמנציה קלה", confidence: 96, source: "סיכום קופ\"ח" },
    { field: "המלצת רופא", value: "מעקב נוירולוג + טיפול פיזיותרפיה", confidence: 90, source: "מכתב מומחה" },
    { field: "חוות דעת עו\"ס", value: "תלוי בבן בלבד — חוסר רשת תמיכה", confidence: 73, source: "ביקור בית" },
    { field: "פרסונה משוערת", value: "תלוי-מטפל", confidence: 76, source: "אגרגציה" },
  ],
  doc3: [
    { field: "שם מלא + ת.ז.", value: "פרץ דוד (ת.ז. ████████)", confidence: 99, source: "כותרת" },
    { field: "גיל", value: "75", confidence: 99, source: "עמ' 1" },
    { field: "ניידות בסיסית", value: "ירידה — היו שתי נפילות בחודשיים", confidence: 85, source: "מד\"א + מיון" },
    { field: "מצב קוגניטיבי", value: "MMSE 27/30", confidence: 95, source: "גריאטר" },
    { field: "אבחנות פעילות", value: "אוסטיאופורוזיס · סוכרת מאוזנת", confidence: 92, source: "קופ\"ח" },
    { field: "המלצת רופא", value: "מקל חכם + פיזיותרפיה בבית · דחוף", confidence: 89, source: "אורתופד" },
    { field: "חוות דעת עו\"ס", value: "סיכון נפילה גבוה — להזיז מהר", confidence: 81, source: "ביקור בית" },
    { field: "פרסונה משוערת", value: "ביתי-מסורתי", confidence: 78, source: "אגרגציה" },
  ],
};

type Status = "idle" | "processing" | "done";

export default function AIIntake() {
  const [docId, setDocId] = useState(SAMPLE_DOCS[0].id);
  const [status, setStatus] = useState<Status>("idle");
  const [revealedCount, setRevealedCount] = useState(0);

  const doc = SAMPLE_DOCS.find((d) => d.id === docId);
  const fullExtraction = EXTRACTED_BY_DOC[docId] ?? [];
  const visibleFields = fullExtraction.slice(0, revealedCount);

  useEffect(() => {
    if (status !== "processing") return;
    if (revealedCount >= fullExtraction.length) {
      setStatus("done");
      return;
    }
    const t = window.setTimeout(() => setRevealedCount((n) => n + 1), 320);
    return () => window.clearTimeout(t);
  }, [status, revealedCount, fullExtraction.length]);

  if (!doc) return null;

  const handleStart = () => {
    setStatus("processing");
    setRevealedCount(0);
  };

  const handleReset = () => {
    setStatus("idle");
    setRevealedCount(0);
  };

  const handleApprove = () => {
    toast.success(`התיק של ${doc.client} אושר והועבר לוועדת זכאות.`);
    handleReset();
  };

  const lowConfidenceCount = fullExtraction.filter((f) => f.confidence < 85).length;
  const avgConfidence = fullExtraction.length
    ? Math.round(fullExtraction.reduce((s, f) => s + f.confidence, 0) / fullExtraction.length)
    : 0;

  return (
    <AppLayout
      title="NLP + OCR · אקסטרקציה מתיקי תביעה"
      subtitle="שכבת AI #1 · MVP פעיל היום על 417K הגשות שנתיות · 50% קיצור זמן ועדה"
    >
      <div className="space-y-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <div className="text-2xl font-bold text-info tabular-nums">{avgConfidence}%</div>
            <div className="text-xs text-muted-foreground">דיוק ממוצע (תיק נבחר)</div>
          </Card>
        </div>

        {/* Document picker */}
        <Card>
          <CardHeader title="בחירת תיק לדמו" subtitle="3 תיקי תביעה לדוגמה · אקסטרקציה חיה" />
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DOCS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDocId(d.id);
                  handleReset();
                }}
                aria-pressed={docId === d.id}
                className={cn(
                  "flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium border transition-colors",
                  docId === d.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted",
                )}
              >
                <FileText className="w-4 h-4" aria-hidden="true" /> {d.filename}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Source document */}
          <Card>
            <CardHeader title="תיק תביעה — מקור" subtitle={doc.filename} />
            <div className="bg-muted/50 rounded-lg p-6 border-2 border-dashed border-border text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
              <div className="text-sm font-mono text-muted-foreground">{doc.filename}</div>
              <div className="mt-4 space-y-2 text-right text-xs text-muted-foreground bg-card rounded p-3 border border-border">
                <div className="h-2 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-full"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-5/6"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-2/3"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-4/5"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-3/5"></div>
                <div className="mt-3 pt-3 border-t border-border flex justify-center gap-2">
                  <Chip tone="muted">{doc.pages} עמודים</Chip>
                  <Chip tone="muted">{doc.fields} שדות</Chip>
                  <Chip tone="muted">מטופל: {doc.client}</Chip>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {status === "idle" && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-2 px-3 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors"
                >
                  <Play className="w-4 h-4" aria-hidden="true" /> הפעלת אקסטרקציה
                </button>
              )}
              {status === "processing" && (
                <button
                  type="button"
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 px-3 h-10 rounded-lg bg-primary/60 text-primary-foreground text-sm font-semibold"
                >
                  <ScanText className="w-4 h-4 animate-pulse" aria-hidden="true" /> מעבד… ({revealedCount}/{fullExtraction.length})
                </button>
              )}
              {status === "done" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-3 h-10 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" /> אפס דמו
                </button>
              )}
            </div>
          </Card>

          {/* Extracted profile */}
          <Card>
            <CardHeader
              title="פרופיל תפקודי — אקסטרקציה"
              subtitle={status === "idle" ? "לחצי 'הפעלת אקסטרקציה' כדי להתחיל" : `${visibleFields.length}/${fullExtraction.length} שדות`}
            />
            {visibleFields.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-8 text-center text-sm text-muted-foreground">
                <ScanText className="w-10 h-10 mx-auto mb-2 opacity-50" aria-hidden="true" />
                ממתין להפעלת אקסטרקציה…
              </div>
            ) : (
              <div className="space-y-2">
                {visibleFields.map((e, i) => (
                  <div
                    key={e.field}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-lg bg-muted/30 transition-all",
                      i === visibleFields.length - 1 && status === "processing" && "animate-fade-in ring-2 ring-primary/30",
                    )}
                  >
                    <div className="w-1.5 h-10 rounded-full bg-primary mt-0.5" style={{ opacity: e.confidence / 100 }} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-muted-foreground">{e.field}</div>
                      <div className="text-sm font-semibold text-foreground">{e.value}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">מקור: {e.source}</div>
                    </div>
                    <Chip tone={e.confidence >= 90 ? "success" : e.confidence >= 80 ? "warning" : "destructive"}>
                      {e.confidence}%
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Approval block — only when done */}
        {status === "done" && (
          <Card className={cn("border-2 animate-fade-in", lowConfidenceCount > 0 ? "border-warning/40 bg-warning-soft/30" : "border-success/40 bg-success-soft/30")}>
            <div className="flex items-start gap-4">
              {lowConfidenceCount > 0 ? (
                <Stamp className="w-8 h-8 text-warning shrink-0 mt-1" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-success shrink-0 mt-1" aria-hidden="true" />
              )}
              <div className="flex-1">
                <div className="font-bold text-foreground">
                  {lowConfidenceCount > 0
                    ? `דרוש אישור מלווה — ${lowConfidenceCount} שדות בביטחון נמוך`
                    : "כל השדות אומתו בביטחון גבוה — מוכן לוועדה"}
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {lowConfidenceCount > 0
                    ? "המודל סימן שדות בביטחון נמוך מ-85%. נדרשת סקירה ידנית לפני סגירת הזכאות."
                    : "כל השדות נמשכו בביטחון >= 85%. ניתן להעביר ישירות לוועדה — חיסכון של ~50% בזמן הטיפול."}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="px-3 h-9 rounded-lg bg-success text-success-foreground text-sm font-semibold"
                  >
                    אישור והעברה לוועדה
                  </button>
                  <button type="button" className="px-3 h-9 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted">
                    עריכת שדות
                  </button>
                  <button type="button" className="px-3 h-9 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted">
                    החזרה למבקש להשלמות
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Process pipeline */}
        <Card>
          <CardHeader title="צינור המידע" subtitle="מהמסמך לפרופיל מובנה" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { icon: FileSearch, title: "1. OCR", desc: "סריקה והפיכת טקסט", active: status !== "idle" },
              { icon: ScanText, title: "2. NLP", desc: "זיהוי ישויות וביטויים", active: status !== "idle" && revealedCount > 2 },
              { icon: AlertTriangle, title: "3. דגלים", desc: "סימון לאישור ידני", active: status === "done" },
              { icon: Clock, title: "4. ועדה", desc: "50% פחות זמן", active: status === "done" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className={cn(
                    "rounded-lg p-4 text-center transition-colors",
                    s.active ? "bg-primary-soft border border-primary/30" : "bg-muted/40 border border-border",
                  )}
                >
                  <Icon className={cn("w-6 h-6 mx-auto mb-2", s.active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                  <div className={cn("font-semibold text-sm", s.active ? "text-foreground" : "text-muted-foreground")}>{s.title}</div>
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
