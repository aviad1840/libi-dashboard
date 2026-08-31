#!/usr/bin/env python3
"""שער הראיות - אכיפה מכנית של משמעת הראיות על כל ממצא.

הכלל היה כתוב מהיום הראשון: "כל טענה נושאת דירוג ראיה E0-E6, אין ראיה כותבים
לא נמצאה ראיה". מה שלא היה: משהו שבודק. סוכן שמדלג על הכלל לא נתפס, וטענה בלי
עוגן נכנסת לתיק ומשם לפוסט. זה בדיוק AP10, וזה כבר שרף את C6.

הכלי הזה קורא ממצאים בשני הפורמטים שהמערכת מייצרת בפועל - דוח markdown של scout
ו-JSON של radar - ואוכף עשרה כללים. הוא לא שופט תוכן. הוא בודק שהראיה מוצהרת,
עקבית, וניתנת למעקב.

  BLOCK  הפרה חד-משמעית. desk.sh finish לא ידחוף
  WARN   ריח רע. נרשם, לא חוסם

שימוש:
    verify.py <path> [<path> ...]     בדיקת קבצים או תיקיות
    verify.py --agent <agent>         בדיקת ה-namespace של סוכן
    verify.py --json                  פלט מכונה
    verify.py --warn-only             שום דבר לא חוסם. לבדיקה ידנית

קוד יציאה: 0 נקי או WARN בלבד · 1 יש BLOCK · 2 שגיאת הרצה
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EVIDENCE = ["E0", "E1", "E2", "E3", "E4", "E5", "E6"]
FACT_MIN = "E3"          # עובדה דורשת פרסום רשמי ומעלה. אמירה בעל פה אינה עובדה
QUOTE_MIN = "E3"         # ציטוט דורש מקור בר-אימות
UNVERIFIED_MAX = "E1"    # E0/E1 חייב סימון unverified

NAMESPACES = {
    "scout": ["intel"], "radar": ["radar"], "rival": ["landscape"],
    "advocate": ["advocate"], "relations": ["people"], "curator": ["curator"],
    "chief-of-staff": ["desk"], "auditor": ["audit"], "producer": ["drafts"],
    "amplifier": ["amplify"],
}

# מפתחות כפי שהסוכנים כותבים אותם בפועל, לא כפי שהיינו רוצים שיכתבו
KEY_MAP = {
    "סיווג": "classification", "מקור": "source", "דירוג ראיה": "evidence_level",
    "evidence_level": "evidence_level", "classification": "classification",
    "source_url": "source_url", "source_date": "source_date",
    "unverified": "unverified", "test_question": "test_question",
    "tier": "tier", "novelty": "novelty", "relevance_score": "relevance_score",
    "actionability": "actionability", "confidence": "confidence",
    "מה קרה": "summary", "summary": "summary", "title": "summary",
    "פעולה מוצעת": "action", "action": "action",
}

# ניסוח כן של היעדר ראיה. זה מותר במפורש - זו בדיוק ההתנהגות הרצויה
NO_EVIDENCE = ("לא נמצאה ראיה", "לא נמצא מקור", "אין ראיה", "לא אומת", "טרם אומת")
# ניסוח שמעמיד פנים שיש מקור. זה מה שאסור
PLACEHOLDER = ("tbd", "todo", "xxx", "לא ידוע", "יושלם", "n/a", "בקרוב", "example.com")

# טענה כמותית. מכוון לסוג שבאמת מסוכן בפוסט, לא לכל ספרה
QUANT = re.compile(r"(\d+(?:[.,]\d+)?\s*%)|([₪$€]\s*\d)|(\d+(?:[.,]\d+)?\s*(?:מיליון|מיליארד|אלף|אחוז))")
QUOTED = re.compile(r"[\"“”«]([^\"“”»\n]{25,})[\"“”»]")
URL = re.compile(r"https?://[^\s|)\]]+")
EM_DASH = re.compile(r"[—–]")


HEB_MONTHS = ("ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי",
              "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר")
DATE_PAT = re.compile(r"(\d{4}-\d{2}-\d{2})|(\d{1,2}[./]\d{1,2}[./]\d{2,4})|(20\d{2})")


def looks_like_date(seg):
    """מזהה תאריך פרסום בתוך מקטע טקסט חופשי."""
    seg = seg.strip()
    if not seg or "http" in seg:
        return False
    return bool(DATE_PAT.search(seg)) or any(m in seg for m in HEB_MONTHS)


def ev_code(value):
    """הסוכנים כותבים 'E4 - מסמך ראשוני, הציטוטים מגוף הדוח'. חלץ את הקוד."""
    m = re.match(r"\s*(E[0-6])\b", str(value).strip().upper())
    return m.group(1) if m else str(value).strip().upper()


def ev_ge(a, b):
    try:
        return EVIDENCE.index(a) >= EVIDENCE.index(b)
    except ValueError:
        return False


def truthy(v):
    return str(v).strip().lower() in ("true", "כן", "yes", "1")


# ------------------------------------------------------------------- extraction
def from_markdown(text, path):
    """דוח scout: כותרת ### לכל ממצא, ואחריה שורות '- מפתח: ערך'."""
    findings = []
    blocks = re.split(r"^###\s+", text, flags=re.M)[1:]
    for block in blocks:
        lines = block.splitlines()
        rec = {"_id": lines[0].strip()[:70] if lines else "?", "_path": path, "_raw": block}
        for line in lines[1:]:
            # הסוכנים כותבים גם "- סוג: x" וגם "- **סוג:** x", ולעיתים כמה שדות
            # בשורה אחת מופרדים ב-|. שלושת הווריאנטים קיימים בפועל ביומן
            clean = line.replace("**", "").replace("__", "")
            if not re.match(r"^\s*[-*]\s", clean):
                continue
            clean = re.sub(r"^\s*[-*]\s*", "", clean)
            head = re.match(r"^\s*([^:|]{2,20}):\s*(.*)$", clean)
            if head and KEY_MAP.get(head.group(1).strip()) in ("source", "summary"):
                # שורת מקור וסיכום נשמרות שלמות - ה-| בתוכן הוא חלק מהערך,
                # לא מפריד שדות. בלי זה תאריך הפרסום נבלע
                key = KEY_MAP[head.group(1).strip()]
                rec.setdefault(key, head.group(2).strip())
                continue
            for seg in clean.split("|"):
                m = re.match(r"^\s*([^:]{2,20}):\s*(.+)$", seg)
                if not m:
                    continue
                key = KEY_MAP.get(m.group(1).strip())
                if key and key not in rec:
                    rec[key] = m.group(2).strip()
        # "מקור:" מכיל URL ותאריך באותה שורה, מופרדים ב-|
        src = rec.get("source", "")
        if src:
            urls = URL.findall(src)
            if urls and "source_url" not in rec:
                rec["source_url"] = " ".join(urls)
            if "source_date" not in rec:
                dm = re.search(r"תאריך[^:]*:\s*([^|]+)", src)
                if dm:
                    rec["source_date"] = dm.group(1).strip()
                else:
                    for seg in src.split("|"):
                        if looks_like_date(seg):
                            rec["source_date"] = seg.strip()
                            break
        findings.append(rec)
    return findings


