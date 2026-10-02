// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/01-tax-residency-and-substantial-presence.md
// and /Users/anubhavgupta/Downloads/LumaTax/laws/02-f1-exempt-individual-status.md
//
// MVP SIMPLIFICATION (explicitly flagged to the user): this module assumes continuous
// presence in the U.S. since `firstEntryDate` with no multi-year gaps/re-entries. A
// student with a gap year, or who held F/J/M/Q status in an earlier, disconnected stay,
// must have `priorExemptYearsOverride` set and the result is routed to human review.

import { Flag, ResidencyResult, UserProfile } from "./types";

/**
 * Counts distinct calendar years in [startYear, endYearInclusive] during which the
 * individual was present for at least one day - i.e. every year in the (inclusive)
 * range counts as a full exempt year, per the "even one day counts as a full year" rule.
 */
function countCalendarYearsTouched(startYear: number, endYearInclusive: number): number {
  if (endYearInclusive < startYear) return 0;
  return endYearInclusive - startYear + 1;
}

export function determineResidency(profile: UserProfile): ResidencyResult {
  const flags: Flag[] = [];
  const firstEntryYear = new Date(profile.firstEntryDate).getUTCFullYear();
  const { taxYear } = profile;

  const exemptYearsUsedBeforeThisYear =
    profile.priorExemptYearsOverride ?? countCalendarYearsTouched(firstEntryYear, taxYear - 1);

  if (profile.priorExemptYearsOverride !== undefined) {
    flags.push({
      severity: "route_to_human_review",
      code: "PRIOR_EXEMPT_YEARS_OVERRIDE",
      message:
        "Prior exempt years were manually overridden (e.g. a prior, disconnected F/J/M/Q stay). Verify the pooled student/teacher/trainee history before relying on this count.",
    });
  }

  // Statutory trigger: disqualified once PRIOR exempt years EXCEED 5, i.e. the 7th
  // calendar year of presence as an exempt student (not the 6th). See file 02 S2.2.
  const disqualificationYear = firstEntryYear + 6; // 7th calendar year (0-indexed +6)
  const isWithinFiveYearAllowance = exemptYearsUsedBeforeThisYear <= 5;

  if (!isWithinFiveYearAllowance) {
    flags.push({
      severity: "route_to_human_review",
      code: "FIVE_YEAR_EXEMPTION_EXHAUSTED",
      message: `The student exempt-individual 5-year lifetime allowance has been exhausted as of ${taxYear} (${exemptYearsUsedBeforeThisYear} prior exempt years counted). Continued exempt status now requires the facts-and-circumstances "no intent to permanently reside" override (Form 8843 Part III) or the student is likely a resident alien subject to the full Substantial Presence Test. This determination cannot be made automatically - route to a tax professional.`,
    });
  }

  if (profile.visaType === "J-1-non-student") {
    flags.push({
      severity: "route_to_human_review",
      code: "J1_NON_STUDENT_TWO_OF_SIX_RULE",
      message:
        "J-1 non-student (teacher/trainee) status uses a rolling 2-of-6-calendar-year lookback, not the student 5-year lifetime rule, and pools history with any prior student years. This engine does not yet compute that test - route to human review.",
    });
  }

  // MVP: if within the 5-year allowance, treat as exempt individual -> NRA.
  // If exhausted, we cannot safely auto-determine SPT without full day-by-day travel
  // history, so we flag UNCERTAIN rather than guessing RA vs NRA.
  const isExemptIndividualThisYear = isWithinFiveYearAllowance;
  const status: ResidencyResult["status"] = isExemptIndividualThisYear ? "NRA" : "UNCERTAIN";

  if (status === "UNCERTAIN") {
    flags.push({
      severity: "warning",
      code: "RESIDENCY_STATUS_UNCERTAIN",
      message:
        "Residency status could not be determined automatically once the 5-year exemption is exhausted. A tax professional must review day-counts under the Substantial Presence Test and the facts-and-circumstances override.",
    });
  }

  return {
    status,
    isExemptIndividualThisYear,
    exemptYearsUsedBeforeThisYear,
    disqualificationYear: isWithinFiveYearAllowance ? null : disqualificationYear,
    flags,
  };
}
