import { NavLink, useLocation } from "react-router-dom";
import {
  Heart,
  LayoutDashboard,
  Sparkles,
  Users,
  Calendar,
  Bell,
  FileBarChart2,
  Settings,
  LogOut,
  Landmark,
  GitBranch,
  Brain,
  Activity,
  Handshake,
  FileText,
  ScanText,
  Workflow,
  MessageSquare,
} from "lucide-react";
import { stats } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/hooks/use-view-mode";
import { ViewToggle } from "./ViewToggle";

type IconType = typeof Heart;

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
  end?: boolean;
  badge?: number;
  badgeTone?: "destructive";
}

const COORDINATOR_NAV: NavItem[] = [
  { to: "/", label: "לוח בקרה", icon: LayoutDashboard, end: true },
  { to: "/actions", label: "פעולות לב", icon: Sparkles, badge: stats.pendingActions },
  { to: "/clients", label: "מטופלים", icon: Users },
  { to: "/bookings", label: "הזמנות", icon: Calendar },
  { to: "/alerts", label: "התראות", icon: Bell, badge: stats.alertsUnread, badgeTone: "destructive" },
  { to: "/reports", label: "דוחות", icon: FileBarChart2 },
  { to: "/settings", label: "הגדרות", icon: Settings },
];

const NATIONAL_NAV: NavItem[] = [
  { to: "/national", label: "מבט לאומי", icon: Landmark, end: true },
  { to: "/national/architecture", label: "ארכיטקטורת AI", icon: GitBranch },
  { to: "/national/early-warning", label: "Early Warning", icon: Activity },
  { to: "/national/intake", label: "NLP + OCR Intake", icon: ScanText },
  { to: "/national/matching", label: "Matching Engine", icon: Brain },
  { to: "/national/outcomes", label: "Outcome Monitoring", icon: Workflow },
  { to: "/national/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/national/partners", label: "שותפים", icon: Handshake },
  { to: "/national/proposal", label: "תקציר הצעה", icon: FileText },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export default function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { pathname } = useLocation();
  const [mode] = useViewMode();
  const nav = mode === "national" ? NATIONAL_NAV : COORDINATOR_NAV;
  const groupLabel = mode === "national" ? "תצוגת מדינה / AI" : "תצוגת מתאמת";

  return (
    <aside
      className="fixed top-0 right-0 h-screen w-64 md:w-64 border-l border-border bg-sidebar flex flex-col z-30"
      aria-label="ניווט ראשי"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5" fill="currentColor" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none text-primary">לב</div>
            <div className="text-[11px] text-muted-foreground mt-1">לוח בקרה</div>
          </div>
        </div>
        <div className="mt-4">
          <ViewToggle />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <div className="px-3 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {groupLabel}
        </div>
        <div className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      "min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center tabular-nums",
                      item.badgeTone === "destructive"
                        ? "bg-destructive text-destructive-foreground"
                        : active
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary text-primary-foreground",
                    )}
                    aria-label={`${item.badge} פריטים פתוחים`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-sm font-semibold"
            aria-hidden="true"
          >
            שמ
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-sidebar-foreground truncate">שרית מזרחי</div>
            <div className="text-[11px] text-muted-foreground truncate">מתאמת טיפול</div>
          </div>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-destructive transition-colors"
            aria-label="יציאה מהמערכת"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
