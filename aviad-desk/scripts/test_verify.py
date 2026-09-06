#!/usr/bin/env python3
"""רגרסיה לחוזה הערך של סעיף TOP (verify.py R13-R16).

filter.md מגדיר את TOP כסעיף היחיד שאביעד קורא בפועל ומחליט לפיו. ההגדרה
הייתה פרוזה בלבד - כתובה ולא נאכפת. הבדיקות כאן הן ההוכחה שהיא נאכפת:
ממצא ב-TOP עומד בפני עצמו, נושא קישור שאפשר לפתוח, ואומר משמעות ולא "מעניין".

    python3 aviad-desk/scripts/test_verify.py
"""
import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("verify", os.path.join(HERE, "verify.py"))
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)

fails = []

TOP_ENTRY = """#### 1. [I-20260904-01] McKinsey: מודל domain מגיע לייצור פי 2.3
**למה עכשיו:** ציון הבשלות של המגזר הציבורי (28) נמוך מהממוצע (33)

- מה קרה: הדוח קובע ש-70% מהתוכניות שנבנות סביב תחום פעולה מגיעות לייצור, מול 30%
- למה זה חשוב לך: הופך את הטענה שמפעל יכולות עדיף על קולות קוראים לנתון שאפשר להציג למקבל החלטה
- מה חדש כאן: מחזק - מספר שלא היה קודם לטענה שכבר הוצגה
- מקור: https://www.tribuneindia.com/news/ai-implementation/mckinsey | תאריך פרסום: 24.7.2026
- סיווג: CLAIM · דירוג ראיה: E2
- ביטחון: בינוני - המקור הראשוני חסום, אישור ממנו היה מעלה אותו
- מה לעשות עכשיו: לשלב את היחס 70/30 בפתיחת מסמך הדוקטרינה
- מוכן לפרסום: 70% מתוכניות שנבנות סביב תחום פעולה מגיעות לייצור, מול 30% (McKinsey 2026)
"""

DETAIL = """### [I-20260904-01] McKinsey - פירוט
- סיווג: CLAIM
- דירוג ראיה: E2
- מקור: https://www.tribuneindia.com/news/ai-implementation/mckinsey | תאריך פרסום: 24.7.2026
- test_question: [C5]
"""


def doc(top=TOP_ENTRY, head="## TOP - מה שווה את תשומת הלב שלך היום\n\n**שורה תחתונה:** משפט.\n\n"):
    return "# Scout - דוח יומי\n\n" + (head + top if top else "") + "\n" + DETAIL


def rules(text, name="2026-09-04.md"):
    return sorted({x["rule"] for x in v.check_top(text, "intel/" + name)})


def check(name, got, want):
    ok = got == want
    if not ok:
        fails.append(f"{name}\n      ציפי: {want!r}\n      קיבל: {got!r}")
    print(("  PASS  " if ok else "  FAIL  ") + name)


print("\nחוזה TOP - מה עובר ומה נחסם")
check("דוח שעומד בחוזה עובר נקי", rules(doc()), [])
check("דוח עם ממצאים ובלי סעיף TOP נחסם", rules(doc(top=None, head="")), ["R13"])
check("סעיף TOP ריק מממצאים מלאים נחסם",
      rules(doc(top="", head="## TOP\n\n**שורה תחתונה:** אין.\n")), ["R13"])
check("ארבעה ממצאים ב-TOP נחסמים",
      "R13" in rules(doc(top="".join(TOP_ENTRY.replace("#### 1.", f"#### {i}.") for i in (1, 2, 3, 4)))),
      True)

no_pub = "\n".join(l for l in TOP_ENTRY.splitlines() if not l.startswith("- מוכן לפרסום"))
check("ממצא ב-TOP בלי \"מוכן לפרסום\" נחסם", rules(doc(top=no_pub + "\n")), ["R14"])

no_new = "\n".join(l for l in TOP_ENTRY.splitlines() if not l.startswith("- מה חדש כאן"))
check("ממצא ב-TOP בלי \"מה חדש כאן\" נחסם", rules(doc(top=no_new + "\n")), ["R14"])

no_when = "\n".join(l for l in TOP_ENTRY.splitlines() if not l.startswith("**למה עכשיו"))
check("ממצא ב-TOP בלי \"למה עכשיו\" נחסם", rules(doc(top=no_when + "\n")), ["R14"])

no_url = TOP_ENTRY.replace("https://www.tribuneindia.com/news/ai-implementation/mckinsey",
                           "לפי תקצירי חיפוש")
check("ממצא ב-TOP בלי קישור נחסם - שער 1", rules(doc(top=no_url)), ["R15"])

generic = TOP_ENTRY.replace(
    "- למה זה חשוב לך: הופך את הטענה שמפעל יכולות עדיף על קולות קוראים לנתון שאפשר להציג למקבל החלטה",
    "- למה זה חשוב לך: מעניין ורלוונטי לתחום")
check('"למה זה חשוב לך" גנרי נחסם - שער 2', rules(doc(top=generic)), ["R16"])

print("\nגבולות - מה החוזה בכוונה לא נוגע בו")
check("דוח מלפני כניסת החוזה לתוקף אינו נחסם רטרואקטיבית",
      rules(doc(top=None, head=""), name="2026-09-02.md"), [])
check("דוח בלי ממצאים כלל אינו דורש TOP",
      rules("# Scout - דוח יומי\n\nאין ממצא שעובר את הסף היום.\n"), [])
check("קובץ בלי תאריך בשם אינו נבדק", rules(doc(top=None, head=""), name="weekly.md"), [])
check("קישור בבלוק הפירוט אינו מכשיר ממצא TOP חסר קישור",
      rules(doc(top=no_url)), ["R15"])

print()
if fails:
    print(f"נכשלו {len(fails)} בדיקות:\n")
    for f in fails:
        print("  - " + f)
    sys.exit(1)
print("כל הבדיקות עברו")
