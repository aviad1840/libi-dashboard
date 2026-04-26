import { useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Chip } from "@/components/common/Chip";
import { clients } from "@/data/clients";
import { NURSING_LEVEL_TONE, PERSONA_LABELS, RISK_LABELS } from "@/data/constants";
import { ChevronLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Clients() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | "1" | "2" | "3">("all");
  const [risk, setRisk] = useState<"all" | "risk" | "ok">("all");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`;
      if (query && !fullName.includes(query) && !c.city.includes(query)) return false;
      if (level !== "all" && String(c.nursingLevel) !== level) return false;
      if (risk === "risk" && c.lev.riskFlags.length === 0) return false;
      if (risk === "ok" && c.lev.riskFlags.length > 0) return false;
      return true;
    });
  }, [query, level, risk]);

  const lonelinessTone = (s: number) => (s <= 3 ? "text-destructive" : s <= 5 ? "text-warning" : "text-success");

  return (
    <AppLayout title="מטופלים" subtitle={`סה״כ ${clients.length} מטופלים · ${filtered.length} מוצגים`}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי שם או עיר…"
            className="w-full h-10 pr-10 pl-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as any)}
          className="h-10 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary"
        >
          <option value="all">כל הרמות</option>
          <option value="1">רמה 1</option>
          <option value="2">רמה 2</option>
          <option value="3">רמה 3</option>
        </select>
        <div className="flex bg-card border border-border rounded-lg p-1 text-sm">
          {([
            { v: "all", l: "הכל" },
            { v: "risk", l: "בסיכון" },
            { v: "ok", l: "תקין" },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setRisk(opt.v)}
              className={cn(
                "px-3 h-8 rounded-md font-medium transition-colors",
                risk === opt.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-right font-semibold px-5 py-3">מטופל/ת</th>
                <th className="text-right font-semibold px-3 py-3">רמה</th>
                <th className="text-right font-semibold px-3 py-3 min-w-[180px]">ארנק</th>
                <th className="text-right font-semibold px-3 py-3">פרסונה</th>
                <th className="text-right font-semibold px-3 py-3">בדידות</th>
                <th className="text-right font-semibold px-3 py-3">דגלים</th>
                <th className="text-right font-semibold px-3 py-3">פעילות</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-3">
                    <Link to={`/clients/${c.id}`} className="flex items-center gap-3">
                      <Avatar name={`${c.firstName} ${c.lastName}`} size={36} />
                      <div>
                        <div className="font-semibold text-foreground">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-muted-foreground">{c.age} · {c.city}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("libi-chip", NURSING_LEVEL_TONE[c.nursingLevel])}>רמה {c.nursingLevel}</span>
                  </td>
                  <td className="px-3 py-3 min-w-[180px]">
                    <ProgressBar value={c.wallet.balance} max={c.wallet.total} tone={c.wallet.balance / c.wallet.total < 0.3 ? "warning" : "primary"} size="sm" />
                    <div className="text-xs text-muted-foreground mt-1 tabular-nums">{c.wallet.balance}/{c.wallet.total} יח׳</div>
                  </td>
                  <td className="px-3 py-3 text-foreground/80 text-xs">{PERSONA_LABELS[c.lev.persona].label}</td>
                  <td className="px-3 py-3">
                    <span className={cn("font-bold tabular-nums", lonelinessTone(c.lev.lonelinessScore))}>
                      {c.lev.lonelinessScore}/10
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {c.lev.riskFlags.length === 0 ? (
                      <Chip tone="success">תקין</Chip>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {c.lev.riskFlags.slice(0, 2).map((f) => (
                          <Chip key={f} tone="destructive">{RISK_LABELS[f].label}</Chip>
                        ))}
                        {c.lev.riskFlags.length > 2 && <Chip tone="muted">+{c.lev.riskFlags.length - 2}</Chip>}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{c.lastActivity}</td>
                  <td className="px-3 py-3 text-muted-foreground group-hover:text-primary transition-colors">
                    <Link to={`/clients/${c.id}`}><ChevronLeft className="w-4 h-4" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
