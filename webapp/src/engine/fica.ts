// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/12-fica-tax-exemption.md
import { Flag, FicaResult, ResidencyResult, UserProfile, W2Income } from "./types";

export function determineFica(profile: UserProfile, residency: ResidencyResult): FicaResult {
  const flags: Flag[] = [];

  // Exemption A - IRC S3121(b)(19): nonresident alien + authorized work tied to visa purpose.
  const w2Items = profile.incomeItems.filter((i): i is W2Income => i.kind === "w2");
  const hasOnlyAuthorizedWork = w2Items.every((w2) => w2.employerType !== "other");
  const isExemptA =
    residency.status === "NRA" &&
    ["F-1", "J-1-student", "M-1", "Q-1"].includes(profile.visaType) &&
    hasOnlyAuthorizedWork;

  if (!hasOnlyAuthorizedWork) {
    flags.push({
      severity: "route_to_human_review",
      code: "UNAUTHORIZED_WORK_TYPE",
      message:
        "One or more W-2 employers was marked as neither on-campus, CPT, nor OPT. Work not authorized by or tied to visa purpose can break both FICA exemption A and SPT 'substantial compliance' - route to review (immigration-status implications, not just tax).",
    });
  }

  // Exemption B - IRC S3121(b)(10): enrolled-student safe harbor, independent of visa/residency.
  let isExemptB: boolean | "needs_review" = false;
  if (profile.isFullTimeEmployee40hrs) {
    isExemptB = false; // hard bright-line per Rev. Proc. 2005-11 S9 - no review needed
  } else if (profile.employerIsOwnSchool && profile.isEnrolledAtLeastHalfTime) {
    isExemptB = true;
  } else if (profile.employerIsOwnSchool && !profile.isEnrolledAtLeastHalfTime) {
    isExemptB = "needs_review";
    flags.push({
      severity: "route_to_human_review",
      code: "FICA_EXEMPTION_B_FACTS_AND_CIRCUMSTANCES",
      message:
        "Employer is the student's own school but enrollment is below half-time. The Rev. Proc. 2005-11 safe harbor is not met; Exemption B may still apply under a facts-and-circumstances test, which this engine cannot resolve automatically.",
    });
  }

  const isExemptOverall = isExemptA || isExemptB === true;

  const ficaWithheldInError = isExemptOverall
    ? w2Items.reduce((sum, w2) => sum + w2.socialSecurityWithheld + w2.medicareWithheld, 0)
    : 0;

  if (ficaWithheldInError > 0) {
    flags.push({
      severity: "warning",
      code: "FICA_WITHHELD_IN_ERROR",
      message: `$${ficaWithheldInError.toFixed(2)} in Social Security/Medicare tax appears to have been withheld in error. Step 1: request a refund directly from the employer. Step 2: if refused, file Form 843 + Form 8316 with the IRS, attaching visa/I-94/I-20/EAD proof and the employer's refusal letter.`,
    });
  }

  if (residency.status === "UNCERTAIN") {
    flags.push({
      severity: "route_to_human_review",
      code: "FICA_DEPENDS_ON_UNCERTAIN_RESIDENCY",
      message: "FICA Exemption A depends on nonresident-alien status, which could not be determined automatically for this tax year (see residency flags).",
    });
  }

  return { isExemptA, isExemptB, isExemptOverall, ficaWithheldInError, flags };
}
