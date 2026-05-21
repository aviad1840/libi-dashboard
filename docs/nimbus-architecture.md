# LIBI — ארכיטקטורת מערכת על נימבוס

מסמך טכני לוועדת היגוי בין-משרדית ולמערך הדיגיטל הלאומי.

**גרסה:** 0.9 (טיוטה לוועדה) · **תאריך:** מאי 2026 · **מוביל:** אביעד יצחקי, ביטוח לאומי

---

## 1. עקרונות מנחים

| עיקרון | מה זה אומר |
|--------|--------------|
| **נימבוס first** | כל קומפוננטה — frontend, backend, DB, LLM — נפרסת תחת ענן ממשלתי. לא יוצאים מהגבולות. |
| **AI as decision support** | המערכת מציעה. אדם מאשר. אין פעולה אוטומטית שמשפיעה על אזרח. |
| **שיתוף דאטה מבוקר** | RLS על רמת רשומה לפי משרד וזכאות. שום משרד לא רואה דאטה שאינו שלו ללא אישור. |
| **הסבריות מלאה** | כל המלצה מציגה את הסיבות שלה. אין "black box". |
| **Audit-first** | כל פעולה נכתבת ל-event log בלתי-משתנה. |
| **Federated by design** | משרד לא צריך להעביר את הדאטה שלו — מספיק access דרך API gateway. |

## 2. שכבות המערכת

```
┌─────────────────────────────────────────────────────────────┐
│                    Coordinator UI (React)                    │
│                    Public Web UI (React)                     │
│                    Mobile App (Capacitor)                    │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS + JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Nimbus Managed)                    │
│         RLS · Rate limit · Audit · Cache · Auth              │
└─────────────────────────────────────────────────────────────┘
                              ▲
        ┌─────────┬─────────┴─────────┬─────────┐
        ▼         ▼                   ▼         ▼
┌──────────┐ ┌─────────┐  ┌───────────────┐ ┌──────────┐
│ Postgres │ │ AI Layer │ │ Document Store│ │ Event Log│
│ (Supabase│ │ (Private │ │   (S3-like)   │ │ (append- │
│  on Nimb)│ │  LLM)    │ └───────────────┘ │   only)  │
└──────────┘ └─────────┘                    └──────────┘
        ▲         ▲
        │         │
┌───────┴─────────┴─────────────────────────────────────┐
│       Federated Data Access (per ministry)            │
├───────────────────────────────────────────────────────┤
│  BTL    │ Welfare │ Health        │ Treasury         │
│  API    │  API    │  (HMOs · 4)   │  API             │
└───────────────────────────────────────────────────────┘
```

## 3. מקורות דאטה ופרוטוקול שיתוף

