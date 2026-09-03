#!/usr/bin/env python3
"""בריאות המערכת - השומר שתופס כשל שקט.

הבעיה שזה פותר: ב-46 הריצות הראשונות לא נרשם ולו כשל אחד. לא כי לא היו כשלים,
אלא כי כשל לא יכול לתעד את עצמו. רוטין שמת לפני desk.sh לא כותב כלום, וריצה
שנכשלה באמצע נרשמה status=ok עם הערה שאומרת "נכשל".

שבע בדיקות, כל אחת נגד כשל שקרה בפועל או נגד פער שהודגם בפועל:

  1. missed        - ירי מתוזמן שלא הותיר רשומה. תופס מוות לפני desk.sh start,
                      אחרי ש-grace_misses ירי נגמר (שעות עד ימים, לפי תדירות)
  2. hung          - heartbeat פתוחה מעל max_minutes בלי finish/fail תואם.
                      אותו כשל בדיוק כמו missed, מזוהה תוך דקות במקום ימים
  3. hidden        - רשומת ok שההערה שלה מכילה סימן כשל. תופס דיווח כוזב
  4. barren        - רצף דוחות ריקים. תופס דעיכת תפוקה לפני שקט מוחלט
  5. stuck         - הודעה שתקועה ב-outbox מעבר לחלון. תופס gateway שלא מנקז
  6. stale_source  - מקור ש-chief-of-staff מציג לא עודכן בזמן. לפי git log,
                      לא mtime - checkout טרי מאפס mtime בלי קשר לגיל האמיתי
  7. retry         - לא בדיקה עצמאית, אלא הקשר שנוסף ל-missed/hidden: כמה נסיונות
                      רצופים נכשלו, ומתי הניסיון הבא (retry הוא הירי המתוזמן הבא,
                      אין רענון-מיידי בפלטפורמה הזו - זה מתועד כאן ולא מוסתר)

שימוש:
    health.py                 דוח מלא, טקסט עברי
    health.py --json          פלט מכונה
    health.py --alert-text    רק שורות ההתראה, ריק אם הכל תקין
    health.py --alert-if-new  כמו --alert-text אך עם דדופ. זה מה ש-gateway מריץ
    health.py --classify-note "<note>"   ok או degraded, לפי סימני כשל בהערה
    health.py --quiet         בלי פלט, רק קוד יציאה

קוד יציאה: 0 תקין או צהוב · 1 יש RED · 2 שגיאת הרצה
זה אבחון בלבד. הוא לא כותב ל-git, לא שולח, ולא מתקן.
"""
import json
import os
import re
import subprocess
import sys
import datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_ROOT = os.path.dirname(ROOT)
RUNS = os.path.join(ROOT, "state", "runs.jsonl")
EXPECTED = os.path.join(ROOT, "state", "expected.json")
OUTBOX = os.path.join(ROOT, "outbox")
HEALTH = os.path.join(ROOT, "state", "health.json")
HEARTBEAT_DIR = os.path.join(ROOT, "state", "heartbeat")

# סימני כשל בתוך הערת ריצה שנרשמה כ-ok. מבוסס על כשלים אמיתיים מהיומן,
# לא על ניחוש: "telegram_fetch נכשל: HTTP 404" נרשם כ-ok ב-30.8
FAILURE_MARKERS = (
    "נכשל", "כשל", "שגיאה", "חסום", "לא הצלחתי", "לא זמין", "תקוע",
    "HTTP 4", "HTTP 5", "error", "Error", "ERROR", "timeout", "Traceback",
    "refused", "denied", "unauthorized", "forbidden",
)

# ניסוחים שנשמעים ככשל אך הם תוצאה עסקית תקינה. מוסרים מההערה לפני הסריקה.
# בלי זה "נכשלו בשער הערך" - שהיא בדיוק ההתנהגות הרצויה - נספרת כתקלה,
# והשומר מאבד אמון תוך יומיים. שומר שצועק על הצלחה מכבים אותו, ובצדק.
BENIGN_PHRASES = (
    "נכשלו בשער הערך", "נכשל בשער הערך",
    "נכשלו בשער הדדופ", "נכשל בשער הדדופ",
    "נכשלו בשער", "נכשל בשער",
    "נכשלו בסף", "נכשל בסף",
    "נכשלו באימות הראיה", "נכשל באימות הראיה",
    # "מה תקוע" הוא סעיף קבוע בבריף (brief-daily.md / chief-of-staff.md) - chief-of-staff
    # כותב "אין דגל/תקוע חדש" בכל ריצה רגילה. בלי זה, הדיווח התקין ביותר האפשרי
    # (שום דבר לא תקוע) נתפס כרשומת כשל, כל יום. נמצא בפועל ב-01.09 03:19Z.
    "אין דגל/תקוע חדש", "אין תקוע חדש", "אין דגל חדש/תקוע חדש",
)


