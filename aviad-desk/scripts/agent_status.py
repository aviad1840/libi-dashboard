#!/usr/bin/env python3
"""שכבת ממשק בלבד - קריאה ממצב קיים, אפס כתיבה. משמש את gateway ל-/agents /status /runs
ואת שער התקציב לפני עבודת עומק. לא מודד עלות אמיתית - אין API לכך, הכל מתויג estimate.

שימוש:
  agent_status.py --agents          טבלת סטטוס לכל סוכן (/agents)
  agent_status.py --l2-remaining    כמה הסלמות L2 נותרו השבוע, מספר בלבד (שער תקציב)
  agent_status.py --cost-estimate   הערכת טוקנים/ריצות שבועית (/status), מסומן estimate
"""
import datetime
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
RUNS = ROOT / "state" / "runs.jsonl"
MANIFEST = ROOT / "manifest.yaml"
AGENTS_DIR = ROOT / "agents"
CONTEXT_DIR = ROOT / "context"

WEEK_AGO = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)


def load_runs():
    if not RUNS.exists():
        return []
    out = []
    for line in RUNS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            out.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return out


def parse_ts(rec):
    try:
        return datetime.datetime.fromisoformat(rec.get("ts", "").replace("Z", "+00:00"))
    except ValueError:
        return None


def this_week(runs):
    result = []
    for r in runs:
        ts = parse_ts(r)
        if ts and ts >= WEEK_AGO:
            result.append(r)
    return result


def load_cadence():
    """קריאה גולמית של manifest.yaml - אין תלות ב-PyYAML, המבנה פשוט וידוע."""
    text = MANIFEST.read_text(encoding="utf-8")
    cadence = {}
    for m in re.finditer(r"- id: (\S+).*?(?=\n  - id:|\nexecution:)", text, re.S):
        block = m.group(0)
        aid = m.group(1)
        cm = re.search(r"cadence:\s*(.+)", block)
        cadence[aid] = cm.group(1).strip() if cm else "?"
    return cadence


def agent_context_tokens(agent_id):
    """טוקני הקשר סטטיים לריצה - אותו חישוב כמו validate.py, בלי תלות בו."""
    f = AGENTS_DIR / f"{agent_id}.md"
    if not f.exists():
        return 0
    text = f.read_text(encoding="utf-8")
    files = []
    for key in ("context_base", "context_role"):
        m = re.search(key + r":\s*\[(.*?)\]", text)
        if m:
            files += [x.strip() for x in m.group(1).split(",") if x.strip()]
    total = 0
    for name in files:
        cf = CONTEXT_DIR / f"{name}.md"
        if cf.exists():
            total += len(cf.read_text(encoding="utf-8")) // 3
    return total


def cmd_agents():
    runs = load_runs()
    cadence = load_cadence()
    by_agent = {}
    for r in runs:
        by_agent.setdefault(r.get("agent", "?"), []).append(r)

    agents = sorted(set(list(cadence.keys()) + list(by_agent.keys())))
    rows = []
    for aid in agents:
        recs = sorted(by_agent.get(aid, []), key=lambda r: r.get("ts", ""))
        last = recs[-1] if recs else None
        week = [r for r in recs if parse_ts(r) and parse_ts(r) >= WEEK_AGO]
        useful = sum(r.get("items", 0) for r in week if r.get("status", "ok") == "ok")
        fails = sum(1 for r in week if r.get("status") == "failed")
        rows.append({
            "agent": aid,
            "cadence": cadence.get(aid, "?"),
            "last_run": last.get("ts", "-") if last else "אף פעם",
            "last_status": last.get("status", "ok") if last else "-",
            "runs_this_week": len(week),
            "useful_this_week": useful,
            "failures_this_week": fails,
        })
    print(json.dumps(rows, ensure_ascii=False, indent=2))


def cmd_l2_remaining():
    runs = this_week(load_runs())
    used = sum(r.get("l2", 0) for r in runs if r.get("status", "ok") == "ok")
    budget = 2  # manifest.yaml: l2_budget_per_week, מערכתי - לא לכל סוכן
    print(max(0, budget - used))


def cmd_cost_estimate():
    runs = this_week(load_runs())
    by_agent = {}
    for r in runs:
        by_agent.setdefault(r.get("agent", "?"), 0)
        by_agent[r.get("agent", "?")] += 1
    total_tokens = 0
    per_agent = {}
    for aid, count in by_agent.items():
        tok = agent_context_tokens(aid) * count
        per_agent[aid] = tok
        total_tokens += tok
    print(json.dumps({
        "_note": "estimate - טוקני הקשר בלבד, לא כולל עבודת חיפוש/כתיבה בפועל. אין API לעלות אמיתית",
        "runs_this_week": sum(by_agent.values()),
        "context_tokens_this_week_estimate": total_tokens,
        "per_agent_estimate": per_agent,
    }, ensure_ascii=False, indent=2))


def main():
    if "--agents" in sys.argv:
        cmd_agents()
    elif "--l2-remaining" in sys.argv:
        cmd_l2_remaining()
    elif "--cost-estimate" in sys.argv:
        cmd_cost_estimate()
    else:
        print(__doc__, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
