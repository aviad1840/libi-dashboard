#!/usr/bin/env bash
# desk.sh - שכבת הרנר התפעולית. מה שתלוי בפלטפורמה יושב כאן, לא ב-agents/.
#
#   desk.sh start  <agent>   הכנת סביבת ריצה: fetch, בחירת ענף, מיזוג מערכת, הדפסת בריף ריצה
#   desk.sh finish <agent> [--items N] [--l0 N] [--l1 N] [--l2 N] [--note "..."]
#                            אכיפת בידוד כתיבה, ולידציה, רישום ריצה, commit, push
#   desk.sh check  <agent>   בדיקת בידוד כתיבה בלבד, בלי לדחוף
#   desk.sh health           דוח בריאות המערכת. קוד יציאה 1 כשיש ממצא אדום
#   desk.sh verify <agent>   שער הראיות על ה-namespace של הסוכן, בלי לדחוף
#
# חוזה: הסקריפט לעולם לא דוחף ל-main. הוא דוחף רק לענף התוצרים.
set -uo pipefail

DESK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "$DESK_DIR/.." && pwd)"
LOG_BRANCH="${DESK_LOG_BRANCH:-desk/log}"
SYS_REFS=("origin/main" "origin/claude/autonomous-workers-routine-hna6je")
MARKER="aviad-desk/manifest.yaml"

cd "$REPO_DIR" || exit 1
git config user.name  >/dev/null 2>&1 || git config user.name  "aviad-desk"
git config user.email >/dev/null 2>&1 || git config user.email "aviad-desk@users.noreply.github.com"

die()  { echo "DESK-ERROR: $*" >&2; exit 1; }
info() { echo "$*"; }

# תיוק התראה לתור היוצא. best-effort מוחלט: אם זה נכשל, הריצה ממשיכה.
# הכלל: כשל שאיש לא יודע עליו גרוע מכשל. לכן זה נקרא גם מ-cmd_fail וגם מ-cmd_finish.
alert() {
  local agent="$1" text="$2"
  python3 "$DESK_DIR/scripts/outbox_put.py" "$agent" "$text" >/dev/null 2>&1 || true
}

# סיווג הערת ריצה. מקור האמת לסימני הכשל הוא health.py, לא רשימה משוכפלת כאן.
classify_note() {
  python3 "$DESK_DIR/scripts/health.py" --classify-note "$1" 2>/dev/null || echo ok
}

# ------------------------------------------------------------------ namespaces
# בידוד כתיבה. סוכן כותב אך ורק לנתיבים שלו. חריג יחיד: curator.
# כל סוכן רשאי לתייק הודעה יוצאת ל-aviad-desk/outbox, אך ורק בקובץ ששמו מתחיל
# במזהה שלו. gateway הוא היחיד ששולח בפועל ומזיז ל-outbox/sent. ראה cmd_check.
allowed_paths() {
  case "$1" in
    scout)          echo "aviad-desk/intel aviad-desk/state/seen.json aviad-desk/outbox" ;;
    radar)          echo "aviad-desk/radar aviad-desk/state/seen.json aviad-desk/outbox" ;;
    rival)          echo "aviad-desk/landscape aviad-desk/state/seen.json aviad-desk/outbox" ;;
    advocate)       echo "aviad-desk/advocate aviad-desk/state/seen.json aviad-desk/outbox" ;;
    relations)      echo "aviad-desk/people aviad-desk/state/seen.json aviad-desk/outbox" ;;
    chief-of-staff) echo "aviad-desk/desk aviad-desk/inbox aviad-desk/outbox" ;;
    curator)        echo "aviad-desk/curator aviad-desk/context/sources.md aviad-desk/context/filter.md aviad-desk/context/voice-learned.md aviad-desk/state/sources.json aviad-desk/state/tempo.json aviad-desk/state/edits.jsonl aviad-desk/outbox" ;;
    auditor)        echo "aviad-desk/audit aviad-desk/outbox" ;;
    producer)       echo "aviad-desk/drafts aviad-desk/outbox" ;;
    amplifier)      echo "aviad-desk/amplify aviad-desk/outbox" ;;
    gateway)        echo "aviad-desk/inbox aviad-desk/config/telegram.json aviad-desk/state/telegram_offset.txt aviad-desk/state/telegram_audit.jsonl aviad-desk/state/pending_approvals.json aviad-desk/state/health.json aviad-desk/feedback/queue aviad-desk/outbox" ;;
    *)              die "סוכן לא מוכר: $1" ;;
  esac
}

