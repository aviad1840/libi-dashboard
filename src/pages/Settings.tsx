import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Bell, Globe, Lock, UserCog, Database, Trash2 } from "lucide-react";
import { clearAll } from "@/lib/storage";
import { toast } from "sonner";

const SECTIONS = [
  { icon: UserCog, title: "פרופיל משתמש", desc: "פרטי המתאמת, חתימה ופרטי קשר." },
  { icon: Bell, title: "התראות", desc: "ניהול ערוצי התראה: דוא״ל, SMS ופוש." },
  { icon: Globe, title: "שפה ואזור", desc: "שפת ממשק (עברית), אזור זמן ופורמט תאריך." },
  { icon: Lock, title: "פרטיות ואבטחה", desc: "סיסמה, אימות דו-שלבי וניהול הרשאות." },
];

export default function Settings() {
  const handleReset = () => {
    if (!confirm("לאפס את כל הנתונים השמורים מקומית? (סטטוסי פעולות, התראות שנקראו, העדפות תצוגה)")) return;
    clearAll();
    toast.success("הנתונים אופסו. רענני את הדף כדי לראות את המצב ההתחלתי.");
  };

  return (
    <AppLayout title="הגדרות" subtitle="העדפות מערכת וחשבון">
      <div className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="hover:border-primary/30 cursor-pointer transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{s.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader
            title="ניהול נתוני דמו"
            subtitle="כל הנתונים נשמרים מקומית בדפדפן (localStorage תחת libi:v1)"
          />
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/40 border border-border">
            <div className="w-11 h-11 rounded-xl bg-warning-soft text-warning-foreground flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">איפוס נתוני דמו</div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                מחיקת כל הסטטוסים שעודכנו במערכת: פעולות שסומנו כהושלמו, התראות שנקראו, מצב באנרים והעדפת
                תצוגה. השרת והקובץ המקורי אינם נפגעים — חוזרים למצב התחלתי של הדמו.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 flex items-center gap-2 px-3 h-9 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" /> איפוס נתוני דמו
              </button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
