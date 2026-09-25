#!/usr/bin/env python3
"""POC - הזדמנויות תעסוקה/מנהיגות אצל ספקי ענן, יעד 2 ב-positioning.md.

"הובלת פעילות Government AI / AI Factory אצל ספק ענן (Google / AWS / Azure) מול הממשלה."

זה לא מחובר ל-radar ולא רץ בשום cron. סקריפט עצמאי, קריאה בלבד, מיועד להרצה ידנית
עד שיוחלט להפוך אותו לייצור. מכסה מקור אחד בלבד עם API אמיתי - AWS. Google ו-Microsoft
וממשלה נבדקו ידנית (ראה הדוח) ואין להם דרך תכנותית שאינה scraper - בכוונה לא נבנה כזה.

שימוש:
    role_feed.py              JSON למסך
    role_feed.py --text       טקסט קריא
"""
import json
import re
import sys
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (aviad-desk role feed POC; read-only)"}
TIMEOUT = 20

# מונחי בכירות - יעד 2 הוא הובלה, לא תפקיד IC. תפקיד בלי אחד מאלה בכותרת מסונן החוצה
SENIORITY = re.compile(
    r"\bSenior\b|\bPrincipal\b|\bHead\b|\bDirector\b|\bManager\b|\bLead\b|\bStrategic\b", re.I)
# הקשר ציבורי/ממשלתי בכותרת עצמה - לא job_category, שלא מתייג את זה באופן עקבי (נבדק בפועל)
PUBLIC_SECTOR = re.compile(r"public sector|government|govtech|civic", re.I)

QUERIES = ["public sector", "government AI", "GenAI public sector"]


def fetch_aws(query):
    url = (f"https://www.amazon.jobs/en/search.json?base_query={query.replace(' ', '%20')}"
           f"&normalized_country_code%5B%5D=ISR&result_limit=30&sort=recent")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode("utf-8"))


def aws_roles():
    seen, out = {}, []
    for q in QUERIES:
        try:
            data = fetch_aws(q)
        except Exception as e:
            return None, f"{type(e).__name__}: {e}"
        for j in data.get("jobs", []):
            title = j.get("title", "")
            if not (SENIORITY.search(title) and PUBLIC_SECTOR.search(title)):
                continue
            jid = j.get("id_icims") or j.get("id")
            if jid in seen:
                continue
            seen[jid] = True
            out.append({
                "source": "AWS", "checked": CHECKED, "title": title.strip(),
                "location": j.get("normalized_location", ""), "posted": j.get("posted_date", ""),
                "link": "https://www.amazon.jobs" + j.get("job_path", ""),
                "why": "הובלת AI מול ממשל/מגזר ציבורי אצל ספק ענן - יעד 2 ישיר, כותרת בכירות מפורשת",
            })
    return out, None


def as_text(roles, blocked):
    lines = [f"# POC - הזדמנויות יעד 2 (Government AI אצל ספק ענן), נבדק {CHECKED}", ""]
    if roles:
        lines.append(f"## AWS - {len(roles)} תפקידים תואמים")
        for r in roles:
            lines.append(f"- {r['title']} | {r['location']} | פורסם {r['posted']} | {r['link']}")
            lines.append(f"  למה רלוונטי: {r['why']}")
    else:
        lines.append("## AWS - אין תוצאה")
    if blocked:
        lines.append("")
        lines.append("## חסומים")
        for b in blocked:
            lines.append(f"- {b}")
    return "\n".join(lines)


import datetime as dt
CHECKED = dt.date.today().isoformat()


def main():
    roles, err = aws_roles()
    blocked = []
    if err:
        blocked.append(f"AWS: {err}")
        roles = []
    rep = {"checked": CHECKED, "aws_roles": roles, "blocked": blocked}
    print(as_text(roles, blocked) if "--text" in sys.argv else json.dumps(rep, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