# קבצי ההקשר שהסוכן רשאי לטעון, מתוך ה-frontmatter שלו. מדיניות: context/LOADING.md
# gateway אינו סוכן (GATEWAY.md), אין לו agents/*.md ואין לו רשימת context קבועה - מדלג
context_files() {
  [ "$1" = "gateway" ] && return 0
  local f="$DESK_DIR/agents/$1.md"
  [ -f "$f" ] || die "אין הגדרת סוכן: agents/$1.md"
  awk '/^---$/{c++; next} c==1' "$f" | grep -E '^context_(base|role):' \
    | sed 's/.*\[\(.*\)\].*/\1/' | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$'
}

# --------------------------------------------------------------------- resolve
resolve_sys_ref() {
  local r
  for r in "${SYS_REFS[@]}"; do
    if git cat-file -e "$r:$MARKER" 2>/dev/null; then echo "$r"; return 0; fi
  done
  return 1
}

# ----------------------------------------------------------------------- start
cmd_start() {
  local agent="$1"
  allowed_paths "$agent" >/dev/null

  local attempt=0 delay=2
  until git fetch origin --prune --quiet 2>/dev/null; do
    attempt=$((attempt+1)); [ "$attempt" -ge 4 ] && die "fetch נכשל אחרי 4 ניסיונות"
    sleep "$delay"; delay=$((delay*2))
  done

  local sys; sys="$(resolve_sys_ref)" || die "aviad-desk לא נמצא באף ענף מערכת. בדוק ש-$MARKER קיים"

  # בטיחות: אל תדרוס עבודה מקומית שאינה של הסקריפט עצמו
  if [ -n "$(git status --porcelain -- . ':(exclude)aviad-desk/scripts' 2>/dev/null)" ] && [ "${DESK_FORCE:-0}" != "1" ]; then
    die "יש שינויים מקומיים לא שמורים. הרץ עם DESK_FORCE=1 רק אם ברור שאפשר לדרוס"
  fi

  if git rev-parse -q --verify "origin/$LOG_BRANCH" >/dev/null 2>&1; then
    git checkout -f -B "$LOG_BRANCH" "origin/$LOG_BRANCH" --quiet || die "checkout ל-$LOG_BRANCH נכשל"
    if ! git merge --no-edit -q "$sys" 2>/dev/null; then
      git merge --abort 2>/dev/null
      die "התנגשות מיזוג בין $LOG_BRANCH ל-$sys. עצור, אל תכריע. דווח ולא תכתוב"
    fi
  else
    git checkout -f -B "$LOG_BRANCH" "$sys" --quiet || die "checkout ל-$LOG_BRANCH נכשל"
  fi

  if [ "$agent" = "gateway" ]; then
    cat <<EOF

=========================== בריף ריצה ===========================
סוכן:            gateway (שכבת ממשק - אינו agent תוכן, ראה GATEWAY.md)
ענף מערכת:       $sys
ענף תוצרים:      $LOG_BRANCH
תאריך {DATE}:    $(date -u +%Y-%m-%d)

קרא GATEWAY.md ופעל לפיו. אין רשימת context קבועה - זו שכבת ניתוב, לא סוכן תוכן.

מותר לכתוב אך ורק ל:
$(allowed_paths "$agent" | tr ' ' '\n' | sed 's/^/  - /')

בעבודת עומק על סוכן קיים (למשל advocate) - קרא/כתוב דרך desk.sh start/finish <agent>
בנפרד, עם הבידוד והתקרות של אותו סוכן עצמו.
=================================================================
EOF
    return 0
  fi

  local ns; ns="$(grep -A1 "^  - id: $agent$" "$DESK_DIR/manifest.yaml" | grep namespace | awk '{print $2}')"
  local level; level="$(python3 - "$agent" <<'PY' 2>/dev/null || echo "unknown"
import json,sys,pathlib
p=pathlib.Path("aviad-desk/state/tempo.json")
print(json.loads(p.read_text(encoding="utf-8"))["agents"].get(sys.argv[1],{}).get("level","n/a"))
PY
)"

  cat <<EOF

