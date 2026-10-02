"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { WizardFormState, initialFormState, toEngineProfile } from "./formTypes";
import { COUNTRIES } from "@/data/countries";
import { STATES } from "@/data/states";
import { runEngine } from "@/engine";
import { EngineResult } from "@/engine/types";
import IncomeEditor from "./IncomeEditor";
import ResultsView from "./ResultsView";

const STEP_TITLES = ["Basics", "States", "Documents", "Deductions", "Results"];

const inputClass =
  "w-full rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelClass = "block text-sm font-medium mb-1.5";
const helpClass = "text-xs text-black/50 dark:text-white/50 mt-1";

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardFormState>(initialFormState());
  const [result, setResult] = useState<EngineResult | null>(null);

  const isIndiaEligible = form.countryOfTaxResidence === "India" && form.wasResidentImmediatelyBeforeUSArrival;

  function next() {
    if (step === STEP_TITLES.length - 2) {
      const engineResult = runEngine(toEngineProfile(form) as Parameters<typeof runEngine>[0]);
      setResult(engineResult);
    }
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const canProceedFromBasics = useMemo(
    () => form.countryOfTaxResidence !== "" && form.firstEntryDate !== "",
    [form.countryOfTaxResidence, form.firstEntryDate]
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-sm font-semibold">
          LumaTax
        </Link>
        <span className="text-xs text-black/50 dark:text-white/50">
          Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 mb-10">
        <div
          className="h-1.5 rounded-full bg-indigo-600 transition-all"
          style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
        />
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <h1 className="text-2xl font-bold mb-2">The basics</h1>
          <div>
            <label className={labelClass}>Country of tax residence / citizenship</label>
            <select
              className={inputClass}
              value={form.countryOfTaxResidence}
              onChange={(e) => setForm({ ...form, countryOfTaxResidence: e.target.value })}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.wasResidentImmediatelyBeforeUSArrival}
              onChange={(e) => setForm({ ...form, wasResidentImmediatelyBeforeUSArrival: e.target.checked })}
            />
            I was a tax resident of that country immediately before arriving in the U.S.
          </label>
          <div>
            <label className={labelClass}>Visa type</label>
            <select className={inputClass} value={form.visaType} onChange={(e) => setForm({ ...form, visaType: e.target.value as WizardFormState["visaType"] })}>
              <option value="F-1">F-1 student</option>
              <option value="J-1-student">J-1 student</option>
              <option value="M-1">M-1 student</option>
              <option value="Q-1">Q-1 exchange visitor</option>
              <option value="J-1-non-student">J-1 scholar / researcher / teacher (not a student)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date you first entered the U.S. on this status</label>
            <input type="date" className={inputClass} value={form.firstEntryDate} onChange={(e) => setForm({ ...form, firstEntryDate: e.target.value })} />
            <p className={helpClass}>Used to compute your 5-year Substantial Presence Test exemption window.</p>
          </div>
          <div>
            <label className={labelClass}>Tax year</label>
            <input className={inputClass} value={form.taxYear} onChange={(e) => setForm({ ...form, taxYear: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Filing status</label>
            <select className={inputClass} value={form.filingStatus} onChange={(e) => setForm({ ...form, filingStatus: e.target.value as WizardFormState["filingStatus"] })}>
              <option value="single">Single</option>
              <option value="mfs">Married filing separately</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-black/10 dark:border-white/10">
            <p className="text-sm font-medium pt-3">FICA / enrollment details</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isEnrolledAtLeastHalfTime} onChange={(e) => setForm({ ...form, isEnrolledAtLeastHalfTime: e.target.checked })} />
              I am enrolled at least half-time
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.employerIsOwnSchool} onChange={(e) => setForm({ ...form, employerIsOwnSchool: e.target.checked })} />
              My employer is my own school/university
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFullTimeEmployee40hrs} onChange={(e) => setForm({ ...form, isFullTimeEmployee40hrs: e.target.checked })} />
              I normally work 40+ hours/week
            </label>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <h1 className="text-2xl font-bold mb-2">Where did you live or work?</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Select every state where you lived or earned income this year. LumaTax has researched these 10 states in depth.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(STATES).map((s) => (
              <label key={s.code} className="flex items-center gap-2 text-sm rounded-lg border border-black/10 dark:border-white/10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={form.statesWithIncome.includes(s.code)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      statesWithIncome: e.target.checked
                        ? [...form.statesWithIncome, s.code]
                        : form.statesWithIncome.filter((c) => c !== s.code),
                    })
                  }
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h1 className="text-2xl font-bold mb-2">Your documents</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Enter the numbers from your W-2s, 1042-S forms, scholarship letters, and any bank interest statements.
          </p>
          <IncomeEditor items={form.incomeItems} onChange={(incomeItems) => setForm({ ...form, incomeItems })} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h1 className="text-2xl font-bold mb-2">Deductions</h1>
          {isIndiaEligible ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/30 p-4 text-sm">
              As an Indian student/apprentice resident in India immediately before arrival, you qualify for the
              U.S.–India treaty Article 21(2) standard deduction instead of itemizing. LumaTax will apply this
              automatically — the fields below are not needed.
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-black/60 dark:text-white/60">
                Nonresident aliens can only itemize (no standard deduction). Enter what applies — leave blank if none.
              </p>
              <div>
                <label className={labelClass}>State/local income tax paid or withheld ($)</label>
                <input
                  className={inputClass}
                  value={form.itemizedDeductions.stateLocalTaxPaid}
                  onChange={(e) => setForm({ ...form, itemizedDeductions: { ...form.itemizedDeductions, stateLocalTaxPaid: e.target.value } })}
                />
              </div>
              <div>
                <label className={labelClass}>Cash gifts to U.S. charities ($)</label>
                <input
                  className={inputClass}
                  value={form.itemizedDeductions.charitableGiftsCash}
                  onChange={(e) => setForm({ ...form, itemizedDeductions: { ...form.itemizedDeductions, charitableGiftsCash: e.target.value } })}
                />
              </div>
              <div>
                <label className={labelClass}>Casualty/theft loss from a federally declared disaster ($)</label>
                <input
                  className={inputClass}
                  value={form.itemizedDeductions.casualtyLossFederalDisaster}
                  onChange={(e) => setForm({ ...form, itemizedDeductions: { ...form.itemizedDeductions, casualtyLossFederalDisaster: e.target.value } })}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && result && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Your results</h1>
          <ResultsView result={result} />
        </div>
      )}

      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full px-5 py-2.5 text-sm font-medium border border-black/15 dark:border-white/15 disabled:opacity-30"
        >
          Back
        </button>
        {step < STEP_TITLES.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={step === 0 && !canProceedFromBasics}
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            {step === STEP_TITLES.length - 2 ? "See my results" : "Continue"}
          </button>
        ) : (
          <Link href="/" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
            Done
          </Link>
        )}
      </div>
    </div>
  );
}
