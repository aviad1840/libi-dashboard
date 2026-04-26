import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Bell, Globe, Lock, UserCog } from "lucide-react";

const SECTIONS = [
  { icon: UserCog, title: "פרופיל משתמש", desc: "פרטי המתאמת, חתימה ופרטי קשר." },
  { icon: Bell, title: "התראות", desc: "ניהול ערוצי התראה: דוא״ל, SMS ופוש." },
  { icon: Globe, title: "שפה ואזור", desc: "שפת ממשק (עברית), אזור זמן ופורמט תאריך." },
  { icon: Lock, title: "פרטיות ואבטחה", desc: "סיסמה, אימות דו-שלבי וניהול הרשאות." },
];

export default function Settings() {
  return (
    <AppLayout title="הגדרות" subtitle="העדפות מערכת וחשבון">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="hover:border-primary/30 cursor-pointer transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
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
    </AppLayout>
  );
}
