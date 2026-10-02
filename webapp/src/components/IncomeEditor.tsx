"use client";

import { DraftIncomeItem, newId } from "./formTypes";
import { INCOME_CODES, EXEMPTION_CODES } from "@/data/form1042s";

const inputClass =
  "w-full rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelClass = "block text-xs font-medium text-black/60 dark:text-white/60 mb-1";

export default function IncomeEditor({
  items,
  onChange,
}: {
  items: DraftIncomeItem[];
  onChange: (items: DraftIncomeItem[]) => void;
}) {
  function update(id: string, patch: Partial<DraftIncomeItem>) {
    onChange(items.map((i) => (i.id === id ? ({ ...i, ...patch } as DraftIncomeItem) : i)));
  }
  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }
  function add(kind: DraftIncomeItem["kind"]) {
    const id = newId();
    if (kind === "w2") {
      onChange([
        ...items,
        { id, kind: "w2", employerType: "on_campus", state: "", wages: "", federalWithholding: "", stateWithholding: "", socialSecurityWithheld: "", medicareWithheld: "" },
      ]);
    } else if (kind === "1042s") {
      onChange([...items, { id, kind: "1042s", incomeCode: "16", grossIncome: "", exemptionCode: "04", federalTaxWithheld: "" }]);
    } else if (kind === "scholarship") {
      onChange([...items, { id, kind: "scholarship", qualifiedTuitionPortion: "", nonQualifiedPortion: "", hasServiceRequirement: false }]);
    } else {
      onChange([...items, { id, kind: "bank_interest", amount: "" }]);
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4 relative">
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="absolute top-3 right-3 text-xs text-black/40 hover:text-red-500"
          >
            Remove
          </button>

          {item.kind === "w2" && (
            <div>
              <p className="text-sm font-semibold mb-3">W-2 wages</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Employer type</label>
                  <select
                    className={inputClass}
                    value={item.employerType}
                    onChange={(e) => update(item.id, { employerType: e.target.value as typeof item.employerType })}
                  >
                    <option value="on_campus">On-campus job</option>
                    <option value="cpt">CPT employer</option>
                    <option value="opt">OPT employer</option>
                    <option value="other">Other / not sure</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>State (2-letter)</label>
                  <input className={inputClass} value={item.state} onChange={(e) => update(item.id, { state: e.target.value.toUpperCase() })} placeholder="MA" maxLength={2} />
                </div>
                <div>
                  <label className={labelClass}>Box 1 - Wages ($)</label>
                  <input className={inputClass} value={item.wages} onChange={(e) => update(item.id, { wages: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Box 2 - Federal tax withheld ($)</label>
                  <input className={inputClass} value={item.federalWithholding} onChange={(e) => update(item.id, { federalWithholding: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Box 17 - State tax withheld ($)</label>
                  <input className={inputClass} value={item.stateWithholding} onChange={(e) => update(item.id, { stateWithholding: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Box 4 - Social Security withheld ($)</label>
                  <input className={inputClass} value={item.socialSecurityWithheld} onChange={(e) => update(item.id, { socialSecurityWithheld: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Box 6 - Medicare withheld ($)</label>
                  <input className={inputClass} value={item.medicareWithheld} onChange={(e) => update(item.id, { medicareWithheld: e.target.value })} placeholder="0" />
                </div>
              </div>
            </div>
          )}

          {item.kind === "1042s" && (
            <div>
              <p className="text-sm font-semibold mb-3">Form 1042-S</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Box 1 - Income code</label>
                  <select className={inputClass} value={item.incomeCode} onChange={(e) => update(item.id, { incomeCode: e.target.value })}>
                    {Object.values(INCOME_CODES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Box 3a - Exemption code</label>
                  <select className={inputClass} value={item.exemptionCode} onChange={(e) => update(item.id, { exemptionCode: e.target.value })}>
                    <option value="">(none)</option>
                    {Object.values(EXEMPTION_CODES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Box 2 - Gross income ($)</label>
                  <input className={inputClass} value={item.grossIncome} onChange={(e) => update(item.id, { grossIncome: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Box 7a - Federal tax withheld ($)</label>
                  <input className={inputClass} value={item.federalTaxWithheld} onChange={(e) => update(item.id, { federalTaxWithheld: e.target.value })} placeholder="0" />
                </div>
              </div>
            </div>
          )}

          {item.kind === "scholarship" && (
            <div>
              <p className="text-sm font-semibold mb-3">Scholarship / fellowship</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Qualified tuition & fees portion ($)</label>
                  <input className={inputClass} value={item.qualifiedTuitionPortion} onChange={(e) => update(item.id, { qualifiedTuitionPortion: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Room/board/stipend portion ($)</label>
                  <input className={inputClass} value={item.nonQualifiedPortion} onChange={(e) => update(item.id, { nonQualifiedPortion: e.target.value })} placeholder="0" />
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={item.hasServiceRequirement} onChange={(e) => update(item.id, { hasServiceRequirement: e.target.checked })} />
                This requires teaching/research service in exchange (TA/RA-type stipend)
              </label>
            </div>
          )}

          {item.kind === "bank_interest" && (
            <div>
              <p className="text-sm font-semibold mb-3">Bank interest</p>
              <div>
                <label className={labelClass}>Interest earned ($)</label>
                <input className={inputClass} value={item.amount} onChange={(e) => update(item.id, { amount: e.target.value })} placeholder="0" />
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="button" onClick={() => add("w2")} className="rounded-full border border-black/15 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
          + Add W-2
        </button>
        <button type="button" onClick={() => add("1042s")} className="rounded-full border border-black/15 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
          + Add Form 1042-S
        </button>
        <button type="button" onClick={() => add("scholarship")} className="rounded-full border border-black/15 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
          + Add scholarship/fellowship
        </button>
        <button type="button" onClick={() => add("bank_interest")} className="rounded-full border border-black/15 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
          + Add bank interest
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-black/40 dark:text-white/40">No documents added yet. Add at least one above.</p>}
    </div>
  );
}
