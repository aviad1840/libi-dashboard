# רוטין: curator - כיול המערכת

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start curator
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/RUN.md` ופעל לפי שבעת השלבים שם, במדויק.
הנחיית התפקיד שלך היא `aviad-desk/agents/curator.md`. טען מ-`aviad-desk/context/` **רק** את הקבצים שבריף הריצה הדפיס.

## שלב 3 - משימת הריצה

**אתה לא מייצר תוכן. אתה משפר את המערכת על בסיס ראיות.**

1. אסוף אותות מ-`aviad-desk/feedback/` (כולל `feedback/queue/*.jsonl` - פידבק גולמי שנכנס דרך
   ה-gateway בטלגרם, מסווג ל-six קטגוריות: `output_feedback`/`correction`/`preference`/
   `context_change_request`/`decision_change`/`temp_instruction`. **קפל אותו לתוך אותם מדדים כמו
   הפידבק החודשי הרגיל - אל תתייחס אליו כמקור נפרד**), משינויי סטטוס ב-`radar/open.json`,
   ומ-**`state/runs.jsonl`** - שם רשומה כל ריצה.
   **`context_change_request` ו-`decision_change` מהתור מקבלים טיפול נפרד:** אלה בקשות מפורשות
   של אביעד לשנות context/decision, לא איתות שגרתי. סמן אותן בבירור ב-`patches/{WEEK}.md` -
   עדיין הצעה בלבד, **אתה לא מחיל אותן** - אבל הבלטה גבוהה יותר מפידבק אימוג'י רגיל.
2. חשב ל-`aviad-desk/curator/metrics.md`, מגמת 8 שבועות: Precision = `(+ ו-!!) / סך הפריטים` |
   **עלות לממצא מועיל** ו**עלות לממצא חדש** - אלה המדדים הראשיים | דקות אנוש לממצא מועיל | יחס L0/L1/L2.
   **המערכת לא נמדדת על מספר ריצות, פריטים או טוקנים.**
3. כייל `state/sources.json` לפי החוקים שם. **אסור להוריד Tier למקור מתחת ל-20 פריטים ממנו.** הורדה מחייבת שני חלונות רצופים.
4. כייל `state/tempo.json`. **הורדת תדירות - אוטומטית. העלאה - דורשת אישור אביעד, רשום כהמלצה בלבד.**
   היסטרזיס: אין שינוי פעמיים באותו שבוע, ואין שינוי בשבועיים הראשונים כלל.
5. כייל `context/filter.md`: נתח פריטי `-`, מצא דפוס, נסח כלל חוסם, **ובדוק שהוא לא היה חוסם אף פריט `+`. כלל שחוסם פריט חיובי נפסל.**
6. הצע תיקוני הנחיה ל-`aviad-desk/curator/patches/{WEEK}.md`. שינוי אחד לכל היותר לסוכן, עם ראיה. **אסור לך להחיל אותו.**
7. דוח `aviad-desk/curator/report-{WEEK}.md`: האם המערכת משתפרת - כן / לא / שטוח | Precision ומגמה |
   מה שיניתי | מה דורש אישור | **המלצת כיבוי לסוכן ששטוח 3 שבועות.**

**חוק ברזל: שינוי ללא ראיה גרוע מאי-שינוי. אין די אותות - כתוב זאת ואל תשנה דבר.**

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish curator --items N --note "שורה אחת"
```

## שלב 5 - הודעת סיכום
עד 5 שורות: משתפרת / לא / שטוח | Precision ומגמה | מה שינית | מה דורש אישור.
