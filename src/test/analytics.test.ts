import { describe, it, expect } from "vitest";
import { clients } from "@/data/clients";
import {
  walletUtilizationByLevel,
  personaDistribution,
  lonelinessDistribution,
  riskFlagsSummary,
  bookingsByWorld,
  nursingLevelDistribution,
  ageHistogram,
} from "@/lib/analytics";

describe("analytics aggregations", () => {
  it("walletUtilizationByLevel returns 3 buckets with valid percentages", () => {
    const data = walletUtilizationByLevel(clients);
    expect(data).toHaveLength(3);
    for (const d of data) {
      expect(d.value).toBeGreaterThanOrEqual(0);
      expect(d.value).toBeLessThanOrEqual(100);
      expect(d.color).toBeDefined();
    }
    expect(data.map((d) => d.name)).toEqual(["רמה 1", "רמה 2", "רמה 3"]);
  });

  it("personaDistribution sums to total client count", () => {
    const data = personaDistribution(clients);
    const total = data.reduce((s, d) => s + d.value, 0);
    expect(total).toBe(clients.length);
  });

  it("lonelinessDistribution sums to total client count", () => {
    const data = lonelinessDistribution(clients);
    const total = data.reduce((s, d) => s + d.value, 0);
    expect(total).toBe(clients.length);
    expect(data).toHaveLength(3);
  });

  it("nursingLevelDistribution sums to total client count", () => {
    const data = nursingLevelDistribution(clients);
    const total = data.reduce((s, d) => s + d.value, 0);
    expect(total).toBe(clients.length);
    expect(data).toHaveLength(3);
  });

  it("ageHistogram sums to total client count", () => {
    const data = ageHistogram(clients);
    const total = data.reduce((s, d) => s + d.value, 0);
    expect(total).toBe(clients.length);
  });

  it("riskFlagsSummary returns rows for known flags only", () => {
    const data = riskFlagsSummary(clients);
    for (const d of data) {
      expect(d.value).toBeGreaterThan(0);
    }
  });

  it("bookingsByWorld returns at least one world", () => {
    const data = bookingsByWorld();
    expect(data.length).toBeGreaterThan(0);
    for (const d of data) {
      expect(d.value).toBeGreaterThan(0);
    }
  });
});
