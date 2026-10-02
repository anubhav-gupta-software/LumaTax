// Draft form shapes used by the wizard before numbers are parsed into the engine's UserProfile.
export type DraftW2 = {
  id: string;
  kind: "w2";
  employerType: "on_campus" | "cpt" | "opt" | "other";
  state: string;
  wages: string;
  federalWithholding: string;
  stateWithholding: string;
  socialSecurityWithheld: string;
  medicareWithheld: string;
};

export type Draft1042S = {
  id: string;
  kind: "1042s";
  incomeCode: string;
  grossIncome: string;
  exemptionCode: string;
  federalTaxWithheld: string;
};

export type DraftScholarship = {
  id: string;
  kind: "scholarship";
  qualifiedTuitionPortion: string;
  nonQualifiedPortion: string;
  hasServiceRequirement: boolean;
};

export type DraftBankInterest = {
  id: string;
  kind: "bank_interest";
  amount: string;
};

export type DraftIncomeItem = DraftW2 | Draft1042S | DraftScholarship | DraftBankInterest;

export interface WizardFormState {
  taxYear: string;
  filingStatus: "single" | "mfs";
  countryOfTaxResidence: string;
  wasResidentImmediatelyBeforeUSArrival: boolean;
  visaType: "F-1" | "J-1-student" | "M-1" | "Q-1" | "J-1-non-student";
  firstEntryDate: string;
  statesWithIncome: string[];
  incomeItems: DraftIncomeItem[];
  itemizedDeductions: {
    stateLocalTaxPaid: string;
    charitableGiftsCash: string;
    casualtyLossFederalDisaster: string;
  };
  isEnrolledAtLeastHalfTime: boolean;
  employerIsOwnSchool: boolean;
  isFullTimeEmployee40hrs: boolean;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function initialFormState(): WizardFormState {
  return {
    taxYear: "2025",
    filingStatus: "single",
    countryOfTaxResidence: "",
    wasResidentImmediatelyBeforeUSArrival: true,
    visaType: "F-1",
    firstEntryDate: "",
    statesWithIncome: [],
    incomeItems: [],
    itemizedDeductions: { stateLocalTaxPaid: "", charitableGiftsCash: "", casualtyLossFederalDisaster: "" },
    isEnrolledAtLeastHalfTime: true,
    employerIsOwnSchool: false,
    isFullTimeEmployee40hrs: false,
  };
}

function num(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function toEngineProfile(form: WizardFormState) {
  return {
    taxYear: num(form.taxYear) || 2025,
    filingStatus: form.filingStatus,
    countryOfTaxResidence: form.countryOfTaxResidence,
    wasResidentImmediatelyBeforeUSArrival: form.wasResidentImmediatelyBeforeUSArrival,
    visaType: form.visaType,
    firstEntryDate: form.firstEntryDate,
    statesWithIncome: form.statesWithIncome,
    incomeItems: form.incomeItems.map((item) => {
      if (item.kind === "w2") {
        return {
          kind: "w2" as const,
          employerType: item.employerType,
          state: item.state || null,
          wages: num(item.wages),
          federalWithholding: num(item.federalWithholding),
          stateWithholding: num(item.stateWithholding),
          socialSecurityWithheld: num(item.socialSecurityWithheld),
          medicareWithheld: num(item.medicareWithheld),
        };
      }
      if (item.kind === "1042s") {
        return {
          kind: "1042s" as const,
          incomeCode: item.incomeCode,
          grossIncome: num(item.grossIncome),
          exemptionCode: item.exemptionCode || null,
          federalTaxWithheld: num(item.federalTaxWithheld),
        };
      }
      if (item.kind === "scholarship") {
        return {
          kind: "scholarship" as const,
          qualifiedTuitionPortion: num(item.qualifiedTuitionPortion),
          nonQualifiedPortion: num(item.nonQualifiedPortion),
          hasServiceRequirement: item.hasServiceRequirement,
        };
      }
      return { kind: "bank_interest" as const, amount: num(item.amount) };
    }),
    itemizedDeductions: {
      stateLocalTaxPaid: num(form.itemizedDeductions.stateLocalTaxPaid),
      charitableGiftsCash: num(form.itemizedDeductions.charitableGiftsCash),
      casualtyLossFederalDisaster: num(form.itemizedDeductions.casualtyLossFederalDisaster),
    },
    isEnrolledAtLeastHalfTime: form.isEnrolledAtLeastHalfTime,
    employerIsOwnSchool: form.employerIsOwnSchool,
    isFullTimeEmployee40hrs: form.isFullTimeEmployee40hrs,
  };
}
