#!/usr/bin/env bash
# desk.sh - שכבת הרנר התפעולית. מה שתלוי בפלטפורמה יושב כאן, לא ב-agents/.
#
#   desk.sh start  <agent>   הכנת סביבת ריצה: fetch, בחירת ענף, מיזוג מערכת, הדפסת בריף ריצה
#   desk.sh finish <agent> [--items N] [--l0 N] [--l1 N] [--l2 N] [--note "..."]
#                            אכיפת בידוד כתיבה, ולידציה, רישום ריצה, commit, push
#   desk.sh check  <agent>   בדיקת בידוד כתיבה בלבד, בלי לדחוף
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

# ------------------------------------------------------------------ namespaces
# בידוד כתיבה. סוכן כותב אך ורק לנתיבים שלו. חריג יחיד: curator.
allowed_paths() {
  case "$1" in
    scout)          echo "aviad-desk/intel aviad-desk/state/seen.json" ;;
    radar)          echo "aviad-desk/radar aviad-desk/state/seen.json" ;;
    rival)          echo "aviad-desk/landscape aviad-desk/state/seen.json" ;;
    advocate)       echo "aviad-desk/advocate aviad-desk/state/seen.json" ;;
    relations)      echo "aviad-desk/people aviad-desk/state/seen.json" ;;
    chief-of-staff) echo "aviad-desk/desk aviad-desk/inbox" ;;
    curator)        echo "aviad-desk/curator aviad-desk/context/sources.md aviad-desk/context/filter.md aviad-desk/state/sources.json aviad-desk/state/tempo.json" ;;
    auditor)        echo "aviad-desk/audit" ;;
    producer)       echo "aviad-desk/drafts" ;;
    amplifier)      echo "aviad-desk/amplify" ;;
    *)              die "סוכן לא מוכר: $1" ;;
  esac
}

# קבצי ההקשר שהסוכן רשאי לטעון, מתוך ה-frontmatter שלו. מדיניות: context/LOADING.md
context_files() {
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
  local changed; changed="$(git status --porcelain | awk '{print $NF}')"
  [ -z "$changed" ] && { echo "אין שינויים"; return 0; }
  local f ok p
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    ok=0
    for p in "${allow[@]}"; do case "$f" in "$p"|"$p"/*) ok=1;; esac; done
    [ "$ok" -eq 0 ] && { echo "הפרת בידוד כתיבה: $f"; bad=1; }
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

  # רישום הריצה. זה המקור שממנו curator מחשב עלות לממצא מועיל
  python3 - "$agent" "${items:-0}" "${l0:-0}" "${l1:-0}" "${l2:-0}" "$note" <<'PY'
import json,sys,datetime,pathlib
p = pathlib.Path("aviad-desk/state/runs.jsonl"); p.parent.mkdir(parents=True, exist_ok=True)
rec = {"date": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
       "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
       "agent": sys.argv[1], "items": int(sys.argv[2] or 0),
       "l0": int(sys.argv[3] or 0), "l1": int(sys.argv[4] or 0), "l2": int(sys.argv[5] or 0),
       "note": sys.argv[6][:200]}
with p.open("a", encoding="utf-8") as fh: fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
PY
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

case "${1:-}" in
  start)  shift; cmd_start  "${1:?חסר שם סוכן}" ;;
  finish) shift; cmd_finish "${1:?חסר שם סוכן}" "${@:2}" ;;
  check)  shift; cmd_check  "${1:?חסר שם סוכן}" ;;
  *) echo "שימוש: desk.sh {start|finish|check} <agent>"; exit 2 ;;
esac
