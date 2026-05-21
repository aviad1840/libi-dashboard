import { ShieldCheck } from "lucide-react";

export function AssistedDecisionFooter() {
  return (
    <div className="bg-info-soft border border-info/30 rounded-xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-info text-white flex items-center justify-center shrink-0">
        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="text-sm">
        <div className="font-bold text-info">AI כתמיכת החלטה — לא כהחלפת גורם מקצועי</div>
        <p className="text-info/90 mt-1 leading-relaxed">
          כל המלצה במערכת עוברת אישור של מלווה או עו"ס לפני יישום. תוכנית ניהול סיכונים מתבססת על המדריך הרשמי
          לשימוש אחראי ב-AI במגזר הציבורי של מערך הדיגיטל הלאומי.
        </p>
      </div>
    </div>
  );
}
