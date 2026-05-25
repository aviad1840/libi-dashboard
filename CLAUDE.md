# CLAUDE.md — לב | LIBI Dashboard

## מה זה הפרויקט

**לב** (LIBI) הוא לוח בקרה לניהול טיפול בגיל השלישי, מיועד למתאמות טיפול. המערכת עוזרת לנהל מטופלים, לוחות זמנים, ארנק שירותים, התראות ופעולות CRM.

**המשתמשת המרכזית:** שרית מזרחי, מתאמת טיפול — זו הדמות שמחוברת בסיידבר.
**הדמות-הלקוחה הראשית (protagonist):** שרה כהן (id: `c1`) — מוצגת ב-spotlight ראשי בדשבורד.

---

## Tech Stack

| שכבה | טכנולוגיה |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | react-router-dom v6 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Components | Radix UI primitives via shadcn |
| Icons | lucide-react |
| Server State | TanStack Query v5 (לעתיד — כרגע הכל mock) |
| Testing | Vitest + Testing Library |
| Hebrew/RTL | `dir="rtl"` על root div ב-AppLayout |

```bash
npm run dev       # dev server
npm run build     # production build
npm run test      # run tests once
npm run lint      # eslint
```

---

## מבנה קבצים

```
src/
├── App.tsx                     # Router root — כל הנתיבים
├── pages/
│   ├── Index.tsx               # דשבורד ראשי
│   ├── Clients.tsx             # רשימת מטופלים + חיפוש
│   ├── ClientDetail.tsx        # פרופיל מטופל (tabs: תפקודי / ארנק / הזמנות)
│   ├── Actions.tsx             # פעולות לב (CRM actions)
│   ├── Alerts.tsx              # התראות
│   ├── Bookings.tsx            # הזמנות שירות
│   ├── Reports.tsx             # דוחות
│   └── Settings.tsx            # הגדרות
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Shell: sidebar + main content, dir="rtl"
│   │   └── AppSidebar.tsx      # ניווט ימני קבוע, 64 = w-64
│   ├── common/
│   │   ├── Avatar.tsx          # אווטאר עם initials
│   │   ├── Card.tsx            # כרטיס בסיסי + CardHeader
│   │   ├── Chip.tsx            # תגית צבעונית
│   │   └── ProgressBar.tsx     # סרגל התקדמות
│   └── ui/                     # shadcn/ui components (אל תשנה ידנית)
├── data/
│   ├── types.ts                # כל ה-TypeScript interfaces
│   ├── constants.ts            # מיפויים: RiskFlag→label, Persona→label וכו'
│   ├── clients.ts              # generateClient() seeded + שרה כהן
│   ├── services.ts             # 18 שירותים ב-5 עולמות תוכן
│   ├── mock.ts                 # schedule, actions (CrmAction[]), alerts, bookings, attentionRows
│   └── dashboard.ts            # stats, kpis, sarahChangelog — נגזר מ-mock + clients
├── hooks/
│   └── use-mobile.tsx
└── lib/
    └── utils.ts                # cn() helper (clsx + tailwind-merge)
```

---

## מודל הדומיין

### Client
```ts
Client {
  id, firstName, lastName, age, city, phone
  emergencyContact: { name, relation, phone }
  nursingLevel: 1 | 2 | 3        // רמת סיעוד
  active: boolean
  wallet: { total, balance, optimalAgingUnits }
  lev: LevProfile                 // פרופיל לב (AI/engagement)
  functional: FunctionalProfile   // mobility, cognition, emotional, social, vision, hearing (1-5 each)
  conditions: string[]
  preferences: string[]
  lastActivity: string            // עברית human-readable
  daysSinceActivity: number
}
```

### LevProfile (פרופיל לב)
```ts
LevProfile {
  persona: "social_active" | "homebody" | "tech_curious" | "tradition_keeper" | "caregiver_dependent"
  meaningTags: string[]          // תחביבים/תחומי עניין
  lonelinessScore: number        // 1-10, 10 = הכי מחובר
  riskFlags: RiskFlag[]          // loneliness | inactive | low_balance | functional_decline | expiring_balance | fall_risk
  dream: string
  engagementTips: string[]
  verified: boolean
}
```

