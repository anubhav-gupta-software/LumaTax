"use client";

import { EngineResult } from "@/engine/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const severityStyle: Record<string, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200",
  route_to_human_review: "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200",
};

const severityLabel: Record<string, string> = {
  info: "Note",
  warning: "Warning",
  route_to_human_review: "Review with a tax professional",
};

export default function ResultsView({ result }: { result: EngineResult }) {
  const { residency, fica, federal, states, forms, allFlags } = result;
  const reviewFlags = allFlags.filter((f) => f.severity === "route_to_human_review");
  const otherFlags = allFlags.filter((f) => f.severity !== "route_to_human_review");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
        <p className="text-sm text-black/50 dark:text-white/50 mb-1">Your federal result</p>
        <div className="flex items-baseline gap-3">
          <span className={`text-3xl font-bold ${federal.refundOrOwe >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {fmt(Math.abs(federal.refundOrOwe))}
          </span>
          <span className="text-black/60 dark:text-white/60">{federal.refundOrOwe >= 0 ? "estimated federal refund" : "estimated amount owed"}</span>
        </div>
        <p className="mt-3 text-sm">
          Tax status:{" "}
          <span className="font-medium">
            {residency.status === "NRA" ? "Nonresident alien" : residency.status === "RA" ? "Resident alien" : "Uncertain — needs review"}
          </span>
        </p>
      </div>

      {reviewFlags.length > 0 && (
        <div className="rounded-2xl border-2 border-red-300 dark:border-red-900/60 p-6">
          <h3 className="font-semibold text-red-700 dark:text-red-300 mb-3">
            {reviewFlags.length} item{reviewFlags.length > 1 ? "s" : ""} flagged for human tax-professional review
          </h3>
          <p className="text-sm text-black/60 dark:text-white/60 mb-4">
            LumaTax never guesses on these — a licensed preparer should confirm them before filing.
          </p>
          <ul className="space-y-3">
            {reviewFlags.map((f, i) => (
              <li key={i} className={`rounded-lg border p-3 text-sm ${severityStyle[f.severity]}`}>
                <span className="font-medium">{severityLabel[f.severity]}:</span> {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
        <h3 className="font-semibold mb-4">Forms you likely need</h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {forms.form8843 && <li>✓ Form 8843 (Statement for Exempt Individuals)</li>}
          {forms.form1040NR && <li>✓ Form 1040-NR</li>}
          {forms.scheduleOI && <li>✓ Schedule OI</li>}
          {forms.scheduleNEC && <li>✓ Schedule NEC</li>}
          {forms.scheduleA && <li>✓ Schedule A (itemized deductions)</li>}
          {forms.form8233Note && <li>✓ Treaty disclosure (Line 1k + Schedule OI Item L)</li>}
          {forms.form843FicaRefund && <li>✓ Form 843 + Form 8316 (FICA refund claim)</li>}
        </ul>
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
        <h3 className="font-semibold mb-4">Federal computation</h3>
        <dl className="text-sm divide-y divide-black/5 dark:divide-white/10">
          {[
            ["Effectively connected income (ECI)", fmt(federal.totalECI)],
            ["Treaty-exempt income excluded", fmt(federal.treatyExemptTotal)],
            ["Non-effectively-connected income (NEC)", fmt(federal.totalNEC)],
            ["Adjusted gross income", fmt(federal.agi)],
            [`Deduction (${federal.deductionType === "india_standard" ? "India standard deduction" : federal.deductionType === "itemized" ? "itemized, Schedule A" : "none"})`, fmt(federal.deduction)],
            ["Taxable income", fmt(federal.taxableIncome)],
            ["Graduated tax", fmt(federal.graduatedTax)],
            ["Schedule NEC tax (flat 30%)", fmt(federal.necTax)],
            ["Total tax", fmt(federal.totalTax)],
            ["Total federal withholding", fmt(federal.totalFederalWithholding)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2">
              <span className="text-black/60 dark:text-white/60">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
        <h3 className="font-semibold mb-4">FICA (Social Security / Medicare)</h3>
        <p className="text-sm">
          {fica.isExemptOverall ? "You are exempt from FICA tax." : "You do not appear to be FICA-exempt."}
        </p>
        {fica.ficaWithheldInError > 0 && (
          <p className="text-sm mt-2 text-amber-700 dark:text-amber-300">
            {fmt(fica.ficaWithheldInError)} was withheld in error — see the review flags above for the refund process.
          </p>
        )}
      </div>

      {states.length > 0 && (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
          <h3 className="font-semibold mb-4">State filing</h3>
          <div className="space-y-3 text-sm">
            {states.map((s) => (
              <div key={s.state} className="border-b border-black/5 dark:border-white/10 pb-3 last:border-0">
                <p className="font-medium">
                  {s.state} {s.filingLikelyRequired ? "— filing likely required" : "— no filing required"}
                </p>
                {s.form && <p className="text-black/60 dark:text-white/60">Form: {s.form}</p>}
                <p className="text-black/50 dark:text-white/50 text-xs mt-1">{s.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherFlags.length > 0 && (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
          <h3 className="font-semibold mb-4">Additional notes</h3>
          <ul className="space-y-3">
            {otherFlags.map((f, i) => (
              <li key={i} className={`rounded-lg border p-3 text-sm ${severityStyle[f.severity]}`}>
                {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
