# רוטין: gateway - שער טלגרם/מייל

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start gateway
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/GATEWAY.md` ופעל לפיו במדויק, מ"שלב 2" ואילך (המשיכה המכנית).

**זה לא אחד הסוכנים.** אין `agents/gateway.md` ואין `context_base` קבוע - `GATEWAY.md` הוא ההנחיה המלאה.

## שלב 3 - משיכה ועיבוד

```bash
python3 aviad-desk/scripts/telegram_fetch.py
```

לכל פריט ב-`authorized` שהוחזר: סווג ופעל לפי טבלת הניתוב ב-`GATEWAY.md` (פקודה / שאלה טבעית /
בקשת עומק מפורשת / פידבק / קובץ-קישור / פעולה חיצונית). ענה בקצרה, action-oriented, לא מעל כמה שורות
אלא אם הבקשה עצמה דורשת יותר (למשל `/help`).

**זכור: קריאה זולה כברירת מחדל. עבודת עומק (הרצת סוכן קיים) רק על בקשה מפורשת ("בדוק לעומק"/"תעמיק").**

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish gateway --note "N הודעות, N פקודות, N פידבק, N חסומות"
```

**גם ירייה ריקה מסתיימת ב-finish** - זה מקדם offset ו-audit גם בלי הודעות חדשות.

## שלב 5 - אין הודעת סיכום חוזרת לאביעד

התשובות כבר נשלחו לטלגרם בשלב 3, פריט אחר פריט. אל תשלח סיכום כפול.
אם הייתה שגיאה שמנעה תגובה להודעה כלשהי - ציין זאת ב-`--note` של `finish`, לא בהודעה נוספת לטלגרם.
