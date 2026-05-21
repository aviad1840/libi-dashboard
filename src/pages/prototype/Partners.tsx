import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { AssistedDecisionFooter } from "@/components/prototype/AssistedDecisionFooter";
import { MINISTRIES, ECOSYSTEM } from "@/data/national";
import { Building2, Handshake, Mail, Phone } from "lucide-react";

const STATUS_TONE = {
  lead: "primary",
  partner: "success",
  ecosystem: "info",
  data_only: "warning",
} as const;

export default function Partners() {
  return (
    <AppLayout
      title="שותפים בין-משרדיים"
      subtitle="4 משרדים עצמאיים + 4 שותפי אקוסיסטם · יתרון תחרותי בקול קורא"
    >
      <div className="space-y-6 max-w-7xl">
        {/* Lead ministries */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" aria-hidden="true" /> משרדים מובילים — שותפות דאטה מלאה
          </h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            הקול קורא דורש שותפות של 3+ משרדים עצמאיים עם שיתוף דאטה. הפרויקט מציג 4 משרדים — חזק מהמינימום הדרוש.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MINISTRIES.map((m) => (
              <Card key={m.id} className={m.status === "lead" ? "border-primary/40 bg-primary-soft/20" : ""}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground">{m.name}</h3>
                      <Chip tone={STATUS_TONE[m.status]}>{m.statusLabel}</Chip>
                    </div>
                    <div className="text-sm text-foreground mt-2 font-medium">תפקיד</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.role}</p>
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-sm text-foreground font-medium">דאטה שמובא לפרויקט</div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{m.data}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Ecosystem */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Handshake className="w-5 h-5 text-primary" aria-hidden="true" /> שותפי אקוסיסטם
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ECOSYSTEM.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0 font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">{m.name}</h3>
                      <Chip tone={STATUS_TONE[m.status]}>{m.statusLabel}</Chip>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{m.role}</p>
                    <div className="mt-2 pt-2 border-t border-border/60">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{m.data}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <Card className="bg-gradient-to-l from-primary to-primary-glow text-primary-foreground">
          <CardHeader title="איש קשר" subtitle="מוביל הפרויקט · המוסד לביטוח לאומי" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-2xl font-bold">
              אי
            </div>
            <div>
              <div className="text-xl font-bold">אביעד יצחקי</div>
              <div className="text-sm opacity-90">מוביל פיתוח, שותפויות ו-AI · המוסד לביטוח לאומי</div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm opacity-95">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" aria-hidden="true" /> aviad@btl.gov.il</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" aria-hidden="true" /> בקרוב</span>
              </div>
            </div>
          </div>
        </Card>

        <AssistedDecisionFooter />
      </div>
    </AppLayout>
  );
}
