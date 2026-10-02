import { FederalTaxResult, FicaResult, FormsNeeded, ResidencyResult, UserProfile } from "./types";

export function determineFormsNeeded(
  profile: UserProfile,
  residency: ResidencyResult,
  federal: FederalTaxResult,
  fica: FicaResult
): FormsNeeded {
  const hasAnyIncome = profile.incomeItems.length > 0;
  const form1040NR = hasAnyIncome || federal.totalTax > 0;
  return {
    form8843: residency.isExemptIndividualThisYear,
    form1040NR,
    scheduleOI: form1040NR,
    scheduleNEC: federal.totalNEC > 0,
    scheduleA: federal.deductionType === "itemized",
    form8233Note: federal.treatyExemptTotal > 0,
    form843FicaRefund: fica.ficaWithheldInError > 0,
  };
}
