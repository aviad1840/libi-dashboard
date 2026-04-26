import type { Client, Persona, RiskFlag, NursingLevel } from "./types";

const FIRST_NAMES_F = ["שרה", "רחל", "מרים", "אסתר", "חנה", "לאה", "יפה", "ציפורה", "מלכה", "פנינה", "דבורה", "תמר", "נעמי", "אביבה", "שושנה", "ברכה", "רבקה", "יעל", "זהבה", "אורה"];
const FIRST_NAMES_M = ["יוסף", "דוד", "משה", "אברהם", "יצחק", "שמואל", "אהרן", "יעקב", "מרדכי", "ישראל", "אליעזר", "חיים", "מנחם", "ראובן", "שלמה", "בנימין", "נתן", "גדעון", "אריה", "עמרם"];
const LAST_NAMES = ["כהן", "לוי", "מזרחי", "פרץ", "גבאי", "ביטון", "אברהם", "פרידמן", "אזולאי", "דהן", "חדד", "עמר", "אוחיון", "אלמליח", "טולדנו", "סויסה", "בן דוד", "רוזן", "שפירא", "גולדברג", "קליין", "וייס", "מוזס", "אדרי", "טל"];
const CITIES = ["רמת גן", "תל אביב", "חיפה", "ירושלים", "באר שבע", "פתח תקווה", "ראשון לציון", "חולון", "נתניה", "אשדוד", "בני ברק", "רחובות", "הרצליה", "כפר סבא"];
const CONDITIONS = ["סכרת", "יתר לחץ דם", "אוסטיאופורוזיס", "דלקת מפרקים", "ירידה בשמיעה", "ליקוי ראייה", "אי ספיקת לב", "פרקינסון", "דמנציה קלה", "פוסט שבץ"];
const PREFERENCES = ["מוזיקה ישראלית", "תנ\"ך", "בישול", "סריגה", "גינון", "שחמט", "טיולים", "צילום", "כתיבה", "תפילה במניין", "סדרות טלוויזיה", "ספרים"];
const DREAMS = [
  "להיפגש שוב עם חברות ילדות",
  "ללמד נכדים לבשל מתכון משפחתי",
  "לחזור לשיר במקהלה",
  "לסיים ספר זיכרונות",
  "ללמוד להשתמש במחשב",
  "לטייל בכרמל עוד פעם אחת",
  "לארגן אירוע משפחתי גדול",
  "להתחיל לכתוב יומן",
];
const TIPS = [
  "התקשרי בבוקר — ערנית יותר ומגיבה בחיוב.",
  "מעדיפ/ה שיחה אישית על פני קבוצתית בהתחלה.",
  "מתחבר/ת לזיכרונות ילדות כפתיח לשיחה.",
  "שירים מבית-אבא פותחים את הלב.",
  "מגיב/ה היטב להזמנה אישית בכתב יד.",
  "עדיף/ה ביקור על פני שיחת טלפון.",
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const personas: Persona[] = ["social_active", "homebody", "tech_curious", "tradition_keeper", "caregiver_dependent"];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function generateClient(i: number): Client {
  const rng = seeded(i * 13 + 7);
  const female = rng() > 0.4;
  const firstName = pick(rng, female ? FIRST_NAMES_F : FIRST_NAMES_M);
  const lastName = pick(rng, LAST_NAMES);
  const age = 65 + Math.floor(rng() * 31);
  const city = pick(rng, CITIES);
  const nursingLevel = (Math.floor(rng() * 3) + 1) as NursingLevel;
  const total = nursingLevel === 1 ? 16 : nursingLevel === 2 ? 32 : 48;
  const balance = Math.floor(rng() * (total + 1));
  const persona = pick(rng, personas);
  const lonelinessScore = Math.floor(rng() * 10) + 1;
  const flags: RiskFlag[] = [];
  if (lonelinessScore <= 3) flags.push("loneliness");
  const daysSince = Math.floor(rng() * 30);
  if (daysSince > 14) flags.push("inactive");
  if (balance / total < 0.2) flags.push("low_balance");
  if (rng() > 0.85) flags.push("functional_decline");
  if (rng() > 0.9) flags.push("expiring_balance");
  if (rng() > 0.92) flags.push("fall_risk");

  const active = daysSince < 14;
  const lastActivity =
    daysSince === 0 ? "היום" : daysSince === 1 ? "אתמול" : `לפני ${daysSince} ימים`;

  return {
    id: `c${i}`,
    firstName,
    lastName,
    age,
    city,
    phone: `05${Math.floor(rng() * 9)}-${String(Math.floor(rng() * 9000000) + 1000000)}`,
    emergencyContact: {
      name: `${pick(rng, female ? FIRST_NAMES_M : FIRST_NAMES_F)} ${lastName}`,
      relation: pick(rng, ["בן", "בת", "אחיין", "אחיינית", "כלה", "חתן"]),
      phone: `05${Math.floor(rng() * 9)}-${String(Math.floor(rng() * 9000000) + 1000000)}`,
    },
    nursingLevel,
    active,
    wallet: {
      total,
      balance,
      optimalAgingUnits: Math.floor(rng() * 8) + 2,
    },
    lev: {
      persona,
      meaningTags: pickN(rng, PREFERENCES, 3),
      lonelinessScore,
      riskFlags: flags,
      dream: pick(rng, DREAMS),
      engagementTips: pickN(rng, TIPS, 2),
      verified: rng() > 0.4,
    },
    functional: {
      mobility: Math.floor(rng() * 5) + 1,
      cognition: Math.floor(rng() * 5) + 1,
      emotional: Math.floor(rng() * 5) + 1,
      social: Math.floor(rng() * 5) + 1,
      vision: Math.floor(rng() * 5) + 1,
      hearing: Math.floor(rng() * 5) + 1,
      verified: rng() > 0.5,
    },
    conditions: pickN(rng, CONDITIONS, 2 + Math.floor(rng() * 2)),
    preferences: pickN(rng, PREFERENCES, 3),
    lastActivity,
    daysSinceActivity: daysSince,
  };
}

// Generate 75 clients
const generated = Array.from({ length: 75 }, (_, i) => generateClient(i + 2));

// Sarah — protagonist (id c1) — pinned to top
const sarah: Client = {
  id: "c1",
  firstName: "שרה",
  lastName: "כהן",
  age: 78,
  city: "רמת גן",
  phone: "052-1234567",
  emergencyContact: { name: "אורי כהן", relation: "בן", phone: "054-9876543" },
  nursingLevel: 2,
  active: true,
  wallet: { total: 32, balance: 32, optimalAgingUnits: 6 },
  lev: {
    persona: "social_active",
    meaningTags: ["שירה ישראלית", "בישול לחג", "נכדים"],
    lonelinessScore: 3,
    riskFlags: ["loneliness"],
    dream: "לחזור לשיר במקהלה כמו פעם",
    engagementTips: [
      "פותחת את הלב כששואלים על הילדים בנעוריה.",
      "שירי נעמי שמר יוצרים מיד חיוך והיענות.",
    ],
    verified: false,
  },
  functional: {
    mobility: 4,
    cognition: 5,
    emotional: 3,
    social: 2,
    vision: 4,
    hearing: 3,
    verified: false,
  },
  conditions: ["יתר לחץ דם", "אוסטיאופורוזיס קלה"],
  preferences: ["מוזיקה ישראלית", "בישול", "תפילה במניין"],
  lastActivity: "לפני 4 ימים",
  daysSinceActivity: 4,
};

export const clients: Client[] = [sarah, ...generated];

export const getClient = (id: string) => clients.find((c) => c.id === id);