### Service (שירות)
```ts
Service {
  id, name, vendor
  world: ContentWorld             // 5 עולמות תוכן (ראה למטה)
  units: number                  // עלות ביחידות מארנק
  subsidy: number                // % סובסידיה (100 / 50 / 20)
  description: string
}
```

### 5 עולמות תוכן (ContentWorld)
| key | תווית | סובסידיה |
|-----|--------|----------|
| `belonging_meaning` | שייכות ומשמעות | 100% |
| `health_function` | בריאות ותפקוד | 100% |
| `resilience` | חוסן ועצמאות | 50% |
| `assistive_tech` | מוצרים וטכנולוגיה מסייעת | 50% |
| `home_services` | שירותי בית | 20% |

### CrmAction (פעולת לב)
```ts
CrmAction {
  id, clientId
  type: ActionType               // loneliness_intervention | wallet_optimization | expiring_balance | ...
  priority: "high" | "medium" | "low"
  title, description, suggestion
  suggestedServiceIds: string[]
  status: "pending" | "in_progress" | "completed"
  hoursOpen, escalated
}
```

---

## Design System

**Brand color:** `#1B3A5C` = `hsl(212 55% 23%)` = `--primary`

**Token pattern:** כל הצבעים ב-CSS variables ב-`src/index.css`. שימוש:
- `bg-primary`, `text-primary`, `bg-primary-soft` — ברנד
- `bg-destructive`, `bg-destructive-soft` — אדום (סיכון, קריטי)
- `bg-warning`, `bg-warning-soft` — כתום (אזהרה)
- `bg-success`, `bg-success-soft` — ירוק (חיובי)
- `bg-info`, `bg-info-soft` — כחול בהיר (מידע)
- `bg-muted` — אפור (secondary)

**RTL:** כל ה-UI עובד RTL. `dir="rtl"` על `AppLayout`. Sidebar מחובר לצד **ימין** (`right-0`), main content עם `mr-64` (לא `ml-64`).

**Chip / tone pattern:**
```tsx
<Chip tone="destructive">טקסט</Chip>
// tones: "primary" | "destructive" | "warning" | "success" | "info" | "muted"
```

**ClassName utility:** תמיד להשתמש ב-`cn()` מ-`@/lib/utils` כדי לחבר classNames תנאיים.

---

## נתיבים

| Path | Component | תיאור |
|------|-----------|-------|
| `/` | Index | דשבורד + spotlight שרה |
| `/clients` | Clients | טבלה + חיפוש + פילטרים |
| `/clients/:id` | ClientDetail | פרופיל מלא, tabs |
| `/actions` | Actions | כל פעולות הלב |
| `/alerts` | Alerts | כל ההתראות |
| `/bookings` | Bookings | ניהול הזמנות |
| `/reports` | Reports | דוחות |
| `/settings` | Settings | הגדרות |

---

## מקורות נתונים

**כל הנתונים כרגע הם mock בזיכרון — אין backend.**

- `clients.ts` — מייצר 75 לקוחות seeded (דטרמיניסטי) + שרה (c1) בראש
- `services.ts` — 18 שירותים סטטיים
- `mock.ts` — schedule, actions, alerts, bookings, attentionRows
- `dashboard.ts` — stats ו-KPIs נגזרים ב-runtime מ-clients + mock

כשמוסיפים backend: צריך להחליף את ה-imports ב-`data/` ב-TanStack Query hooks. `QueryClient` כבר מוגדר ב-`App.tsx`.

---

## Conventions

1. **Pages** — כל page מוסיפה `<AppLayout title="..." subtitle="...">` כ-wrapper.
2. **Common components** — Card, Chip, Avatar, ProgressBar הם ה-primitives הפנימיים. `src/components/ui/` הם shadcn — לא לשנות ישירות.
3. **Data imports** — תמיד `import { clients } from "@/data/clients"` (לא relative paths).
4. **Icon map** — `lucide-react` בלבד. Icon-name בתוך string (כמו ב-`constants.ts`) → resolve ידנית ל-component.
5. **Hebrew text** — כל הטקסט הגלוי למשתמש בעברית. Comments ו-code באנגלית.
6. **Tone consistency** — danger = `destructive`, warning = `warning`, ok = `success`, neutral = `muted`.

