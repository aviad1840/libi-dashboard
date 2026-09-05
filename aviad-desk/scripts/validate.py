#!/usr/bin/env python3
"""בדיקת שלמות ועלות. הרץ: python3 scripts/validate.py"""
import json, pathlib, re, sys, datetime

R = pathlib.Path(__file__).resolve().parent.parent
err, warn = [], []
tok = lambda c: c // 3

REQ = ["_index","LOADING","ESCALATION","README","profile","positioning","claims","portfolio",
       "people","landscape","sources","filter","calendar","voice","glossary","anti-patterns",
       "proof-points","decision-style","open-questions","_freshness"]
for f in REQ:
    if not (R/f"context/{f}.md").exists(): err.append(f"חסר context/{f}.md")
for f in ["doctrine","operating-model"]:
    if not (R/f"context/{f}.md").exists(): warn.append(f"context/{f}.md לא הועתק - שלב 1 ב-SETUP")

BANNED = ["git push","/workspace","05:30","Grok","Cursor"]
for a in (R/"agents").glob("*.md"):
    if a.name.startswith("_"): continue
    t = a.read_text(encoding="utf-8")
    if not t.startswith("---"): err.append(f"{a.name}: חסר frontmatter")
    if "context_base" not in t: err.append(f"{a.name}: לא הומר למדיניות הטעינה החדשה")
    for b in BANNED:
        if b in t: err.append(f"{a.name}: מכיל '{b}' - תלוי פלטפורמה, מקומו ב-runners/")

for s in list((R/"schemas").glob("*.json")) + list((R/"state").glob("*.json")):
    try: json.loads(s.read_text(encoding="utf-8"))
    except Exception as e: err.append(f"{s.name}: JSON שבור - {e}")

# עלות טעינה
sizes = {f.stem: len(f.read_text(encoding="utf-8")) for f in (R/"context").glob("*.md")}
runs = {"scout":6,"radar":2,"rival":1,"relations":1,"advocate":1,"chief-of-staff":5,"curator":1}
total = 0
print(f'{"agent":<16}{"tok/run":>9}{"runs":>6}{"tok/week":>10}')
for a in (R/"agents").glob("*.md"):
    if a.name.startswith("_"): continue
    t = a.read_text(encoding="utf-8"); aid = a.stem
    if aid not in runs: continue
    files = []
    for key in ["context_base","context_role"]:
        m = re.search(key + r":\s*\[(.*?)\]", t)
        if m: files += [x.strip() for x in m.group(1).split(",") if x.strip()]
    tk = sum(tok(sizes.get(f,0)) for f in files)
    wk = tk*runs[aid]; total += wk
    print(f"{aid:<16}{tk:>9,}{runs[aid]:>6}{wk:>10,}")
print(f'{"TOTAL":<16}{"":>9}{"":>6}{total:>10,}  טוקני הקשר בשבוע')
if total > 60000: warn.append(f"עלות טעינה {total:,}/שבוע - מעל התקציב")

# רעננות
fr = (R/"context/_freshness.md")
if fr.exists():
    today = datetime.date.today()
    for m in re.finditer(r"\|\s*([\w\-\.]+\.md)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(\d+) יום", fr.read_text(encoding="utf-8")):
        name, d, ttl = m.group(1), datetime.date.fromisoformat(m.group(2)), int(m.group(3))
        age = (today - d).days
        if age > ttl: warn.append(f"{name} פג תוקף - {age} יום, תוקף {ttl}")

n = sum(len(re.findall(r"\[לאמת\]", f.read_text(encoding="utf-8"))) for f in (R/"context").glob("*.md"))
if n: warn.append(f"{n} סימוני [לאמת] פתוחים")

print()
for w in warn: print("אזהרה:", w)
for e in err: print("שגיאה:", e)
print("\n" + ("תקין" if not err else f"{len(err)} שגיאות"))
sys.exit(1 if err else 0)
