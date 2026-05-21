import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { bookings } from "@/data/mock";
import { getClient } from "@/data/clients";
import { getServiceOrFallback } from "@/data/services";
import { BOOKING_STATUS, CONTENT_WORLDS } from "@/data/constants";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/data/types";

const TABS: { id: BookingStatus | "all"; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "scheduled", label: "מתוכננות" },
  { id: "in_progress", label: "בתהליך" },
  { id: "completed", label: "הושלמו" },
  { id: "cancelled", label: "בוטלו" },
];

export default function Bookings() {
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("all");
  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  return (
    <AppLayout title="הזמנות" subtitle={`${bookings.length} הזמנות סה״כ`}>
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 h-9 rounded-lg text-sm font-medium transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-right font-semibold px-5 py-3">תאריך</th>
                <th className="text-right font-semibold px-3 py-3">מטופל/ת</th>
                <th className="text-right font-semibold px-3 py-3">שירות</th>
                <th className="text-right font-semibold px-3 py-3">תוכן</th>
                <th className="text-right font-semibold px-3 py-3">יחידות</th>
                <th className="text-right font-semibold px-3 py-3">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const c = getClient(b.clientId);
                if (!c) return null;
                const s = getServiceOrFallback(b.serviceId);
                const w = CONTENT_WORLDS[s.world];
                const status = BOOKING_STATUS[b.status];
                return (
                  <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-foreground tabular-nums">{b.date.split("-").reverse().join("/")}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">{b.time}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Link to={`/clients/${c.id}`} className="flex items-center gap-2 hover:text-primary">
                        <Avatar name={`${c.firstName} ${c.lastName}`} size={28} />
                        <span className="font-medium">{c.firstName} {c.lastName}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-foreground">{s.name}</td>
                    <td className="px-3 py-3"><span className={cn("libi-chip", w.colorClass)}>{w.emoji} {w.label}</span></td>
                    <td className="px-3 py-3 font-bold text-foreground tabular-nums">{b.units}</td>
                    <td className="px-3 py-3"><span className={cn("libi-chip", status.tone)}>{status.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
