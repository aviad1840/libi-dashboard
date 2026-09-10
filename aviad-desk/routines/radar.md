# רוטין: radar - הזדמנויות ודדליינים

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start radar
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/RUN.md` ופעל לפי שבעת השלבים שם, במדויק.
הנחיית התפקיד שלך היא `aviad-desk/agents/radar.md`. טען מ-`aviad-desk/context/` **רק** את הקבצים שבריף הריצה הדפיס.

## שלב 3 - משימת הריצה

סרוק מקורות הזדמנויות: קולות קוראים, תחרויות, RFI, מכרזים, כנסים, קולות קוראים להרצאות, מלגות, מינויים, משרות.
הצלב מול `context/calendar.md` ומול `state/seen.json`. **אל תדווח שוב על הזדמנות קיימת אלא אם הדדליין, התנאים או הסטטוס השתנו.**
לכל הזדמנות קבע רלוונטיות מול המסלולים ב-`_index`. **הזדמנות שלא מקדמת את היעד לא נכנסת.**

עדכן `aviad-desk/radar/open.json` לפי `schemas/opportunity.schema.json`. הזדמנות שעבר מועדה - העבר ל-`aviad-desk/radar/archive/`.

**התראות:** דדליין בתוך 30 יום - סמן. בתוך 14 יום - סמן בכל ריצה. הזדמנות חדשה עם דדליין קצר מ-21 יום - **דגל דחוף בראש הדוח.**

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish radar --items N --l0 N --l1 N --l2 0 --note "שורה אחת"
```

## שלב 5 - הודעת סיכום
עד 5 שורות: הזדמנויות חדשות, כל דדליין מתחת ל-14 יום, וכל דגל דחוף.