def from_json(obj, path):
    """radar/open.json ודומיו: רשימה תחת מפתח, או רשימה ישירה."""
    out = []
    items = []
    if isinstance(obj, list):
        items = obj
    elif isinstance(obj, dict):
        for key in ("opportunities", "findings", "items", "claims"):
            if isinstance(obj.get(key), list):
                items = obj[key]
                break
    for it in items:
        if not isinstance(it, dict):
            continue
        rec = dict(it)
        rec["_id"] = str(it.get("id") or it.get("title") or "?")[:70]
        rec["_path"] = path
        rec["_raw"] = json.dumps(it, ensure_ascii=False)
        if "summary" not in rec:
            rec["summary"] = str(it.get("title") or it.get("why_relevant") or "")
        out.append(rec)
    return out


def collect(paths):
    findings, seen_files = [], []
    for p in paths:
        if os.path.isdir(p):
            for base, _, files in os.walk(p):
                if any(x in base for x in (".git", "__pycache__", "/sent")):
                    continue
                for f in sorted(files):
                    if f.endswith((".md", ".json")) and not f.startswith("."):
                        seen_files.append(os.path.join(base, f))
        elif os.path.isfile(p):
            seen_files.append(p)
    for f in seen_files:
        rel = os.path.relpath(f, ROOT)
        if os.path.basename(f) in ("README.md", "_FORMAT.md", ".gitkeep"):
            continue
        try:
            text = open(f, encoding="utf-8").read()
        except (OSError, UnicodeDecodeError):
            continue
        if f.endswith(".json"):
            try:
                findings += from_json(json.loads(text), rel)
            except json.JSONDecodeError:
                findings.append({"_id": "קובץ פגום", "_path": rel, "_raw": "", "_broken": True})
        else:
            findings += from_markdown(text, rel)
    return findings, seen_files


