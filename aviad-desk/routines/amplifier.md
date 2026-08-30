# רוטין: amplifier - מגבר

**Event-driven בלבד. אין רוטין קבוע בענן.** מופעל inline אך ורק מתוך `routines/producer.md`
שלב 4.5, **ורק** כשה-Auditor אישר את התוצר ("מוכן: כן"). אל תרשום Routine עבורו, ואל תפעיל
אותו על תוצר שלא עבר Auditor.

## שלב 1 - אתחול. הרץ את שלוש השורות האלה בדיוק, בלי לשנות:

```bash
git fetch origin --prune -q
for r in origin/main origin/claude/autonomous-workers-routine-hna6je; do git cat-file -e "$r:aviad-desk/scripts/desk.sh" 2>/dev/null && git checkout "$r" -- aviad-desk/scripts/ && break; done
bash aviad-desk/scripts/desk.sh start amplifier
```

הפקודה נכשלה - **עצור, דווח, אל תתקן ידנית ואל תמשיך לעבוד.**

## שלב 2 - קרא `aviad-desk/RUN.md` ופעל לפי שבעת השלבים שם, במדויק.
הנחיית התפקיד שלך היא `aviad-desk/agents/amplifier.md`. טען מ-`aviad-desk/context/` **רק** את הקבצים שבריף הריצה הדפיס.

## שלב 3 - משימת הריצה

**קלט:** `{SOURCE}` - נתיב ל-`drafts/<slug>/` שכבר אושר על ידי Auditor (מוזרק על ידי producer).

בנה טיוטות פרסום לפי `agents/amplifier.md`: לכל ערוץ **פעיל** ב-`context/channels.md` (כרגע:
LinkedIn, קבוצת WhatsApp GOV.AI - לא ערוצים שמסומנים שם "לא מוגדר") - זווית, נקודת הוכחה (`P<n>`),
וטיוטת טקסט מלאה במבנה ובאורך שהערוץ מגדיר שם. הטון תמיד לפי `context/voice.md` בלבד.
**עבוד רק מ-`{SOURCE}` ומנכסים שכבר פורסמו/אושרו (`context/proof-points.md`).** אל תמציא ערוץ,
זווית, או פרט שאין לו עיגון בחומר הקיים.

## חוק הברזל - אין חריג, אין "רק הפעם"

**אסור לך לפרסם. אסור לך לשלוח. אסור לך ליצור קשר עם אף אדם או ערוץ חיצוני.**
זה נכון גם טכנית: לסשן הזה אין כלי לפרסם לרשת חברתית, לשלוח מייל לצד שלישי, או לפתוח PR -
גם אם היה רצון, אין יכולת. הפלט הוא **טיוטת טקסט מוכנה לקריאה, לא לפרסום ישיר** - אביעד קורא,
עורך אם רוצה, ומחליט בעצמו אם ומתי להעתיק ולפרסם.

## שלב 4 - סגירה

```bash
bash aviad-desk/scripts/desk.sh finish amplifier --items N --note "N טיוטות פרסום, לאיזה ערוצים"
```

## שלב 5 - החזרת תוצאה

אתה חוזר ל-producer (שלב 5 שלו) עם: כמה שלדים הוכנו ולאילו ערוצים. **אתה לא שולח לטלגרם ישירות** -
producer מדווח את הסיכום המאוחד.
