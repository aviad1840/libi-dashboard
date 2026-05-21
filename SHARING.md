# LIBI — ערכת שיתוף

> מסמך זה מרכז את כל הקישורים העובדים לשני הכלים, ‎4 דרכים שונות להפעיל אותם, וטקסטים מוכנים לשליחה לסמנכ"לית/לוועדה.

---

## 1. קישורים ישירים שכבר עובדים (אפס הגדרה)

### צפייה בקוד + תיאור מלא
- 🟢 **PR #2 — גרסת פיילוט**: https://github.com/aviad1840/libi-dashboard/pull/2
- 🟣 **PR #1 — אב-טיפוס בין-משרדי לקול קורא**: https://github.com/aviad1840/libi-dashboard/pull/1

### צפייה בקוד הסניפים (ללא PR)
- Branch A: https://github.com/aviad1840/libi-dashboard/tree/claude/code-review-improvements-Ng0u1
- Branch B: https://github.com/aviad1840/libi-dashboard/tree/claude/inter-ministerial-prototype

### תיעוד טכני מצורף (לוועדה)
- ארכיטקטורה על נימבוס: [`docs/nimbus-architecture.md`](docs/nimbus-architecture.md)
- תוכנית ניהול סיכונים: [`docs/risk-management.md`](docs/risk-management.md)
- ‎README של הפיילוט: [`README.md`](README.md)
- ‎README של האב-טיפוס: [`README.prototype.md`](README.prototype.md)

---

## 2. הרצה חיה — 4 אופציות

### 🚀 אופציה A — Vercel (מומלץ לדמו ציבורי)

**One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aviad1840/libi-dashboard&project-name=libi-dashboard&repository-name=libi-dashboard&demo-title=LIBI%20Dashboard&demo-url=https://github.com/aviad1840/libi-dashboard)

ידני:
1. `npm i -g vercel`
2. `vercel link --confirm` (פעם אחת)
3. `vercel --prod` — מקבלים URL חי תוך ‎60 שניות
4. ה-`vercel.json` כבר מוגדר עם SPA rewrites + cache headers

תוצאה: כתובת `https://libi-dashboard-xxx.vercel.app` שאפשר לשלוח לסמנכ"לית.

### 🌐 אופציה B — StackBlitz (אפס התקנה, מבוסס דפדפן)

פשוט פתח את הקישור — StackBlitz מקמפל את הסניף בענן:

- גרסת פיילוט: https://stackblitz.com/github/aviad1840/libi-dashboard/tree/claude/code-review-improvements-Ng0u1
- אב-טיפוס: https://stackblitz.com/github/aviad1840/libi-dashboard/tree/claude/inter-ministerial-prototype

יתרון: עובד מיד מכל מחשב, אפשר לערוך קוד תוך כדי הצגה.
חסרון: לא URL "ציבורי" של מוצר.

### 💻 אופציה C — מקומית (לדמו פנימי בארגון)

```bash
git clone https://github.com/aviad1840/libi-dashboard.git
cd libi-dashboard
git checkout claude/inter-ministerial-prototype   # או -Ng0u1 לפיילוט
npm install
npm run dev
# → http://localhost:8080
```

יתרון: גם בלי אינטרנט עובד. אופציה הכי בטוחה לחומר רגיש.

### 📱 אופציה D — Build סטטי + מארח פנימי

```bash
git checkout claude/inter-ministerial-prototype
npm install && npm run build
# התוצאה ב-dist/ — אפשר להעלות לכל web server (IIS, nginx, S3)
```

מומלץ ל-Deploy פנים-ארגוני על נימבוס בעתיד.

---

## 3. מסלולי הצגה (Demo Scripts)

### לסמנכ"לית — ‎5 דקות (אב-טיפוס)

| # | מסך | מה אומרים |
|---|------|------------|
| 1 | `/national` | "‎240,000 זכאי סיעוד · ‎4 משרדים · ‎2 מיליארד ₪ חיסכון פוטנציאלי" |
| 2 | `/national` | סוחבים את ה-ROI slider מ-‎20% ל-‎30% — מראים שהמספר משתנה חי |
| 3 | `/national/architecture` | מצביעים על ‎5 השכבות + ‎4 המשרדים + Nimbus |
| 4 | `/national/early-warning` | "המודל מזהה ירידה ‎60 ימים לפני שהיא קורית — ‎87% ביטחון" |
| 5 | `/national/matching` | מחליפים בין קשישים → רואים scoring משתנה חי |
| 6 | `/national/intake` | לוחצים "הפעלת אקסטרקציה" → רואים שדות נחשפים אוטומטית |
| 7 | `/national/proposal` | "ייצוא PDF" — הסמנכ"לית מקבלת מסמך מודפס לוקח איתה |

