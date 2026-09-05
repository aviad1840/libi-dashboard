#!/usr/bin/env python3
"""ניתוב לפי סיכון - כמה עומק מגיע לפריט הזה, ומי צריך לאשר.

הבעיה שזה פותר: המערכת נבנתה כשרשרת סוכנים. producer קורא ל-auditor, auditor
מחזיר ל-amplifier. המשמעות היא שכל פריט, גם הזניח ביותר, עובר את אותו מסלול,
וכל תוספת יכולת דורשת סוכן נוסף ורוטין נוסף.

הגישה כאן הפוכה: **הפריט קובע את העומק, לא הסוכן שמצא אותו.** אותה ריצה
מטפלת בפריט R0 בשתי שורות ובפריט R3 בבדיקה מלאה, בלי להעיר אף אחד.

ארבעה מסלולים:

  R0  תייק בלבד. אין טענה, אין חשיפה. לא מדווח, לא מסכם
  R1  דיווח רגיל. נכנס לבריף, נמדד, לא נבדק לעומק
  R2  אימות ראיה חובה לפני שזה יוצא. מספר, ציטוט, שם אדם, טענה סיבתית
  R3  אישור מפורש של אביעד לפני כל צעד. פרסום פומבי, ספק ענן, עמדת הארגון

ארבעה צירים, כל אחד 0-3. הציון הוא המקסימום, לא הסכום: פריט אחד עם חשיפה
פומבית הוא R3 גם אם הוא זניח בכל שאר המובנים. סיכון לא ממוצע את עצמו.

שימוש:
    risk.py --text "<טקסט הפריט>" [--channel public|internal] [--json]
    risk.py --file <path> [--json]
    risk.py --explain            הסבר המסלולים והצירים

קוד יציאה: 0 עד R2 · 3 כשהמסלול הוא R3 (דורש אישור) · 2 שגיאת הרצה
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LANES = {
    0: ("R0", "תייק בלבד", []),
    1: ("R1", "דיווח רגיל", ["דירוג ראיה", "תיוג ל-OQ/C/P/AP"]),
    2: ("R2", "אימות ראיה חובה", [
        "כל מספר נושא מקור ותאריך",
        "כל ציטוט נושא מקור E3 ומעלה",
        "כל שם אדם מאוית נכון ומאומת מול people.md",
        "הרצת verify.py על הקובץ לפני finish",
    ]),
    3: ("R3", "אישור מפורש של אביעד", [
        "כל הדרישות של R2",
        "טיוטה מלאה מוגשת לאביעד. שום דבר לא יוצא לפני תשובה שלו",
        "בדיקת קווים אדומים מול publishing-playbook.md",
        "ציון שער הפרסום מוצג במפורש לצד הטיוטה",
    ]),
}

# ציר 1 - חשיפה. מי יראה את זה
PUBLIC_WORDS = ("לינקדאין", "linkedin", "פוסט", "לפרסום", "פומבי", "מאמר",
                "כנס", "הרצאה", "ראיון", "עיתון", "podcast", "פודקאסט")
SHARED_WORDS = ("קבוצת", "whatsapp", "וואטסאפ", "gov.ai", "פורום", "מצגת",
                "מסמך לשיתוף", "לשלוח ל", "להעביר ל")

# ציר 2 - עוצמת הטענה. כמה קשה יהיה לחזור מזה
QUANT = re.compile(r"(\d+(?:[.,]\d+)?\s*%)|([₪$€]\s*\d)|(\d+(?:[.,]\d+)?\s*(?:מיליון|מיליארד|אלף|אחוז))")
QUOTED = re.compile(r"[\"“”«]([^\"“”»\n]{20,})[\"“”»]")
CAUSAL = ("הביא ל", "גרם ל", "הוביל ל", "בזכות", "כתוצאה מ", "הוכיח ש", "מוכיח ש")

# ציר 3 - רגישות פוליטית. הקווים האדומים מ-publishing-playbook.md
VENDORS = ("גוגל", "google", "amazon", "אמזון", "aws", "מיקרוסופט", "microsoft",
           "azure", "אנתרופיק", "anthropic", "openai", "nvidia", "oracle", "ספק ענן")
ORG = ("ביטוח לאומי", "המוסד לביטוח לאומי", "btl", "מינהל הגמלאות")
TENDER = ("מכרז", "רכש", "קול קורא", "rfi", "rfp", "התקשרות", "ספק נבחר")

# ציר 4 - אנשים בשם. טעות בשם היא נזק אישי, לא נזק מקצועי
NAMED = re.compile(r"(?:^|\s)(?:ד\"ר|פרופ\'?|מר|גב\'?|עו\"ד)\s+[֐-׿]{2,}|"
                   r"[֐-׿]{3,}\s+[֐-׿]{3,}\s+(?:אמר|אמרה|כתב|כתבה|טען|טענה|הצהיר)")


def score_exposure(text, channel):
    low = text.lower()
    if channel == "public" or any(w in low for w in PUBLIC_WORDS):
        return 3, "חשיפה פומבית בשמו"
    if any(w in low for w in SHARED_WORDS):
        return 2, "משותף עם עמיתים, לא פומבי"
    if channel == "internal":
        return 0, "פנימי בלבד"
    return 1, "לא הוגדר ערוץ, מניחים דיווח פנימי"


def score_claim(text):
    hits = []
    if QUANT.search(text):
        hits.append("טענה כמותית")
    if QUOTED.search(text):
        hits.append("ציטוט")
    if any(c in text for c in CAUSAL):
        hits.append("טענה סיבתית")
    if not hits:
        return 0, "אין טענה שניתן להפריך"
    return (3 if len(hits) >= 2 else 2), " · ".join(hits)


def score_politics(text):
    low = text.lower()
    hits = []
    if any(v in low for v in VENDORS):
        hits.append("אזכור ספק ענן")
    if any(t in low for t in TENDER):
        hits.append("הקשר מכרזי או רכש")
    if any(o in low for o in ORG):
        hits.append("עמדת ביטוח לאומי")
    if not hits:
        return 0, "אין רגישות פוליטית מזוהה"
    # ספק ענן יחד עם מכרז הוא בדיוק הקו האדום "מי שכתב את המכרז לגוגל"
    if "אזכור ספק ענן" in hits and "הקשר מכרזי או רכש" in hits:
        return 3, "ספק ענן בהקשר מכרזי - קו אדום מפורש"
    return 2, " · ".join(hits)


def score_people(text):
    return (2, "אדם מוזכר בשם") if NAMED.search(text) else (0, "אין אדם בשם")


def assess(text, channel=None):
    axes = {}
    axes["חשיפה"] = score_exposure(text, channel)
    axes["עוצמת הטענה"] = score_claim(text)
    axes["רגישות"] = score_politics(text)
    axes["אנשים"] = score_people(text)

    # מקסימום ולא סכום. סיכון לא ממוצע את עצמו
    level = max(v[0] for v in axes.values())
    driver = max(axes.items(), key=lambda kv: kv[1][0])
    lane, label, checks = LANES[level]
    return {
        "lane": lane, "level": level, "label": label,
        "driver": f"{driver[0]}: {driver[1][1]}",
        "axes": {k: {"score": v[0], "why": v[1]} for k, v in axes.items()},
        "required": checks,
    }


def as_text(r):
    lines = [f"מסלול {r['lane']} - {r['label']}",
             f"הציר הקובע: {r['driver']}", ""]
    for name, a in r["axes"].items():
        lines.append(f"  {name:<14} {a['score']}  {a['why']}")
    if r["required"]:
        lines.append("")
        lines.append("נדרש לפני שזה יוצא:")
        for c in r["required"]:
            lines.append(f"  - {c}")
    if r["lane"] == "R3":
        lines.append("")
        lines.append("R3 אינו המלצה. שום דבר לא יוצא לפני תשובה מפורשת של אביעד.")
    return "\n".join(lines)


EXPLAIN = """ניתוב לפי סיכון - ארבעה מסלולים, ארבעה צירים

  R0  תייק בלבד            אין טענה, אין חשיפה
  R1  דיווח רגיל           נכנס לבריף, לא נבדק לעומק
  R2  אימות ראיה חובה      מספר, ציטוט, שם אדם, טענה סיבתית
  R3  אישור של אביעד       פרסום פומבי, ספק ענן במכרז, עמדת הארגון

