#!/usr/bin/env python3
"""לולאת הטיוטה - מה שאביעד שינה הוא ההוראה האמיתית.

המערכת לא יודעת לכתוב בקול שלו. היא יודעת מה כתוב ב-voice.md, וזה לא אותו דבר.
הפער נסגר במקום אחד בלבד: בהבדל בין מה שהיא הציעה לבין מה שהוא באמת פרסם.

כל עריכה שלו היא נתון. הכלי הזה הופך אותה למשהו מדיד:

    טיוטה (amplify/draft-*.md)  ->  סופי (inbox/published/*.md)  ->  דלתאות

**עריכה אחת היא רעש. שלוש עריכות זהות הן כלל.** זה בדיוק חוק הברזל של curator,
ולכן הכלי מציע ולא כותב. הוא מתייק ל-state/edits.jsonl, וכשניסוח נחתך שלוש
פעמים הוא מציע כלל ל-context/voice-learned.md. curator מאשר, אביעד מאשר, ורק אז זה נכנס.

שימוש:
    diff_learn.py --auto               מצא זוגות חדשים לבד, עבד אותם. זה מה ש-curator מריץ
    diff_learn.py <draft> <final>      השווה זוג ספציפי, תייק דלתאות, הדפס סיכום
    diff_learn.py --pair <draft> <final> --dry-run    בלי לתייק
    diff_learn.py --rules              כללים בשלים מהמאגר (3 חזרות ומעלה)
    diff_learn.py --report             מצב הלמידה: כמה זוגות, מה חוזר
    diff_learn.py --json               פלט מכונה

קוד יציאה: 0 תמיד, למעט שגיאת הרצה (2). זה כלי למידה, הוא לא חוסם כלום.
"""
import json
import os
import re
import sys
import datetime as dt
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORE = os.path.join(ROOT, "state", "edits.jsonl")

PROMOTE_AT = 3          # כמה חזרות עד שדלתא הופכת למועמד לכלל
NGRAM_MIN, NGRAM_MAX = 2, 5

EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿←-⇿⬀-⯿]")
HASHTAG = re.compile(r"#[\w֐-׿]+")
NUMBER = re.compile(r"\d+(?:[.,]\d+)?\s*%?")
EM_DASH = re.compile(r"[—–]")
MARKETING = ("פורץ דרך", "מהפכני", "גאה לשתף", "נרגש לשתף", "אין ספק", "ללא ספק",
             "חד משמעית", "בלתי נתפס", "מדהים", "מרגש", "היסטורי")

# שמונה תחנות השלד מ-publishing-playbook.md, לפי סימנים שניתן לזהות מכנית
STATIONS = {
    "וו": lambda t: bool(t.strip()) and not t.strip().split("\n")[0].endswith(":"),
    "נקודות": lambda t: len(re.findall(r"^\s*[🔹✅•\-\*]\s", t, re.M)) >= 3,
    "מסגור": lambda t: ("לא " in t and " אלא " in t) or "השאלה היא לא" in t,
    "הודאה בגבול": lambda t: any(k in t for k in
        ("זה לא מוכיח", "מה שזה לא", "עוד לא פתור", "אני עלול לטעות",
         "המגבלה", "מה שעדיין לא", "לא נפתר", "טרם")),
    "שאלה": lambda t: "?" in t,
    "תיוג": lambda t: "@" in t or bool(re.search(r"תודה ל", t)),
    "האשטגים": lambda t: bool(HASHTAG.search(t)),
}


def norm(text):
    text = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.S)   # front-matter
    return re.sub(r"[ \t]+", " ", text).strip()


def words(text):
    return [w for w in re.split(r"[\s,.;:!?()\[\]\"'״׳]+", text) if w]


def ngrams(toks, lo=NGRAM_MIN, hi=NGRAM_MAX):
    out = set()
    for n in range(lo, hi + 1):
        for i in range(len(toks) - n + 1):
            out.add(" ".join(toks[i:i + n]))
    return out


