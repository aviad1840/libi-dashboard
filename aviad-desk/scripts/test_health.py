#!/usr/bin/env python3
"""רגרסיה לסמנטיקת המצב של השומר.

כל מקרה כאן הוא כשל שקרה בפועל ביומן, לא תרחיש מומצא. שתי הטעויות שהשומר
יכול לעשות שקולות בחומרתן, ולכן שתיהן נבדקות בכל שינוי:

  OK כוזב      - כשל אמיתי שנרשם כהצלחה. השומר שותק והמערכת מתה בשקט
  RED כוזב     - התראה על מצב תקין. השומר צועק, אביעד מכבה אותו, וזהו

    python3 aviad-desk/scripts/test_health.py
"""
import importlib.util
import os
import sys
import datetime as dt

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("health", os.path.join(HERE, "health.py"))
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)

NOW = dt.datetime(2026, 9, 3, 7, 0, tzinfo=dt.timezone.utc)
fails = []


def check(name, got, want):
    ok = got == want
    if not ok:
        fails.append(f"{name}\n      ציפי: {want!r}\n      קיבל: {got!r}")
    print(("  PASS  " if ok else "  FAIL  ") + name)


def rec(agent, hhmm, status, note, items=0, **kw):
    d = {"agent": agent, "ts": f"2026-09-03T{hhmm}:00+00:00", "status": status,
         "note": note, "items": items}
    d.update(kw)
    return d


print("\nclassify_note - סימן כשל בהערה")
CASES = [
    ("הכל תקין, 3 פריטים", 3, "ok", "הערה נקייה"),
    ("4 מועמדים נכשלו בשער הערך", 2, "ok", "שער ערך שסינן הוא ההתנהגות הרצויה"),
    ("אין דגל/תקוע חדש", 1, "ok", "סעיף קבוע בבריף, לא דיווח על תקיעה"),
    ("mckinsey.com חסום HTTP 503, 2 ממצאים", 2, "ok", "מקור חסום + תוצרת = לא כשל"),
    ("mckinsey.com חסום HTTP 503, אין ממצאים", 0, "degraded", "חסימה בלי תוצרת כן כשל"),
    ("שומר: 1 אדום - תויק לתור (gateway note קודם הכיל מילת נכשל)", 2, "ok",
     "ציטוט הערה קודמת בסוגריים אינו כשל של הריצה הזו"),
    ("שומר: 1 אדום, ההערה הקודמת הכילה כשל, התור נוקה", 1, "ok",
     "ציטוט הערה קודמת כמקטע מופרד"),
    ("telegram_fetch נכשל: HTTP 404", 0, "degraded", "כשל טכני אמיתי"),
    ("push נדחה - permission denied", 1, "degraded", "כשל אמיתי למרות items>0"),
    ("Traceback (most recent call last)", 0, "degraded", "חריגה"),
    ("שומר: 1 אדום (gateway note קודם הכיל מילת נכשל), telegram_send נכשל HTTP 401", 1,
     "degraded", "ציטוט עבר לא מבליע כשל אמיתי באותה הערה"),
]
for note, items, want, why in CASES:
    check(f"{why}", h.classify_note(note, items), want)

print("\n_true_ok - status קפוא מול סיווג חי")
check("רשומה שנכתבה degraded והערתה נקייה היום היא ok",
      h._true_ok(rec("gateway", "06:09", "degraded", "2 נשלחו (note קודם הכיל מילת נכשל)", 2)), True)
check("רשומה שנכתבה ok והערתה מודה בכשל אינה ok",
      h._true_ok(rec("gateway", "05:09", "ok", "telegram_fetch נכשל: HTTP 404")), False)
check("status=failed לעולם אינו ok, גם עם הערה נקייה",
      h._true_ok(rec("scout", "02:30", "failed", "הכל תקין", 3, reason="merge conflict")), False)

print("\ncheck_hidden - כשל חי מול כשל שנפתר")
EXP = {"gateway": {"cron": ["6 * * * *"], "grace_misses": 3}}
live = [rec("gateway", "05:09", "ok", "telegram_send נכשל HTTP 401")]
res = h.check_hidden(live, EXP, NOW)
check("כשל בלי ריצה תקינה אחריו = RED", [x["level"] for x in res], ["RED"])

healed = live + [rec("gateway", "06:09", "ok", "2 נשלחו מהתור, 0 חסומות", 2)]
res = h.check_hidden(healed, EXP, NOW)
check("כשל שריצה תקינה אחריו תיקנה = YELLOW", [x["level"] for x in res], ["YELLOW"])
check("ההתראה שנפתרה נושאת את זמן ההחלמה",
      "נפתר - ריצה תקינה ב-03.09 06:09Z" in res[0]["detail"], True)
check("כשל שנפתר אינו נספר כנסיון ברצף", "נסיון" in res[0]["detail"], False)

streak = [rec("gateway", f"0{i}:09", "ok", "telegram_send נכשל HTTP 401") for i in (3, 4, 5)]
res = h.check_hidden(streak, EXP, NOW)
check("שלושה כשלים רצופים = שורה אחת, לא שלוש", len(res), 1)
check("שלושה כשלים רצופים מסלימים ל\"כשל חוזר\"", res[0]["detail"].startswith("כשל חוזר."), True)

print("\ncheck_missed - טריגר בלי ריפו מחובר")
res = h.check_missed([], {"amplifier": {"cron": ["0 6 * * 3"], "connected": False}}, NOW)
check("connected=false הוא YELLOW NOT CONNECTED, לא כשל runtime",
      [(x["level"], x["check"]) for x in res], [("YELLOW", "not_connected")])
res = h.check_missed([], {"scout": {"cron": ["30 2 * * 0-4"], "grace_misses": 2}}, NOW)
check("סוכן מחובר שלא הותיר רשומה הוא RED", [x["level"] for x in res], ["RED"])

print()
if fails:
    print(f"נכשלו {len(fails)} בדיקות:\n")
    for f in fails:
        print("  - " + f)
    sys.exit(1)
print("כל הבדיקות עברו")
