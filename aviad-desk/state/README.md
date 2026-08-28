# state

מצב תפעולי. **לא הקשר, לא תוצר.**

| קובץ | בעלים | תפקיד |
|---|---|---|
| `seen.json` | scout, radar, rival | מניעת דיווח כפול |
| `tempo.json` | curator (מציע), אביעד (מאשר) | תדירות מונעת-ערך |
| `sources.json` | curator | ROI למקור |

**כלל:** אלה קבצים קטנים ומובנים. אם `seen.json` עובר 200KB - הרץ ניקוי לפי `retention_days`.
