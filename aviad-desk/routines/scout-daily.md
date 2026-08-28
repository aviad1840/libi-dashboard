# רוטין: scout - מודיעין יומי

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start scout
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/RUN.md` ופעל לפי שבעת השלבים שם, במדויק.
הנחיית התפקיד שלך היא `aviad-desk/agents/scout.md`. טען מ-`aviad-desk/context/` **רק** את הקבצים שבריף הריצה הדפיס.

## שלב 3 - משימת הריצה

ריצת **L0 יומית**. סרוק כותרות ותאריכים מ-Tier 1 כלפי מטה לפי `context/sources.md`. אל תפתח עמודים בשלב הזה.
הצלב כל מועמד מול `aviad-desk/state/seen.json`. הסלם עד 5 מועמדים ל-L1 לפי `context/ESCALATION.md`.
כתוב ל-`aviad-desk/intel/{DATE}.md` לפי `schemas/intel-item.schema.json`. עדכן את `seen.json`.

**מקסימום 8 פריטים. אין תיוג OQ/C/P/AP/OPP/OWN - הפריט נזרק.**
חדשות AI כלליות בלי הקשר ממשלתי, כותרת בלי החלטה או ראיה, דעה בלי מקור ראשוני - **לא נכנסים.**

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish scout --items N --l0 N --l1 N --l2 N --note "שורה אחת"
```

ודא שקיים PR טיוטה פתוח מ-`desk/log` ל-`main`. אין - פתח אחד בכותרת `aviad-desk: תוצרי עובדים`.

## שלב 5 - הודעת סיכום

כתוב תשובה של **עד 5 שורות**: כמה פריטים נכנסו, הממצא החזק ביותר במשפט אחד עם התיוג שלו,
וכל דגל `דחוף` או `דגל אדום`. אין ממצא - כתוב "ריצה ריקה" ומספר המועמדים שנבדקו. זו ההודעה שאביעד יראה בטלפון.
