# CLAUDE.md

הריפו הזה מכיל שני דברים נפרדים. אל תערבב ביניהם.

## 1. `src/` - דשבורד ליבי

אפליקציית React + Vite + TypeScript + Tailwind, בעברית RTL.
`npm run dev` | `npm run build` | `npm run lint` | `npx vitest run`

## 2. `aviad-desk/` - מערכת העובדים האוטונומיים

תשתית סוכנים אישית של אביעד. **אגנוסטית לספק ולמודל.** רצה בענן דרך Routines, גם כשהמחשב סגור.

```
context/     מי אני, מה אני טוען, מה פתוח. כל סוכן קורא מכאן
agents/      הגדרת תפקיד ניטרלית. לא מזכירה ספק, שעה, git או פקודה
runners/     שכבת ההתאמה לפלטפורמה
routines/    הנחיית הרוטין לכל עובד. מקור האמת - ערוך כאן, ואז עדכן את הרוטין
RUN.md       פרוטוקול הריצה. שבעה שלבים, בסדר קבוע
GATEWAY.md   פרוטוקול שכבת הממשק (טלגרם/מייל) - gateway אינו סוכן, ראה שם
scripts/     desk.sh - אתחול, אכיפת בידוד כתיבה, commit, push, ו-fail (רישום כשל)
             telegram_send.py / telegram_fetch.py / email_notify.py / agent_status.py - שכבת הממשק בלבד
             outbox_put.py / outbox_send.py - התור היוצא. ראה למטה
outbox/      התור היוצא. סוכן מתייק לכאן דרך outbox_put.py, gateway שולח דרך outbox_send.py
state/       seen.json (דדופ) · tempo.json (תדירות) · sources.json (ROI) · runs.jsonl (יומן ריצות)
             telegram_offset.txt/telegram_audit.jsonl/pending_approvals.json - gateway בלבד
```

### הכללים שלא נשברים

- **קובץ ב-`agents/` לעולם לא מזכיר `git`, שעה, נתיב מוחלט, שם ספק או שם מודל.** כל זה יושב ב-`runners/`
- **סוכן כותב אך ורק ל-namespace שלו.** חריג יחיד: `curator`. `desk.sh` אוכף
- **אפס תקשורת יוצאת לצד שלישי מכל עובד.** לא מייל, לא הודעה, לא טופס, לא הרשמה, לא לאדם אחר.
  היוצא מהכלל היחיד: הודעה לאביעד עצמו דרך `config/telegram.json`/`EMAIL_TO` - ראה `RUN.md` 7.5
- **נקודת אינטגרציה אחת בלבד.** סוכן תוכן לא שולח בעצמו, לא מחזיק טוקן ולא נוגע ברשת -
  הוא מתייק ל-`outbox/` דרך `outbox_put.py`. `gateway` בלבד שולח, כל שעה, דרך `outbox_send.py`.
  **המשמעות: החלפת ערוץ היציאה היא שינוי של קובץ אחד, לא של כל הסוכנים.**
  ב-`outbox/` סוכן כותב רק קבצים ששמם מתחיל במזהה שלו - `desk.sh` אוכף גם את זה
- **אף עובד לא דוחף ל-`main`.** התוצרים נכנסים דרך PR מ-`desk/log`
- **כל טענה נושאת דירוג ראיה E0-E6.** אין ראיה - כותבים "לא נמצאה ראיה", לא ממציאים
- **מקף רגיל בלבד. לעולם לא em dash**
- **`gateway` אינו agent.** אין לו `agents/gateway.md`, הוא שכבת ניתוב בלבד - ראה `GATEWAY.md`.
  סודות (`TELEGRAM_BOT_TOKEN`, `EMAIL_SMTP_*`) לעולם לא ב-git - ראה `.env.example`

### לפני שאתה נוגע ב-`aviad-desk/`

```bash
python3 aviad-desk/scripts/validate.py
```

בודק שלמות הקשר, עלות טעינה שבועית, ושאף קובץ סוכן לא זלג לתלות בפלטפורמה.

### להריץ עובד ידנית

```bash
bash aviad-desk/scripts/desk.sh start <agent>     # ואז פעל לפי RUN.md
bash aviad-desk/scripts/desk.sh finish <agent> --items N
```

### מה נמדד

עלות לממצא מועיל | עלות לממצא חדש | השפעה על החלטה | דקות אנוש לממצא מועיל.
**לא נמדדים: ריצות, טוקנים, מספר פריטים, מספר סוכנים.**
