import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { alerts as initialAlerts } from "@/data/mock";
import { ALERT_SEVERITY } from "@/data/constants";
import { CheckCircle2, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Alerts() {
  const [items, setItems] = useState(initialAlerts);

  const resolve = (id: string) => setItems((arr) => arr.map((a) => (a.id === id ? { ...a, resolved: true, read: true } : a)));
  const markRead = (id: string) => setItems((arr) => arr.map((a) => (a.id === id ? { ...a, read: true } : a)));

  const open = items.filter((a) => !a.resolved);
  const resolved = items.filter((a) => a.resolved);

  return (
    <AppLayout title="התראות" subtitle={`${open.length} פתוחות · ${items.filter((a) => !a.read).length} חדשות`}>
      <div className="max-w-4xl space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">פתוחות</h2>
          <div className="space-y-2">
            {open.length === 0 && <Card className="text-center py-10 text-muted-foreground text-sm">אין התראות פתוחות 🎉</Card>}
            {open.map((a) => {
              const sev = ALERT_SEVERITY[a.severity];
              return (
                <Card
                  key={a.id}
                  className={cn(
                    "flex items-start gap-4 transition-colors cursor-pointer",
                    !a.read && "border-r-4 border-r-primary"
                  )}
                  padded={false}
                >
                  <div className="flex items-start gap-4 p-4 w-full" onClick={() => markRead(a.id)}>
                    <div className={cn("w-2.5 h-2.5 rounded-full mt-2 shrink-0", a.read ? "bg-border" : "bg-primary animate-pulse-soft")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn("libi-chip border", sev.tone)}>{sev.label}</span>
                        <span className="text-xs text-muted-foreground">{a.createdAt}</span>
                      </div>
                      <div className="font-semibold text-foreground">{a.title}</div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{a.description}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); resolve(a.id); }}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-success text-success-foreground text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> סגור
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {resolved.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <BellOff className="w-4 h-4" /> נסגרו
            </h2>
            <div className="space-y-2 opacity-70">
              {resolved.map((a) => (
                <Card key={a.id} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground line-through">{a.title}</span>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
