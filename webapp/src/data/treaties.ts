// Derived from /Users/anubhavgupta/Downloads/LumaTax/laws/04-tax-treaties.md
// IRS Tax Treaty Table 2 / Table 3, retrieved 2026-10-02. Re-verify before each filing season.

export type Confidence = "high" | "medium" | "low";

export interface TreatyArticle {
  article: string;
  /** Dollar cap per year. null = no limit. */
  cap: number | null;
  /** Time limit in years. null = no limit. */
  timeLimitYears: number | null;
  retroactiveLoss?: boolean;
  payerCondition?: string;
}

export interface CountryTreaty {
  country: string;
  status: "active" | "terminated" | "suspended";
  statusNote?: string;
  scholarship?: TreatyArticle;
  compensation?: TreatyArticle;
  teaching?: TreatyArticle;
  remittance?: TreatyArticle;
  /** Greece & Pakistan: no saving-clause exception -> benefits end entirely on becoming resident alien. */
  noSavingClauseException?: boolean;
  /** China & CIS: saving-clause exception extends even to green-card holders. */
  savingClauseExtendsToGreenCard?: boolean;
  notes?: string;
  confidence: Confidence;
}

export const TREATIES: Record<string, CountryTreaty> = {
  Australia: { country: "Australia", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: null }, confidence: "high" },
  Austria: { country: "Austria", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: 3 }, confidence: "high" },
  Bangladesh: { country: "Bangladesh", status: "active", scholarship: { article: "Art. 21(2)", cap: null, timeLimitYears: 2 }, compensation: { article: "Art. 21(2)", cap: 8000, timeLimitYears: 2 }, teaching: { article: "Art. 21(1)", cap: null, timeLimitYears: 2 }, confidence: "high" },
  Barbados: { country: "Barbados", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: null }, notes: "Students may elect resident taxation (Art. 18) but forfeit Student/Trainee exemption if so", confidence: "high" },
  Belgium: { country: "Belgium", status: "active", compensation: { article: "Art. 19(1)(b)", cap: 9000, timeLimitYears: 2 }, teaching: { article: "Art. 19(2)", cap: null, timeLimitYears: 2 }, remittance: { article: "Art. 19(1)(a)", cap: null, timeLimitYears: 2 }, confidence: "high" },
  Bulgaria: { country: "Bulgaria", status: "active", compensation: { article: "Art. 19(1)(b)", cap: 9000, timeLimitYears: 2 }, teaching: { article: "Art. 19(2)", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Canada: { country: "Canada", status: "active", remittance: { article: "Art. XX C", cap: null, timeLimitYears: null }, notes: "No dedicated compensation-during-study sub-article; wages commonly sheltered via general Dependent Personal Services Art. XV $10,000/yr de minimis threshold.", confidence: "high" },
  Chile: { country: "Chile", status: "active", compensation: { article: "Art. 20", cap: null, timeLimitYears: null }, notes: "Unusually, no dollar cap on student compensation at all", confidence: "medium" },
  China: { country: "China", status: "active", scholarship: { article: "Art. 20(b)", cap: null, timeLimitYears: null }, compensation: { article: "Art. 20(c)", cap: 5000, timeLimitYears: null }, teaching: { article: "Art. 19", cap: null, timeLimitYears: 3 }, savingClauseExtendsToGreenCard: true, notes: "Does not apply to Hong Kong, Macau, or Taiwan residents. No specific time limit on student article - unusually generous.", confidence: "high" },
  Cyprus: { country: "Cyprus", status: "active", scholarship: { article: "Art. 21(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 21(1)", cap: 2000, timeLimitYears: 5 }, notes: "Gaining-experience $7,500/1yr; US-govt-program $10,000/1yr", confidence: "medium" },
  "Czech Republic": { country: "Czech Republic", status: "active", scholarship: { article: "Art. 21(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 21(1)", cap: 5000, timeLimitYears: 5 }, teaching: { article: "Art. 21(5)", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Denmark: { country: "Denmark", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: 3 }, confidence: "high" },
  Egypt: { country: "Egypt", status: "active", scholarship: { article: "Art. 23(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 23(1)", cap: 3000, timeLimitYears: 5 }, teaching: { article: "Art. 22", cap: null, timeLimitYears: 2 }, confidence: "high" },
  Estonia: { country: "Estonia", status: "active", scholarship: { article: "Art. 20(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 20(1)/(2)", cap: 8000, timeLimitYears: 5 }, confidence: "medium" },
  Finland: { country: "Finland", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: null }, confidence: "high" },
  France: { country: "France", status: "active", scholarship: { article: "Art. 21(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 21(1)/(2)", cap: 8000, timeLimitYears: 5 }, teaching: { article: "Art. 20", cap: null, timeLimitYears: 2 }, notes: "Combined Student+Teacher benefit period capped at 5 years total.", confidence: "high" },
  Germany: { country: "Germany", status: "active", scholarship: { article: "Art. 20(3)", cap: null, timeLimitYears: null }, compensation: { article: "Art. 20(4)", cap: 9000, timeLimitYears: 4, retroactiveLoss: true }, teaching: { article: "Art. 20(1)", cap: null, timeLimitYears: 2 }, notes: "Compensation exemption retroactively voided in full if 4-year limit exceeded.", confidence: "high" },
  Greece: { country: "Greece", status: "active", remittance: { article: "Art. XIII", cap: null, timeLimitYears: null }, teaching: { article: "Art. XII", cap: null, timeLimitYears: 3 }, noSavingClauseException: true, notes: "Oldest treaty (1953). NO saving-clause exception - loses all benefits entirely on becoming resident alien.", confidence: "high" },
  Iceland: { country: "Iceland", status: "active", scholarship: { article: "Art. 19(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 19(1)", cap: 9000, timeLimitYears: 5 }, confidence: "medium" },
  India: { country: "India", status: "active", remittance: { article: "Art. 21(1)", cap: null, timeLimitYears: null }, teaching: { article: "Art. 22", cap: null, timeLimitYears: 2, retroactiveLoss: true }, notes: "Art. 21(2): unique US standard-deduction equivalent for students/apprentices resident in India immediately before US arrival. No dedicated compensation sub-cap. Teacher/Researcher article has retroactive cliff-effect if 2-yr limit exceeded.", confidence: "high" },
  Indonesia: { country: "Indonesia", status: "active", scholarship: { article: "Art. 19(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 19(1)", cap: 2000, timeLimitYears: 5 }, teaching: { article: "Art. 20", cap: null, timeLimitYears: 2 }, notes: "Gaining-experience $7,500/12mo", confidence: "high" },
  Ireland: { country: "Ireland", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: 1 }, confidence: "high" },
  Israel: { country: "Israel", status: "active", scholarship: { article: "Art. 24(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 24(1)", cap: 3000, timeLimitYears: 5 }, teaching: { article: "Art. 23", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Italy: { country: "Italy", status: "active", remittance: { article: "Art. 21", cap: null, timeLimitYears: null }, teaching: { article: "Art. 20", cap: null, timeLimitYears: 2 }, confidence: "high" },
  Jamaica: { country: "Jamaica", status: "active", scholarship: { article: "Art. 21(1)", cap: null, timeLimitYears: null }, compensation: { article: "Art. 21(2)", cap: 7500, timeLimitYears: 1 }, teaching: { article: "Art. 22", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Japan: { country: "Japan", status: "active", remittance: { article: "Art. 19", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. 20", cap: null, timeLimitYears: 2 }, notes: "Apprentice/business trainee cap only; full-time degree students typically uncapped in practice for remittances - confirm against treaty text.", confidence: "medium" },
  Kazakhstan: { country: "Kazakhstan", status: "active", scholarship: { article: "Art. 19", cap: null, timeLimitYears: 5 }, notes: "Training/research only", confidence: "medium" },
  "South Korea": { country: "South Korea", status: "active", scholarship: { article: "Art. 21(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 21(1)", cap: 2000, timeLimitYears: 5 }, teaching: { article: "Art. 20", cap: null, timeLimitYears: 2 }, notes: "General personal-services articles also capped $3,000/yr (unusually low). Limited dependents/CTC eligibility under Pub. 519 ch.5.", confidence: "high" },
  Latvia: { country: "Latvia", status: "active", scholarship: { article: "Art. 20(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 20(1)/(2)", cap: 8000, timeLimitYears: 5 }, confidence: "medium" },
  Lithuania: { country: "Lithuania", status: "active", scholarship: { article: "Art. 20(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 20(1)/(2)", cap: 8000, timeLimitYears: 5 }, confidence: "medium" },
  Luxembourg: { country: "Luxembourg", status: "active", remittance: { article: "Art. 21(1)", cap: null, timeLimitYears: 2 }, teaching: { article: "Art. 21(2)", cap: null, timeLimitYears: 2, retroactiveLoss: true }, confidence: "high" },
  Malta: { country: "Malta", status: "active", compensation: { article: "Art. 20(2)", cap: 9000, timeLimitYears: null }, remittance: { article: "Art. 20(1)", cap: null, timeLimitYears: 1 }, confidence: "medium" },
  Mexico: { country: "Mexico", status: "active", remittance: { article: "Art. 21", cap: null, timeLimitYears: null }, notes: "No dedicated compensation-during-study exemption in student article.", confidence: "high" },
  Morocco: { country: "Morocco", status: "active", scholarship: { article: "Art. 18", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 18", cap: 2000, timeLimitYears: 5 }, confidence: "medium" },
  Netherlands: { country: "Netherlands", status: "active", scholarship: { article: "Art. 22(2)", cap: null, timeLimitYears: 3 }, compensation: { article: "Art. 22(1)/(2)", cap: 2000, timeLimitYears: null }, teaching: { article: "Art. 21(1)", cap: null, timeLimitYears: 2, retroactiveLoss: true }, confidence: "high" },
  "New Zealand": { country: "New Zealand", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: null }, confidence: "high" },
  Norway: { country: "Norway", status: "active", scholarship: { article: "Art. 16(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 16(1)", cap: 2000, timeLimitYears: 5 }, teaching: { article: "Art. 15", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Pakistan: { country: "Pakistan", status: "active", scholarship: { article: "Art. XIII(1)", cap: null, timeLimitYears: null, payerCondition: "Pakistani nonprofit organization only" }, compensation: { article: "Art. XIII(1)", cap: 5000, timeLimitYears: null }, teaching: { article: "Art. XII", cap: null, timeLimitYears: 2 }, noSavingClauseException: true, notes: "Oldest treaty (1959). NO saving-clause exception - loses all benefits entirely on becoming resident alien.", confidence: "high" },
  Philippines: { country: "Philippines", status: "active", scholarship: { article: "Art. 22(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 22(1)", cap: 3000, timeLimitYears: 5 }, teaching: { article: "Art. 21", cap: null, timeLimitYears: 2 }, confidence: "high" },
  Poland: { country: "Poland", status: "active", scholarship: { article: "Art. 18(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 18(1)", cap: 2000, timeLimitYears: 5 }, teaching: { article: "Art. 17", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Portugal: { country: "Portugal", status: "active", scholarship: { article: "Art. 23(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 23(1)/(2)", cap: 8000, timeLimitYears: 5 }, teaching: { article: "Art. 22", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Romania: { country: "Romania", status: "active", scholarship: { article: "Art. 20(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 20(1)", cap: 2000, timeLimitYears: 5 }, teaching: { article: "Art. 19", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  "Slovak Republic": { country: "Slovak Republic", status: "active", scholarship: { article: "Art. 21(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 21(1)", cap: 5000, timeLimitYears: 5 }, teaching: { article: "Art. 21(5)", cap: null, timeLimitYears: 2 }, notes: "Teacher benefit once-in-a-lifetime clause.", confidence: "medium" },
  Slovenia: { country: "Slovenia", status: "active", scholarship: { article: "Art. 20(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 20(1)/(2)", cap: 8000, timeLimitYears: 5 }, teaching: { article: "Art. 20(3)", cap: null, timeLimitYears: 2 }, notes: "Combined 5-yr cap with teaching.", confidence: "medium" },
  "South Africa": { country: "South Africa", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: 1 }, confidence: "medium" },
  Spain: { country: "Spain", status: "active", scholarship: { article: "Art. 22(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 22(1)", cap: 5000, timeLimitYears: 5 }, confidence: "high" },
  "Sri Lanka": { country: "Sri Lanka", status: "active", remittance: { article: "Art. 21(1)", cap: null, timeLimitYears: null }, confidence: "medium" },
  Sweden: { country: "Sweden", status: "active", remittance: { article: "Art. 21", cap: null, timeLimitYears: null }, confidence: "high" },
  Switzerland: { country: "Switzerland", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: null }, confidence: "high" },
  Thailand: { country: "Thailand", status: "active", scholarship: { article: "Art. 22(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 22(1)", cap: 3000, timeLimitYears: 5 }, teaching: { article: "Art. 23", cap: null, timeLimitYears: 2 }, confidence: "high" },
  "Trinidad and Tobago": { country: "Trinidad and Tobago", status: "active", scholarship: { article: "Art. 19(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 19(1)", cap: 5000, timeLimitYears: 5 }, teaching: { article: "Art. 18", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Tunisia: { country: "Tunisia", status: "active", scholarship: { article: "Art. 20", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 20", cap: 4000, timeLimitYears: 5 }, confidence: "medium" },
  Turkey: { country: "Turkey", status: "active", remittance: { article: "Art. 20(1)", cap: null, timeLimitYears: null }, teaching: { article: "Art. 20(2)", cap: null, timeLimitYears: 2 }, confidence: "high" },
  Ukraine: { country: "Ukraine", status: "active", scholarship: { article: "Art. 20", cap: null, timeLimitYears: 5 }, notes: "Training/research", confidence: "medium" },
  "United Kingdom": { country: "United Kingdom", status: "active", remittance: { article: "Art. 20", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. 20A", cap: null, timeLimitYears: 2, retroactiveLoss: true }, confidence: "high" },
  Venezuela: { country: "Venezuela", status: "active", scholarship: { article: "Art. 21(1)", cap: null, timeLimitYears: 5 }, compensation: { article: "Art. 21(1)/(2)", cap: 8000, timeLimitYears: 5 }, teaching: { article: "Art. 21(3)", cap: null, timeLimitYears: 2 }, confidence: "medium" },

  // CIS / former USSR treaty bloc
  Armenia: { country: "Armenia", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },
  Azerbaijan: { country: "Azerbaijan", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },
  Belarus: { country: "Belarus", status: "active", statusNote: "Only Art. III(1)(g) suspended Dec 17 2024 - Dec 31 2026 (not the student article). Re-verify before relying.", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, confidence: "medium" },
  Georgia: { country: "Georgia", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },
  Kyrgyzstan: { country: "Kyrgyzstan", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },
  Moldova: { country: "Moldova", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },
  Tajikistan: { country: "Tajikistan", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },
  Turkmenistan: { country: "Turkmenistan", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },
  Uzbekistan: { country: "Uzbekistan", status: "active", scholarship: { article: "Art. VI(1)", cap: 10000, timeLimitYears: 5 }, compensation: { article: "Art. VI(1)", cap: null, timeLimitYears: 1 }, teaching: { article: "Art. VI(1)", cap: null, timeLimitYears: 2 }, notes: "CIS/ex-USSR treaty bloc.", confidence: "medium" },

  // Suspended / terminated - special handling
  Hungary: { country: "Hungary", status: "terminated", statusNote: "Treaty terminated effective Jan 1, 2024. Treat as no-treaty country for 2024+ income.", confidence: "high" },
  Russia: { country: "Russia", status: "suspended", statusNote: "Articles 5-21 and 23 suspended Aug 16, 2024. Treat as no usable treaty benefits for students from that date forward.", confidence: "high" },
};

/** Confirmed to have NO U.S. tax treaty at all (file 04 S2.3). */
export const NO_TREATY_COUNTRIES = [
  "Vietnam", "Nigeria", "Saudi Arabia", "Brazil", "Nepal", "Ghana", "Kenya", "Iran", "Taiwan",
  "Singapore", "Malaysia", "Hong Kong", "United Arab Emirates", "Qatar", "Kuwait", "Lebanon",
  "Jordan", "Colombia", "Peru", "Ecuador", "Argentina", "Ethiopia", "Uganda", "Tanzania",
  "Zimbabwe", "Cameroon", "Rwanda", "Angola", "Myanmar",
];

export function isCisBloc(country: string): boolean {
  return ["Armenia", "Azerbaijan", "Belarus", "Georgia", "Kyrgyzstan", "Moldova", "Tajikistan", "Turkmenistan", "Uzbekistan"].includes(country);
}
