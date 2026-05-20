# LIBI Dashboard — "לב"

לוח בקרה לפיילוט "עכשיו אני" — מערכת ניהול וטיפול אישי למתאמות בתכנית הסיעוד הקהילתית בפסגת זאב, ירושלים.

המוצר מתמקד ב**טיפול משמעותי**: זיהוי בדידות, פרסונה, חלום אישי, וארנק שירותים מחולק לחמישה עולמות תוכן (שייכות ומשמעות, בריאות ותפקוד, חוסן, טכנולוגיה מסייעת, שירותי בית).

## הרצה מקומית

```bash
npm install        # או: bun install
npm run dev        # http://localhost:8080
```

סקריפטים:

| פקודה | תיאור |
|-------|-------|
| `npm run dev` | פיתוח לוקאלי (port 8080) |
| `npm run build` | build לפרודקשן |
| `npm run preview` | תצוגה מקדימה של ה-build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest במצב watch |

## מבנה תיקיות

```
src/
├── App.tsx                # שורש האפליקציה (routes + providers)
├── main.tsx               # StrictMode + render
├── components/
│   ├── common/            # Card, Chip, Avatar, ProgressBar
│   ├── layout/            # AppLayout (mobile-responsive), AppSidebar
│   ├── system/            # ErrorBoundary, ScrollToTop, RouteFallback
│   └── ui/                # shadcn/ui (~50 רכיבים)
├── pages/                 # 9 דפים: Index, Clients, ClientDetail, Actions, Alerts, Bookings, Reports, Settings, NotFound
├── data/
│   ├── types.ts           # מודלים: Client, LevProfile, Wallet, CrmAction, Alert, Booking, ScheduleItem
│   ├── clients.ts         # 75 קלאינטים מיוצרים מ-seed קבוע + Sarah (c1) כ-hero
│   ├── services.ts        # 18 שירותים ב-5 עולמות תוכן
│   ├── mock.ts            # schedule + bookings + alerts + attentionRows
│   ├── constants.ts       # מילוני label/icon/tone לכל enum-ים
│   ├── actions-store.ts   # store עם persistence ב-localStorage
│   └── alerts-store.ts    # store עם persistence ב-localStorage
├── lib/
│   ├── recommendations.ts # מנוע ההמלצות (6 templates)
│   ├── analytics.ts       # אגרגציות לעמוד Reports
│   ├── storage.ts         # typed localStorage adapter
│   └── utils.ts           # cn() helper
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-debounced-value.ts
│   └── use-persisted-state.ts
└── test/                  # Vitest + Testing Library
```

## מנוע ההמלצות

`src/lib/recommendations.ts` ממפה כל קלאינט ל-`CrmAction[]` לפי 6 כללי heuristic:

| Trigger | Priority | סף |
|---------|----------|-----|
| ציון בדידות ≤ 3 או flag `loneliness` | high | SLA 72h |
| flag `expiring_balance` | high | SLA 72h |
| flag `functional_decline`/`fall_risk` או mobility ≤ 2 | high | SLA 72h |
| יתרת ארנק ≥ 85% ללא שימוש | medium | SLA 168h |
| `daysSinceActivity` ≥ 14 ולא פעיל | medium | SLA 168h |
| פרסונה `tradition_keeper` או `caregiver_dependent` | low | SLA 336h |

האקשנים נוצרים בעת טעינת האפליקציה (deterministic, מה-`clients`), וסטטוסים שמשתנים (pending → in_progress → completed) נשמרים ב-localStorage תחת ה-namespace `libi:v1:actions-overrides`.

## Persistence

- **Read/write בזמן ריצה**: localStorage namespace `libi:v1`.
- **שני stores**: `actions-store.ts` (סטטוסי פעולות) ו-`alerts-store.ts` (read/resolved של התראות).
- **API שכמו של backend**: `useActions()`, `useAlerts()` — מבוסס `useSyncExternalStore`, אז כל קומפוננטה מתעדכנת אוטומטית.
- מתאים ל-**דמואים חד-משתמש**. לא לפיילוט רב-משתמשים — דורש backend.

## איכות

- **TypeScript strict** מלא (`strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals/Parameters`, `noImplicitReturns`).
- **ESLint** עם `no-unused-vars`, `no-explicit-any`, `no-console` (allow warn/error).
- **28 בדיקות Vitest** מכסות את מנוע ההמלצות, פונקציות האגרגציה, ו-Avatar/ProgressBar.
- **Lazy-loaded routes** עם Suspense + RouteFallback בעברית.
- **ErrorBoundary** עוטף את כל האפליקציה.
- **Mobile-responsive** — drawer-sidebar במובייל, breakpoint 768px.
- **a11y בסיסי** — skip-to-content, aria-labels, role="img" באווטרים, aria-current על nav active.

## Roadmap לפרודקשן

| צעד | זמן | מה זה נותן |
|-----|-----|------------|
| Supabase (Auth + DB + RLS) | 1-2 שבועות | רב-משתמש, persistence, אבטחה |
| Vercel deploy + CI | יום | URL חי, CI/CD |
| Sentry monitoring | חצי יום | error tracking |
| Audit log | 2-3 ימים | דרישה רגולטורית |
| חיבור ל-LLM (Anthropic API) | 3-5 ימים | שדרוג ההמלצות ל-AI אמיתי |

## טכנולוגיות

React 18 · TypeScript 5 · Vite 5 · TailwindCSS · shadcn/ui · React Router 6 · React Query 5 · recharts · sonner · Vitest

---

איש קשר: אביעד יצחקי, מוביל פיתוח/שותפויות/AI, המוסד לביטוח לאומי.
