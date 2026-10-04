# רוטין: auditor - בודק

**on-demand בלבד. אין רוטין קבוע בענן.** מופעל inline מתוך ריצה אחרת (producer בסיום עבודתו,
או gateway על בקשה מפורשת), **לא** על ידי שעון. אל תרשום Routine עבורו.

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start auditor
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/RUN.md` ופעל לפי שבעת השלבים שם, במדויק.
הנחיית התפקיד שלך היא `aviad-desk/agents/auditor.md`. טען מ-`aviad-desk/context/` **רק** את הקבצים שבריף הריצה הדפיס.

## שלב 3 - משימת הריצה

**קלט:** נתיב למסמך/תיקייה שממתינה לבדיקה (`{INPUT}` - מוזרק על ידי מי שהפעיל אותך: producer
מצביע על `drafts/<שם>/`, gateway מצביע על מה שאביעד ביקש). **אל תמציא קלט - אם לא ניתן, עצור ודווח.**

בצע את שלושת המעברים לפי `agents/auditor.md` במדויק: אימות עובדתי, Red Team משלוש עמדות,
עקביות ודפוסי כשל. כתוב ל-`aviad-desk/audit/<שם>-review.md`.

**שני היקפי הפעלה שונים - הבחן ביניהם:**

**היקף מלא** (מסמך/טיוטה אמיתית מ-producer או advocate) - שלושת המעברים במלואם.

**היקף מהיר** (ממצא בודד, שורה אחת, שנבחר כ"headline" בבריף היומי) - **מעבר 1 בלבד** (אימות
עובדתי: `source_url` עדיין תומך ב-`summary`, `evidence_level` תואם למה שבאמת נראה, לא מנופח).
**אל תריץ Red Team או ניתוח דפוסי כשל על ממצא בודד - זה חוסר יחס בין עלות לתועלת.**

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish auditor --items 1 --note "שורה אחת - היקף מלא/מהיר, מוכן לשליחה כן/לא"
```

## שלב 5 - החזרת תוצאה למי שהפעיל

**אתה לא שולח לטלגרם ולא לאף ערוץ - אתה מחזיר את התוצאה לתהליך שקרא לך**, בתוך אותו סשן.
שורה תחתונה בלבד: `מוכן: כן / לא / לא לפני תיקון X`. מי שהפעיל אותך (producer/gateway)
מחליט מה לעשות עם זה - כולל אם ואיך להציג לאביעד.
