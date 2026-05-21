import { useNavigate } from "react-router-dom";
import { Users, Landmark } from "lucide-react";
import { useViewMode, type ViewMode } from "@/hooks/use-view-mode";
import { cn } from "@/lib/utils";

const OPTIONS: { mode: ViewMode; label: string; icon: typeof Users; path: string }[] = [
  { mode: "coordinator", label: "תצוגת מתאמת", icon: Users, path: "/" },
  { mode: "national", label: "תצוגת מדינה", icon: Landmark, path: "/national" },
];

export function ViewToggle() {
  const [mode, setMode] = useViewMode();
  const navigate = useNavigate();

  const handleClick = (option: typeof OPTIONS[number]) => {
    setMode(option.mode);
    navigate(option.path);
  };

  return (
    <div className="flex bg-card border border-border rounded-lg p-1 text-xs" role="tablist" aria-label="בחירת תצוגה">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => handleClick(opt)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 h-7 rounded-md font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
