import { useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { Avatar } from "@/components/common/Avatar";
import { clients, getClient } from "@/data/clients";
import { CONTENT_WORLDS, PERSONA_LABELS } from "@/data/constants";
import { rankServices, rankCompanions } from "@/lib/matching";
import { Brain, Sparkles, UserCheck, ArrowLeft, Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Matching() {
  const [selectedId, setSelectedId] = useState("c1");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 150);

  const selected = getClient(selectedId);
  const persona = selected ? PERSONA_LABELS[selected.lev.persona] : null;

  const filteredClients = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return clients.slice(0, 8);
    return clients
      .filter((c) => `${c.firstName} ${c.lastName}`.includes(q) || c.city.includes(q))
      .slice(0, 8);
  }, [debouncedQuery]);

  const serviceMatches = useMemo(() => (selected ? rankServices(selected, 3) : []), [selected]);
  const companionMatches = useMemo(() => (selected ? rankCompanions(selected, 2) : []), [selected]);

  if (!selected || !persona) return null;

  const handleApprove = () => {
    toast.success("ההמלצות אושרו והועברו לתיאום ספק. מלווה תקבל את הפרטים.");
  };

  return (
    <AppLayout
      title="Matching Engine · התאמת סל ומלווה לפרופיל"
      subtitle="שכבת AI #2 · scoring מוסבר · 18 שירותים × 5 מלוות = 90 צירופים אפשריים"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Client picker */}
        <Card>
          <CardHeader title="בחירת מטופל" subtitle="חיפוש מתוך 75 קשישים בפיילוט · המנגנון מתעדכן בזמן אמת" />
          <div className="relative max-w-md mb-3">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש לפי שם או עיר…"
              className="w-full h-10 pr-10 pl-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredClients.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                aria-pressed={selectedId === c.id}
                className={cn(
                  "flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium border transition-colors",
                  selectedId === c.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted",
                )}
              >
                <Avatar name={`${c.firstName} ${c.lastName}`} size={22} tone={selectedId === c.id ? "primary" : "default"} />
                {c.firstName} {c.lastName}
              </button>
            ))}
            {filteredClients.length === 0 && (
              <div className="text-xs text-muted-foreground py-2">לא נמצאו תוצאות.</div>
            )}
          </div>
        </Card>

        {/* Selected profile */}
        <Card className="bg-primary-soft/30 border-primary/20">
          <div className="flex items-start gap-4">
            <Avatar name={`${selected.firstName} ${selected.lastName}`} size={64} tone="primary" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">פרופיל לאלגוריתם</div>
              <div className="text-xl font-bold text-foreground">{selected.firstName} {selected.lastName}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Chip tone="primary">{persona.emoji} {persona.label}</Chip>
                <Chip tone="muted">רמה {selected.nursingLevel}</Chip>
                <Chip tone={selected.lev.lonelinessScore <= 3 ? "destructive" : "muted"}>
                  בדידות {selected.lev.lonelinessScore}/10
                </Chip>
                <Chip tone="warning">ארנק {selected.wallet.balance}/{selected.wallet.total}</Chip>
                <Chip tone="muted">ניידות {selected.functional.mobility}/5</Chip>
              </div>
              {selected.lev.meaningTags.length > 0 && (
                <div className="text-xs text-muted-foreground mt-3">
                  <span className="font-semibold">תגי משמעות: </span>
                  {selected.lev.meaningTags.join(" · ")}
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground">חלום</div>
              <div className="text-sm font-semibold text-foreground max-w-xs">{selected.lev.dream}</div>
            </div>
          </div>
        </Card>

        {/* Service matches */}
        <Card>
          <CardHeader
            title="Top-3 שירותים מומלצים"
            subtitle={`מתוך 18 שירותים בקטלוג · score מחושב לכל אחד מ-6 פרמטרים`}
          />
          <div className="space-y-3">
            {serviceMatches.map((m, i) => {
              const s = m.service;
              const w = CONTENT_WORLDS[s.world];
              const isAffordable = selected.wallet.balance >= s.units;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "p-4 rounded-xl border-2 bg-card transition-colors",
                    i === 0 ? "border-primary/40 bg-primary-soft/20" : "border-border",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold",
                        i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      <div className="text-[10px] opacity-80">#</div>
                      <div className="text-lg leading-none">{i + 1}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{s.name}</h3>
                        <span className={"libi-chip " + w.colorClass}>{w.emoji} {w.label}</span>
                        <Chip tone="muted">{s.subsidy}% סבסוד · {s.units} יח׳</Chip>
                        {!isAffordable && <Chip tone="destructive">⚠ חורג מהיתרה</Chip>}
                      </div>
                      <div className="text-xs text-muted-foreground">{s.description} · ספק: {s.vendor}</div>
                      <div className="mt-3">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                          רציונל החישוב ({m.reasons.length} סיבות)
                        </div>
                        <ul className="space-y-1">
                          {m.reasons.map((r) => (
                            <li
                              key={r}
                              className={cn(
                                "text-xs flex items-center gap-2",
                                r.includes("⚠") ? "text-destructive" : "text-foreground",
                              )}
                            >
                              <Sparkles className="w-3 h-3 text-primary shrink-0" aria-hidden="true" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <div
                        className={cn(
                          "text-3xl md:text-4xl font-bold tabular-nums",
                          m.score >= 80 ? "text-success" : m.score >= 60 ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {m.score}
                      </div>
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
          <CardHeader title="Top-2 מלוות מותאמות" subtitle="מתוך 5 מלוות מאושרות · התאמת ניסיון + פרסונה + צורך" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companionMatches.map((c, i) => (
              <div
                key={c.id}
                className={cn(
                  "p-4 rounded-xl border-2",
                  i === 0 ? "border-primary/40 bg-primary-soft/20" : "border-border bg-card",
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size={48} tone="primary" />
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.speciality}</div>
                  </div>
                  <div
                    className={cn(
                      "text-3xl font-bold tabular-nums",
                      c.score >= 80 ? "text-success" : "text-primary",
                    )}
                  >
                    {c.score}
                  </div>
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
              <div className="font-bold text-foreground">איך מתחשב ה-score (שקיפות מלאה)</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                התחלה מ-50 נקודות בסיס. תוספות לפי: <strong>התאמת פרסונה לעולם תוכן</strong> (עד +40), אחוז סבסוד
                (+5/+12), יתרת ארנק (+8 / −20 חריגה), מענה לדגלי סיכון פעילים (+8 / +12), תגי משמעות אישיים (+6).
                אין משקלים נסתרים. כל סיבה מוצגת לעין.
              </p>
            </div>
          </div>
        </Card>

        {/* Approval */}
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-success" aria-hidden="true" />
              <div>
                <div className="font-bold text-foreground">אישור מלווה נדרש</div>
                <div className="text-xs text-muted-foreground">המערכת לא תבצע הזמנות ללא חתימת המתאמת</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApprove}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-success text-success-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              אשרי והעברה לתיאום ספק <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