# מקטע שמדווח על חסימת מקור חיצוני. לפי חוזה scout (filter.md) חסימה היא שגרה
# מוצהרת ולא תקלה, והדוח חייב לתעד אותה. ריצה שהפיקה ממצאים למרות חסימה היא
# בדיוק ההתנהגות הרצויה - לא ריצה מדורדרת. קרה ב-03.09: scout מצא 2 ממצאים
# תקינים, כתב "mckinsey.com חסום HTTP 503", ונרשם degraded.
BLOCKED_CLAUSE = re.compile(r"[^,.;|]*חסום[^,.;|]*")


def scrub(note):
    """מסיר ניסוחי תוצאה עסקית לפני חיפוש סימני כשל טכני."""
    for phrase in BENIGN_PHRASES:
        note = note.replace(phrase, "")
    return note
STUCK_HOURS = 3          # הודעה בתור מעבר לזה = gateway לא מנקז
MISSED_LOOKBACK_DAYS = 14
REPEAT_ALERT_HOURS = 12  # אותה התראה בדיוק לא נשלחת שוב לפני זה


def now_utc():
    return dt.datetime.now(dt.timezone.utc)


def parse_ts(s):
    if not s:
        return None
    try:
        t = dt.datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return t if t.tzinfo else t.replace(tzinfo=dt.timezone.utc)
    except (ValueError, TypeError):
        return None


# ------------------------------------------------------------------ cron match
def _field(spec, value, lo, hi):
    """התאמת שדה cron בודד. תומך ב-* , - / ובטווח מפורש."""
    for part in str(spec).split(","):
        part = part.strip()
        if not part:
            continue
        step = 1
        if "/" in part:
            part, _, st = part.partition("/")
            try:
                step = int(st)
            except ValueError:
                return False
            if step <= 0:
                return False
        if part in ("*", ""):
            start, end = lo, hi
        elif "-" in part:
            a, _, b = part.partition("-")
            try:
                start, end = int(a), int(b)
            except ValueError:
                return False
        else:
            try:
                start = end = int(part)
            except ValueError:
                return False
        if start > end:
            continue
        if start <= value <= end and (value - start) % step == 0:
            return True
    return False


def cron_matches(cron, when):
    """when הוא datetime ב-UTC. cron בן חמישה שדות, כמו ב-Routines."""
    f = cron.split()
    if len(f) != 5:
        return False
    dow = (when.weekday() + 1) % 7  # python: Mon=0 · cron: Sun=0
    return (
        _field(f[0], when.minute, 0, 59)
        and _field(f[1], when.hour, 0, 23)
        and _field(f[2], when.day, 1, 31)
        and _field(f[3], when.month, 1, 12)
        and _field(f[4], dow, 0, 6)
    )


def fires_between(crons, start, end):
    """כמה ירי מתוזמן היו בין שני הזמנים. סורק בדקות - החלון קצר, זה זול."""
    if start >= end:
        return 0
    cur = start.replace(second=0, microsecond=0) + dt.timedelta(minutes=1)
    count = 0
    while cur <= end:
        if any(cron_matches(c, cur) for c in crons):
            count += 1
        cur += dt.timedelta(minutes=1)
    return count


def next_fire_after(crons, start, horizon_days=14):
    """הירי המתוזמן הבא. זה ה-retry האמיתי בפלטפורמה הזו - אין רענון-מיידי
    לרוטין שנכשל, ולכן retry הוא כנה רק אם הוא מדווח את הזמן האמיתי הזה,
    לא מעמיד פנים שיש ניסיון חוזר תוך דקות כשאין."""
    cur = start.replace(second=0, microsecond=0) + dt.timedelta(minutes=1)
    limit = start + dt.timedelta(days=horizon_days)
    while cur <= limit:
        if any(cron_matches(c, cur) for c in crons):
            return cur
        cur += dt.timedelta(minutes=1)
    return None


