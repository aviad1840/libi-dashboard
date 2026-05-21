import { FormEvent, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { clients } from "@/data/clients";
import type { Client } from "@/data/types";
import { Send, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryResult {
  intro: string;
  rationale: string;
  matches: Client[];
}

const SAMPLE_PROMPTS = [
  "מי בסיכון בדידות גבוה בירושלים?",
  "תראי לי מטופלים ברמה 3 עם ירידה תפקודית",
  "פעולות דחופות לטיפול היום",
  "מי לא פעיל יותר מ-14 ימים?",
  "מטופלים עם יתרת ארנק לא מנוצלת",
];

function matchClients(prompt: string): QueryResult {
  const q = prompt.trim();
  let results = [...clients];
  const reasons: string[] = [];

  if (/בדידות|בודד/.test(q)) {
    results = results.filter((c) => c.lev.lonelinessScore <= 3 || c.lev.riskFlags.includes("loneliness"));
    reasons.push("ציון בדידות ≤ 3 או דגל loneliness");
  }
  const lvlMatch = q.match(/רמה\s*([123])/);
  if (lvlMatch) {
    const lvl = Number(lvlMatch[1]);
    results = results.filter((c) => c.nursingLevel === lvl);
    reasons.push(`רמת סיעוד ${lvl}`);
  }
  if (/ירידה תפקודית|תפקודי|נפילה/.test(q)) {
    results = results.filter((c) => c.lev.riskFlags.includes("functional_decline") || c.lev.riskFlags.includes("fall_risk") || c.functional.mobility <= 2);
    reasons.push("דגל ירידה תפקודית/נפילה או mobility ≤ 2");
  }
  if (/לא פעיל|חוסר פעילות|14|לא יצא/.test(q)) {
    results = results.filter((c) => c.daysSinceActivity >= 14);
    reasons.push("daysSinceActivity ≥ 14");
  }
  if (/דחוף|דחופ|עדיפות גבוהה/.test(q)) {
    results = results.filter((c) => c.lev.riskFlags.length >= 2);
    reasons.push("שני דגלי סיכון או יותר");
  }
  if (/יתרה|ארנק/.test(q)) {
    results = results.filter((c) => c.wallet.total > 0 && c.wallet.balance / c.wallet.total >= 0.85);
    reasons.push("≥ 85% מהארנק לא נוצל");
  }
  const cityMatch = q.match(/ב(?:עיר\s*)?([֐-׿\s]+?)(?:$|[?.])/);
  if (cityMatch) {
    const city = cityMatch[1].trim();
    if (city.length > 1 && city.length < 20) {
      const sub = results.filter((c) => c.city.includes(city));
      if (sub.length > 0) {
        results = sub;
        reasons.push(`עיר מכילה "${city}"`);
      }
    }
  }

  return {
    intro: results.length === 0 ? "לא נמצאו תוצאות תואמות." : `נמצאו ${results.length} מטופלים שעונים על הקריטריונים.`,
    rationale: reasons.length === 0 ? "לא זוהו פילטרים — מציג עד 5 מטופלים אקראיים מתוך 75." : `פילטרים שהופעלו: ${reasons.join(" · ")}`,
    matches: results.slice(0, 8),
  };
}

interface Message {
  role: "user" | "assistant";
  text: string;
  result?: QueryResult;
}

export default function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "שלום! אני עוזרת AI עבור מתאמות טיפול. שאלי אותי על הקשישים שלך — אזהה את הקריטריונים, אריץ סינון ואחזיר תוצאות עם רציונל גלוי. כל המלצה כפופה לאישור מקצועי שלך.",
    },
  ]);
  const totalClients = useMemo(() => clients.length, []);

  const ask = (q: string) => {
    const result = matchClients(q);
    setMessages((arr) => [
      ...arr,
      { role: "user", text: q },
      { role: "assistant", text: result.intro, result },
    ]);
    setInput("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    ask(input);
  };

  return (
    <AppLayout
      title="AI Assistant · עוזרת חכמה למתאמות"
      subtitle="הקלידי שאלה בשפה טבעית · המערכת מציגה רציונל שקוף · כל פעולה דורשת אישור מקצועי"
    >
      <div className="space-y-5 max-w-5xl">
        <Card className="bg-warning-soft/30 border-warning/30">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-foreground/80 leading-relaxed">
              <strong>הבהרה:</strong> דמו זה מבוסס heuristic engine מקומי — אין שיחה עם LLM חיצוני, אין שיתוף
              דאטה מחוץ למערכת. במודל הקרוב — חיבור ל-LLM ייעודי בתוך נימבוס תחת בקרה של Data & Responsible AI Review.
            </div>
          </div>
        </Card>

        {/* Sample prompts */}
        <Card>
          <CardHeader title="שאלות לדוגמה" subtitle="לחצי כדי להריץ" />
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => ask(p)}
                className="text-xs px-3 h-8 rounded-lg border border-primary/30 bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Sparkles className="w-3 h-3 inline-block ml-1" aria-hidden="true" /> {p}
              </button>
            ))}
          </div>
        </Card>

        {/* Conversation */}
        <Card>
          <CardHeader title="שיחה" subtitle={`${totalClients} מטופלים במאגר · ניתן לסנן לפי בדידות, רמת סיעוד, עיר, יתרה, פעילות`} />
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-xl",
                  m.role === "user" ? "bg-primary text-primary-foreground mr-auto max-w-[80%]" : "bg-muted/40 ml-auto max-w-[90%]",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {m.role === "user" ? (
                    <span className="text-[10px] uppercase tracking-wider opacity-80">מתאמת</span>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">עוזרת AI</span>
                    </>
                  )}
                </div>
                <div className="text-sm">{m.text}</div>
                {m.result && (
                  <div className="mt-3 bg-card rounded-lg p-3 border border-border">
                    <div className="text-[11px] text-muted-foreground mb-2 italic">{m.result.rationale}</div>
                    {m.result.matches.length === 0 ? (
                      <div className="text-xs text-muted-foreground">ללא תוצאות.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {m.result.matches.map((c) => (
                          <div key={c.id} className="flex items-center gap-2 text-xs">
                            <div className="font-semibold text-foreground">{c.firstName} {c.lastName}</div>
                            <span className="text-muted-foreground">· {c.age} · {c.city}</span>
                            <Chip tone="muted">רמה {c.nursingLevel}</Chip>
                            {c.lev.lonelinessScore <= 3 && <Chip tone="destructive">בדידות {c.lev.lonelinessScore}/10</Chip>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <label htmlFor="assistant-input" className="sr-only">הקלידי שאלה</label>
            <input
              id="assistant-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="לדוגמה: מי בסיכון בדידות גבוה ברמת גן?"
              className="flex-1 h-11 px-4 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex items-center gap-2 px-4 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" aria-hidden="true" /> שלחי
            </button>
          </form>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
