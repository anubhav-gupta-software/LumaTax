// Shared types for the LumaTax deterministic rule engine.
// Every number here is a plain dollar amount (no cents rounding assumed until final totals).

export type FilingStatus = "single" | "mfs";

export interface W2Income {
  kind: "w2";
  employerType: "on_campus" | "cpt" | "opt" | "other";
  state: string | null;
  wages: number;
  federalWithholding: number;
  stateWithholding: number;
  socialSecurityWithheld: number;
  medicareWithheld: number;
}

export interface Form1042SIncome {
  kind: "1042s";
  incomeCode: string; // Box 1
  grossIncome: number; // Box 2
  exemptionCode: string | null; // Box 3a
  federalTaxWithheld: number; // Box 7a
  recipientCountryCode?: string; // Box 13b
}

export interface ScholarshipIncome {
  kind: "scholarship";
  /** Tuition & required fees/books for a degree candidate - tax-free under IRC S117. */
  qualifiedTuitionPortion: number;
  /** Room/board/stipend/living-expense portion - taxable unless treaty-exempt. */
  nonQualifiedPortion: number;
  /** TA/RA-type stipend with a service requirement - always wages/ECI under S117(c), never excludable. */
  hasServiceRequirement: boolean;
}

export interface BankInterestIncome {
  kind: "bank_interest";
  amount: number;
}

export type IncomeItem = W2Income | Form1042SIncome | ScholarshipIncome | BankInterestIncome;

export interface UserProfile {
  taxYear: number;
  filingStatus: FilingStatus;
  countryOfTaxResidence: string;
  wasResidentImmediatelyBeforeUSArrival: boolean;
  visaType: "F-1" | "J-1-student" | "M-1" | "Q-1" | "J-1-non-student";
  /** First date ever present in the U.S. as an exempt F/J/M/Q individual. */
  firstEntryDate: string; // ISO date
  /** Distinct calendar years (before taxYear) already used as exempt student/teacher/trainee, if known from prior stays. Usually derived from firstEntryDate but can be overridden for re-entrants. */
  priorExemptYearsOverride?: number;
  statesWithIncome: string[];
  incomeItems: IncomeItem[];
  itemizedDeductions: {
    stateLocalTaxPaid: number;
    charitableGiftsCash: number;
    casualtyLossFederalDisaster: number;
  };
  isEnrolledAtLeastHalfTime: boolean;
  employerIsOwnSchool: boolean;
  isFullTimeEmployee40hrs: boolean;
}

export interface Flag {
  severity: "info" | "warning" | "route_to_human_review";
  code: string;
  message: string;
}

export interface ResidencyResult {
  status: "NRA" | "RA" | "UNCERTAIN";
  isExemptIndividualThisYear: boolean;
  exemptYearsUsedBeforeThisYear: number;
  disqualificationYear: number | null; // first calendar year the 5-year allowance is exceeded
  flags: Flag[];
}

export interface TreatyBenefitResult {
  applicable: boolean;
  exemptAmount: number;
  taxableAmount: number;
  article: string | null;
  cap: number | null;
  timeLimitYears: number | null;
  flags: Flag[];
}

export interface FicaResult {
  isExemptA: boolean; // S3121(b)(19) nonresident-alien based
  isExemptB: boolean | "needs_review"; // S3121(b)(10) enrolled-student based
  isExemptOverall: boolean;
  ficaWithheldInError: number;
  flags: Flag[];
}

export interface FederalTaxResult {
  totalECI: number;
  totalNEC: number;
  treatyExemptTotal: number;
  agi: number;
  deduction: number;
  deductionType: "itemized" | "india_standard" | "none";
  taxableIncome: number;
  graduatedTax: number;
  necTax: number;
  totalTax: number;
  totalFederalWithholding: number;
  refundOrOwe: number; // positive = refund, negative = owe
  flags: Flag[];
}

export interface StateTaxLine {
  state: string;
  filingLikelyRequired: boolean;
  treatyConformity: string;
  form: string | null;
  confidence: string;
  notes: string;
}

export interface FormsNeeded {
  form8843: boolean;
  form1040NR: boolean;
  scheduleOI: boolean;
  scheduleNEC: boolean;
  scheduleA: boolean;
  form8233Note: boolean;
  form843FicaRefund: boolean;
}

export interface EngineResult {
  residency: ResidencyResult;
  fica: FicaResult;
  federal: FederalTaxResult;
  states: StateTaxLine[];
  forms: FormsNeeded;
  allFlags: Flag[];
}
