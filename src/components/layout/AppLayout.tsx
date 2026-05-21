import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import AppSidebar from "./AppSidebar";
import { PrototypeBanner } from "./PrototypeBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useViewMode } from "@/hooks/use-view-mode";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode] = useViewMode();

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {viewMode === "national" && <PrototypeBanner />}
      {/* Skip-to-content for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        דלג לתוכן הראשי
      </a>

      {/* Desktop sidebar (fixed) */}
      {!isMobile && <AppSidebar />}

      {/* Mobile drawer + backdrop */}
      {isMobile && drawerOpen && (
        <>
          <button
            type="button"
            aria-label="סגור תפריט"
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={closeDrawer}
          />
          <div className="fixed top-0 right-0 z-50 h-screen w-72 max-w-[85vw] shadow-xl animate-fade-in">
            <AppSidebar onNavigate={closeDrawer} />
          </div>
        </>
      )}

      <main
        id="main-content"
        className={cn("min-h-screen", !isMobile && "mr-64")}
      >
        {(title || isMobile) && (
          <header className="px-4 md:px-8 pt-5 md:pt-7 pb-4 md:pb-5 flex items-center md:items-end justify-between gap-3 md:gap-4 border-b border-border bg-background sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="פתח תפריט"
                  aria-expanded={drawerOpen}
                  className="w-10 h-10 shrink-0 rounded-lg border border-border bg-card text-foreground flex items-center justify-center hover:bg-muted transition-colors"
                >
                  {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
              {title && (
                <div className="min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold text-foreground tracking-tight truncate">{title}</h1>
                  {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">{subtitle}</p>}
                </div>
              )}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </header>
        )}
        <div className="p-4 md:p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
