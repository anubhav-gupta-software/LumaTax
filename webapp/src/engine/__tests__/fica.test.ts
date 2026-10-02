import { describe, it, expect } from "vitest";
import { determineFica } from "../fica";
import { determineResidency } from "../residency";
import { UserProfile, W2Income } from "../types";

function baseProfile(overrides: Partial<UserProfile>): UserProfile {
  return {
    taxYear: 2025,
    filingStatus: "single",
    countryOfTaxResidence: "China",
    wasResidentImmediatelyBeforeUSArrival: true,
    visaType: "F-1",
    firstEntryDate: "2023-08-15",
    statesWithIncome: [],
    incomeItems: [],
    itemizedDeductions: { stateLocalTaxPaid: 0, charitableGiftsCash: 0, casualtyLossFederalDisaster: 0 },
    isEnrolledAtLeastHalfTime: true,
    employerIsOwnSchool: false,
    isFullTimeEmployee40hrs: false,
    ...overrides,
  };
}

const w2: W2Income = {
  kind: "w2",
  employerType: "on_campus",
  state: "MA",
  wages: 5000,
  federalWithholding: 300,
  stateWithholding: 100,
  socialSecurityWithheld: 310,
  medicareWithheld: 72.5,
};

describe("determineFica", () => {
  it("NRA F-1 student with on-campus wages is exempt under Exemption A, and flags erroneous FICA withholding", () => {
    const profile = baseProfile({ incomeItems: [w2] });
    const residency = determineResidency(profile);
    const result = determineFica(profile, residency);
    expect(result.isExemptA).toBe(true);
    expect(result.isExemptOverall).toBe(true);
    expect(result.ficaWithheldInError).toBeCloseTo(382.5);
    expect(result.flags.some((f) => f.code === "FICA_WITHHELD_IN_ERROR")).toBe(true);
  });

  it("Exemption B applies when employer is the student's own school and enrolled half-time", () => {
    const profile = baseProfile({ incomeItems: [], employerIsOwnSchool: true, isEnrolledAtLeastHalfTime: true });
    const residency = determineResidency(profile);
    const result = determineFica(profile, residency);
    expect(result.isExemptB).toBe(true);
  });

  it("full-time 40hr/week employee is never exempt under Exemption B, no review needed", () => {
    const profile = baseProfile({ employerIsOwnSchool: true, isFullTimeEmployee40hrs: true });
    const residency = determineResidency(profile);
    const result = determineFica(profile, residency);
    expect(result.isExemptB).toBe(false);
  });

  it("work for an 'other' (unauthorized) employer type is flagged for review", () => {
    const profile = baseProfile({ incomeItems: [{ ...w2, employerType: "other" }] });
    const residency = determineResidency(profile);
    const result = determineFica(profile, residency);
    expect(result.flags.some((f) => f.code === "UNAUTHORIZED_WORK_TYPE")).toBe(true);
  });
});
