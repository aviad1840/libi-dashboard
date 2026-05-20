import { Heart } from "lucide-react";

export function RouteFallback() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center animate-pulse-soft">
          <Heart className="w-6 h-6" fill="currentColor" />
        </div>
        <div className="text-sm">טוען…</div>
      </div>
    </div>
  );
}