=========================== בריף ריצה ===========================
סוכן:            $agent
ענף מערכת:       $sys
ענף תוצרים:      $LOG_BRANCH
תאריך {DATE}:    $(date -u +%Y-%m-%d)
שבוע {WEEK}:     $(date -u +%GW%V)
{OUT}:           aviad-desk/${ns:-$agent/}
רמת תדירות:      $level

טען מ-aviad-desk/context/ את הקבצים האלה בלבד:
$(context_files "$agent" | sed 's/^/  - /;s/$/.md/')
קובץ נוסף - רק לפי טריגר ב-context/LOADING.md, וציין בפלט למה.

מותר לכתוב אך ורק ל:
$(allowed_paths "$agent" | tr ' ' '\n' | sed 's/^/  - /')

תקרות: L1 עד 5 בריצה. L2 רק על טריגר מפורש, אחד לכל היותר.
דוח ריק שנכתב בזמן טוב מדוח מלא שנכתב אחרי לולאה.
=================================================================
EOF
}

# ----------------------------------------------------------------------- check
cmd_check() {
  local agent="$1" bad=0
  local -a allow; read -r -a allow <<< "$(allowed_paths "$agent")"
  # -uall חובה: בלעדיו git מקפל תיקייה לא-מעוקבת לשורה אחת ושם הקובץ ב-outbox לא מגיע לבדיקה
  local changed; changed="$(git status --porcelain -uall | awk '{print $NF}')"
  [ -z "$changed" ] && { echo "אין שינויים"; return 0; }
  local f ok p base
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    ok=0
    for p in "${allow[@]}"; do case "$f" in "$p"|"$p"/*) ok=1;; esac; done
    [ "$ok" -eq 0 ] && { echo "הפרת בידוד כתיבה: $f"; bad=1; continue; }
    # outbox משותף אך לא הפקר: סוכן מתייק רק קבצים ששמם מתחיל במזהה שלו.
    # gateway פטור - הוא זה ששולח ומזיז ל-sent/
    case "$f" in
      aviad-desk/outbox/*)
        if [ "$agent" != "gateway" ]; then
          base="${f#aviad-desk/outbox/}"
          case "$base" in
            sent/*)     echo "הפרת outbox: רק gateway מזיז ל-sent/ - $f"; bad=1 ;;
            "$agent"-*) ;;
            *)          echo "הפרת outbox: שם הקובץ חייב להתחיל ב-\"$agent-\" - $f"; bad=1 ;;
          esac
        fi
        ;;
    esac
  done <<< "$changed"
  [ "$bad" -eq 1 ] && return 1
  echo "בידוד כתיבה תקין"
  return 0
}

# ---------------------------------------------------------------------- finish
cmd_finish() {
  local agent="$1"; shift
  local items="" l0="" l1="" l2="" note=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --items) items="$2"; shift 2;; --l0) l0="$2"; shift 2;;
      --l1) l1="$2"; shift 2;;     --l2) l2="$2"; shift 2;;
      --note) note="$2"; shift 2;; *) shift;;
    esac
  done

  cmd_check "$agent" || die "ריצה נעצרה. סוכן כתב מחוץ ל-namespace שלו"

  if ! python3 "$DESK_DIR/scripts/validate.py" >/tmp/desk-validate.txt 2>&1; then
    cat /tmp/desk-validate.txt >&2; die "validate.py נכשל. לא דוחפים"
  fi

  # שער הראיות. נבדקים אך ורק הקבצים שהריצה הזו שינתה, לא כל ההיסטוריה -
  # אחרת הפרה ישנה אחת חוסמת כל ריצה עתידית לנצח, והשער נהיה מכשול במקום שער.
  local -a touched=()
  while IFS= read -r cf; do
    [ -z "$cf" ] && continue
    case "$cf" in
      aviad-desk/outbox/*|aviad-desk/state/*|*.gitkeep) continue ;;
      *.md|*.json) [ -f "$cf" ] && touched+=("$cf") ;;
    esac
  done <<< "$(git status --porcelain -uall | awk '{print $NF}')"

  if [ "${#touched[@]}" -gt 0 ]; then
    if ! python3 "$DESK_DIR/scripts/verify.py" "${touched[@]}" >/tmp/desk-verify.txt 2>&1; then
      cat /tmp/desk-verify.txt >&2
      echo "" >&2
      echo "שער הראיות חסם את הריצה. הקבצים שלך על הדיסק ולא אבדו." >&2
      echo "תקן את ההפרות למעלה והרץ finish שוב. אין ראיה - כתוב \"לא נמצאה ראיה\"," >&2
      echo "הורד את הסיווג ל-CLAIM, או הסר את הממצא. אל תעקוף את השער." >&2
      die "ריצה נעצרה בשער הראיות"
    fi
    cat /tmp/desk-verify.txt
  fi

  # הסטטוס נגזר מההערה, לא נקבע מראש. ריצה שההערה שלה מודה בכשל טכני נרשמת
  # degraded ולא ok. בלי זה "telegram_fetch נכשל: HTTP 404" נרשם כהצלחה - זה קרה בפועל.
  local status; status="$(classify_note "$note")"

  # רישום הריצה. זה המקור שממנו curator מחשב עלות לממצא מועיל, וגם /agents ו-/status ב-gateway
  python3 - "$agent" "${items:-0}" "${l0:-0}" "${l1:-0}" "${l2:-0}" "$note" "$status" <<'PY'
import json,sys,datetime,pathlib
p = pathlib.Path("aviad-desk/state/runs.jsonl"); p.parent.mkdir(parents=True, exist_ok=True)
rec = {"date": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
       "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
       "agent": sys.argv[1], "status": sys.argv[7], "items": int(sys.argv[2] or 0),
       "l0": int(sys.argv[3] or 0), "l1": int(sys.argv[4] or 0), "l2": int(sys.argv[5] or 0),
       "note": sys.argv[6][:200]}
with p.open("a", encoding="utf-8") as fh: fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
PY

  # ריצה מדורדרת מתריעה מיד, בלי לחכות לשומר השעתי
  if [ "$status" = "degraded" ]; then
    info "אזהרה: הריצה נרשמה degraded - ההערה מכילה סימן כשל טכני"
    alert "$agent" "$agent: ריצה הסתיימה עם סימן כשל טכני
$(date -u +%Y-%m-%d\ %H:%M)Z
$note"
  fi

  git add -- aviad-desk/state/runs.jsonl

  local p
  for p in $(allowed_paths "$agent"); do git add -A -- "$p" 2>/dev/null; done

  if git diff --cached --quiet; then
    info "אין מה לדחוף. דוח ריק הוא תוצאה תקינה"
    return 0
  fi

  git commit -q -m "$agent: ריצה $(date -u +%Y-%m-%d)

פריטים: ${items:-0} | L0: ${l0:-0} | L1: ${l1:-0} | L2: ${l2:-0}
${note}" || die "commit נכשל"

  local attempt=0 delay=2
  until git push -u origin "$LOG_BRANCH" --quiet 2>/dev/null; do
    attempt=$((attempt+1)); [ "$attempt" -ge 5 ] && die "push נכשל אחרי 4 ניסיונות"
    git fetch origin "$LOG_BRANCH" --quiet 2>/dev/null
    git rebase "origin/$LOG_BRANCH" --quiet 2>/dev/null || git rebase --abort 2>/dev/null
    sleep "$delay"; delay=$((delay*2))
  done
  info "נדחף ל-$LOG_BRANCH"
}

# ------------------------------------------------------------------------ fail
# רישום כשל - best-effort לחלוטין. לעולם לא חוסם: הסוכן/gateway חייב להיות מסוגל
# להודיע לאביעד בטלגרם גם אם רישום ה-audit עצמו נכשל. ראה RUN.md - פורמט כשל.
cmd_fail() {
  local agent="$1"; shift
  local reason=""
  while [ $# -gt 0 ]; do
    case "$1" in --reason) reason="$2"; shift 2;; *) shift;; esac
  done

  local rec
  rec="$(python3 - "$agent" "$reason" <<'PY'
import json,sys,datetime
print(json.dumps({
  "date": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
  "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
  "agent": sys.argv[1], "status": "failed", "reason": sys.argv[2][:300],
}, ensure_ascii=False))
PY
)"

  # ניסיון למקם על ענף התוצרים - לא חוסם אם נכשל, רק מדלג על הכתיבה ל-git
  if git rev-parse -q --verify "origin/$LOG_BRANCH" >/dev/null 2>&1; then
    git checkout -f -B "$LOG_BRANCH" "origin/$LOG_BRANCH" --quiet 2>/dev/null
  fi

  mkdir -p "$DESK_DIR/state" 2>/dev/null
  echo "$rec" >> "$DESK_DIR/state/runs.jsonl" 2>/dev/null

  if git add -- "$DESK_DIR/state/runs.jsonl" 2>/dev/null \
     && ! git diff --cached --quiet 2>/dev/null \
     && git commit -q -m "$agent: כשל $(date -u +%Y-%m-%d) - ${reason:0:80}" 2>/dev/null; then
    local attempt=0 delay=2
    until git push -u origin "$LOG_BRANCH" --quiet 2>/dev/null; do
      attempt=$((attempt+1)); [ "$attempt" -ge 4 ] && break
      sleep "$delay"; delay=$((delay*2))
    done
  fi

  # ההתראה עצמה. זו הנקודה שבה כשל הופך לידיעה של אביעד ולא לשורה ביומן שאיש לא קורא.
  alert "$agent" "כשל: $agent
$(date -u +%Y-%m-%d\ %H:%M)Z
${reason:-לא צוינה סיבה}

הריצה נעצרה. אין תוצר."

  echo "$rec"
  return 0
}

# ---------------------------------------------------------------------- health
# השומר. רץ מ-gateway כל שעה ומ-chief-of-staff בבריף היומי. ראה scripts/health.py
cmd_health() {
  python3 "$DESK_DIR/scripts/health.py" "$@"
}

# ---------------------------------------------------------------------- verify
# שער הראיות על דרישה. ב-finish הוא רץ אוטומטית על הקבצים שהשתנו בלבד.
cmd_verify() {
  python3 "$DESK_DIR/scripts/verify.py" --agent "$@"
}

case "${1:-}" in
  start)  shift; cmd_start  "${1:?חסר שם סוכן}" ;;
  finish) shift; cmd_finish "${1:?חסר שם סוכן}" "${@:2}" ;;
  check)  shift; cmd_check  "${1:?חסר שם סוכן}" ;;
  fail)   shift; cmd_fail   "${1:?חסר שם סוכן}" "${@:2}" ;;
  health) shift; cmd_health "$@" ;;
  verify) shift; cmd_verify "${1:?חסר שם סוכן}" "${@:2}" ;;
  *) echo "שימוש: desk.sh {start|finish|check|fail|verify} <agent> | desk.sh health"; exit 2 ;;
esac
