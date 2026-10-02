// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/08-state-tax-rules.md
import { STATES } from "@/data/states";
import { Flag, StateTaxLine } from "./types";

export function determineStateObligations(statesWithIncome: string[]): { lines: StateTaxLine[]; flags: Flag[] } {
  const flags: Flag[] = [];
  const lines: StateTaxLine[] = [];

  for (const code of statesWithIncome) {
    const rule = STATES[code];
    if (!rule) {
      flags.push({
        severity: "route_to_human_review",
        code: "STATE_NOT_RESEARCHED",
        message: `${code} is not one of the 10 states LumaTax has researched (CA, NY, TX, MA, IL, PA, OH, MI, IN, FL). Default to a conservative add-back assumption and get dedicated legal/tax research before filing in this state.`,
      });
      lines.push({
        state: code,
        filingLikelyRequired: true,
        treatyConformity: "unknown",
        form: null,
        confidence: "n/a",
        notes: "Not yet researched - route to human review before filing.",
      });
      continue;
    }

    if (!rule.hasIncomeTax) {
      lines.push({
        state: rule.name,
        filingLikelyRequired: false,
        treatyConformity: "n/a",
        form: null,
        confidence: rule.confidence,
        notes: rule.notes,
      });
      continue;
    }

    if (rule.confidence === "low") {
      flags.push({
        severity: "route_to_human_review",
        code: "LOW_CONFIDENCE_STATE_RULE",
        message: `${rule.name}'s treaty-conformity conclusion is low-confidence (inferred, not an explicit DOR statement). Confirm with the state DOR or a tax professional before filing.`,
      });
    } else if (rule.treatyConformity === "add_back") {
      flags.push({
        severity: "warning",
        code: "STATE_TREATY_ADD_BACK",
        message: `${rule.name} does not honor the federal tax treaty exemption - treaty-exempt income must be added back to the state income base.`,
      });
    }

    lines.push({
      state: rule.name,
      filingLikelyRequired: true,
      treatyConformity: rule.treatyConformity,
      form: rule.form,
      confidence: rule.confidence,
      notes: rule.notes,
    });
  }

  return { lines, flags };
}
