// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/08-state-tax-rules.md
// Every row needs human/legal review before production use - see `confidence`.

export interface StateRule {
  code: string;
  name: string;
  hasIncomeTax: boolean;
  /** Does the state honor federal NRA treaty exemptions, or require add-back? */
  treatyConformity: "conforms" | "add_back" | "likely_conforms" | "unknown";
  form: string | null;
  confidence: "high" | "medium" | "low" | "n/a";
  notes: string;
}

export const STATES: Record<string, StateRule> = {
  CA: { code: "CA", name: "California", hasIncomeTax: true, treatyConformity: "add_back", form: "Form 540NR + Schedule CA (540NR)", confidence: "high", notes: "FTB Publication 1001: California does not conform to federal tax treaties. Add back 100% of federal-treaty-exempt income." },
  NY: { code: "NY", name: "New York", hasIncomeTax: true, treatyConformity: "conforms", form: "Form IT-203", confidence: "medium", notes: "Starts from federal AGI (flow-through), but NY says to verify treaty provisions 'provision-by-provision'." },
  TX: { code: "TX", name: "Texas", hasIncomeTax: false, treatyConformity: "conforms", form: null, confidence: "high", notes: "No state income tax exists at all." },
  MA: { code: "MA", name: "Massachusetts", hasIncomeTax: true, treatyConformity: "conforms", form: "Form 1-NR/PY", confidence: "high", notes: "830 CMR 62.5A.1 + DOR Directive 87-4 explicitly recognize federal treaty exemptions (gross-up-then-deduct on Schedule Y)." },
  IL: { code: "IL", name: "Illinois", hasIncomeTax: true, treatyConformity: "likely_conforms", form: "Form IL-1040 + Schedule NR", confidence: "medium", notes: "Starts from federal AGI; inferred conformity, not an explicit DOR statement." },
  PA: { code: "PA", name: "Pennsylvania", hasIncomeTax: true, treatyConformity: "add_back", form: "Form PA-40", confidence: "high", notes: "PA Personal Income Tax Guide: treaties have no effect on PA tax law. Filing threshold is only $33." },
  OH: { code: "OH", name: "Ohio", hasIncomeTax: true, treatyConformity: "likely_conforms", form: "Form IT 1040", confidence: "low", notes: "Inferred from federal-AGI flow-through mechanics; no explicit Ohio DOR statement located." },
  MI: { code: "MI", name: "Michigan", hasIncomeTax: true, treatyConformity: "likely_conforms", form: "Form MI-1040 + Schedule NR", confidence: "medium", notes: "Schedule NR instructions reference federal 1040-NR line 11 flow-through directly." },
  IN: { code: "IN", name: "Indiana", hasIncomeTax: true, treatyConformity: "likely_conforms", form: "Form IT-40PNR", confidence: "low", notes: "Weakest-sourced conclusion; explicit Indiana DOR confirmation needed before relying on this." },
  FL: { code: "FL", name: "Florida", hasIncomeTax: false, treatyConformity: "conforms", form: null, confidence: "high", notes: "No state income tax exists at all." },
};

/** Other states with no individual income tax at all (file 08 S4). */
export const NO_INCOME_TAX_STATES = ["AK", "FL", "NV", "SD", "TN", "TX", "WA", "WY"];
