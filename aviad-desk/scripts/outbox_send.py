#!/usr/bin/env python3
"""שכבת ממשק - שולח את כל מה שממתין ב-outbox. רץ מתוך gateway בלבד.

זו נקודת האינטגרציה היחידה של המערכת עם ערוץ יציאה. סוכני התוכן מתייקים
ל-outbox דרך outbox_put.py ולא נוגעים בטוקן, ברשת או בטלגרם.

בלי TELEGRAM_BOT_TOKEN - יוצא בשקט (exit 0), ההודעות נשארות בתור לירייה הבאה.
נשלח בהצלחה - הקובץ עובר ל-outbox/sent/ כדי שלא יישלח פעמיים.

שימוש: outbox_send.py [--limit N]
פלט: JSON - {"sent": N, "failed": N, "pending": N, "no_token": bool}
"""
import json
import os
import shutil
import sys
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import telegram_send  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTBOX = os.path.join(ROOT, "outbox")
SENT = os.path.join(OUTBOX, "sent")
DEAD = os.path.join(OUTBOX, "dead")

DEFAULT_LIMIT = 10


def _retire(path, name):
    """פריט שלא ניתן לשלוח לעולם - קובץ פגום או בלי טקסט - עובר ל-outbox/dead.

    בלי זה הוא נשאר בתור ונכשל בכל ירייה, לנצח: gateway נרשם degraded כל שעה,
    השומר מדווח stuck, והתור אף פעם לא מתנקז. קרה בפועל ב-03.09 עם שני פריטים
    ריקים. dead/ נשמר ולא נמחק - אפשר לבדוק מה קרה, אבל הוא כבר לא חוסם.
    """
    try:
        os.makedirs(DEAD, exist_ok=True)
        shutil.move(path, os.path.join(DEAD, name))
    except OSError:
        pass


def pending_files():
    if not os.path.isdir(OUTBOX):
        return []
    names = [
        n for n in os.listdir(OUTBOX)
        if n.endswith(".json") and os.path.isfile(os.path.join(OUTBOX, n))
    ]
    return sorted(names)


def main():
    limit = DEFAULT_LIMIT
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == "--limit" and i + 1 < len(args):
            try:
                limit = int(args[i + 1])
            except ValueError:
                pass

    files = pending_files()
    if not files:
        print(json.dumps({"sent": 0, "failed": 0, "pending": 0, "no_token": False},
                         ensure_ascii=False))
        return 0

    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        print(json.dumps({"sent": 0, "failed": 0, "pending": len(files), "no_token": True},
                         ensure_ascii=False))
        return 0

    chat_id = telegram_send.load_chat_id()
    if not chat_id:
        print(json.dumps({"sent": 0, "failed": 0, "pending": len(files),
                          "no_token": False, "error": "אין chat_id מקושר"},
                         ensure_ascii=False))
        return 0

    os.makedirs(SENT, exist_ok=True)
    sent = 0
    failed = 0
    dead = 0
    errors = []

    for name in files[:limit]:
        path = os.path.join(OUTBOX, name)
        try:
            with open(path, encoding="utf-8") as f:
                rec = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            dead += 1
            errors.append(f"{name}: קובץ פגום, הועבר ל-dead ({e})")
            _retire(path, name)
            continue

        text = rec.get("text")
        if not text or not str(text).strip():
            dead += 1
            errors.append(f"{name}: אין טקסט, הועבר ל-dead")
            _retire(path, name)
            continue

        try:
            result = telegram_send.send(token, chat_id, text, rec.get("keyboard"))
        except urllib.error.URLError as e:
            # רשת נפלה - משאירים בתור, ננסה בירייה הבאה. לא כשל
            errors.append(f"{name}: שגיאת רשת ({e})")
            break
        except OSError as e:
            errors.append(f"{name}: {e}")
            break

        if not result.get("ok"):
            failed += 1
            errors.append(f"{name}: {result}")
            continue

        shutil.move(path, os.path.join(SENT, name))
        sent += 1

    out = {
        "sent": sent,
        "failed": failed,
        "dead": dead,
        "pending": len(pending_files()),
        "no_token": False,
    }
    if errors:
        out["errors"] = errors[:5]
    print(json.dumps(out, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
