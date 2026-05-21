import { Sparkles, X } from "lucide-react";
import { usePersistedState } from "@/hooks/use-persisted-state";

export function PrototypeBanner() {
  const [dismissed, setDismissed] = usePersistedState("prototype-banner-dismissed", false);
  if (dismissed) return null;
  return (
    <div className="bg-gradient-to-l from-primary to-primary-glow text-primary-foreground text-xs py-2 px-4 flex items-center justify-center gap-2 print:hidden">
      <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="font-medium text-center">
        אב-טיפוס לקול קורא 3.0 · מערך הדיגיטל הלאומי × 4 משרדים · מסמך אסטרטגי
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="סגור באנר"
        className="w-6 h-6 rounded hover:bg-primary-foreground/10 flex items-center justify-center mr-1"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