def next_fire_str(crons, now):
    nxt = next_fire_after(crons, now)
    return f"{nxt:%d.%m %H:%M}Z" if nxt else "לא נמצא בטווח הקרוב"


# ----------------------------------------------------------------------- input
def load_runs():
    runs = []
    if not os.path.exists(RUNS):
        return runs
    with open(RUNS, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                runs.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return runs


def load_expected():
    if not os.path.exists(EXPECTED):
        return {}
    try:
        with open(EXPECTED, encoding="utf-8") as fh:
            return json.load(fh).get("agents", {})
    except (json.JSONDecodeError, OSError):
        return {}


def load_stale_sources():
    if not os.path.exists(EXPECTED):
        return {}
    try:
        with open(EXPECTED, encoding="utf-8") as fh:
            d = json.load(fh)
        return {k: v for k, v in d.get("stale_sources", {}).items() if not k.startswith("_")}
    except (json.JSONDecodeError, OSError):
        return {}


def load_heartbeats():
    out = {}
    if not os.path.isdir(HEARTBEAT_DIR):
        return out
    for name in os.listdir(HEARTBEAT_DIR):
        if not name.endswith(".json"):
            continue
        try:
            with open(os.path.join(HEARTBEAT_DIR, name), encoding="utf-8") as fh:
                rec = json.load(fh)
        except (json.JSONDecodeError, OSError):
            continue
        out[rec.get("agent") or name[:-5]] = rec
    return out


def _true_ok(rec):
    """סטטוס ok אמיתי - לא רק status=='ok', גם ההערה חייבת להיות נקייה מסימני כשל.
    בלי זה סטריק הכשלים לא ייעצר על רשומה שדווחה ok אך היא בעצם hidden failure."""
    return (rec.get("status") == "ok"
            and classify_note(rec.get("note") or "", rec.get("items")) == "ok")


def consecutive_non_ok(runs, agent):
    """כמה רשומות רצופות אחרונות של הסוכן אינן ok אמיתי. זה מונה ה-retry."""
    agent_runs = sorted([r for r in runs if r.get("agent") == agent],
                        key=lambda r: str(r.get("ts") or ""))
    streak = 0
    for r in reversed(agent_runs):
        if _true_ok(r):
            break
        streak += 1
    return streak


# ---------------------------------------------------------------------- checks
def check_missed(runs, expected, now):
    """ירי מתוזמן שלא הותיר רשומה. זה הבדיקה שתופסת מוות לפני desk.sh."""
    out = []
    horizon = now - dt.timedelta(days=MISSED_LOOKBACK_DAYS)
    for agent, cfg in expected.items():
        crons = cfg.get("cron") or []
        if not crons:
            continue
        # טריגר בלי ריפו מחובר יורה לתוך קונטיינר ריק. זו תצורה חסרה, לא תקלת
        # runtime, והפתרון היחיד הוא לחיצה של אביעד ב-UI. לספור את זה כאדום
        # מטשטש כשלים אמיתיים ומייצר התראה שאי אפשר לפעול לפיה מהקוד.
        if cfg.get("connected") is False:
            out.append({
                "level": "YELLOW", "check": "not_connected", "agent": agent,
                "detail": f"{agent}: NOT CONNECTED - הטריגר קיים אך ללא ריפו מחובר. "
                          f"דורש חיבור חד-פעמי ב-claude.ai/code/routines. לא כשל runtime",
            })
            continue
        grace = int(cfg.get("grace_misses", 2))
        agent_runs = [r for r in runs if r.get("agent") == agent]
        last = max((parse_ts(r.get("ts")) for r in agent_runs if parse_ts(r.get("ts"))), default=None)
        since = last or horizon
        if since < horizon:
            since = horizon
        missed = fires_between(crons, since, now)
        if missed >= grace:
            age = "מעולם לא רץ" if not last else f"אחרון: {last:%d.%m %H:%M}Z"
            streak = consecutive_non_ok(runs, agent)
            retry_note = f" ועוד {streak} רשומות כשל רצופות לפניו" if streak else ""
            out.append({
                "level": "RED", "check": "missed", "agent": agent,
                "detail": (f"{agent}: {missed} ירי מתוזמן ללא רשומה ({age}){retry_note}. "
                          f"retry - הירי המתוזמן הבא: {next_fire_str(crons, now)}"),
            })
        elif missed == 1 and grace > 1:
            out.append({
                "level": "YELLOW", "check": "missed", "agent": agent,
                "detail": f"{agent}: החמצה אחת, עדיין בתוך הסבילות",
            })
    return out


def check_hidden(runs, expected, now, window_hours=26):
    """רשומת ok שההערה שלה מודה בכשל, או רשומת failed מפורשת.

    מדווח רשומה אחת בלבד לכל סוכן - האחרונה בחלון - עם מונה הסטריק המצטבר.
    שלושה כשלים רצופים של אותו סוכן הם אירוע אחד מתמשך, לא שלוש התראות זהות -
    בלעדי זה, fingerprint (check:agent זהה לשלושתן) גם ככה מקפל אותן לירייה
    אחת בדדופ, אבל הדוח המלא (health.py בלי --alert) היה מציג שלוש שורות
    כמעט זהות על אותה תקלה עצמה. זה רעש, לא מידע.
    """
    out = []
    cutoff = now - dt.timedelta(hours=window_hours)
    latest = {}
    for r in runs:
        ts = parse_ts(r.get("ts"))
        if not ts or ts < cutoff:
            continue
        agent = r.get("agent")
        note = str(r.get("note") or "")
        degraded = classify_note(note, r.get("items")) == "degraded"
        hit = next((m for m in FAILURE_MARKERS if m in scrub(note)), None) if degraded else None
        if r.get("status") != "failed" and not hit:
            continue
        prev = latest.get(agent)
        if prev is None or ts > prev[0]:
            latest[agent] = (ts, r, hit)

    for agent, (ts, r, hit) in latest.items():
        note = str(r.get("note") or "")
        streak = consecutive_non_ok(runs, agent)
        crons = (expected.get(agent) or {}).get("cron") or []
        retry_txt = f" retry - הירי המתוזמן הבא: {next_fire_str(crons, now)}" if crons else ""
        escalate = "כשל חוזר. " if streak >= 3 else ""

        if r.get("status") == "failed":
            out.append({
                "level": "RED", "check": "failed", "agent": agent,
                "detail": (f"{escalate}{agent} נכשל ב-{ts:%d.%m %H:%M}Z "
                          f"(נסיון {streak} ברצף): {str(r.get('reason') or note)[:120]}.{retry_txt}"),
            })
        else:
            out.append({
                "level": "RED", "check": "hidden", "agent": agent,
                "detail": (f"{escalate}{agent} נרשם ok אך ההערה מכילה \"{hit}\" "
                          f"({ts:%d.%m %H:%M}Z, נסיון {streak} ברצף): {note[:120]}.{retry_txt}"),
            })
    return out


def check_barren(runs, expected):
    """רצף דוחות ריקים. דעיכת תפוקה היא כשל שקט, לא משמעת."""
    out = []
    for agent, cfg in expected.items():
        limit = cfg.get("barren_limit")
        if not limit:
            continue
        agent_runs = [r for r in runs if r.get("agent") == agent]
        agent_runs.sort(key=lambda r: str(r.get("ts") or ""))
        streak = 0
        for r in reversed(agent_runs):
            if int(r.get("items") or 0) == 0:
                streak += 1
            else:
                break
        if streak >= int(limit):
            out.append({
                "level": "RED", "check": "barren", "agent": agent,
                "detail": f"{agent}: {streak} דוחות ריקים ברצף (סף {limit}). המנוע רץ ולא מייצר",
            })
        elif streak >= int(limit) - 1:
            out.append({
                "level": "YELLOW", "check": "barren", "agent": agent,
                "detail": f"{agent}: {streak} דוחות ריקים ברצף, עוד אחד וזו התראה",
            })
    return out


def check_hung(runs, expected, now):
    """heartbeat פתוחה מעל max_minutes בלי finish/fail תואם - תהליך תקוע או מת.

    זה תחליף מהיר בהרבה ל-missed: לא מחכה שכל ה-grace_misses של הירי המתוזמן
    ייגמרו (שעות עד ימים), רק שחלף זמן ריצה סביר מאז ש-cmd_start כתב heartbeat.
    """
    out = []
    for agent, hb in load_heartbeats().items():
        started = parse_ts(hb.get("started_at"))
        if not started:
            continue
        ceiling = int((expected.get(agent) or {}).get("max_minutes", 30))
        age_min = (now - started).total_seconds() / 60.0
        if age_min < ceiling:
            continue
        agent_runs = [r for r in runs if r.get("agent") == agent]
        finished_after = any(
            parse_ts(r.get("ts")) and parse_ts(r.get("ts")) >= started for r in agent_runs
        )
        if finished_after:
            # heartbeat נשארה על הדיסק מריצה קודמת, אבל runs.jsonl כבר מוכיח סיום.
            # לא תקוע - רק שאריות שלא נמחקו, לא באג פעיל
            continue
        out.append({
            "level": "RED", "check": "hung", "agent": agent,
            "detail": (f"{agent}: החל ריצה ב-{started:%d.%m %H:%M}Z ולא סיים אחרי "
                      f"{age_min:.0f} דקות (תקרה: {ceiling}). ייתכן שהתהליך מת באמצע"),
        })
    return out


def check_stale_sources(now):
    """מקור ש-chief-of-staff מציג לא עודכן. לפי git log -1 על הנתיב, לא mtime -
    checkout טרי מאפס mtime של כל קובץ בלי קשר לגיל האמיתי שלו בהיסטוריית הגיט."""
    out = []
    for rel, spec in load_stale_sources().items():
        max_hours = float(spec.get("max_hours", 48))
        try:
            proc = subprocess.run(
                ["git", "log", "-1", "--format=%cI", "--", rel],
                cwd=REPO_ROOT, capture_output=True, text=True, timeout=10,
            )
            last = parse_ts(proc.stdout.strip()) if proc.returncode == 0 else None
        except (OSError, subprocess.SubprocessError):
            last = None

        label = rel.rsplit("/", 1)[-1]
        if last is None:
            out.append({
                "level": "YELLOW", "check": "stale_source", "agent": label,
                "detail": f"{rel}: אין היסטוריית git על הנתיב, לא ניתן לבדוק עדכניות",
            })
            continue
        age_h = (now - last).total_seconds() / 3600.0
        if age_h >= max_hours:
            out.append({
                "level": "RED", "check": "stale_source", "agent": label,
                "detail": (f"{rel}: לא עודכן {age_h:.0f} שעות (סף {max_hours:.0f}). "
                          f"עדכון אחרון: {last:%d.%m %H:%M}Z. chief-of-staff חייב לציין "
                          f"זאת בבריף ולא להציג את המצב כעדכני"),
            })
    return out


def check_stuck(now):
    """הודעה שתקועה בתור. אם gateway לא מנקז, אביעד לא יודע כלום."""
    out = []
    if not os.path.isdir(OUTBOX):
        return out
    for name in sorted(os.listdir(OUTBOX)):
        path = os.path.join(OUTBOX, name)
        if not os.path.isfile(path) or not name.endswith(".json"):
            continue
        age_h = (now.timestamp() - os.path.getmtime(path)) / 3600.0
        if age_h >= STUCK_HOURS:
            out.append({
                "level": "RED", "check": "stuck", "agent": name.split("-")[0],
                "detail": f"הודעה תקועה בתור {age_h:.0f} שעות: {name}",
            })
    return out


# ---------------------------------------------------------------------- report
def build(now=None):
    now = now or now_utc()
    runs = load_runs()
    expected = load_expected()
    findings = (
        check_missed(runs, expected, now)
        + check_hung(runs, expected, now)
        + check_hidden(runs, expected, now)
        + check_barren(runs, expected)
        + check_stale_sources(now)
        + check_stuck(now)
    )
    red = [f for f in findings if f["level"] == "RED"]
    yellow = [f for f in findings if f["level"] == "YELLOW"]
    return {
        "checked_at": now.isoformat(timespec="seconds"),
        "status": "RED" if red else ("YELLOW" if yellow else "GREEN"),
        "red": len(red), "yellow": len(yellow),
        "runs_seen": len(runs), "agents_watched": len(expected),
        "findings": findings,
    }


def as_text(rep, alert_only=False):
    if alert_only and rep["status"] != "RED":
        return ""
    icon = {"GREEN": "תקין", "YELLOW": "שים לב", "RED": "התראה"}[rep["status"]]
    lines = []
    if alert_only:
        lines.append(f"בריאות המערכת: {icon} · {rep['red']} אדום")
    else:
        lines.append(f"בריאות המערכת: {icon}")
        lines.append(f"{rep['runs_seen']} ריצות ביומן · {rep['agents_watched']} סוכנים תחת שמירה")
    for f in rep["findings"]:
        if alert_only and f["level"] != "RED":
            continue
        lines.append(("- " if f["level"] == "RED" else "  ") + f["detail"])
    if not alert_only and not rep["findings"]:
        lines.append("אין ממצא. כל הרוטינים בזמן, אין כשל מוסתר, אין דעיכה, התור נקי")
    return "\n".join(lines)


def fingerprint(rep):
    """טביעת אצבע של מצב האדום. משתנה רק כשמשהו אמיתי משתנה."""
    keys = sorted(f"{f['check']}:{f['agent']}" for f in rep["findings"] if f["level"] == "RED")
    return "|".join(keys)


def alert_if_new(rep, now=None):
    """מחזיר טקסט התראה רק אם המצב חדש, או אם עברו REPEAT_ALERT_HOURS.

    בלי זה אותה התראה נשלחת 24 פעם ביום, אביעד משתיק את הבוט, והשומר מת.
    """
    now = now or now_utc()
    state = {}
    if os.path.exists(HEALTH):
        try:
            with open(HEALTH, encoding="utf-8") as fh:
                state = json.load(fh)
        except (json.JSONDecodeError, OSError):
            state = {}

    fp = fingerprint(rep)
    prev_fp = state.get("last_alert_fingerprint", "")
    prev_at = parse_ts(state.get("last_alert_at"))

    if rep["status"] != "RED":
        # התאוששות: היה אדום, כבר לא. זה שווה הודעה אחת
        recovered = bool(prev_fp)
        state = {"last_status": rep["status"], "last_checked_at": now.isoformat(timespec="seconds"),
                 "last_alert_fingerprint": "", "last_alert_at": state.get("last_alert_at")}
        _save_health(state)
        return "בריאות המערכת: חזר לתקין. כל הממצאים האדומים נסגרו" if recovered else ""

    stale = prev_at is None or (now - prev_at) >= dt.timedelta(hours=REPEAT_ALERT_HOURS)
    if fp == prev_fp and not stale:
        state["last_checked_at"] = now.isoformat(timespec="seconds")
        _save_health(state)
        return ""

    state = {"last_status": "RED", "last_checked_at": now.isoformat(timespec="seconds"),
             "last_alert_fingerprint": fp, "last_alert_at": now.isoformat(timespec="seconds")}
    _save_health(state)
    prefix = "" if fp != prev_fp else "עדיין פתוח. "
    return prefix + as_text(rep, alert_only=True)


def _save_health(state):
    try:
        os.makedirs(os.path.dirname(HEALTH), exist_ok=True)
        with open(HEALTH, "w", encoding="utf-8") as fh:
            json.dump(state, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
    except OSError:
        pass  # השומר לא מפיל את הריצה בגלל קובץ מצב


def classify_note(note, items=None):
    """ok או degraded. מקור אמת יחיד לסימני הכשל, כדי ש-desk.sh לא ישכפל רשימה.

    items מאפשר את ההבחנה היחידה שחסרה: ריצה שהפיקה ממצאים למרות מקור חסום
    אינה מדורדרת. ריצה שלא הפיקה כלום ומדווחת חסימה - כן, שם החסימה היא הסיבה.
    """
    text = scrub(str(note or ""))
    try:
        produced = items is not None and int(items) > 0
    except (TypeError, ValueError):
        produced = False
    if produced:
        text = BLOCKED_CLAUSE.sub("", text)
    return "degraded" if any(m in text for m in FAILURE_MARKERS) else "ok"


def main():
    args = set(sys.argv[1:])

    # מצב עצמאי: סיווג הערת ריצה. לא נוגע ביומן ולא בשומר
    if "--classify-note" in sys.argv:
        i = sys.argv.index("--classify-note")
        note = sys.argv[i + 1] if i + 1 < len(sys.argv) else ""
        items = sys.argv[i + 2] if i + 2 < len(sys.argv) else None
        print(classify_note(note, items))
        return 0

    try:
        rep = build()
    except Exception as e:  # השומר לעולם לא מפיל את הקורא
        print(f"health.py נכשל: {e}", file=sys.stderr)
        return 2
    if "--json" in args:
        print(json.dumps(rep, ensure_ascii=False, indent=2))
    elif "--alert-if-new" in args:
        txt = alert_if_new(rep)
        if txt:
            print(txt)
    elif "--alert-text" in args:
        txt = as_text(rep, alert_only=True)
        if txt:
            print(txt)
    elif "--quiet" not in args:
        print(as_text(rep))
    return 1 if rep["status"] == "RED" else 0


if __name__ == "__main__":
    sys.exit(main())
