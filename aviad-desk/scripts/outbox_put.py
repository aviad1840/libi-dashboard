#!/usr/bin/env python3
"""שכבת ממשק - הכנסת הודעה יוצאת לתור. מתייק בלבד, לא שולח.

הרעיון: סוכן תוכן לא צריך טוקן, לא צריך גישת רשת, ולא צריך לדעת מה ערוץ היציאה.
הוא רק מתייק הודעה. gateway - הרכיב היחיד שמחובר לערוץ - שולח אותה בירייה הבאה.

המשמעות התפעולית: נקודת אינטגרציה אחת בכל המערכת. החלפת טלגרם בכל ערוץ אחר
היא שינוי של קובץ אחד (outbox_send.py), לא של שבעה סוכנים.

שימוש: outbox_put.py <agent> "<טקסט>" [--keyboard '<json reply_markup>']
פלט: נתיב הקובץ שנוצר
"""
import json
import os
import sys
import time
import uuid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTBOX = os.path.join(ROOT, "outbox")


def main():
    if len(sys.argv) < 3:
        print('שימוש: outbox_put.py <agent> "<טקסט>" [--keyboard \'<json>\']', file=sys.stderr)
        return 2

    agent = sys.argv[1].strip()
    text = sys.argv[2]
    keyboard = None

    args = sys.argv[3:]
    i = 0
    while i < len(args):
        if args[i] == "--keyboard" and i + 1 < len(args):
            try:
                keyboard = json.loads(args[i + 1])
            except json.JSONDecodeError as e:
                print(f"--keyboard אינו JSON תקין: {e}", file=sys.stderr)
                return 2
            i += 2
        else:
            i += 1

    if not agent or "/" in agent or agent.startswith("."):
        print(f"שם סוכן לא תקין: {agent}", file=sys.stderr)
        return 2

    # טקסט ריק יוצר פריט שלא ניתן לשלוח לעולם, והוא נתקע בתור ומכשיל את gateway
    # בכל שעה מחדש. קרה בפועל ב-03.09: gateway הריץ outbox_put עם פלט ריק של
    # health.py --alert-if-new (דדופ החזיר כלום) ויצר שני פריטים מתים.
    # אין מה לשלוח - לא נוצר קובץ. זו הצלחה, לא כשל.
    if not text or not text.strip():
        print("אין טקסט לשליחה - לא נוצר פריט בתור", file=sys.stderr)
        return 0

    os.makedirs(OUTBOX, exist_ok=True)
    stamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    name = f"{agent}-{stamp}-{uuid.uuid4().hex[:4]}.json"
    path = os.path.join(OUTBOX, name)

    rec = {
        "agent": agent,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "text": text,
    }
    if keyboard:
        rec["keyboard"] = keyboard

    with open(path, "w", encoding="utf-8") as f:
        json.dump(rec, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(os.path.join("aviad-desk", "outbox", name))
    return 0


if __name__ == "__main__":
    sys.exit(main())
