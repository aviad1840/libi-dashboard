# LIBI — ערכת שיתוף

> כל הקישורים העובדים, שלב הפעלה חד-פעמי, וטקסטים מוכנים לשליחה לסמנכ"לית.

---

## 🎯 קישורים חיים (אחרי הפעלת Pages פעם אחת)

### ⚡ הפעלה חד-פעמית (10 שניות — חובה לפני שהקישורים יעבדו)

1. כנס ל: **https://github.com/aviad1840/libi-dashboard/settings/pages**
2. תחת **"Build and deployment"** → **Source**: בחר `Deploy from a branch`
3. תחת **Branch**: בחר `gh-pages` · `/ (root)` · לחץ **Save**
4. המתן 1-2 דקות. הקישורים למטה יעלו לאוויר.

### 🔗 ה-‎3 קישורים העובדים (אחרי השלב לעיל)

| מטרה | קישור |
|------|--------|
| 🏠 **דף בחירה ראשי** | https://aviad1840.github.io/libi-dashboard/ |
| 🟢 **גרסת פיילוט** (פסגת זאב) | https://aviad1840.github.io/libi-dashboard/pilot/ |
| 🟣 **אב-טיפוס בין-משרדי** (קול קורא) | https://aviad1840.github.io/libi-dashboard/prototype/ |

ה-deploy רץ אוטומטית בכל push לסניפים `claude/code-review-improvements-Ng0u1` ו-`claude/inter-ministerial-prototype` דרך GitHub Actions שכבר מוגדרים.

---

## 📋 קישורי קוד וצפייה (פעילים מיד, ללא הגדרה)

### Pull Requests
- 🟢 PR פיילוט (#2): https://github.com/aviad1840/libi-dashboard/pull/2
- 🟣 PR אב-טיפוס (#1): https://github.com/aviad1840/libi-dashboard/pull/1

### סניפים
- A — Pilot: https://github.com/aviad1840/libi-dashboard/tree/claude/code-review-improvements-Ng0u1
- B — Prototype: https://github.com/aviad1840/libi-dashboard/tree/claude/inter-ministerial-prototype

### מסמכים טכניים
- 📐 [ארכיטקטורה על נימבוס](docs/nimbus-architecture.md)
- 🛡️ [תוכנית ניהול סיכונים](docs/risk-management.md)
- 📖 [README פיילוט](README.md)
- 📘 [README אב-טיפוס](README.prototype.md)

---

## 🚀 אופציות פריסה נוספות (אם GH Pages לא מתאים)

### A — הפעלה מקומית (הכי בטוח)
```bash
git clone https://github.com/aviad1840/libi-dashboard.git
cd libi-dashboard
git checkout claude/inter-ministerial-prototype
npm install
npm run dev   # → http://localhost:8080
```

### B — Vercel (אם רוצים URL פרטי)
1. כנס ל-https://vercel.com/new
2. **Import Git Repository** → בחר `aviad1840/libi-dashboard`
3. תן לפרויקט שם חדש (כל שם — לא `libi-dashboard` כי קיים אצלך)
4. **Production Branch** → בחר `claude/inter-ministerial-prototype`
5. Deploy → תוך 60 שניות יש URL

### C — Build סטטי לארגון
```bash
npm install && npm run build
# התוצאה ב-dist/ — מעלים ל-IIS / nginx / נימבוס
```

---

## 🎬 מסלול הצגה לסמנכ"לית (5 דקות)

| # | פעולה | משפט פתיחה |
|---|--------|--------------|
| 1 | פתחי https://aviad1840.github.io/libi-dashboard/ | "‎2 מערכות מקבילות — פיילוט פעיל בפסגת זאב ואב-טיפוס בין-משרדי" |
| 2 | לחיצה על "פתחי את האב-טיפוס" | מגיעים ל-`/national` |
| 3 | סוחבים את ה-ROI slider מ-‎20% ל-‎25% | "כל ‎5% דחיית הידרדרות = ‎500 מיליון ₪ נוספים" |
| 4 | סיידבר → "ארכיטקטורת AI" | "‎5 שכבות AI על נימבוס · ‎4 משרדים שותפים" |
| 5 | סיידבר → "Early Warning" | "המודל מזהה ירידה ‎41 ימים לפני שהיא קורית — ‎87% ביטחון" |
| 6 | סיידבר → "Matching" → לחיצה על קשיש אחר | "כל ציון בא עם הסבר מלא — ‎AI כתמיכת החלטה" |
| 7 | סיידבר → "תקציר הצעה" → "ייצוא PDF" | "מסמך מודפס שאת לוקחת איתך" |

**משפט סגירה**: "‎20% דחיית הידרדרות = מעל ‎2 מיליארד ₪ חיסכון לשנה. צריך אישור עקרוני שלך עד ‎15/06."

---

## 📨 טקסט מוכן לשליחה במייל

> **נושא: אב-טיפוס לקול קורא ‎3.0 — מוכן להצגה**
>
> שלום [שם],
>
> מצורף אב-טיפוס מקצה לקצה לקול קורא ‎3.0 (מערך הדיגיטל × ‎4 משרדים).
>
> **דמו חי**: https://aviad1840.github.io/libi-dashboard/prototype/
> **תקציר הצעה (להדפסה)**: https://aviad1840.github.io/libi-dashboard/prototype/#/national/proposal
> **תיאור מלא + קוד**: https://github.com/aviad1840/libi-dashboard/pull/1
> **ארכיטקטורה + ניהול סיכונים**: https://github.com/aviad1840/libi-dashboard/tree/claude/inter-ministerial-prototype/docs
>
> ‎9 מסכים שמדגימים את ‎5 שכבות ה-AI על נימבוס. אשמח להציג ביום ראשון — ‎5 דקות מספיקות לסקירה ראשונית.
>
> אביעד

---

## 🧹 ניהול הדמו

### לפני כל הצגה
1. פתח את `/settings` במסך → "איפוס נתוני דמו" — מאפס סטטוסים שמורים
2. ודא שהטוגל בסיידבר על "תצוגת מדינה"
3. רענן את הדף (F5)

### אם משהו נשבר
- ErrorBoundary יציג הודעה בעברית "משהו השתבש"
- "נסה שוב" משחזר את הדף
- ב-worst case — רענון של הדפדפן

---

## 📊 מספרי מפתח (לזכור בפגישה)

| מספר | מה זה |
|------|--------|
| ‎240,000 | זכאי סיעוד ברמות ‎1-3 |
| ‎2 מיליארד ₪ | חיסכון שנתי פוטנציאלי (20% דחיית הידרדרות) |
| ‎4 משרדים | שותפות חזקה מהמינימום הנדרש (‎3) |
| ‎5 שכבות AI | כפי שמופיע בקול קורא |
| ‎50% | קיצור זמן ועדת זכאות |
| ‎286 / ‎1,692 | משתתפים פעילים / זכאי יעד בפסגת זאב |
| ‎10M ₪ | תקציב כולל (6M award + 4M matching) |
| ‎30/07/2026 | מועד הגשה |
| ‎15/06/2026 | מועד אישור עקרוני |

---

**איש קשר טכני**: אביעד יצחקי · המוסד לביטוח לאומי
