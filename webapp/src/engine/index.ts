import { determineResidency } from "./residency";
import { determineFica } from "./fica";
import { computeFederalTax } from "./federalTax";
import { determineStateObligations } from "./stateTax";
import { determineFormsNeeded } from "./forms";
import { EngineResult, Flag, UserProfile } from "./types";

export function runEngine(profile: UserProfile): EngineResult {
  const residency = determineResidency(profile);
  const fica = determineFica(profile, residency);
  const federal = computeFederalTax(profile, residency);
  const { lines: states, flags: stateFlags } = determineStateObligations(profile.statesWithIncome);
  const forms = determineFormsNeeded(profile, residency, federal, fica);

  const allFlags: Flag[] = [
    ...residency.flags,
    ...fica.flags,
    ...federal.flags,
    ...stateFlags,
  ];

  return { residency, fica, federal, states, forms, allFlags };
}

export * from "./types";
export { determineResidency } from "./residency";
export { getTreatyBenefit, NO_TREATY_COUNTRIES } from "./treaty";
export { determineFica } from "./fica";
export { computeFederalTax } from "./federalTax";
export { determineStateObligations } from "./stateTax";
