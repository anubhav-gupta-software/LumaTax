// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/05-federal-tax-calculation.md
// IRS Rev. Proc. 2024-40 (tax year 2025 figures). Must be re-verified annually - never
// hardcode a single year's numbers into business logic; always read through this table.

export type FilingStatus = "single" | "mfs";

export interface Bracket {
  rate: number;
  /** Taxable income over this amount (lower bound, inclusive) is taxed at `rate`. */
  over: number;
}

export interface YearRates {
  brackets: Record<FilingStatus, Bracket[]>;
  standardDeduction: { single: number; qss: number };
  saltCap: { regular: number; mfs: number };
  ctcPerChild: number;
  actcRefundablePerChild: number;
  additionalMedicareTaxThreshold: number;
  additionalMedicareTaxRate: number;
  ficaSocialSecurityRate: number;
  ficaMedicareRate: number;
  ficaWageBase: number;
}

export const TAX_YEARS: Record<number, YearRates> = {
  2025: {
    brackets: {
      single: [
        { rate: 0.10, over: 0 },
        { rate: 0.12, over: 11925 },
        { rate: 0.22, over: 48475 },
        { rate: 0.24, over: 103350 },
        { rate: 0.32, over: 197300 },
        { rate: 0.35, over: 250525 },
        { rate: 0.37, over: 626350 },
      ],
      mfs: [
        { rate: 0.10, over: 0 },
        { rate: 0.12, over: 11925 },
        { rate: 0.22, over: 48475 },
        { rate: 0.24, over: 103350 },
        { rate: 0.32, over: 197300 },
        { rate: 0.35, over: 250525 },
        { rate: 0.37, over: 375800 },
      ],
    },
    standardDeduction: { single: 15750, qss: 31500 },
    saltCap: { regular: 40000, mfs: 20000 },
    ctcPerChild: 2200,
    actcRefundablePerChild: 1700,
    additionalMedicareTaxThreshold: 200000,
    additionalMedicareTaxRate: 0.009,
    ficaSocialSecurityRate: 0.062,
    ficaMedicareRate: 0.0145,
    ficaWageBase: 176100,
  },
};

export function getYearRates(year: number): YearRates {
  const rates = TAX_YEARS[year];
  if (!rates) {
    throw new Error(`No tax rate table for year ${year}. Add it to src/data/taxBrackets.ts before supporting this year.`);
  }
  return rates;
}

export function computeGraduatedTax(taxableIncome: number, status: FilingStatus, year: number): number {
  const rates = getYearRates(year);
  const brackets = rates.brackets[status];
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const current = brackets[i];
    const next = brackets[i + 1];
    const upper = next ? next.over : Infinity;
    if (taxableIncome <= current.over) break;
    const amountInBracket = Math.min(taxableIncome, upper) - current.over;
    if (amountInBracket > 0) tax += amountInBracket * current.rate;
  }
  return Math.round(tax * 100) / 100;
}