def top_phrases(pool, limit=5):
    """n-gram גולמי מייצר עשרות וריאציות חופפות של אותו שינוי.

    שלושה מסננים, ובלעדיהם האות האמיתי - "הוא חתך את השפה השיווקית" - נקבר
    מתחת לתריסר תמורות של אותה שורת האשטגים:
      1. רצף האשטגים יוצא. הוא כבר נמדד בנפרד ב-hashtag_count
      2. גראם שמוכל בגראם ארוך יותר שכבר נבחר - יוצא
      3. ניסוח שיווקי עולה לראש. זה מה שבאמת רוצים ללמוד
    """
    cand = [g for g in pool if not g.strip().startswith("#") and g.count("#") < 2]
    cand.sort(key=lambda g: (0 if any(m in g for m in MARKETING) else 1, -len(g)))
    picked = []
    for g in cand:
        if any(g in kept for kept in picked):
            continue
        picked.append(g)
        if len(picked) >= limit:
            break
    return picked


# ----------------------------------------------------------------------- delta
def compare(draft_raw, final_raw, draft_name="", final_name=""):
    d, f = norm(draft_raw), norm(final_raw)
    dw, fw = words(d), words(f)
    deltas = []

    def add(kind, detail, payload=None, weight="medium"):
        deltas.append({"kind": kind, "detail": detail, "payload": payload, "weight": weight})

    # 1. אורך. הסימן הכי גס ולעיתים הכי חשוב
    if dw and fw:
        pct = round((len(fw) - len(dw)) / len(dw) * 100)
        if abs(pct) >= 15:
            direction = "קיצר" if pct < 0 else "הרחיב"
            add("length", f"אביעד {direction} ב-{abs(pct)}% ({len(dw)} -> {len(fw)} מילים)",
                {"pct": pct}, "high" if abs(pct) >= 30 else "medium")

    # 2. ניסוחים שנחתכו. זה האות החזק ביותר ל"אל תכתוב ככה"
    dn, fn = ngrams(dw), ngrams(fw)
    kept, orig = set(fw), set(dw)
    cut = {g for g in dn - fn if not all(w in kept for w in g.split())}
    added = {g for g in fn - dn if not all(w in orig for w in g.split())}

    for kind, pool, label, base_weight in (
        ("cut_phrase", cut, "נחתך", "medium"),
        ("added_phrase", added, "אביעד הוסיף", "high"),
    ):
        for g in top_phrases(pool):
            add(kind, f"{label}: \"{g}\"", {"phrase": g},
                "high" if any(m in g for m in MARKETING) else base_weight)

    # 3. הפתיח. התחנה עם ההשפעה הגדולה ביותר על מעורבות
    d0 = d.split("\n")[0].strip() if d else ""
    f0 = f.split("\n")[0].strip() if f else ""
    if d0 and f0 and d0 != f0:
        add("hook", f"החליף את הפתיח.\n    היה:  {d0[:110]}\n    הפך ל: {f0[:110]}",
            {"from": d0, "to": f0}, "high")

    # 4. מספרים. אם הוא הסיר מספר, המערכת כנראה המציאה אותו - זה כשל ראיה, לא סגנון
    dnums, fnums = set(NUMBER.findall(d)), set(NUMBER.findall(f))
    gone = {n for n in dnums - fnums if n.strip()}
    if gone:
        add("number_removed",
            f"הסיר מספרים: {', '.join(sorted(gone)[:6])}. בדוק אם היה להם מקור",
            {"numbers": sorted(gone)}, "high")
    new_nums = {n for n in fnums - dnums if n.strip()}
    if new_nums:
        add("number_added",
            f"הוסיף מספרים שהמערכת לא ידעה: {', '.join(sorted(new_nums)[:6])}",
            {"numbers": sorted(new_nums)}, "high")

    # 5. תחנות השלד שנשרו או נוספו
    for name, test in STATIONS.items():
        din, fin = test(d), test(f)
        if din and not fin:
            add("station_dropped", f"הסיר את תחנת \"{name}\"", {"station": name}, "high")
        elif fin and not din:
            add("station_added", f"הוסיף את תחנת \"{name}\" שחסרה בטיוטה",
                {"station": name}, "high")

    # 6. סימנים מכניים
    for label, pat, key in (("אימוג'י", EMOJI, "emoji"), ("האשטגים", HASHTAG, "hashtag")):
        dc, fc = len(pat.findall(d)), len(pat.findall(f))
        if dc != fc:
            add(f"{key}_count", f"{label}: {dc} -> {fc}", {"from": dc, "to": fc}, "low")
    if EM_DASH.search(d) and not EM_DASH.search(f):
        add("em_dash", "הסיר em dash. הכלל נשבר בטיוטה", None, "high")

    return {
        "at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "draft": draft_name, "final": final_name,
        "draft_words": len(dw), "final_words": len(fw),
        "deltas": deltas,
    }