| משרד | סוג גישה | סיווג | רשומות צפויות |
|------|-----------|--------|----------------|
| ביטוח לאומי | ישיר (אנחנו הבית) | פתוח לפרויקט | ~240K זכאי סיעוד פעילים |
| משרד הרווחה | API gateway · קריאה בלבד | אישור משפטי נדרש | ~180K תיקי רווחה רלוונטיים |
| משרד הבריאות (קופ"ח) | FHIR API · קריאה בלבד | הסכם דאטה לפי קופ"ח | ~240K (חופף ל-BTL) |
| משרד האוצר | API · נתוני עלות מצרפיים | מעין-פתוח (אגרגציה) | ללא PII — סכומים בלבד |

**עיקרון פדרציה**: הדאטה נשארת אצל המשרד. הפרויקט לא מחזיק עותקים. כל שאילתה רצה דרך API gateway של המשרד עם authorization-per-call ו-audit log.

## 4. ‎5 שכבות ה-AI

### שכבה 1 — NLP + OCR (Intake)
- **קלט:** תיק תביעה (PDF סרוק)
- **טכנולוגיה:** Azure Document Intelligence על נימבוס + מודל NER עברי custom
- **פלט:** ‎8-12 שדות מובנים + confidence score
- **MVP פעיל:** ‎YES (‎417K הגשות/שנה)
- **SLA:** <30 שניות לתיק

### שכבה 2 — Matching Engine
- **קלט:** פרופיל קשיש (פרסונה, רמה, ארנק, דגלים)
- **טכנולוגיה:** Heuristic scoring + logistic regression (תוצאות עתידיות)
- **פלט:** Top-3 שירותים + Top-2 מלוות, עם score + רציונל
- **MVP פעיל:** בפיתוח מתקדם
- **SLA:** <500ms

### שכבה 3 — Early Warning
- **קלט:** ‎12-23 פיצ׳רים מ-‎4 משרדים (timeline ‎60 ימים)
- **טכנולוגיה:** Gradient boosting classifier על דאטה היסטורי מצרפי
- **פלט:** הסתברות להידרדרות בחודש הבא + sources
- **MVP פעיל:** מתוכנן Q4 ‎2026
- **SLA:** <2 שניות per client; batch nightly

### שכבה 4 — Outcome Monitoring
- **קלט:** היסטוריית פעולות + תוצאות מדידה רבעוניות
- **טכנולוגיה:** Counterfactual analysis (control vs treatment) + drift detection
- **פלט:** אינסייטים אוטומטיים שמועברים לוועדת היגוי
- **MVP פעיל:** מתוכנן Q2 ‎2027
- **SLA:** דוחות דו-חודשיים

### שכבה 5 — Policy Intelligence
- **קלט:** אגרגציות מ-‎4 השכבות
- **טכנולוגיה:** Dashboard + RAG על ה-corpus המקצועי
- **פלט:** דו"ח רבעוני + alert system לוועדה
- **MVP פעיל:** מתוכנן ‎2027

## 5. LLM Strategy

| היבט | בחירה |
|------|--------|
| מודל | Claude Opus / Sonnet דרך private endpoint על נימבוס |
| חלופה | LLM ישראלי (DICTA, AlephBERT) — בהערכה |
| Use cases | Assistant Chat למתאמת · אגרגציית טקסט · עוזר ניסוח דוחות |
| בקרה | כל פרומפט עובר prompt-firewall (ניקוי PII) לפני יציאה |
| תיעוד | כל interaction נשמר ב-event log עם hash |
| Off-switch | יכולת להעביר את כל ה-AI ל-rule-based fallback בלחיצה אחת |

## 6. אבטחת מידע

| תחום | מנגנון |
|------|---------|
| Auth | SSO ממשלתי (Smart Card) · אופציה ל-MFA |
| Authorization | RBAC + ABAC: מתאמת רואה רק את הזכאים שלה |
| Encryption at rest | AES-256 (נימבוס managed) |
| Encryption in transit | TLS 1.3 בלבד |
| Secrets | Nimbus Key Vault (אין secrets ב-code/ENV) |
| PII handling | redaction אוטומטית בטרם כל שליחה ל-LLM |
| Backup | יומי + שבועי · retention ‎7 שנים (רגולציה) |
| DR | RTO 4 שעות · RPO 1 שעה |

## 7. תאימות והסמכות

- [x] תקן אבטחת מידע ממשלתי (תק"א)
- [x] חוק הגנת הפרטיות + תקנות
- [ ] ISO ‎27001 — בתהליך
- [ ] HIPAA-equivalent (לבריאות) — בתהליך
- [x] מדריך לשימוש אחראי ב-AI במגזר הציבורי — תאימות מלאה (סעיף ‎9)

## 8. ביצועים צפויים

| מדד | יעד | מצב נוכחי (פיילוט) |
|-----|------|--------------------|
| Latency UI | p95 < 200ms | בדיקה ידנית: ~150ms |
| Latency AI (Matching) | p95 < 500ms | mock — instant |
| Throughput | 10K req/s peak | לא נבדק |
| Uptime | 99.9% | TBD |

## 9. תאימות למדריך AI אחראי במגזר הציבורי

| דרישה מהמדריך | מימוש בפרויקט |
|----------------|----------------|
| הסבריות | כל המלצה מציגה את ה-‎reasons שתרמו ל-score |
| הוגנות | בדיקת bias תקופתית על פני קבוצות (גיל, מגדר, ארץ מוצא) |
| שקיפות | קוד פתוח לוועדה · model card לכל מודל |
| בקרה אנושית | אישור מלווה לפני כל פעולה משפיעה |
| יכולת ערעור | טופס "ערעור על המלצה" בכל מסך |
| תיעוד | event log בלתי-משתנה + audit dashboard |
| פרטיות | PII redaction · data minimization · purpose limitation |

## 10. Roadmap טכני

| רבעון | אבן דרך |
|--------|---------|
| Q3 2026 | אישור ועדה · kick-off |
| Q4 2026 | Backend + Auth · ‎2 שכבות AI ראשונות (NLP+OCR · Matching) |
| Q1 2027 | Federation עם בריאות + רווחה |
| Q2 2027 | Early Warning model · ‎5 פיילוטים |
| Q3 2027 | Outcome Monitoring · feedback loop |
| Q4 2027 | Policy Intelligence Layer · הרחבה לאומית |

---

**נספחים** (יתפתחו לקראת ההגשה):
- Appendix A: Database schema
- Appendix B: API contracts
- Appendix C: Data sharing agreements draft
- Appendix D: Model cards (NLP, Matching, Early Warning)
