// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/11-1042s-handling.md
// Verified against the IRS Form 1042-S (2026) "Explanation of Codes" pages directly.

export type IncomeNature = "scholarship" | "compensation" | "fdap";

export interface IncomeCodeInfo {
  code: string;
  label: string;
  nature: IncomeNature;
}

/** Box 1 - Income code lookup. Do NOT guess codes not in this table; route to human review. */
export const INCOME_CODES: Record<string, IncomeCodeInfo> = {
  "01": { code: "01", label: "Interest paid by U.S. obligors - general", nature: "fdap" },
  "06": { code: "06", label: "Dividends paid by U.S. corporations - general", nature: "fdap" },
  "09": { code: "09", label: "Capital gains", nature: "fdap" },
  "14": { code: "14", label: "Real property income and natural resources royalties", nature: "fdap" },
  "15": { code: "15", label: "Pensions, annuities, alimony, and/or insurance premiums", nature: "fdap" },
  "16": { code: "16", label: "Scholarship or fellowship grants", nature: "scholarship" },
  "17": { code: "17", label: "Compensation for independent personal services", nature: "compensation" },
  "18": { code: "18", label: "Compensation for dependent personal services", nature: "compensation" },
  "19": { code: "19", label: "Compensation for teaching", nature: "compensation" },
  "20": { code: "20", label: "Compensation during studying and training", nature: "compensation" },
  "23": { code: "23", label: "Other income", nature: "fdap" },
  "28": { code: "28", label: "Gambling winnings", nature: "fdap" },
  "29": { code: "29", label: "Deposit interest", nature: "fdap" },
};

export interface ExemptionCodeInfo {
  code: string;
  label: string;
  /** How the engine should treat income carrying this exemption code. */
  treatment: "taxable_eci" | "not_taxable" | "not_us_source" | "treaty_exempt" | "route_to_human_review";
}

/** Box 3a - Chapter 3 exemption codes. */
export const EXEMPTION_CODES: Record<string, ExemptionCodeInfo> = {
  "01": { code: "01", label: "Effectively connected income", treatment: "taxable_eci" },
  "02": { code: "02", label: "Exempt/reduced withholding under IRC (catch-all)", treatment: "not_taxable" },
  "03": { code: "03", label: "Income is not from U.S. sources", treatment: "not_us_source" },
  "04": { code: "04", label: "Exempt or reduced withholding under tax treaty", treatment: "treaty_exempt" },
  "05": { code: "05", label: "Portfolio interest exempt under IRC", treatment: "not_taxable" },
  "23": { code: "23", label: "Exempt under §897(l) (QFPF real property gains)", treatment: "route_to_human_review" },
  "24": { code: "24", label: "Exempt under §892 (foreign government income)", treatment: "route_to_human_review" },
};
