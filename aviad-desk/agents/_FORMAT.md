# פורמט הגדרת סוכן

כל קובץ ב-`agents/` מכיל **הגדרת תפקיד ניטרלית בלבד**.

## חובה

```yaml
---
id:            מזהה קצר באנגלית
namespace:     תיקיית הכתיבה הבלעדית
context:       [רשימת קבצי context שנטענים]
cadence:       תדירות לוגית - daily / weekly / on-demand
cost_class:    A (איסוף) / B (סינתזה) / C (עומק)
autonomy:      0-5
---
```

ואז: **Mission** (משפט אחד), **Instructions**, **Output contract**, **Hard limits**, **KPI**.

## אסור בקובץ סוכן

שם ספק, שעת הרצה, `git`, נתיב מוחלט, שם מודל, פקודת CLI.
כל אלה יושבים ב-`runners/`.

## משתנים שהרנר מזריק

`{CONTEXT}` נתיב תיקיית ההקשר | `{OUT}` נתיב הכתיבה | `{DATE}` תאריך היום | `{WEEK}` מזהה שבוע
