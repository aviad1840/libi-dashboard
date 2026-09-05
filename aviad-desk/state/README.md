# state

מצב תפעולי. **לא הקשר, לא תוצר.**

| קובץ | בעלים | תפקיד |
|---|---|---|
| `seen.json` | scout, radar, rival | מניעת דיווח כפול |
| `tempo.json` | curator (מציע), אביעד (מאשר) | תדירות מונעת-ערך |
| `sources.json` | curator | ROI למקור |
| `runs.jsonl` | כל סוכן, דרך `desk.sh finish` | יומן ריצות - המקור לעלות לממצא מועיל |
| `telegram_offset.txt` | gateway בלבד | מצביע ה-`getUpdates` האחרון שעובד |
| `telegram_audit.jsonl` | gateway בלבד | יומן ביקורת - כל הודעה נכנסת, מאושרת או לא |
| `pending_approvals.json` | gateway בלבד | פעולות חיצוניות שממתינות לאישור מפורש בטלגרם |

**כלל:** אלה קבצים קטנים ומובנים. אם `seen.json` עובר 200KB - הרץ ניקוי לפי `retention_days`.
אם `telegram_audit.jsonl` תופח - זה לא נמחק אוטומטית. ראה `GATEWAY.md` לפני שאתה נוגע בו.
