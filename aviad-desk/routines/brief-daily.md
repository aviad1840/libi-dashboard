# רוטין: chief-of-staff - הבריף היומי

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start chief-of-staff
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/RUN.md` ופעל לפי שבעת השלבים שם, במדויק.
הנחיית התפקיד שלך היא `aviad-desk/agents/chief-of-staff.md`. טען מ-`aviad-desk/context/` **רק** את הקבצים שבריף הריצה הדפיס.

## שלב 3 - משימת הריצה

**זה התוצר היומי שאביעד קורא בפועל. הוא נמדד על שימושיות, לא על שלמות.**

1. קרא כל קובץ חדש ב-`aviad-desk/inbox/`. חלץ החלטות, התחייבויות (של מי, כלפי מי, עד מתי), חוסמים, שינויי סטטוס.
   **`inbox/` בענן מכיל רק מה שאביעד דחף במפורש. ריק זה תקין** - אל תמציא סטטוס, המשך לסעיף 2.
2. קרא את מה שהעובדים האחרים ייצרו מאז אתמול: `intel/`, `radar/open.json`, `landscape/`, `advocate/`, `people/`.
   **קרא רק קבצים שהשתנו ב-48 שעות האחרונות** (`git log --since=48.hours --name-only`). אל תסרוק את כל ההיסטוריה.
3. עדכן `aviad-desk/desk/state.json` לפי `schemas/portfolio-state.schema.json`.
   מסלול שלא עודכן - `"לא עודכן מאז DD/MM"`. **אל תמציא סטטוס.**
4. כתוב `aviad-desk/desk/brief-{DATE}.md` בסדר הזה:
   - **מה מחר** - מה בלוח לפי `context/calendar.md`, מה להכין, ומה הבטחת שמועדו היום או מחר
   - **דדליינים** - כל מועד מ-`calendar.md` ומ-`radar/open.json` בתוך 30 יום, עם ימים שנותרו. **מתחת ל-14 יום - בראש הדוח.**
   - **דגלים** - כל `דחוף` או `דגל אדום` שהעובדים סימנו מאז אתמול
   - **מה תקוע** - מסלול מעל 14 יום ללא תנועה, הצעה אחת משחררת, ואיזה `AP` מסתמן.
     **מעל 21 יום - המלץ במפורש להקפיא, לא "לעקוב" (AP5).**
5. העבר קובץ inbox מעובד ל-`inbox/processed/`. לא מובן - ל-`inbox/unclear/` עם שורת נימוק. **אל תשאל שאלות.**

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish chief-of-staff --items N --note "שורה אחת"
```

## שלב 5 - הודעת סיכום

**עד 6 שורות, בסדר הזה:** הדדליין הקרוב ביותר וכמה ימים נותרו | דגל אדום או דחוף אם יש |
הדבר האחד שכדאי לעשות היום | מה תקוע הכי הרבה זמן. זו ההודעה שאביעד יראה בטלפון בבוקר.
