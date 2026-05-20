import { Link, useLocation } from "react-router-dom";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-10 shadow-sm">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center mb-4">
          <Compass className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">עמוד לא נמצא</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          הכתובת <span className="font-mono text-foreground/70" dir="ltr">{location.pathname}</span> לא קיימת במערכת.
          ייתכן שהקישור ישן, או שהדף הועבר.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors"
        >
          <Home className="w-4 h-4" /> חזרה לעמוד הראשי
        </Link>
      </div>
    </div>
  );
}
