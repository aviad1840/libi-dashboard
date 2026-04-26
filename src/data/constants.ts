import type { ContentWorld, Persona, RiskFlag, ActionType, ScheduleType, AlertSeverity, BookingStatus, NursingLevel } from "./types";

export const CONTENT_WORLDS: Record<ContentWorld, { label: string; emoji: string; subsidy: number; colorClass: string }> = {
  belonging_meaning: { label: "שייכות ומשמעות", emoji: "🤝", subsidy: 100, colorClass: "bg-info-soft text-info" },
  health_function: { label: "בריאות ותפקוד", emoji: "❤️‍🩹", subsidy: 100, colorClass: "bg-success-soft text-success" },
  resilience: { label: "חוסן ועצמאות", emoji: "🛡️", subsidy: 50, colorClass: "bg-primary-soft text-primary" },
  assistive_tech: { label: "מוצרים וטכנולוגיה מסייעת", emoji: "🦯", subsidy: 50, colorClass: "bg-warning-soft text-warning-foreground" },
  home_services: { label: "שירותי בית", emoji: "🏠", subsidy: 20, colorClass: "bg-muted text-muted-foreground" },
};

export const PERSONA_LABELS: Record<Persona, { label: string; emoji: string; description: string }> = {
  social_active: { label: "נהנה/ית מפעילות חברתית", emoji: "👥", description: "אוהב/ת מפגשים, קבוצות וחוויות משותפות." },
  homebody: { label: "מעדיף/ה את הבית", emoji: "🏡", description: "מתחבר/ת היטב לפעילות בבית או בסביבה הקרובה." },
  tech_curious: { label: "סקרן/ית טכנולוגיה", emoji: "📱", description: "פתוח/ה לכלים דיגיטליים ולמידה חדשה." },
  tradition_keeper: { label: "שומר/ת מסורת", emoji: "🕯️", description: "מעריך/ה ערכים, משפחה ומורשת." },
  caregiver_dependent: { label: "תלוי/ה במטפל/ת", emoji: "🤲", description: "זקוק/ה ללווי קרוב בפעילות יומית." },
};

export const RISK_LABELS: Record<RiskFlag, { label: string; icon: string; tone: "danger" | "warning" }> = {
  loneliness: { label: "בדידות", icon: "💔", tone: "danger" },
  inactive: { label: "לא פעיל", icon: "💤", tone: "warning" },
  low_balance: { label: "יתרה נמוכה", icon: "📉", tone: "warning" },
  functional_decline: { label: "ירידה תפקודית", icon: "⚠️", tone: "danger" },
  expiring_balance: { label: "יתרה פגה בקרוב", icon: "⏳", tone: "warning" },
  fall_risk: { label: "סיכון נפילה", icon: "🦯", tone: "danger" },
};

export const ACTION_TYPE_LABELS: Record<ActionType, { label: string; icon: string }> = {
  loneliness_intervention: { label: "התערבות בבדידות", icon: "💔" },
  wallet_optimization: { label: "אופטימיזציית ארנק", icon: "💰" },
  expiring_balance: { label: "יתרה פגה", icon: "⏳" },
  functional_decline: { label: "ירידה תפקודית", icon: "⚠️" },
  reactivation: { label: "החזרה לפעילות", icon: "🔄" },
  family_engagement: { label: "מעורבות משפחה", icon: "👨‍👩‍👧" },
};

export const SCHEDULE_ICONS: Record<ScheduleType, string> = {
  visit: "Home",
  call: "Phone",
  vendor: "Package",
  plan: "FileText",
  assessment: "AlertTriangle",
  family: "Users",
  report: "FileText",
};

export const ALERT_SEVERITY: Record<AlertSeverity, { label: string; tone: string }> = {
  critical: { label: "קריטי", tone: "bg-destructive-soft text-destructive border-destructive/20" },
  warning: { label: "אזהרה", tone: "bg-warning-soft text-warning-foreground border-warning/20" },
  info: { label: "מידע", tone: "bg-info-soft text-info border-info/20" },
};

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: string }> = {
  scheduled: { label: "מתוכנן", tone: "bg-info-soft text-info" },
  completed: { label: "הושלם", tone: "bg-success-soft text-success" },
  cancelled: { label: "בוטל", tone: "bg-destructive-soft text-destructive" },
  in_progress: { label: "בתהליך", tone: "bg-warning-soft text-warning-foreground" },
};

export const NURSING_LEVEL_TONE: Record<NursingLevel, string> = {
  1: "bg-success-soft text-success",
  2: "bg-warning-soft text-warning-foreground",
  3: "bg-destructive-soft text-destructive",
};
