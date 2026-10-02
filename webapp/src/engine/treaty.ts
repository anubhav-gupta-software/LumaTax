// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/04-tax-treaties.md
import { TREATIES, NO_TREATY_COUNTRIES, TreatyArticle } from "@/data/treaties";
import { Flag, TreatyBenefitResult } from "./types";

export type TreatyIncomeType = "scholarship" | "compensation" | "remittance";

export function getTreatyBenefit(
  country: string,
  incomeType: TreatyIncomeType,
  amount: number,
  wasResidentImmediatelyBeforeUSArrival: boolean,
  isResidentAlien: boolean
): TreatyBenefitResult {
  const flags: Flag[] = [];
  const none = (): TreatyBenefitResult => ({
    applicable: false,
    exemptAmount: 0,
    taxableAmount: amount,
    article: null,
    cap: null,
    timeLimitYears: null,
    flags,
  });

  if (NO_TREATY_COUNTRIES.includes(country)) {
    return none();
  }

  const treaty = TREATIES[country];
  if (!treaty) {
    flags.push({
      severity: "route_to_human_review",
      code: "COUNTRY_NOT_IN_TREATY_TABLE",
      message: `"${country}" is not in LumaTax's verified treaty table. Do not assume no-treaty status - affirmatively check the current IRS Table 3 before filing.`,
    });
    return { ...none(), flags };
  }

  if (treaty.status === "terminated" || treaty.status === "suspended") {
    flags.push({
      severity: "warning",
      code: "TREATY_INACTIVE",
      message: `${country}: ${treaty.statusNote ?? "Treaty is terminated or suspended."}`,
    });
    return { ...none(), flags };
  }

  if (treaty.confidence !== "high") {
    flags.push({
      severity: "route_to_human_review",
      code: "TREATY_DATA_CONFIDENCE",
      message: `Treaty data for ${country} is ${treaty.confidence}-confidence (transcribed from IRS Table 2 by an automated pass). Re-verify article, cap, and time limit against the live treaty text before filing.`,
    });
  }

  if (isResidentAlien) {
    if (treaty.noSavingClauseException) {
      flags.push({
        severity: "route_to_human_review",
        code: "SAVING_CLAUSE_NO_EXCEPTION",
        message: `${country}'s treaty has NO saving-clause exception for students. All treaty benefits end the moment the student becomes a resident alien - confirm the exact SPT-crossing date.`,
      });
      return { ...none(), flags };
    }
    flags.push({
      severity: "route_to_human_review",
      code: "RESIDENT_ALIEN_TREATY_CLAIM",
      message:
        "Taxpayer is a resident alien claiming a treaty benefit via the saving-clause exception. This requires Form 1040 (not 1040-NR) mechanics - gross up on line 1, back out on Schedule 1 line 8z - and a W-9 statement to the payer. Route to human review.",
    });
  }

  let article: TreatyArticle | undefined;
  if (incomeType === "scholarship") article = treaty.scholarship;
  else if (incomeType === "compensation") article = treaty.compensation;
  else article = treaty.remittance;

  if (!article) {
    return { ...none(), flags };
  }

  if (article.payerCondition) {
    flags.push({
      severity: "route_to_human_review",
      code: "TREATY_PAYER_CONDITION",
      message: `${country} Art. ${article.article} requires: ${article.payerCondition}. Confirm the payer meets this condition before applying the exemption.`,
    });
  }

  const cap = article.cap ?? Infinity;
  const exemptAmount = Math.min(amount, cap);
  const taxableAmount = Math.max(0, amount - cap);

  if (article.retroactiveLoss) {
    flags.push({
      severity: "route_to_human_review",
      code: "CLIFF_EFFECT_TREATY",
      message: `${country} Art. ${article.article} has a retroactive "cliff effect": exceeding the ${article.timeLimitYears}-year limit voids the ENTIRE exemption retroactively, requiring amended prior-year returns. Track cumulative years/months used precisely and get human sign-off before this limit is approached.`,
    });
  }

  if (treaty.savingClauseExtendsToGreenCard) {
    flags.push({
      severity: "info",
      code: "GREEN_CARD_SAVING_CLAUSE_EXTENSION",
      message: `${country}'s saving-clause exception uniquely extends to green-card holders, not just SPT resident aliens, as long as the person remains a bona fide student/trainee.`,
    });
  }

  if (treaty.statusNote) {
    flags.push({ severity: "info", code: "TREATY_STATUS_NOTE", message: `${country}: ${treaty.statusNote}` });
  }

  return {
    applicable: exemptAmount > 0,
    exemptAmount,
    taxableAmount,
    article: article.article,
    cap: article.cap,
    timeLimitYears: article.timeLimitYears,
    flags,
  };
}

export { NO_TREATY_COUNTRIES };