הצירים: חשיפה · עוצמת הטענה · רגישות פוליטית · אנשים בשם

**הציון הוא המקסימום ולא הסכום.** פריט עם חשיפה פומבית הוא R3 גם אם הוא
זניח בכל שאר המובנים. סיכון לא ממוצע את עצמו, וזו כל הנקודה.

**זה מחליף שרשרת סוכנים, לא מוסיף אחד.** אותה ריצה מטפלת ב-R0 בשתי שורות
ובפריט R3 בבדיקה מלאה. אין צורך להעיר auditor בשביל פריט שלא צריך אותו,
ואין דרך לעקוף אותו בשביל פריט שכן."""


def main():
    argv = sys.argv[1:]
    if "--explain" in argv or not argv:
        print(EXPLAIN)
        return 0
    as_json = "--json" in argv
    channel = None
    if "--channel" in argv:
        i = argv.index("--channel")
        channel = argv[i + 1] if i + 1 < len(argv) else None

    text = ""
    try:
        if "--text" in argv:
            i = argv.index("--text")
            text = argv[i + 1] if i + 1 < len(argv) else ""
        elif "--file" in argv:
            i = argv.index("--file")
            text = open(argv[i + 1], encoding="utf-8").read()
        else:
            text = sys.stdin.read()
    except (OSError, IndexError) as e:
        print(f"risk.py נכשל: {e}", file=sys.stderr)
        return 2

    r = assess(text, channel)
    print(json.dumps(r, ensure_ascii=False, indent=2) if as_json else as_text(r))
    return 3 if r["lane"] == "R3" else 0


if __name__ == "__main__":
    sys.exit(main())
