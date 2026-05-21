import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { AI_LAYERS, MINISTRIES, ECOSYSTEM } from "@/data/national";
import { Cloud, ShieldAlert, ArrowDown, Database, Building2, Brain, Zap, BarChart3, FileSearch, Network } from "lucide-react";
import { cn } from "@/lib/utils";

const LAYER_ICONS = [FileSearch, Network, Zap, BarChart3, Brain] as const;
const LAYER_COLORS = [
  "from-info-soft to-info-soft border-info/30 text-info",
  "from-primary-soft to-primary-soft border-primary/30 text-primary",
  "from-warning-soft to-warning-soft border-warning/30 text-warning-foreground",
  "from-success-soft to-success-soft border-success/30 text-success",
  "from-destructive-soft to-destructive-soft border-destructive/30 text-destructive",
];

const STATUS_TONE = {
  active: "success",
  developing: "warning",
  planned: "info",
} as const;

export default function Architecture() {
  return (
    <AppLayout
      title="ארכיטקטורת AI על נימבוס"
      subtitle="5 שכבות AI מקצה לקצה · 4 משרדים שותפים · אישור מערך הדיגיטל הלאומי"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Nimbus banner */}
        <Card className="bg-gradient-to-l from-primary to-primary-glow text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Cloud className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold flex items-center gap-2">
                פועל על נימבוס
                <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">מאושר ✓</span>
              </div>
              <p className="text-sm opacity-90 mt-1 leading-relaxed">
                ענן ממשלתי ישראלי — תאימות מלאה לדרישות אבטחה ופרטיות של מערך הדיגיטל הלאומי.
              </p>
            </div>
          </div>
        </Card>

        {/* 5 AI Layers — vertical stack with flow arrows */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">5 שכבות AI</h2>
          <div className="space-y-2">
            {AI_LAYERS.map((layer, i) => {
              const Icon = LAYER_ICONS[i];
              return (
                <div key={layer.id}>
                  <Card className={cn("bg-gradient-to-l border-2", LAYER_COLORS[i])}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-card border-2 border-current flex items-center justify-center font-bold text-lg">
                          {layer.number}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-card/70 border border-current flex items-center justify-center shrink-0 text-current">
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base md:text-lg font-bold text-foreground">{layer.name}</h3>
                          <Chip tone={STATUS_TONE[layer.status]}>{layer.statusLabel}</Chip>
                        </div>
                        <div className="text-sm text-foreground mt-1">{layer.role}</div>
                        <div className="text-xs text-muted-foreground mt-2 flex items-start gap-2 bg-card/60 rounded-lg p-2 border border-border">
                          <span className="font-semibold shrink-0">למה AI חייב:</span>
                          <span>{layer.rationale}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  {i < AI_LAYERS.length - 1 && (
                    <div className="flex justify-center py-1" aria-hidden="true">
                      <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Data sources — 4 ministries */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" aria-hidden="true" /> מקורות דאטה — 4 משרדים שותפים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MINISTRIES.map((m) => (
              <Card key={m.id} className={cn(m.status === "lead" && "border-primary/40 bg-primary-soft/30")}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold text-foreground">{m.name}</div>
                      {m.status === "lead" && <Chip tone="primary">מוביל</Chip>}
                    </div>
                    <div className="text-xs text-foreground/80 mt-1 leading-relaxed">{m.role}</div>
                    <div className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border">
                      <span className="font-semibold">דאטה: </span>
                      {m.data}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Ecosystem */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">שותפי אקוסיסטם</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ECOSYSTEM.map((m) => (
              <Card key={m.id}>
                <div className="font-bold text-foreground">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.role}</div>
                <div className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60">{m.data}</div>
                <Chip tone="muted" className="mt-3">{m.statusLabel}</Chip>
              </Card>
            ))}
          </div>
        </section>

        {/* Risk management */}
        <Card className="bg-warning-soft/40 border-warning/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning text-warning-foreground flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">תוכנית ניהול סיכונים</h3>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                תוכנית ניהול הסיכונים תוגש בהתאם ל<strong>מדריך לשימוש אחראי ב-AI במגזר הציבורי</strong> של
                מערך הדיגיטל הלאומי. סקירה דו-חודשית: פרטיות, סייבר, הוגנות, שקיפות והסבריות מודל. כל שינוי
                בהיקף או באוכלוסיית יעד יחייב Gate Review של פנל Data & Responsible AI.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Chip tone="muted">פרטיות</Chip>
                <Chip tone="muted">סייבר</Chip>
                <Chip tone="muted">הוגנות</Chip>
                <Chip tone="muted">שקיפות</Chip>
                <Chip tone="muted">הסבריות מודל</Chip>
                <Chip tone="muted">Gate Review</Chip>
              </div>
            </div>
          </div>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
