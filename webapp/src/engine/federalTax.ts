// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/05-federal-tax-calculation.md,
// 09-scholarship-fellowship-treatment.md, 11-1042s-handling.md
import { INCOME_CODES, EXEMPTION_CODES } from "@/data/form1042s";
import { computeGraduatedTax, getYearRates } from "@/data/taxBrackets";
import { getTreatyBenefit } from "./treaty";
import { Flag, FederalTaxResult, ResidencyResult, UserProfile } from "./types";

const NEC_FLAT_RATE = 0.30;

export function computeFederalTax(profile: UserProfile, residency: ResidencyResult): FederalTaxResult {
  const flags: Flag[] = [];
  const isResidentAlien = residency.status === "RA";
  const year = profile.taxYear;
  const rates = getYearRates(year);

  let totalECI = 0;
  let totalNEC = 0;
  let treatyExemptTotal = 0;
  let totalFederalWithholding = 0;

  for (const item of profile.incomeItems) {
    if (item.kind === "w2") {
      totalECI += item.wages;
      totalFederalWithholding += item.federalWithholding;
    } else if (item.kind === "bank_interest") {
      // IRC S871(i): bank deposit interest is generally not taxable to an NRA at all.
      flags.push({
        severity: "info",
        code: "BANK_INTEREST_EXEMPT",
        message: `$${item.amount.toFixed(2)} of bank interest is excluded from tax under IRC S871(i) - not reported as taxable income.`,
      });
    } else if (item.kind === "scholarship") {
      if (item.hasServiceRequirement) {
        // S117(c): a TA/RA-type stipend is always wages/ECI, never excludable, regardless of use.
        totalECI += item.qualifiedTuitionPortion + item.nonQualifiedPortion;
        flags.push({
          severity: "info",
          code: "SERVICE_CONDITIONED_STIPEND",
          message: "Scholarship/stipend has a service requirement (e.g. TA/RA) - the full amount is ECI wages under IRC S117(c), not an excludable qualified scholarship.",
        });
      } else {
        // Qualified tuition portion is tax-free by statute; non-qualified portion is ECI
        // (IRC S871(c)) unless a treaty exempts it.
        const benefit = getTreatyBenefit(
          profile.countryOfTaxResidence,
          "scholarship",
          item.nonQualifiedPortion,
          profile.wasResidentImmediatelyBeforeUSArrival,
          isResidentAlien
        );
        flags.push(...benefit.flags);
        treatyExemptTotal += benefit.exemptAmount;
        totalECI += benefit.taxableAmount;
      }
    } else if (item.kind === "1042s") {
      const incomeInfo = INCOME_CODES[item.incomeCode];
      if (!incomeInfo) {
        flags.push({
          severity: "route_to_human_review",
          code: "UNRECOGNIZED_1042S_INCOME_CODE",
          message: `1042-S income code "${item.incomeCode}" is not in LumaTax's verified code table. Do not guess its classification - route to human review.`,
        });
        continue;
      }
      totalFederalWithholding += item.federalTaxWithheld;

      const exemptionInfo = item.exemptionCode ? EXEMPTION_CODES[item.exemptionCode] : null;
      if (exemptionInfo?.treatment === "not_us_source" || exemptionInfo?.treatment === "not_taxable") {
        continue; // excluded entirely
      }
      if (exemptionInfo?.treatment === "route_to_human_review") {
        flags.push({
          severity: "route_to_human_review",
          code: "RARE_1042S_EXEMPTION_CODE",
          message: `1042-S exemption code "${item.exemptionCode}" (${exemptionInfo.label}) is rare for student income - route to human review.`,
        });
        continue;
      }

      if (exemptionInfo?.treatment === "treaty_exempt") {
        const incomeType = incomeInfo.nature === "scholarship" ? "scholarship" : "compensation";
        const benefit = getTreatyBenefit(
          profile.countryOfTaxResidence,
          incomeType,
          item.grossIncome,
          profile.wasResidentImmediatelyBeforeUSArrival,
          isResidentAlien
        );
        flags.push(...benefit.flags);
        treatyExemptTotal += benefit.exemptAmount;
        if (incomeInfo.nature === "fdap") totalNEC += benefit.taxableAmount;
        else totalECI += benefit.taxableAmount;
        continue;
      }

      // Not treaty-exempt: route by income nature.
      if (incomeInfo.nature === "fdap") totalNEC += item.grossIncome;
      else totalECI += item.grossIncome; // scholarship (S871(c)) or compensation -> ECI
    }
  }

  const agi = totalECI; // no above-the-line adjustments modeled in this MVP

  // Deduction: India Art. 21(2) standard deduction exception, else itemized (Schedule A), else $0.
  const isIndiaStudent =
    profile.countryOfTaxResidence === "India" &&
    profile.wasResidentImmediatelyBeforeUSArrival &&
    profile.filingStatus === "single";

  let deduction = 0;
  let deductionType: FederalTaxResult["deductionType"] = "none";

  if (isIndiaStudent) {
    deduction = rates.standardDeduction.single;
    deductionType = "india_standard";
    flags.push({
      severity: "route_to_human_review",
      code: "INDIA_STANDARD_DEDUCTION_CLAIMED",
      message:
        "India Art. 21(2) standard deduction claimed. This requires confirming the student was an India tax resident immediately before U.S. arrival - a factual/legal determination the engine does not independently verify.",
    });
  } else {
    const saltCap = profile.filingStatus === "mfs" ? rates.saltCap.mfs : rates.saltCap.regular;
    const saltDeduction = Math.min(profile.itemizedDeductions.stateLocalTaxPaid, saltCap);
    deduction = saltDeduction + profile.itemizedDeductions.charitableGiftsCash + profile.itemizedDeductions.casualtyLossFederalDisaster;
    if (deduction > 0) deductionType = "itemized";
  }

  const taxableIncome = Math.max(0, agi - deduction);
  const graduatedTax = computeGraduatedTax(taxableIncome, profile.filingStatus, year);
  const necTax = Math.round(totalNEC * NEC_FLAT_RATE * 100) / 100;

  // Credits: EITC, education credits, elderly/disabled credit are always $0 for 1040-NR filers.
  // CTC/ODC/dependent-care are restricted to US nationals + Canada/Mexico (full) or South
  // Korea/India (limited) - not modeled in this MVP beyond the $0 default; flag if relevant.
  const restrictedCountries = ["Canada", "Mexico", "South Korea", "India"];
  if (restrictedCountries.includes(profile.countryOfTaxResidence)) {
    flags.push({
      severity: "info",
      code: "DEPENDENT_CREDITS_MAY_BE_AVAILABLE",
      message: `${profile.countryOfTaxResidence} residents may claim limited dependent-related credits (CTC/ODC/dependent care) under Pub. 519 ch. 5. This engine does not compute dependent credits in its MVP - route to a tax professional if claiming dependents.`,
    });
  }

  const totalTax = graduatedTax + necTax;
  const refundOrOwe = Math.round((totalFederalWithholding - totalTax) * 100) / 100;

  return {
    totalECI,
    totalNEC,
    treatyExemptTotal,
    agi,
    deduction,
    deductionType,
    taxableIncome,
    graduatedTax,
    necTax,
    totalTax,
    totalFederalWithholding,
    refundOrOwe,
    flags,
  };
}
