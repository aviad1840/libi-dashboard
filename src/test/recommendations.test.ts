import { describe, it, expect } from "vitest";
import type { Client } from "@/data/types";
import { recommendForClient, recommendForAll } from "@/lib/recommendations";

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: "test-1",
    firstName: "פלוני",
    lastName: "אלמוני",
    age: 75,
    city: "תל אביב",
    phone: "050-0000000",
    emergencyContact: { name: "בן", relation: "בן", phone: "050-1111111" },
    nursingLevel: 2,
    active: true,
    wallet: { total: 32, balance: 16, optimalAgingUnits: 4 },
    lev: {
      persona: "social_active",
      meaningTags: ["מוזיקה"],
      lonelinessScore: 7,
      riskFlags: [],
      dream: "חלום",
      engagementTips: ["טיפ"],
      verified: true,
    },
    functional: {
      mobility: 4,
      cognition: 4,
      emotional: 4,
      social: 4,
      vision: 4,
      hearing: 4,
      verified: true,
    },
    conditions: [],
    preferences: [],
    lastActivity: "אתמול",
    daysSinceActivity: 1,
    ...overrides,
  };
}

describe("recommendations engine", () => {
  it("produces no actions for a healthy active client", () => {
    const c = makeClient();
    const actions = recommendForClient(c);
    expect(actions.length).toBe(0);
  });

  it("flags loneliness when score is 3 or below", () => {
    const c = makeClient({ lev: { ...makeClient().lev, lonelinessScore: 2 } });
    const actions = recommendForClient(c);
    const loneliness = actions.find((a) => a.type === "loneliness_intervention");
    expect(loneliness).toBeDefined();
    expect(loneliness?.priority).toBe("high");
  });

  it("flags wallet optimization when 85%+ unused", () => {
    const c = makeClient({ wallet: { total: 32, balance: 30, optimalAgingUnits: 4 } });
    const actions = recommendForClient(c);
    const wallet = actions.find((a) => a.type === "wallet_optimization");
    expect(wallet).toBeDefined();
    expect(wallet?.priority).toBe("medium");
  });

  it("flags expiring balance from risk flag", () => {
    const c = makeClient({ lev: { ...makeClient().lev, riskFlags: ["expiring_balance"] } });
    const actions = recommendForClient(c);
    const exp = actions.find((a) => a.type === "expiring_balance");
    expect(exp).toBeDefined();
    expect(exp?.priority).toBe("high");
  });

  it("flags functional decline when mobility is 2 or less", () => {
    const c = makeClient({ functional: { ...makeClient().functional, mobility: 2 } });
    const actions = recommendForClient(c);
    const fn = actions.find((a) => a.type === "functional_decline");
    expect(fn).toBeDefined();
    expect(fn?.priority).toBe("high");
  });

  it("flags reactivation after 14+ days inactive", () => {
    const c = makeClient({ daysSinceActivity: 20, active: false });
    const actions = recommendForClient(c);
    const react = actions.find((a) => a.type === "reactivation");
    expect(react).toBeDefined();
    expect(react?.priority).toBe("medium");
  });

  it("flags family engagement for tradition_keeper persona", () => {
    const c = makeClient({ lev: { ...makeClient().lev, persona: "tradition_keeper" } });
    const actions = recommendForClient(c);
    const fam = actions.find((a) => a.type === "family_engagement");
    expect(fam).toBeDefined();
    expect(fam?.priority).toBe("low");
  });

  it("sorts results so high priority comes first", () => {
    const c1 = makeClient({ id: "c-low", lev: { ...makeClient().lev, persona: "tradition_keeper" } });
    const c2 = makeClient({ id: "c-high", lev: { ...makeClient().lev, lonelinessScore: 1 } });
    const all = recommendForAll([c1, c2]);
    expect(all[0]?.priority).toBe("high");
  });

  it("preserves Sarah narrative override", () => {
    const sarah = makeClient({
      id: "c1",
      firstName: "שרה",
      lastName: "כהן",
      lev: { ...makeClient().lev, lonelinessScore: 3 },
    });
    const actions = recommendForClient(sarah);
    const loneliness = actions.find((a) => a.type === "loneliness_intervention");
    expect(loneliness?.title).toContain("שרה");
  });
});
