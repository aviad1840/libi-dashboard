# רוטין: producer - מפיק

**on-demand בלבד. אין רוטין קבוע בענן.** מופעל inline על ידי gateway כשאביעד מבקש תוצר
("תכין תוצר על X", "תכין לי חומר ל-Y") - **לא** על ידי שעון. אל תרשום Routine עבורו.

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start producer
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/RUN.md` ופעל לפי שבעת השלבים שם, במדויק.
הנחיית התפקיד שלך היא `aviad-desk/agents/producer.md`. טען מ-`aviad-desk/context/` **רק** את הקבצים שבריף הריצה הדפיס.

## שלב 3 - משימת הריצה

**קלט:** הנושא/ההזדמנות/הממצא שאביעד ציין (`{TOPIC}` - מוזרק על ידי gateway מתוך ההודעה שלו).
**אל תמציא נושא אם לא צוין במפורש** - אם ההודעה עמומה, gateway כבר סינן את זה לפני שהגעת לכאן.

בנה את `drafts/<slug>/` לפי `agents/producer.md`: `brief.md` / `evidence.md` / `counter.md` / `gaps.md`.
מקור החומר: `intel/`, `advocate/claims/`, `radar/open.json` - **רק מה שכבר קיים ואושר בערוצים אחרים.**
אל תמציא ראיה חדשה ואל תסרוק רשת - זה תפקיד scout/advocate, לא שלך.

## שלב 3.5 - Auditor לפני שמדווחים "מוכן"

**חובה, לא אופציונלי.** לפני שאתה מכריז על התוצר כמוכן, הרץ עליו Auditor בהיקף מלא:

```bash
bash aviad-desk/scripts/desk.sh start auditor
# ... בצע לפי routines/auditor.md + agents/auditor.md, {INPUT} = drafts/<slug>/ ...
bash aviad-desk/scripts/desk.sh finish auditor --items 1 --note "..."
```

**התוצאה של Auditor קובעת את הניסוח שלך בשלב 4** - "מוכן: כן" רק אם Auditor אמר כן.
"לא לפני תיקון X" - כתוב את X בפירוש, אל תסתיר.

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish producer --items N --note "מוכן: כן/לא/לא לפני תיקון X"
```

## שלב 4.5 - Amplifier, אך ורק אם Auditor אמר "מוכן: כן"

**זה ה"event" - מוצר מוכן מפעיל הפצה, לא שעון.** Auditor אמר "לא" או "לא לפני תיקון X" -
**דלג על השלב הזה לגמרי**, אל תריץ Amplifier על טיוטה פגומה.

```bash
bash aviad-desk/scripts/desk.sh start amplifier
# ... בצע לפי routines/amplifier.md + agents/amplifier.md, {SOURCE} = drafts/<slug>/ ...
bash aviad-desk/scripts/desk.sh finish amplifier --items N --note "..."
```

## שלב 5 - הודעת סיכום

עד 5 שורות דרך `scripts/telegram_send.py`: הנושא | מוכן לשליחה כן/לא (מ-Auditor) | הפער המרכזי
אם "לא" | אם רץ Amplifier - כמה שלדי הפצה הוכנו | לאן להמשיך (hebrew-docs-engine / hebrew-rtl-docx
- הייצור הסופי לא כאן, וגם לא פרסום - זה תמיד אביעד).
