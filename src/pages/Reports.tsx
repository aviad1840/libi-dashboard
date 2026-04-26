import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/common/Card";
import { FileBarChart2, Download, TrendingUp, Calendar } from "lucide-react";

const REPORTS = [
  { icon: TrendingUp, title: "דוח ניצול הסל הרבעוני", desc: "סקירת ניצול יחידות לפי עולם תוכן ולפי רמת סיעוד.", date: "Q1 2025" },
  { icon: FileBarChart2, title: "דוח התערבויות מונעות", desc: "כל פעולות לב שהתבצעו והשפעתן על מדדי הבדידות.", date: "אפריל 2025" },
  { icon: Calendar, title: "דוח שביעות רצון מטופלים", desc: "ציוני שירות, פידבק ודירוג ספקים.", date: "מרץ 2025" },
];

export default function Reports() {
  return (
    <AppLayout title="דוחות" subtitle="הפקה והורדה של דוחות תקופתיים">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title} className="hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-foreground">{r.title}</div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{r.date}</span>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  <Download className="w-3.5 h-3.5" /> הורדת PDF
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
