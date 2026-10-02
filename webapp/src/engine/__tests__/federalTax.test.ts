import { describe, it, expect } from "vitest";
import { computeFederalTax } from "../federalTax";
import { determineResidency } from "../residency";
import { UserProfile, W2Income, Form1042SIncome } from "../types";
import { computeGraduatedTax } from "@/data/taxBrackets";

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

describe("computeGraduatedTax", () => {
  it("matches hand-computed 10% bracket for $8,000 taxable income (single, 2025)", () => {
    expect(computeGraduatedTax(8000, "single", 2025)).toBeCloseTo(800);
  });

  it("spans multiple brackets correctly for $60,000 taxable income (single, 2025)", () => {
    // 10% * 11925 + 12% * (48475-11925) + 22% * (60000-48475)
    const expected = 11925 * 0.1 + (48475 - 11925) * 0.12 + (60000 - 48475) * 0.22;
    expect(computeGraduatedTax(60000, "single", 2025)).toBeCloseTo(expected, 2);
  });
});

describe("computeFederalTax - end-to-end scenario (start.md worked example)", () => {
  it("China F-1 student: W-2 wages + treaty-exempt 1042-S compensation under the China cap", () => {
    const w2: W2Income = {
      kind: "w2", employerType: "on_campus", state: "MA", wages: 8000,
      federalWithholding: 600, stateWithholding: 200, socialSecurityWithheld: 0, medicareWithheld: 0,
    };
    const form1042s: Form1042SIncome = {
      kind: "1042s", incomeCode: "20", grossIncome: 5000, exemptionCode: "04", federalTaxWithheld: 0,
    };
    const profile = baseProfile({ incomeItems: [w2, form1042s] });
    const residency = determineResidency(profile);
    const result = computeFederalTax(profile, residency);

    expect(result.treatyExemptTotal).toBe(5000); // fully under China's $5,000 cap
    expect(result.totalECI).toBe(8000); // only the W-2 wages remain taxable
    expect(result.agi).toBe(8000);
    expect(result.taxableIncome).toBe(8000);
    expect(result.graduatedTax).toBeCloseTo(800);
    expect(result.totalFederalWithholding).toBe(600);
    expect(result.refundOrOwe).toBeCloseTo(-200); // owes ~$200
  });

  it("India F-1 student: standard deduction exception reduces taxable income to $0", () => {
    const w2: W2Income = {
      kind: "w2", employerType: "on_campus", state: "TX", wages: 10000,
      federalWithholding: 1000, stateWithholding: 0, socialSecurityWithheld: 0, medicareWithheld: 0,
    };
    const profile = baseProfile({ countryOfTaxResidence: "India", incomeItems: [w2] });
    const residency = determineResidency(profile);
    const result = computeFederalTax(profile, residency);

    expect(result.deductionType).toBe("india_standard");
    expect(result.deduction).toBe(15750);
    expect(result.taxableIncome).toBe(0);
    expect(result.graduatedTax).toBe(0);
    expect(result.refundOrOwe).toBeCloseTo(1000); // full withholding refunded
    expect(result.flags.some((f) => f.code === "INDIA_STANDARD_DEDUCTION_CLAIMED")).toBe(true);
  });

  it("bank interest is excluded entirely, not taxed", () => {
    const profile = baseProfile({ incomeItems: [{ kind: "bank_interest", amount: 50 }] });
    const residency = determineResidency(profile);
    const result = computeFederalTax(profile, residency);
    expect(result.totalECI).toBe(0);
    expect(result.totalNEC).toBe(0);
    expect(result.flags.some((f) => f.code === "BANK_INTEREST_EXEMPT")).toBe(true);
  });

  it("FDAP dividend income (1042-S code 06, not treaty-exempt) is taxed at flat 30% via Schedule NEC", () => {
    const form1042s: Form1042SIncome = {
      kind: "1042s", incomeCode: "06", grossIncome: 1000, exemptionCode: null, federalTaxWithheld: 300,
    };
    const profile = baseProfile({ incomeItems: [form1042s] });
    const residency = determineResidency(profile);
    const result = computeFederalTax(profile, residency);
    expect(result.totalNEC).toBe(1000);
    expect(result.necTax).toBeCloseTo(300);
  });

  it("scholarship with a service requirement (TA/RA) is fully ECI wages, never excludable under S117(c)", () => {
    const profile = baseProfile({
      incomeItems: [{ kind: "scholarship", qualifiedTuitionPortion: 20000, nonQualifiedPortion: 5000, hasServiceRequirement: true }],
    });
    const residency = determineResidency(profile);
    const result = computeFederalTax(profile, residency);
    expect(result.totalECI).toBe(25000);
    expect(result.flags.some((f) => f.code === "SERVICE_CONDITIONED_STIPEND")).toBe(true);
  });
});
