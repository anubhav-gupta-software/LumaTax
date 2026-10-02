import { describe, it, expect } from "vitest";
import { getTreatyBenefit } from "../treaty";

describe("getTreatyBenefit", () => {
  it("China compensation under the $5,000 cap is fully exempt, no time limit", () => {
    const result = getTreatyBenefit("China", "compensation", 4000, true, false);
    expect(result.applicable).toBe(true);
    expect(result.exemptAmount).toBe(4000);
    expect(result.taxableAmount).toBe(0);
    expect(result.article).toBe("Art. 20(c)");
    expect(result.timeLimitYears).toBeNull();
  });

  it("China compensation above the $5,000 cap: excess is taxable", () => {
    const result = getTreatyBenefit("China", "compensation", 7000, true, false);
    expect(result.exemptAmount).toBe(5000);
    expect(result.taxableAmount).toBe(2000);
  });

  it("no-treaty country (Vietnam) gets zero exemption", () => {
    const result = getTreatyBenefit("Vietnam", "compensation", 3000, true, false);
    expect(result.applicable).toBe(false);
    expect(result.taxableAmount).toBe(3000);
  });

  it("country not in the verified table routes to human review rather than guessing", () => {
    const result = getTreatyBenefit("Not A Real Country", "compensation", 1000, true, false);
    expect(result.flags.some((f) => f.code === "COUNTRY_NOT_IN_TREATY_TABLE")).toBe(true);
    expect(result.applicable).toBe(false);
  });

  it("Greece: resident alien loses all benefits - no saving-clause exception", () => {
    const result = getTreatyBenefit("Greece", "remittance", 1000, true, true);
    expect(result.applicable).toBe(false);
    expect(result.flags.some((f) => f.code === "SAVING_CLAUSE_NO_EXCEPTION")).toBe(true);
  });

  it("Pakistan scholarship requires a Pakistani-nonprofit payer - flags the condition", () => {
    const result = getTreatyBenefit("Pakistan", "scholarship", 1000, true, false);
    expect(result.flags.some((f) => f.code === "TREATY_PAYER_CONDITION")).toBe(true);
  });

  it("Germany compensation: cliff-effect flag present due to retroactive loss clause", () => {
    const result = getTreatyBenefit("Germany", "compensation", 3000, true, false);
    expect(result.flags.some((f) => f.code === "CLIFF_EFFECT_TREATY")).toBe(true);
    expect(result.timeLimitYears).toBe(4);
  });

  it("terminated treaty (Hungary) gives zero exemption", () => {
    const result = getTreatyBenefit("Hungary", "compensation", 1000, true, false);
    expect(result.applicable).toBe(false);
    expect(result.flags.some((f) => f.code === "TREATY_INACTIVE")).toBe(true);
  });

  it("India has no dedicated compensation article - not applicable for wages", () => {
    const result = getTreatyBenefit("India", "compensation", 1000, true, false);
    expect(result.applicable).toBe(false);
  });

  it("India remittance from abroad is uncapped and unlimited", () => {
    const result = getTreatyBenefit("India", "remittance", 10000, true, false);
    expect(result.applicable).toBe(true);
    expect(result.exemptAmount).toBe(10000);
  });
});
