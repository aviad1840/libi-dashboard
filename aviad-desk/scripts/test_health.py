#!/usr/bin/env python3
"""רגרסיה לסמנטיקת המצב של השומר.

הכלל היחיד: הסטטוס נקבע משדות התוצאה של הריצה - status ו-failures - ולא
מחיפוש מילים בהערה. ההערה נשמרת ל-audit ואין לה שום משקל בהחלטה.

שתי הטעויות שהשומר יכול לעשות שקולות בחומרתן, ולכן שתיהן נבדקות:

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

NOW = dt.datetime(2026, 9, 3, 11, 0, tzinfo=dt.timezone.utc)
EXP = {"gateway": {"cron": ["6 * * * *"], "grace_misses": 3}}
fails = []


def check(name, got, want):
    ok = got == want
    if not ok:
        fails.append(f"{name}\n      ציפי: {want!r}\n      קיבל: {got!r}")
    print(("  PASS  " if ok else "  FAIL  ") + name)


def rec(agent, hhmm, status="ok", note="", items=0, failures=0, **kw):
    d = {"agent": agent, "ts": f"2026-09-03T{hhmm}:00+00:00", "status": status,
         "note": note, "items": items, "failures": failures}
    d.update(kw)
    return d


def levels(runs, expected=EXP):
    return [x["level"] for x in h.check_failures(runs, expected, NOW)]


print("\nהסטטוס לפי שדות התוצאה, לא לפי מילים בהערה")

# הריצה שהתחיל ממנה הכל: 03.09 08:09Z. 1 נשלח, 0 כשלים, שומר תקין - וההערה
# מכילה את המילה "כשלים", ולכן סריקת מחרוזות סימנה אותה RED
GATEWAY_0809 = "0 הודעות נכנסות, 1 נשלחו מהתור, 0 כשלים, שומר: תקין, אין curator patch ממתין"
check("SUCCESS עם note שמכיל \"כשל\" נשאר GREEN",
      levels([rec("gateway", "08:09", note=GATEWAY_0809, failures=0)]), [])
check("אותה ריצה נחשבת ok אמיתי לצורך מונה הסטריק",
      h._true_ok(rec("gateway", "08:09", note=GATEWAY_0809, failures=0)), True)

for note in (
    "telegram_fetch נכשל: HTTP 404",
    "push נדחה - permission denied",
    "Traceback (most recent call last)",
    "4 מועמדים נכשלו בשער הערך",
    "אין דגל/תקוע חדש",
    "mckinsey.com חסום HTTP 503",
    "שומר: 1 אדום (gateway note קודם הכיל מילת נכשל)",
):
    check(f"failures=0 -> GREEN, תהיה ההערה אשר תהיה: \"{note[:42]}\"",
          levels([rec("gateway", "08:09", note=note, failures=0)]), [])

print("\nכשל אמיתי עדיין נתפס")
check("failures=1 הוא RED, גם עם הערה נקייה לחלוטין",
      levels([rec("gateway", "08:09", note="הכל תקין", failures=1)]), ["RED"])
check("status=failed הוא RED, גם עם failures=0",
      levels([rec("gateway", "08:09", status="failed", note="הכל תקין",
                  failures=0, reason="merge conflict")]), ["RED"])
check("ההערה מצורפת לפרטי ההתראה לצורכי audit",
      GATEWAY_0809[:40] in h.check_failures(
          [rec("gateway", "08:09", note=GATEWAY_0809, failures=2)], EXP, NOW)[0]["detail"], True)
check("מספר הכשלים מופיע בהתראה",
      "דיווח 2 כשלים" in h.check_failures(
          [rec("gateway", "08:09", note="x", failures=2)], EXP, NOW)[0]["detail"], True)

print("\nרשומות ישנות בלי שדה failures")
check("status=degraded היסטורי בלי שדה failures אינו כשל",
      levels([{"agent": "gateway", "ts": "2026-09-03T08:09:00+00:00",
               "status": "degraded", "items": 0, "note": GATEWAY_0809}]), [])
check("status=failed היסטורי כן נשאר כשל",
      levels([{"agent": "gateway", "ts": "2026-09-03T08:09:00+00:00",
               "status": "failed", "items": 0, "note": "x", "reason": "מת"}]), ["RED"])
check("שדה failures פגום נקרא כאפס ולא מפיל",
      levels([rec("gateway", "08:09", failures="שלוש")]), [])

print("\nהחלמה, סטריק וסוכן לא מחובר")
live = [rec("gateway", "08:09", failures=1, note="שליחה נכשלה")]
check("כשל בלי ריצה תקינה אחריו = RED", levels(live), ["RED"])
healed = live + [rec("gateway", "09:08", failures=0, note="1 נשלחו מהתור")]
check("כשל שריצה תקינה אחריו תיקנה = YELLOW", levels(healed), ["YELLOW"])
res = h.check_failures(healed, EXP, NOW)
check("ההתראה שנפתרה נושאת את זמן ההחלמה",
      "נפתר - ריצה תקינה ב-03.09 09:08Z" in res[0]["detail"], True)

streak = [rec("gateway", f"0{i}:09", failures=1, note="שליחה נכשלה") for i in (6, 7, 8)]
res = h.check_failures(streak, EXP, NOW)
check("שלושה כשלים רצופים = שורה אחת, לא שלוש", len(res), 1)
check("שלושה כשלים רצופים מסלימים ל\"כשל חוזר\"", res[0]["detail"].startswith("כשל חוזר."), True)

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