**משפט סגירה**: "‎20% דחיית הידרדרות = מעל ‎2 מיליארד ₪ חיסכון לשנה. אנחנו צריכים אישור עקרוני שלך עד ‎15/06."

### לוועדת היגוי — ‎15 דקות

הוסף לסקריפט מעל:
- `/national/partners` — ‎8 שותפים
- `/national/outcomes` — Feedback loop
- `/national/assistant` — חיפוש בשפה טבעית
- `docs/risk-management.md` — שואלים על אבטחה
- `docs/nimbus-architecture.md` — שואלים על טכנולוגיה

### למתאמת בפיילוט — ‎5 דקות (גרסה רגילה)

מתחילים ב-`/` (לוח בקרה) → רואים ‎3 פעולות דחופות → לוחצים על פעולה → "התחלת טיפול" → "סיום" → רואים שזה נשמר אחרי refresh.

---

## 4. טקסטים מוכנים לשליחה

### למייל לסמנכ"לית

> נושא: **אב-טיפוס לקול קורא ‎3.0 — מוכן להצגה**
>
> שלום [שם],
>
> מצורף אב-טיפוס מקצה לקצה של החזון שלנו לקול קורא ‎3.0 (מערך הדיגיטל × ‎4 משרדים).
>
> **קישור הצגה**: [URL מהדפלוי של Vercel]
> **תיאור מלא**: https://github.com/aviad1840/libi-dashboard/pull/1
> **תקציר הצעה (להדפסה)**: [URL]/national/proposal
>
> ‎9 מסכים שמדגימים את ‎5 שכבות ה-AI על נימבוס, עם ‎4 משרדים שותפים. אני אשמח להציג בפגישה ביום ראשון, ‎5 דקות מספיקות לסקירה הראשונית.
>
> אביעד

### לוועדת היגוי / שותפים

> נושא: **‎LIBI · עדכון פרויקט + הזמנה לסקירה**
>
> שלום,
>
> בשבועות האחרונים בנינו אב-טיפוס מקצה לקצה שעונה במלואו על דרישות הקול קורא של מערך הדיגיטל הלאומי + המטה ל-AI.
>
> **קוד + תיאור מלא**:
> - פיילוט (פסגת זאב): https://github.com/aviad1840/libi-dashboard/pull/2
> - אב-טיפוס לקול קורא: https://github.com/aviad1840/libi-dashboard/pull/1
>
> **מסמכים טכניים**:
> - [ארכיטקטורה על נימבוס](docs/nimbus-architecture.md)
> - [תוכנית ניהול סיכונים](docs/risk-management.md) — לפי המדריך לשימוש אחראי ב-AI במגזר הציבורי
>
> **דמו אינטראקטיבי**: [URL מהדפלוי]
>
> נשמח לפידבק עד ‎15/06 — המועד לאישור העקרוני מצד השותפים.
>
> אביעד יצחקי · מוביל פיתוח, שותפויות ו-AI · ביטוח לאומי

---

## 5. ניהול הדמו

### לפני כל הצגה
1. גש ל-`/settings` → "איפוס נתוני דמו" — מוודא שהמערכת במצב התחלתי
2. בדוק שאתה במצב "תצוגת מדינה" (toggle בסיידבר)
3. רענן את הדף (F5)

### אם משהו שובר באמצע הצגה
- כל דף עטוף ב-ErrorBoundary — לכל היותר תראה הודעת עברית "משהו השתבש"
- כפתור "נסה שוב" משחזר את הדף
- אם הכל קורס: רענון של הדפדפן וחזרה ל-Home

---

## 6. מספרי מפתח (לזכור בפגישה)

| מספר | מה זה |
|------|--------|
| ‎240,000 | זכאי סיעוד ברמות ‎1-3 |
| ‎2 מיליארד ₪ | חיסכון שנתי פוטנציאלי (20% דחיית הידרדרות) |
| ‎4 משרדים | שותפות חזקה מהמינימום הנדרש (‎3) |
| ‎5 שכבות AI | כפי שמופיע בקול קורא |
| ‎50% | קיצור זמן ועדת זכאות |
| ‎286 / ‎1,692 | משתתפים פעילים / זכאי יעד בפסגת זאב |
| ‎10M ₪ | תקציב כולל מבוקש (6M award + 4M matching) |
| ‎30/07/2026 | מועד הגשה |
| ‎15/06/2026 | מועד אישור עקרוני |

---

**איש קשר טכני**: אביעד יצחקי · aviad@btl.gov.il (placeholder)
