# רוטין: scout - סינתזה שבועית

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

ריצת **סינתזה שבועית (cost class B). בלי גלישה כלל.**
קרא את שבעת הדוחות האחרונים ב-`aviad-desk/intel/`. זהו: דפוס אחד, שאלה פתוחה אחת שהתקדמה, והמלצה אחת.
כתוב ל-`aviad-desk/intel/weekly/{WEEK}.md`. מקסימום 15 פריטים.

**זו ריצת קריאת קבצים בלבד. אל תפעיל WebSearch או WebFetch.**

## שלב 4 - סגירה. **הרץ אותה רק אחרי שלב 5**

**התיוק לתור היוצא קורה לפני `finish`, לא אחריו.** `finish` מתחייב על מה שבתור ודוחף. הודעה שתויקה אחרי `finish` נשארת בקונטיינר שנמחק בסוף הריצה - כך אבד הבריף של 8.9.

```bash
bash aviad-desk/scripts/desk.sh finish scout --items N --l0 0 --l1 0 --l2 0 --note "סינתזה שבועית"
```

## שלב 5 - הודעת סיכום
עד 5 שורות: הדפוס, השאלה הפתוחה שהתקדמה, וההמלצה. משפט אחד לכל אחד.

```bash
python3 aviad-desk/scripts/outbox_put.py scout "<הסיכום>"
```

## שלב 6 - מסלול הפרסום (amplifier). **חובה, אחרי ש-`finish scout` הצליח**

לטריגר העצמאי של amplifier אין ריפו מחובר, ולכן הוא מעולם לא הפיק טיוטה אחת. הוא רץ מכאן,
בסשן שכן עובד - מיד אחרי שהסינתזה של השבוע נכתבה, כך שהדפוס שזיהית זמין לו כמועמד.

```bash
bash aviad-desk/scripts/desk.sh start amplifier
```

ואז בצע את `aviad-desk/routines/amplifier.md` **משלב 2 עד שלב 7, במדויק** - כולל
`desk.sh finish amplifier` גם כש"אין מועמד שעובר את הסף". זה עובד נפרד עם namespace משלו:
**אל תכתוב ל-`amplify/` בשם scout, ואל תחזור לשלב 3 של scout.** גם כאן - בלי גלישה.

כשל במסלול הזה לא מבטל את הסינתזה, שכבר נדחפה:
`bash aviad-desk/scripts/desk.sh fail amplifier --reason "..."` - וסיים.
