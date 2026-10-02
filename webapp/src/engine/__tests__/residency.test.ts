import { describe, it, expect } from "vitest";
import { determineResidency } from "../residency";
import { UserProfile } from "../types";

function baseProfile(overrides: Partial<UserProfile>): UserProfile {
  return {
    taxYear: 2025,
    filingStatus: "single",
    countryOfTaxResidence: "India",
    wasResidentImmediatelyBeforeUSArrival: true,
    visaType: "F-1",
    firstEntryDate: "2021-12-29",
    statesWithIncome: [],
    incomeItems: [],
    itemizedDeductions: { stateLocalTaxPaid: 0, charitableGiftsCash: 0, casualtyLossFederalDisaster: 0 },
    isEnrolledAtLeastHalfTime: true,
    employerIsOwnSchool: false,
    isFullTimeEmployee40hrs: false,
    ...overrides,
  };
}

describe("determineResidency - 5-year exempt-individual boundary (file 02 S2.2)", () => {
  it("entering Dec 29, 2021: the 6th calendar year of presence (2026) is STILL exempt (prior years = 5, not > 5)", () => {
    const result = determineResidency(baseProfile({ firstEntryDate: "2021-12-29", taxYear: 2026 }));
    expect(result.exemptYearsUsedBeforeThisYear).toBe(5);
    expect(result.isExemptIndividualThisYear).toBe(true);
    expect(result.status).toBe("NRA");
  });

  it("entering Dec 29, 2021: the 7th calendar year of presence (2027) IS disqualified (prior years = 6 > 5)", () => {
    const result = determineResidency(baseProfile({ firstEntryDate: "2021-12-29", taxYear: 2027 }));
    expect(result.exemptYearsUsedBeforeThisYear).toBe(6);
    expect(result.isExemptIndividualThisYear).toBe(false);
    expect(result.status).toBe("UNCERTAIN");
    expect(result.flags.some((f) => f.code === "FIVE_YEAR_EXEMPTION_EXHAUSTED")).toBe(true);
  });

  it("first year of presence (same calendar year as entry) is exempt with 0 prior years used", () => {
    const result = determineResidency(baseProfile({ firstEntryDate: "2023-08-15", taxYear: 2023 }));
    expect(result.exemptYearsUsedBeforeThisYear).toBe(0);
    expect(result.isExemptIndividualThisYear).toBe(true);
  });

  it("flags J-1 non-student visas as needing the separate 2-of-6 rule, not the student 5-year rule", () => {
    const result = determineResidency(baseProfile({ visaType: "J-1-non-student", taxYear: 2023, firstEntryDate: "2023-01-01" }));
    expect(result.flags.some((f) => f.code === "J1_NON_STUDENT_TWO_OF_SIX_RULE")).toBe(true);
  });
});