# ----------------------------------------------------------------------- store
def append(rec):
    os.makedirs(os.path.dirname(STORE), exist_ok=True)
    with open(STORE, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(rec, ensure_ascii=False) + "\n")


def load():
    if not os.path.exists(STORE):
        return []
    out = []
    with open(STORE, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    out.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return out


def mature_rules(records=None):
    """דלתא שחזרה PROMOTE_AT פעמים לפחות. אחת היא רעש, שלוש הן כלל."""
    records = load() if records is None else records
    counts, examples = Counter(), {}
    for rec in records:
        for d in rec.get("deltas", []):
            pay = d.get("payload") or {}
            if d["kind"] in ("cut_phrase", "added_phrase"):
                key = (d["kind"], pay.get("phrase", ""))
            elif d["kind"] in ("station_dropped", "station_added"):
                key = (d["kind"], pay.get("station", ""))
            elif d["kind"] == "length":
                key = (d["kind"], "קיצר" if pay.get("pct", 0) < 0 else "הרחיב")
            elif d["kind"] in ("hook", "number_removed", "number_added",
                               "em_dash", "emoji_count", "hashtag_count"):
                key = (d["kind"], "")
            else:
                continue
            counts[key] += 1
            examples.setdefault(key, d["detail"])

    rules = []
    for (kind, val), n in counts.most_common():
        if n < PROMOTE_AT:
            continue
        # ניסוח שאביעד הוסיף ויש בו מספר הוא תוכן של פוסט מסוים, לא כלל סגנון.
        # להעלות אותו ככלל פירושו ללמד את המערכת לחזור על אותו פוסט
        if kind == "added_phrase" and (re.search(r"\d", val) or "#" in val):
            continue
        rules.append({"kind": kind, "value": val, "times": n,
                      "rule": phrase_rule(kind, val, n), "example": examples[(kind, val)]})

    # קיפול חפיפות. "פורץ דרך שהובלתי בביטוח לאומי" ו-"מהלך פורץ דרך שהובלתי בביטוח"
    # הם אותו לקח בדיוק, ואף אחד מהם אינו תת-מחרוזת של השני. הבדיקה היא חפיפת
    # מילים, לא הכלה. בלי זה curator מקבל שישה ניסוחים של אותו כלל אחד ומאבד אמון.
    collapsed, seen = [], []
    for r in sorted(rules, key=lambda r: (-r["times"], -len(str(r["value"])))):
        if r["kind"] in ("cut_phrase", "added_phrase"):
            w = set(str(r["value"]).split())
            if any(len(w & prev) / max(len(w | prev), 1) >= 0.5 for prev in seen):
                continue
            seen.append(w)
        collapsed.append(r)
    return collapsed


def phrase_rule(kind, val, n):
    if kind == "cut_phrase":
        return f"אל תכתוב \"{val}\". אביעד חתך את זה {n} פעמים"
    if kind == "added_phrase":
        return f"השתמש ב-\"{val}\". אביעד הוסיף את זה {n} פעמים ידנית"
    if kind == "station_dropped":
        return f"תחנת \"{val}\" יורדת אצלו בפועל. חשוב מחדש אם היא נחוצה ({n} פעמים)"
    if kind == "station_added":
        return f"תחנת \"{val}\" חסרה בטיוטות שלך. הוסף אותה מראש ({n} פעמים)"
    if kind == "length":
        return f"אביעד {val} את הטיוטה {n} פעמים. כוון לאורך שלו מראש"
    if kind == "hook":
        return f"הפתיח שלך הוחלף {n} פעמים. זו התחנה החלשה ביותר שלך"
    if kind == "number_removed":
        return f"אביעד הסיר מספרים {n} פעמים. בדוק שכל מספר נושא מקור לפני שאתה כותב אותו"
    if kind == "number_added":
        return f"אביעד הוסיף מספרים משלו {n} פעמים. שאל אותו לנתון במקום לוותר עליו"
    if kind == "em_dash":
        return f"em dash הופיע בטיוטות שלך {n} פעמים. הכלל הוא מקף רגיל, תמיד"
    if kind == "emoji_count":
        return f"מספר האימוג'ים תוקן {n} פעמים"
    if kind == "hashtag_count":
        return f"מספר ההאשטגים תוקן {n} פעמים"
    return f"{kind} {val} - {n} פעמים"


# ---------------------------------------------------------------------- output
def pair_text(rec):
    lines = [f"לולאת הטיוטה: {os.path.basename(rec['draft'])} -> {os.path.basename(rec['final'])}",
             f"{rec['draft_words']} -> {rec['final_words']} מילים · {len(rec['deltas'])} דלתאות"]
    if not rec["deltas"]:
        lines.append("אין הבדל מהותי. הטיוטה עברה כמעט כמו שהיא - זה האות החזק ביותר שהמערכת מתכנסת")
        return "\n".join(lines)
    order = {"high": 0, "medium": 1, "low": 2}
    for d in sorted(rec["deltas"], key=lambda x: order.get(x["weight"], 3)):
        lines.append(("  " if d["weight"] == "low" else "- ") + d["detail"])
    return "\n".join(lines)


def report_text():
    recs = load()
    rules = mature_rules(recs)
    lines = [f"מצב הלמידה: {len(recs)} זוגות טיוטה-סופי במאגר"]
    if not recs:
        lines.append("אין עדיין דאטה. כל פוסט שאביעד מפרסם בפועל, אחרי טיוטה, מזין את זה")
        lines.append(f"צריך {PROMOTE_AT} חזרות של אותה עריכה כדי שתהפוך לכלל")
        return "\n".join(lines)
    total = sum(len(r.get("deltas", [])) for r in recs)
    lines.append(f"{total} דלתאות נאספו · {len(rules)} בשלות לכלל ({PROMOTE_AT} חזרות ומעלה)")
    if rules:
        lines.append("")
        lines.append("כללים בשלים - מועמדים ל-context/voice-learned.md:")
        for r in rules:
            lines.append(f"- {r['rule']}")
    near = [1 for r in recs for _ in r.get("deltas", [])]
    if not rules and near:
        lines.append("שום דלתא עוד לא חזרה מספיק פעמים. זה תקין - עריכה אחת היא רעש")
    return "\n".join(lines)


# ------------------------------------------------------------------- pairing
DRAFTS = os.path.join(ROOT, "amplify")
PUBLISHED = os.path.join(ROOT, "inbox", "published")


def front_matter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            out[k.strip()] = v.strip()
    return out


def slug_of(name):
    """draft-2026-09-03-mahal.md ו-2026-09-03-mahal.md מצביעים על אותו פוסט."""
    base = os.path.splitext(os.path.basename(name))[0]
    return re.sub(r"^(draft|final|published)-", "", base)


def find_pairs():
    """מזווג טיוטה לגרסה שאביעד באמת פרסם.

    שתי דרכים, בסדר הזה:
      1. הקובץ הסופי מצהיר draft: <נתיב> ב-front-matter. מדויק, עדיף
      2. אותו slug בשם הקובץ. הדרך שלא דורשת מאביעד לכתוב כלום

    זוג שכבר עובד לא מעובד שוב - המאגר מכיל את הנתיבים.
    """
    if not os.path.isdir(PUBLISHED):
        return []
    done = {(r.get("draft"), r.get("final")) for r in load()}
    drafts = {}
    if os.path.isdir(DRAFTS):
        for f in os.listdir(DRAFTS):
            if f.endswith(".md") and not f.startswith("."):
                drafts[slug_of(f)] = os.path.join(DRAFTS, f)

    pairs = []
    for f in sorted(os.listdir(PUBLISHED)):
        if not f.endswith(".md") or f.startswith("."):
            continue
        fp = os.path.join(PUBLISHED, f)
        try:
            fm = front_matter(open(fp, encoding="utf-8").read())
        except OSError:
            continue
        dp = None
        ref = fm.get("draft")
        if ref:
            cand = os.path.join(ROOT, ref.replace("aviad-desk/", "", 1))
            if os.path.isfile(cand):
                dp = cand
        if not dp:
            dp = drafts.get(slug_of(f))
        if not dp:
            continue
        key = (os.path.relpath(dp, ROOT), os.path.relpath(fp, ROOT))
        if key in done:
            continue
        pairs.append((dp, fp))
    return pairs


def run_auto(dry=False):
    pairs = find_pairs()
    if not pairs:
        return "אין זוג חדש לעיבוד. זה תקין - זה אומר שאביעד לא פרסם מאז הריצה הקודמת"
    out = []
    for dp, fp in pairs:
        rec = compare(open(dp, encoding="utf-8").read(), open(fp, encoding="utf-8").read(),
                      os.path.relpath(dp, ROOT), os.path.relpath(fp, ROOT))
        if not dry:
            append(rec)
        out.append(pair_text(rec))
    out.append("")
    out.append(report_text())
    return "\n\n".join(out)


def main():
    argv = sys.argv[1:]
    as_json = "--json" in argv
    dry = "--dry-run" in argv
    pos = [a for a in argv if not a.startswith("--")]

    try:
        if "--rules" in argv:
            rules = mature_rules()
            print(json.dumps(rules, ensure_ascii=False, indent=2) if as_json
                  else ("\n".join("- " + r["rule"] for r in rules) or
                        f"אין עדיין כלל בשל. צריך {PROMOTE_AT} חזרות של אותה עריכה"))
            return 0

        if "--auto" in argv:
            print(run_auto(dry))
            return 0

        if "--report" in argv or not pos:
            print(json.dumps({"records": len(load()), "rules": mature_rules()},
                             ensure_ascii=False, indent=2) if as_json else report_text())
            return 0

        if len(pos) < 2:
            print("צריך שני נתיבים: טיוטה וסופי", file=sys.stderr)
            return 2
        draft_p, final_p = pos[0], pos[1]
        rec = compare(open(draft_p, encoding="utf-8").read(),
                      open(final_p, encoding="utf-8").read(),
                      os.path.relpath(draft_p, ROOT), os.path.relpath(final_p, ROOT))
        if not dry:
            append(rec)
        print(json.dumps(rec, ensure_ascii=False, indent=2) if as_json else pair_text(rec))
        return 0
    except FileNotFoundError as e:
        print(f"קובץ לא נמצא: {e.filename}", file=sys.stderr)
        return 2
    except Exception as e:
        print(f"diff_learn.py נכשל: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