# ------------------------------------------------------------------------ rules
def check(rec):
    """עשרה כללים. כל אחד מחזיר (רמה, כלל, הסבר)."""
    out = []
    def bad(level, rule, msg):
        out.append({"level": level, "rule": rule, "id": rec.get("_id"),
                    "path": rec.get("_path"), "detail": msg})

    if rec.get("_broken"):
        bad("BLOCK", "R0", "קובץ JSON פגום, לא ניתן לקרוא")
        return out

    # הזדמנות (radar) אינה טענה עובדתית - היא דדליין. החוזה שלה שונה ומוצהר:
    # מקור, מועד, וזיקה למסלול. לא סיווג FACT/CLAIM ולא ציטוט
    is_opportunity = bool(rec.get("deadline")) or "radar/" in str(rec.get("_path", ""))

    ev = ev_code(rec.get("evidence_level", ""))
    cls = str(rec.get("classification", "")).strip().upper()
    src_url = str(rec.get("source_url", "")).strip()
    src_date = str(rec.get("source_date", "")).strip()
    # רק תוכן הממצא עצמו, לא הבלוק. אחרת כל ציטוט בסעיף "נבדקו ולא נכנסו" נספר
    summary = str(rec.get("summary", "")) or str(rec.get("_id", ""))
    unver = truthy(rec.get("unverified", False))
    blob = str(rec.get("_raw", ""))
    said_no_evidence = any(p in blob for p in NO_EVIDENCE)

    # R1 - דירוג ראיה. הכלל הבסיסי, זה שלא נאכף עד היום
    if ev not in EVIDENCE:
        bad("BLOCK" if not is_opportunity else "WARN", "R1",
            f"אין דירוג ראיה תקין (נמצא: {ev or 'כלום'})")

    # R2 - עובדה דורשת ראיה. אמירה בעל פה אינה עובדה, גם אם היא נכונה
    if cls == "FACT" and ev in EVIDENCE and not ev_ge(ev, FACT_MIN):
        bad("BLOCK", "R2", f"סווג FACT בדירוג {ev}. עובדה דורשת {FACT_MIN} ומעלה - סווג CLAIM")
    if cls and cls not in ("FACT", "CLAIM", "INFERENCE"):
        bad("BLOCK", "R2", f"סיווג לא חוקי: {cls}")
    if not cls and not is_opportunity:
        bad("BLOCK", "R2", "אין סיווג FACT/CLAIM/INFERENCE")

    # R2b - הזדמנות בלי מועד היא לא הזדמנות
    if is_opportunity and not str(rec.get("deadline", "")).strip():
        bad("BLOCK", "R2b", "הזדמנות בלי deadline. בלי מועד אין מה לתעדף")

    # R3 - מקור אמיתי או הודאה מפורשת שאין. שתיקה אינה אפשרות
    if not src_url and not said_no_evidence:
        bad("BLOCK", "R3", "אין source_url ואין אמירה מפורשת שלא נמצאה ראיה")
    if src_url and any(ph in src_url.lower() for ph in PLACEHOLDER):
        bad("BLOCK", "R3", f"מקור placeholder ולא כתובת אמיתית: {src_url[:60]}")

    # R4 - תאריך פרסום. בלי תאריך אי אפשר לדעת אם הידיעה חיה או בת שנתיים
    if src_url and not src_date and not said_no_evidence:
        bad("WARN", "R4", "יש מקור אך אין תאריך פרסום. בלי תאריך אין דרך לדעת אם זה עדכני")

    # R5 - מספר דורש מקור. זה הכלל שמונע את הנזק הגדול ביותר בפרסום
    q = QUANT.search(summary)
    if q and not src_url:
        bad("BLOCK", "R5", f"טענה כמותית ({q.group(0).strip()}) בלי מקור")
    if q and ev in EVIDENCE and not ev_ge(ev, "E2"):
        bad("BLOCK", "R5", f"טענה כמותית ({q.group(0).strip()}) בדירוג {ev}. מספר דורש E2 ומעלה")

    # R6 - סימון [לאמת] ושדה unverified חייבים להסכים
    has_mark = "[לאמת]" in blob
    if has_mark and not unver:
        bad("WARN", "R6", "מסומן [לאמת] בטקסט אך unverified אינו true")
    if unver and not has_mark and ev_ge(ev or "E0", "E3"):
        bad("WARN", "R6", "unverified=true בדירוג גבוה, בלי סימון [לאמת] בטקסט")

    # R7 - E0/E1 חייב סימון. זה הכלל שנשבר ב-C6 ועלה בטענה שרופה
    if ev in ("E0", "E1") and not unver:
        bad("BLOCK", "R7", f"דירוג {ev} בלי unverified=true. אמירה בעל פה נכנסת לתיק כאילו אומתה")

    # R8 - מקף רגיל בלבד
    if EM_DASH.search(blob):
        bad("BLOCK", "R8", "נמצא em dash. הכלל הוא מקף רגיל בלבד")

    # R9 - תיוג לשאלה או לטענה. ממצא בלי זה הוא חדשה, לא מודיעין
    tq = rec.get("test_question")
    tq_txt = " ".join(tq) if isinstance(tq, list) else str(tq or "")
    if not re.search(r"\b(OQ|C|P|AP)\d+", tq_txt + " " + str(rec.get("advances", ""))):
        bad("BLOCK", "R9", "אין תיוג ל-OQ/C/P/AP. ממצא בלי זיקה לשאלה פתוחה הוא חדשה, לא מודיעין")

    # R10 - ציטוט. המצאת ציטוט היא הנזק שהכי קשה להתאושש ממנו
    qt = None if is_opportunity else QUOTED.search(summary)
    if qt:
        if not src_url:
            bad("BLOCK", "R10", f"ציטוט בלי מקור: \"{qt.group(1)[:45]}...\"")
        elif ev in EVIDENCE and not ev_ge(ev, QUOTE_MIN):
            bad("BLOCK", "R10", f"ציטוט בדירוג {ev}. ציטוט דורש {QUOTE_MIN} ומעלה")

    return out


