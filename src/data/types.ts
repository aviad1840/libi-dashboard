// LIBI domain types

export type NursingLevel = 1 | 2 | 3;

export type ContentWorld =
  | "belonging_meaning"
  | "health_function"
  | "resilience"
  | "assistive_tech"
  | "home_services";

export interface Service {
  id: string;
  name: string;
  world: ContentWorld;
  units: number; // cost in units
  subsidy: number; // %
  description: string;
  vendor: string;
}

export type RiskFlag =
  | "loneliness"
  | "inactive"
  | "low_balance"
  | "functional_decline"
  | "expiring_balance"
  | "fall_risk";

export type Persona =
  | "social_active"
  | "homebody"
  | "tech_curious"
  | "tradition_keeper"
  | "caregiver_dependent";

export interface FunctionalProfile {
  mobility: number; // 1-5
  cognition: number;
  emotional: number;
  social: number;
  vision: number;
  hearing: number;
  verified: boolean;
}

export interface Wallet {
  total: number;
  balance: number;
  optimalAgingUnits: number;
}

export interface LevProfile {
  persona: Persona;
  meaningTags: string[];
  lonelinessScore: number; // 1-10 (10 = most connected)
  riskFlags: RiskFlag[];
  dream: string;
  engagementTips: string[];
  verified: boolean;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  city: string;
  phone: string;
  emergencyContact: { name: string; relation: string; phone: string };
  nursingLevel: NursingLevel;
  active: boolean;
  wallet: Wallet;
  lev: LevProfile;
  functional: FunctionalProfile;
  conditions: string[];
  preferences: string[];
  lastActivity: string; // human-readable Hebrew date
  daysSinceActivity: number;
}

export type ActionPriority = "high" | "medium" | "low";
export type ActionStatus = "pending" | "in_progress" | "completed";
export type ActionType =
  | "loneliness_intervention"
  | "wallet_optimization"
  | "expiring_balance"
  | "functional_decline"
  | "reactivation"
  | "family_engagement";

export interface CrmAction {
  id: string;
  clientId: string;
  type: ActionType;
  typeLabel: string;
  priority: ActionPriority;
  title: string;
  description: string;
  suggestion: string;
  suggestedServiceIds: string[];
  status: ActionStatus;
  createdAt: string;
  hoursOpen: number;
  escalated: boolean;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  clientId?: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  read: boolean;
  resolved: boolean;
  createdAt: string;
}

export type BookingStatus = "scheduled" | "completed" | "cancelled" | "in_progress";

export interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: BookingStatus;
  units: number;
}

export type ScheduleType =
  | "visit"
  | "call"
  | "vendor"
  | "plan"
  | "assessment"
  | "family"
  | "report";

export interface ScheduleItem {
  id: string;
  time: string;
  type: ScheduleType;
  title: string;
  note: string;
  urgent?: boolean;
}
