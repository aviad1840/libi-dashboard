#!/usr/bin/env python3
"""שכבת ממשק בלבד - שליחה יוצאת במייל, SMTP, stdlib בלבד (בלי תלות חדשה).
שימוש: email_notify.py "<נושא>" "<גוף ההודעה>" [--attach /path/to/file ...]
בלי EMAIL_SMTP_* בסביבה - יוצא בשקט (exit 0), כדי שריצת סוכן לעולם לא תיכשל בגלל התראה חסרה.
"""
import os
import smtplib
import ssl
import sys
from email.message import EmailMessage


def main():
    if len(sys.argv) < 3:
        print("שימוש: email_notify.py \"<נושא>\" \"<גוף>\" [--attach path ...]", file=sys.stderr)
        return 2

    subject, body = sys.argv[1], sys.argv[2]
    attachments = []
    args = sys.argv[3:]
    i = 0
    while i < len(args):
        if args[i] == "--attach" and i + 1 < len(args):
            attachments.append(args[i + 1])
            i += 2
        else:
            i += 1

    host = os.environ.get("EMAIL_SMTP_HOST")
    port = os.environ.get("EMAIL_SMTP_PORT")
    user = os.environ.get("EMAIL_SMTP_USER")
    password = os.environ.get("EMAIL_SMTP_APP_PASSWORD")
    to_addr = os.environ.get("EMAIL_TO")

    if not all([host, port, user, password, to_addr]):
        print("EMAIL_SMTP_* לא מוגדר במלואו - דילוג על שליחה (לא כשל)", file=sys.stderr)
        return 0

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_addr
    msg.set_content(body)

    for path in attachments:
        try:
            with open(path, "rb") as f:
                data = f.read()
            msg.add_attachment(data, maintype="application", subtype="octet-stream",
                                filename=os.path.basename(path))
        except OSError as e:
            print(f"דילוג על צירוף {path}: {e}", file=sys.stderr)

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(host, int(port), timeout=20) as server:
            server.starttls(context=context)
            server.login(user, password)
            server.send_message(msg)
        return 0
    except (smtplib.SMTPException, OSError) as e:
        print(f"שליחת מייל נכשלה: {e}", file=sys.stderr)
        return 0  # best-effort - לא מפיל ריצת סוכן


if __name__ == "__main__":
    sys.exit(main())
