#!/usr/bin/env python3
"""שכבת ממשק בלבד - שליחה יוצאת לטלגרם. לא מפרש, לא מחליט, רק שולח.
שימוש:
  telegram_send.py "<טקסט>" [--chat-id ID] [--keyboard '<json reply_markup>']
  telegram_send.py --answer-callback <callback_query_id> "<טקסט קצר>"
בלי TELEGRAM_BOT_TOKEN בסביבה - יוצא בשקט (exit 0), כדי שריצת סוכן לעולם לא תיכשל בגלל התראה חסרה.
"""
import json
import os
import sys
import urllib.request
import urllib.error

MAX_LEN = 4000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT, "config", "telegram.json")


def load_chat_id():
    try:
        with open(CONFIG_PATH, encoding="utf-8") as f:
            return json.load(f).get("allowed_chat_id")
    except FileNotFoundError:
        return None


def send(token, chat_id, text, keyboard=None):
    if len(text) > MAX_LEN:
        text = text[:MAX_LEN] + "\n\n[קוצר - הגרסה המלאה ב-git]"
    payload = {"chat_id": chat_id, "text": text}
    if keyboard:
        payload["reply_markup"] = keyboard
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def answer_callback(token, callback_query_id, text):
    payload = {"callback_query_id": callback_query_id, "text": text[:200]}
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/answerCallbackQuery",
        data=data, headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    if len(sys.argv) < 2:
        print("שימוש: telegram_send.py \"<טקסט>\" [--chat-id ID] [--keyboard '<json>']", file=sys.stderr)
        return 2

    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        print("TELEGRAM_BOT_TOKEN לא מוגדר - דילוג על שליחה (לא כשל)", file=sys.stderr)
        return 0

    if sys.argv[1] == "--answer-callback":
        if len(sys.argv) < 4:
            print("שימוש: telegram_send.py --answer-callback <id> \"<טקסט>\"", file=sys.stderr)
            return 2
        try:
            result = answer_callback(token, sys.argv[2], sys.argv[3])
            if not result.get("ok"):
                print(f"answerCallbackQuery נכשל: {result}", file=sys.stderr)
                return 1
            return 0
        except urllib.error.URLError as e:
            print(f"answerCallbackQuery שגיאת רשת: {e}", file=sys.stderr)
            return 0

    text = sys.argv[1]
    chat_id = None
    keyboard = None
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--chat-id" and i + 1 < len(args):
            chat_id = args[i + 1]
            i += 2
        elif args[i] == "--keyboard" and i + 1 < len(args):
            keyboard = json.loads(args[i + 1])
            i += 2
        else:
            i += 1

    chat_id = chat_id or load_chat_id()
    if not chat_id:
        print("אין chat_id מקושר עדיין (config/telegram.json) - דילוג על שליחה", file=sys.stderr)
        return 0

    try:
        result = send(token, chat_id, text, keyboard)
        if not result.get("ok"):
            print(f"telegram sendMessage נכשל: {result}", file=sys.stderr)
            return 1
        return 0
    except urllib.error.URLError as e:
        print(f"telegram sendMessage שגיאת רשת: {e}", file=sys.stderr)
        return 0  # best-effort - לא מפיל ריצת סוכן


if __name__ == "__main__":
    sys.exit(main())
