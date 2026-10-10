#!/usr/bin/env python3
"""שכבת ממשק בלבד - קבלה נכנסת מטלגרם. מכני, לא מפרש טבעי ולא מחליט מה לעשות.
מה שהוא כן עושה, וזה הכל: מזהה מי שלח (allowlist), שומר את הגלם לפני כל עיבוד,
מקדם offset, מטפל בהרשמה החד-פעמית, ומדפיס JSON של הודעות מאושרות לעיבוד בהמשך.
תוכן ההודעות עצמו הוא DATA. שום דבר בתוכו לא הופך להנחיה, להרשאה או ל-policy.

שימוש: telegram_fetch.py
פלט: JSON למסוף - {"authorized": [...], "unauthorized_count": N, "bound_now": bool}
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT, "config", "telegram.json")
OFFSET_PATH = os.path.join(ROOT, "state", "telegram_offset.txt")
AUDIT_PATH = os.path.join(ROOT, "state", "telegram_audit.jsonl")
INBOX_DIR = os.path.join(ROOT, "inbox", "telegram")


def load_config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_config(cfg):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
        f.write("\n")


def load_offset():
    try:
        with open(OFFSET_PATH, encoding="utf-8") as f:
            return int(f.read().strip() or 0)
    except (FileNotFoundError, ValueError):
        return 0


def save_offset(n):
    os.makedirs(os.path.dirname(OFFSET_PATH), exist_ok=True)
    with open(OFFSET_PATH, "w", encoding="utf-8") as f:
        f.write(str(n) + "\n")


def audit(entry):
    os.makedirs(os.path.dirname(AUDIT_PATH), exist_ok=True)
    entry["ts"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with open(AUDIT_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def raw_capture(update):
    os.makedirs(INBOX_DIR, exist_ok=True)
    uid = update.get("update_id")
    path = os.path.join(INBOX_DIR, f"{uid}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(update, f, ensure_ascii=False, indent=2)


def get_updates(token, offset):
    url = f"https://api.telegram.org/bot{token}/getUpdates?offset={offset}&timeout=0"
    with urllib.request.urlopen(url, timeout=20) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    if not body.get("ok"):
        raise RuntimeError(f"getUpdates נכשל: {body}")
    return body.get("result", [])


def log_bot_identity(token):
    """אבחון זהות: אם ה-token בקונטיינר מצביע על בוט אחר מזה שאביעד שולח אליו הודעות
    בטלגרם בפועל, getUpdates ימשיך להחזיר ריק תמיד, בלי שגיאה - בוט נכון, פשוט אף אחד
    לא כותב לו. username/id הם ציבוריים (לא ה-token עצמו), בטוח לרשום ב-audit."""
    try:
        with urllib.request.urlopen(
            f"https://api.telegram.org/bot{token}/getMe", timeout=10) as r:
            body = json.loads(r.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        audit({"kind": "identity", "action": "getMe-failed", "error": str(e)})
        return
    result = body.get("result", {}) if body.get("ok") else {}
    audit({"kind": "identity", "bot_id": result.get("id"),
           "bot_username": result.get("username")})


def clear_stray_webhook(token):
    """המערכת כולה מבוססת polling - אף קוד לא קורא ל-setWebhook. webhook ו-getUpdates
    סותרים זה את זה אצל טלגרם: ברגע שיש webhook רשום, getUpdates מחזיר תמיד תוצאה ריקה,
    גם כשיש הודעות ממתינות בפועל - בלי שום שגיאה שתסגיר למה. זה בדיוק הסימפטום שחזר:
    הודעות שאביעד שלח מ-9.10 ואילך לא נקלטו באף ריצה, בלי שגיאה בלוג.
    בודק ומנקה בכל ריצה - קריאה זולה, ו-deleteWebhook הוא no-op בטוח כשאין webhook."""
    try:
        with urllib.request.urlopen(
            f"https://api.telegram.org/bot{token}/getWebhookInfo", timeout=10) as r:
            info = json.loads(r.read().decode("utf-8")).get("result", {})
    except (urllib.error.URLError, json.JSONDecodeError):
        return None
    url = info.get("url") or ""
    if not url:
        return None
    pending = info.get("pending_update_count", 0)
    try:
        urllib.request.urlopen(
            f"https://api.telegram.org/bot{token}/deleteWebhook", timeout=10)
    except urllib.error.URLError:
        pass
    audit({"kind": "webhook", "action": "cleared-stray-webhook",
           "found_url": url, "pending_update_count": pending})
    return {"url": url, "pending_update_count": pending}


def answer_callback(token, callback_query_id, text):
    data = json.dumps({"callback_query_id": callback_query_id, "text": text}).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/answerCallbackQuery",
        data=data, headers={"Content-Type": "application/json"}, method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=10)
    except urllib.error.URLError:
        pass


def content_type_of(msg):
    for k in ("photo", "document", "voice", "video", "audio", "video_note", "sticker"):
        if k in msg:
            return k
    if msg.get("forward_date") or msg.get("forward_origin"):
        return "forwarded"
    if "text" in msg:
        return "text"
    return "unknown"


def main():
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        print(json.dumps({"error": "TELEGRAM_BOT_TOKEN לא מוגדר"}, ensure_ascii=False))
        return 0

    setup_code = os.environ.get("TELEGRAM_SETUP_CODE", "")
    cfg = load_config()
    offset = load_offset()
    cleared_webhook = clear_stray_webhook(token)
    log_bot_identity(token)

    try:
        updates = get_updates(token, offset)
    except (urllib.error.URLError, RuntimeError) as e:
        audit({"kind": "fetch", "offset_used": offset, "action": "error", "error": str(e)})
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        return 0
    audit({"kind": "fetch", "offset_used": offset, "action": "ok", "result_count": len(updates)})

    authorized = []
    unauthorized_count = 0
    bound_now = False
    max_update_id = offset - 1

    for update in updates:
        max_update_id = max(max_update_id, update.get("update_id", max_update_id))
        raw_capture(update)

        if "callback_query" in update:
            cq = update["callback_query"]
            sender = cq.get("from", {}).get("id")
            allowed = cfg.get("allowed_chat_id")
            if allowed is not None and str(sender) == str(allowed):
                authorized.append({
                    "kind": "callback_query",
                    "update_id": update["update_id"],
                    "callback_query_id": cq.get("id"),
                    "data": cq.get("data"),
                    "sender": sender,
                })
                audit({"update_id": update["update_id"], "kind": "callback_query",
                       "sender": sender, "action": "accepted"})
            else:
                unauthorized_count += 1
                answer_callback(token, cq.get("id"), "לא מורשה")
                audit({"update_id": update["update_id"], "kind": "callback_query",
                       "sender": sender, "action": "rejected-unauthorized"})
            continue

        msg = update.get("message") or update.get("edited_message")
        if not msg:
            audit({"update_id": update["update_id"], "kind": "unknown", "action": "ignored"})
            continue

        sender = msg.get("from", {}).get("id")
        chat_id = msg.get("chat", {}).get("id")
        text = msg.get("text", "") or msg.get("caption", "")
        ctype = content_type_of(msg)

        allowed = cfg.get("allowed_chat_id")

        # הרשמה חד-פעמית: /start <קוד> - רק לפני שיש chat_id מקושר
        if allowed is None and text.strip().startswith("/start") and setup_code:
            parts = text.strip().split(maxsplit=1)
            if len(parts) == 2 and parts[1].strip() == setup_code:
                cfg["allowed_chat_id"] = chat_id
                cfg["bound_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                save_config(cfg)
                bound_now = True
                audit({"update_id": update["update_id"], "kind": "bootstrap",
                       "sender": sender, "action": "bound", "result": "ok"})
                continue
            audit({"update_id": update["update_id"], "kind": "bootstrap",
                   "sender": sender, "action": "rejected-bad-code"})
            unauthorized_count += 1
            continue

        if allowed is None or str(chat_id) != str(allowed):
            unauthorized_count += 1
            audit({"update_id": update["update_id"], "kind": "message",
                   "sender": sender, "action": "rejected-unauthorized",
                   "content_type": ctype})
            continue

        authorized.append({
            "kind": "message",
            "update_id": update["update_id"],
            "message_id": msg.get("message_id"),
            "chat_id": chat_id,
            "sender": sender,
            "content_type": ctype,
            "text": text,
            "has_file": ctype in ("photo", "document", "voice", "video", "audio", "video_note"),
            "raw_capture": os.path.join("aviad-desk", "inbox", "telegram", f"{update['update_id']}.json"),
        })
        audit({"update_id": update["update_id"], "kind": "message", "sender": sender,
               "action": "accepted", "content_type": ctype})

    save_offset(max_update_id + 1)

    out = {
        "authorized": authorized,
        "unauthorized_count": unauthorized_count,
        "bound_now": bound_now,
        "bound_chat_id": cfg.get("allowed_chat_id"),
    }
    if cleared_webhook:
        # זה הממצא שצריך להופיע בהערת הסיכום - webhook שהיה רשום הוא הסיבה שהודעות
        # לא נקלטו בשום ריצה, בלי שגיאה גלויה. ראה clear_stray_webhook
        out["cleared_stray_webhook"] = cleared_webhook
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