---

## סביבה

- הפרויקט מתארח ב-cloud remote environment (Claude Code on the web)
- Branch עבודה: `claude/notebook-claude-integration-D7h6M`
- Remote: `aviad1840/libi-dashboard` ב-GitHub
- Push תמיד ל: `git push -u origin claude/notebook-claude-integration-D7h6M`

---

## Notebooks MCP — שני שרתי כלים

`.claude/settings.json` רושם שני MCP servers שפועלים אוטומטית בכל סשן Claude Code מקומי.

### הגדרה — פעם אחת

```bash
bash notebooks-mcp/setup.sh   # מתקין הכל + מסביר שלב הלוגין
notebooklm login               # פותח דפדפן לחיבור חשבון Google
```

---

### 1. Local Notebooks (`notebooks-mcp/server.py`)

קורא תיקיות מקומיות — קוד, הערות, Obsidian, כל קבצי טקסט.

**קונפיג:** `~/.claude/notebooks.json` (על המכונה שלך, לא ב-git)
```json
{
  "notebooks": {
    "libi": { "path": "/Users/you/libi-dashboard", "description": "לב dashboard" },
    "notes": { "path": "/Users/you/Documents/notes", "description": "הערות מחקר" }
  }
}
```

| כלי | שימוש |
|-----|-------|
| `notebook_list` | רשימת כל הנוטבוקים המוגדרים |
| `notebook_context <name>` | טעינת כל הקבצים לקונטקסט |
| `notebook_search <name> <query>` | חיפוש בתוך נוטבוק |
| `notebook_add <name> <path>` | הוספת נוטבוק חדש |

---

### 2. Google NotebookLM (`notebooks-mcp/google_notebooklm_server.py`)

גישה מלאה לחשבון Google NotebookLM — כל הנוטבוקים, מקורות, יצירת תוכן.

**18 כלים זמינים לקלוד:**

| קטגוריה | כלים |
|---------|------|
| **Auth** | `notebooklm_auth_check`, `notebooklm_login` |
| **נוטבוקים** | `notebooklm_list`, `notebooklm_create`, `notebooklm_use`, `notebooklm_status`, `notebooklm_delete` |
| **מקורות** | `notebooklm_source_add`, `notebooklm_source_list`, `notebooklm_source_wait`, `notebooklm_source_fulltext`, `notebooklm_source_research` |
| **שיחה** | `notebooklm_ask`, `notebooklm_history` |
| **יצירה** | `notebooklm_generate`, `notebooklm_generate_wait`, `notebooklm_download` |
| **הערות** | `notebooklm_note_create` |

**סוגי תוכן שניתן לייצר:**
`audio` (פודקאסט) · `video` · `slide-deck` · `quiz` · `flashcards` · `report` · `infographic` · `mind-map` · `data-table`

**מתי להשתמש ב-NotebookLM במקום בקונטקסט ישיר:**
- מסמכים גדולים (PDF, מחקרים) — `source_add` + `ask` במקום לטעון לקונטקסט
- יצירת מצגות / אינפוגרפיקה / פודקאסטים מחומר קיים
- מחקר web אוטומטי — `source_research "נושא"`
- שמירת ניתוחים של קלוד כהערות בנוטבוק לשימוש עתידי

---

### זמינות לפי סביבה

| סביבה | Local Notebooks | Google NotebookLM |
|--------|----------------|-------------------|
| Claude Code CLI (מקומי) | ✅ | ✅ |
| Claude Code VS Code | ✅ | ✅ |
| Claude Desktop App | ✅ (הוסף ל-`claude_desktop_config.json`) | ✅ |
| Claude.ai web (cloud) | ❌ MCP לא רץ בענן | ❌ |

> **טיפ:** לחיבור ב-Claude Desktop App — הרץ `setup.sh`, הוא מדפיס את ה-JSON המדויק להוספה ל-`claude_desktop_config.json`.
