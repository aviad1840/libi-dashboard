import type { Service } from "./types";

export const services: Service[] = [
  // Belonging & Meaning (100% subsidy)
  { id: "s1", name: "מועדון חברתי שכונתי", world: "belonging_meaning", units: 4, subsidy: 100, description: "מפגש שבועי עם בני הגיל באווירה חמה.", vendor: "מתנ\"ס רמת גן" },
  { id: "s2", name: "סיפור חיים מצולם", world: "belonging_meaning", units: 6, subsidy: 100, description: "תיעוד סיפור החיים בסרט מקצועי למשפחה.", vendor: "זיכרון חי" },
  { id: "s3", name: "מתנדב לשיחה שבועית", world: "belonging_meaning", units: 2, subsidy: 100, description: "שיחת חברות קבועה עם מתנדב/ת בהתאמה אישית.", vendor: "ידידים" },
  { id: "s4", name: "חוג שירה בציבור", world: "belonging_meaning", units: 3, subsidy: 100, description: "מפגש שירה בקבוצה קטנה.", vendor: "שירה ביחד" },

  // Health & Function (100% subsidy)
  { id: "s5", name: "פיזיותרפיה בבית", world: "health_function", units: 5, subsidy: 100, description: "טיפול פיזיותרפיה אישי בסביבת הבית.", vendor: "פיזיו פלוס" },
  { id: "s6", name: "תזונאי/ת קליני/ת", world: "health_function", units: 4, subsidy: 100, description: "ייעוץ תזונה מותאם למצב רפואי.", vendor: "תזונה נכונה" },
  { id: "s7", name: "עיסוי רפואי", world: "health_function", units: 4, subsidy: 100, description: "טיפול עיסוי להקלה על כאבי שרירים ומפרקים.", vendor: "מגע מרפא" },
  { id: "s8", name: "טיפול רגשי קצר מועד", world: "health_function", units: 5, subsidy: 100, description: "ליווי רגשי על ידי עו\"ס מוסמך.", vendor: "אופק" },

  // Resilience (50% subsidy)
  { id: "s9", name: "סדנת התמודדות עם דמנציה", world: "resilience", units: 6, subsidy: 50, description: "כלים מעשיים לבן/בת המשפחה.", vendor: "מכון מרכז" },
  { id: "s10", name: "סדנת אבל ואובדן", world: "resilience", units: 5, subsidy: 50, description: "תהליך קבוצתי לעיבוד אובדן.", vendor: "נחמה" },
  { id: "s11", name: "ייעוץ פיננסי לגיל השלישי", world: "resilience", units: 4, subsidy: 50, description: "תכנון תקציב והתנהלות כלכלית.", vendor: "כספים נבונים" },

  // Assistive Tech (50% subsidy)
  { id: "s12", name: "מכשיר שמיעה דיגיטלי", world: "assistive_tech", units: 12, subsidy: 50, description: "מכשיר שמיעה מתקדם עם התאמה אישית.", vendor: "מדיקל הירינג" },
  { id: "s13", name: "שעון חירום עם GPS", world: "assistive_tech", units: 6, subsidy: 50, description: "שעון לחצן מצוקה עם איתור מיקום.", vendor: "סייפ-לייף" },
  { id: "s14", name: "מקל הליכה חכם", world: "assistive_tech", units: 4, subsidy: 50, description: "מקל עם חיישני נפילה והתראה.", vendor: "וויקר טק" },

  // Home Services (20% subsidy)
  { id: "s15", name: "ניקיון יסודי לבית", world: "home_services", units: 3, subsidy: 20, description: "ניקיון מקיף פעם בחודש.", vendor: "בית נקי" },
  { id: "s16", name: "תיקוני בית קלים", world: "home_services", units: 3, subsidy: 20, description: "אינסטלציה, חשמל ותיקונים קטנים.", vendor: "מאסטר פיקס" },
  { id: "s17", name: "כביסה ומגוהצת", world: "home_services", units: 2, subsidy: 20, description: "שירות כביסה שבועי עד הבית.", vendor: "לבן וצח" },
  { id: "s18", name: "קניות ומשלוח מצרכים", world: "home_services", units: 2, subsidy: 20, description: "קניות שבועיות לפי רשימה אישית.", vendor: "סופר עד הבית" },
];

export const getService = (id: string) => services.find((s) => s.id === id)!;