# ----------------------------------------------------------------------- report
def run(paths):
    findings, files = collect(paths)
    violations = []
    for rec in findings:
        violations += check(rec)
    blocks = [v for v in violations if v["level"] == "BLOCK"]
    warns = [v for v in violations if v["level"] == "WARN"]
    return {
        "files_scanned": len(files), "findings_checked": len(findings),
        "block": len(blocks), "warn": len(warns), "violations": violations,
    }


def as_text(rep):
    lines = [f"שער הראיות: {rep['findings_checked']} ממצאים ב-{rep['files_scanned']} קבצים"]
    if not rep["violations"]:
        lines.append("נקי. כל ממצא נושא דירוג ראיה, מקור וזיקה לשאלה")
        return "\n".join(lines)
    for v in rep["violations"]:
        tag = "חוסם" if v["level"] == "BLOCK" else "אזהרה"
        lines.append(f"[{tag} {v['rule']}] {v['path']} · {v['id']}\n    {v['detail']}")
    lines.append(f"סה\"כ {rep['block']} חוסמים, {rep['warn']} אזהרות")
    return "\n".join(lines)


def main():
    argv = sys.argv[1:]
    warn_only = "--warn-only" in argv
    as_json = "--json" in argv
    argv = [a for a in argv if not a.startswith("--") or a == "--agent"]

    paths = []
    if "--agent" in sys.argv:
        i = sys.argv.index("--agent")
        agent = sys.argv[i + 1] if i + 1 < len(sys.argv) else ""
        for ns in NAMESPACES.get(agent, []):
            paths.append(os.path.join(ROOT, ns))
        if not paths:
            print(f"אין namespace ידוע לבדיקה עבור {agent}", file=sys.stderr)
            return 0
    else:
        paths = [a for a in argv if a != "--agent"]
    if not paths:
        print(__doc__.strip().split("שימוש:")[1], file=sys.stderr)
        return 2

    try:
        rep = run(paths)
    except Exception as e:
        print(f"verify.py נכשל: {e}", file=sys.stderr)
        return 2

    print(json.dumps(rep, ensure_ascii=False, indent=2) if as_json else as_text(rep))
    return 1 if (rep["block"] and not warn_only) else 0


if __name__ == "__main__":
    sys.exit(main())
