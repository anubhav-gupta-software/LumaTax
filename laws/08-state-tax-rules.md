# 08 — State Tax Rules for Nonresident Alien (NRA) F-1 Students

**Scope:** This file documents state personal-income-tax treatment of F-1 students who are nonresident aliens (NRAs) for federal purposes and who typically file Form 1040-NR + Form 8843 federally. It covers the 11 highest-international-student-population states: California, New York, Texas, Massachusetts, Illinois, Pennsylvania, Ohio, Michigan, Indiana, Florida, plus a general decision framework for every other state.

**CRITICAL FRAMING — read before using this file as a logic spec:** State conformity to federal nonresident-alien treaty exemptions is **not uniform**, is **not well-documented** in primary-source state guidance (several states have no explicit published position; practitioners infer the rule from whether the state return starts from federal AGI/taxable income and whether a specific addition-modification line exists), and **changes with legislation**. Every state rule below is flagged with a confidence level. **No state's rule in this file should be shipped into the deterministic engine without a named human/legal review sign-off**, and the engine should re-verify annually (state DOR instruction booklets are typically finalized for a tax year between November and February).

---

## 1. The Core Conformity Question

Federal tax treaties exempt certain NRA income (e.g., China Article 20(c) $5,000 wage exemption, India Article 21(2) training income, many countries' student/scholarship articles) from inclusion in **federal gross income** entirely — the exempt amount never enters federal AGI (it is excluded on Schedule OI of Form 1040-NR, not merely deducted). This matters for states because:

- **States that compute state taxable income starting from federal AGI, with no specific state addition-modification for treaty income** → the treaty-exempt amount is **never in the base** to begin with, so it flows through untaxed **by default**, with no further action needed. This looks like "conformity" but is really just an artifact of starting from federal AGI that already excludes the income.
- **States that explicitly require federal-treaty-exempt income to be added back** (most notably California, and historically several others) → the engine must re-add the treaty-exempt dollar amount into the state income base via a specific addition line.
- **States with their own residency/sourcing rules independent of federal NRA status** → a taxpayer who is an NRA federally may still be taxed as if present under ordinary state nonresident/part-year-resident sourcing rules; "NRA" is a federal tax concept with no automatic state-law equivalent.

This is the single most consequential, most-missed rule in this domain — treat every "does this state conform" answer below as requiring periodic re-verification, not a permanent fact.

---

## 2. State-by-State Detail

### 2.1 California

- **(a) Residency test:** California has its own statutory residency/domicile test (Rev. & Tax Code §17014 et seq., FTB Pub. 1031 "Guidelines for Determining Resident Status") — fully independent of federal NRA/resident-alien status. An F-1 student physically present and domiciled in California for the tax year is generally a California resident or part-year resident for **state** purposes even while being an NRA federally; most F-1 students with only CA-source income file as nonresidents of CA if domiciled abroad, but this must be checked against FTB Pub. 1031 facts-and-circumstances, not assumed from federal NRA status.
- **(b) Treaty conformity: NO — add-back required.** "California does not conform to federal law relating to income protected by U.S. tax treaties. California income is taxable and subject to withholding" (FTB Publication 1001, "Supplemental Guidelines to California Adjustments"). Treaty-exempt income is excluded only if "the treaty specifically excludes the income for state income tax" (vanishingly rare — most U.S. tax treaties are silent on state taxation, which is reserved to the states under the U.S. Constitution). **Engine rule: for CA, add back 100% of federal-treaty-exempt income into the Schedule CA (540NR) income base unless the specific treaty article is confirmed to reference state tax exemption.**
- **(c) Form:** Form 540NR (California Nonresident or Part-Year Resident Income Tax Return) with Schedule CA (540NR).
- **(d) Standard deduction/exemption for NRAs:** California's standard deduction and personal exemption credit are determined under California's own rules on Form 540NR and are **not** tied to the federal NRA standard-deduction bar — i.e., unlike the federal return (which denies the standard deduction to NRAs, with the narrow India-treaty exception), California's own standard deduction/exemption credit computation on 540NR is generally available regardless of federal NRA status. This must be verified against the current-year 540NR booklet each season, as FTB could tie the figure to federal itemized/standard choice.
- **(e) Filing threshold:** Gross-income/AGI thresholds scale with filing status, age, and dependents. For 2025, single filer under 65 with 0 dependents: **$22,941 gross income / $18,353 AGI** (whichever test is lower triggers the filing requirement) — verify current-year table in the 540NR booklet before shipping, as these figures are inflation-adjusted annually.
- **(f) Reciprocity:** California has **no reciprocity agreements** with any other state.
- **(g) E-file:** CalFile and commercial e-file support Form 540NR for ordinary nonresidents, but a return tied to a federal Form 1040-NR generally **cannot** be e-filed through consumer software (see File 14) because the federal return itself is rarely e-filed by consumer products; CA returns prepared via Sprintax are typically paper-filed (Sprintax does not e-file any state return — see File 14, §4(c)).

### 2.2 New York

- **(a) Residency test:** New York's own statutory residency test (domicile + 183-day "statutory residency" rule, Tax Law §605) is independent of federal NRA status; most F-1 students are NY nonresidents or part-year residents.
- **(b) Treaty conformity: Generally YES, via federal-AGI flow-through — but provision-specific exceptions exist and must be checked.** Form IT-203 starts from the federal amount column (federal AGI, which already excludes treaty-exempt income for an NRA), so New York does not generally require a separate add-back of treaty-exempt income already excluded at the federal level. However, NY guidance cautions that treaty benefits "do not automatically apply at the state level" and should be verified "provision-by-provision," so this is a **medium-confidence** rule, not an absolute one — flag any treaty article NY has specifically addressed in an Advisory Opinion for human review.
- **(c) Form:** Form IT-203 (Nonresident and Part-Year Resident Income Tax Return).
- **(d) Standard deduction/exemption for NRAs:** NY allows its own standard deduction on IT-203 by filing status, independent of federal NRA treatment. 2025 nonresident standard deduction: Single (dependent-eligible) $3,100; Single (not dependent-eligible) $8,000; MFJ $16,050; MFS $8,000; HOH $11,200; Qualifying surviving spouse $16,050.
- **(e) Filing threshold:** Required to file if NY AGI (federal-amount column, Form IT-203 line 31) exceeds the NY standard deduction for the filer's status (i.e., the thresholds in (d) above double as the filing threshold in practice), or if NY tax was withheld and a refund is sought.
- **(f) Reciprocity:** New York has **no reciprocity agreements** with neighboring states (NY, NJ, and CT all tax nonresident wages and require nonresident filings/credits rather than reciprocity).
- **(g) E-file:** IT-203 can be e-filed through NY-supported commercial software for ordinary nonresidents; however, a return tied to a federal 1040-NR filed on paper generally cannot be e-filed as a linked state return (most states require the federal return to have been e-filed/accepted first in a "fed/state" pipeline) — expect paper filing in the common case.

### 2.3 Texas (no state income tax)

- **(a)-(g):** Texas levies **no individual income tax** (Texas Constitution Art. VIII, §24, requiring voter approval to ever create one, which has never been given). There is **no state income tax return of any kind** for an F-1 student with Texas-source wages/income. **No NRA-specific form, no treaty conformity question, no filing threshold, no state standard deduction, and no state e-file question exists.** Students with only Texas-source income have zero state income-tax filing obligation (federal Form 8843 / 1040-NR obligations are unaffected).
- **Caution for the engine:** a student may still have **TX franchise tax** exposure if self-employed through a TX entity (rare/immigration-sensitive for F-1, flag to human review per File 05 §8 QBI note) and should still be screened for **other-state** source income (e.g., remote work for an out-of-state employer, or a summer internship in another state) that would trigger that other state's rules independently of TX's own no-tax status.

### 2.4 Florida (no state income tax)

- **(a)-(g):** Florida levies **no individual income tax** (Florida Constitution Art. VII, §5, prohibits a state income tax on individuals). Identical conclusion to Texas: no state return, no NRA-specific form, no threshold, no e-file question. Same caution re: other-state-source income applies.

### 2.5 Massachusetts

- **(a) Residency test:** Massachusetts has its own domicile/183-day statutory-resident test (830 CMR 62.5A.1) independent of federal NRA status; most F-1 students file as MA nonresidents.
- **(b) Treaty conformity: YES — Massachusetts explicitly recognizes federal treaty exemptions.** "Massachusetts source income received by a non-resident from another country is exempt from Massachusetts taxation" where "the income is excluded from federal gross income under an income tax treaty or convention that the United States is a party to" (830 CMR 62.5A.1; Mass. DOR Directive 87-4, "Non-Residents From Other Countries — Effect of Tax Treaty"). **This is a high-confidence, well-documented conformity state** — no add-back required for genuine treaty-exempt income. Mechanically, the treaty-exempt amount is included on the MA return as income first and then backed out as a Schedule Y deduction, rather than being omitted outright — the engine must implement this gross-up-then-subtract mechanic, not a simple omission, to match MA's reporting convention.
- **(c) Form:** Form 1-NR/PY (Massachusetts Nonresident or Part-Year Resident Income Tax Return).
- **(d) Standard deduction/exemption:** Massachusetts does not use a federal-style "standard deduction" concept; it uses its own personal exemption amounts (prorated for nonresidents by the ratio of MA income to total income) plus specific statutory deductions (Schedule Y) — not tied to federal NRA deduction bars.
- **(e) Filing threshold:** Nonresident must file Form 1-NR/PY if MA-source gross income exceeds the **lesser of $8,000 or** the prorated personal-exemption threshold (ratio of MA income to total income × exemption amount).
- **(f) Reciprocity:** Massachusetts has **no reciprocity agreements** with other states.
- **(g) E-file:** MassTaxConnect and commercial software support e-filing Form 1-NR/PY for ordinary nonresidents; a return linked to a paper-filed federal 1040-NR will typically need to be paper-filed as well.

### 2.6 Illinois

- **(a) Residency test:** Illinois uses its own domicile-based residency definition but for part-year/nonresident computation purposes largely keys off the federal return; F-1 students are generally IL nonresidents.
- **(b) Treaty conformity: YES, via federal-AGI flow-through — medium-high confidence.** IL-1040 starts from federal AGI, and because treaty-exempt income is already excluded from federal AGI, "your treaty benefit generally carries through to your Illinois return without any additional add-back" — e.g., a China Article 20(c) wage exemption or an India Article 21(2) item is respected with no IL-specific addition line for this purpose. No explicit IL DOR publication was located stating this as an affirmative policy (as MA's Directive 87-4 does) — **flag as inferred-from-mechanics, not an explicit DOR statement, and verify no addition-modification code on Schedule M/Schedule NR captures treaty income before shipping.**
- **(c) Form:** Form IL-1040 with Schedule NR (Nonresident and Part-Year Resident Computation of Illinois Tax).
- **(d) Standard deduction/exemption:** Illinois uses a flat per-person **exemption allowance** ($2,850 for 2025) rather than a standard deduction; available to nonresidents, prorated via Schedule NR, and not tied to federal NRA deduction-bar rules. The IL exemption allowance phases out entirely above $250,000 federal AGI (single) / $500,000 (MFJ) — immaterial for the large majority of F-1 students but should be modeled for high-income edge cases (e.g., a student with a trust distribution).
- **(e) Filing threshold:** Must file if IL base income from Illinois sources (Schedule NR Step 5, line 46) exceeds the IL exemption allowance (Schedule NR Step 5, line 50), or to claim a refund of IL withholding.
- **(f) Reciprocity:** Illinois has reciprocal agreements with Iowa, Kentucky, Michigan, and Wisconsin for **wage income of residents of those states working in Illinois** — this reciprocity framework is built for state **residents** crossing borders and generally does **not** apply to an NRA F-1 student (who is not a "resident" of any reciprocal-agreement state in the sense the agreements contemplate); flag any claimed reciprocity use by an F-1 student for human review rather than auto-applying it.
- **(g) E-file:** IL supports e-file for Schedule NR nonresident returns generally; a federal-1040-NR-linked return will typically follow the paper-filing pattern described in File 14.

### 2.7 Pennsylvania

- **(a) Residency test:** Pennsylvania has its own residency/domicile test independent of federal NRA status; PA taxes nonresidents only on PA-source income (compensation, business income, certain gains, rents/royalties, dividends, interest, gambling winnings, and estate/trust income — the "eight classes of income").
- **(b) Treaty conformity: NO — Pennsylvania does not recognize federal tax treaty exemptions as a general matter.** "A tax treaty between the U.S. Government and a foreign country has no effect on Pennsylvania tax law" (PA Personal Income Tax Guide). The one narrow exception found: income otherwise included in federal wages is still subject to PA treatment "unless treaty specifically says state tax exempt" — i.e., the default is taxable/add-back, with exemption only if the specific treaty article affirmatively addresses state-level taxation (rare). **Engine rule: for PA, treat federal-treaty-exempt compensation as PA-taxable by default (add back), same posture as California.**
- **(c) Form:** Form PA-40 (Pennsylvania Personal Income Tax Return) — Pennsylvania does not have a separate "NR" form number; nonresident status is indicated on the standard PA-40.
- **(d) Standard deduction/exemption:** Pennsylvania has **no standard deduction and no personal exemption** at all (for residents or nonresidents) — PA taxes gross compensation/income at a flat rate with very limited enumerated deductions; this is simpler than most states but means there is no NRA-favorable deduction gap to model.
- **(e) Filing threshold:** Must file if total PA gross taxable income exceeds **$33** — an unusually low, flat statutory threshold that applies identically to residents, nonresidents, and part-year residents (PA Personal Income Tax Guide, "Brief Overview and Filing Requirements"). In practice this means nearly any F-1 student with any PA-source compensation must file.
- **(f) Reciprocity:** Pennsylvania has reciprocal agreements with Indiana, Maryland, New Jersey, Ohio, Virginia, and West Virginia for **compensation of residents of those states** — again a residents'-reciprocity framework not generally applicable to an NRA F-1 student; flag for human review rather than auto-apply.
- **(g) E-file:** PA supports e-file (myPATH / padirectfile and commercial software) for ordinary PA-40 nonresident filings; a federal-1040-NR-linked return will typically need to be paper-filed per the general pattern in File 14.

### 2.8 Ohio

- **(a) Residency test:** Ohio uses a statutory domicile/bright-line-presence test (Ohio Rev. Code §5747.24) independent of federal NRA status; most F-1 students are Ohio nonresidents.
- **(b) Treaty conformity: LOW CONFIDENCE — likely conforms via federal-AGI flow-through, but no explicit Ohio DOR statement was located.** Ohio's IT 1040 starts from federal AGI and applies the state's own Schedule of Adjustments (additions/deductions); no specific addition-modification line for "federal-treaty-exempt income" was identified in the researched 2025 instructions, which suggests (by the same mechanical logic as Illinois) that treaty-exempt income — already excluded from federal AGI — flows through untaxed by default. **This is an inference, not a confirmed rule — flag explicitly for legal/DOR-helpline verification before relying on it in production**, since Ohio's Schedule of Adjustments additions list was not fully verifiable from the documents reviewed.
- **(c) Form:** Form IT 1040 (Ohio Individual Income Tax Return) — Ohio does not have a numbered "NR" form; nonresident status is established via the Ohio Nonresident Statement (formerly separate Form IT NRS, folded into IT 10/IT 1040 starting tax year 2025) plus IT 1040 itself. Full-year nonresidents of Indiana, Kentucky, Michigan, Pennsylvania, or West Virginia whose **only** Ohio-source income is wages are specifically excused from filing at all (these are reciprocal border states for Ohio — see (f)).
- **(d) Standard deduction/exemption:** Ohio uses a personal-exemption-amount mechanism (not a federal-style standard deduction) on IT 1040, generally available regardless of federal NRA deduction-bar status; amount and phase-outs must be pulled from the current-year booklet.
- **(e) Filing threshold:** No filing required if Ohio AGI (IT 1040 line 3) is $0 or less, or if the personal exemption amount (line 4) equals or exceeds Ohio AGI.
- **(f) Reciprocity:** Ohio has reciprocity agreements with Indiana, Kentucky, Michigan, Pennsylvania, and West Virginia covering **wage income of residents of those states**; as with IL/PA above, this is a residents'-reciprocity framework, not automatically applicable to an F-1 NRA — flag for human review.
- **(g) E-file:** Ohio supports e-file for ordinary IT 1040 nonresident filings; federal-1040-NR-linked returns will typically be paper-filed per File 14's general pattern.

### 2.9 Michigan

- **(a) Residency test:** Michigan has its own domicile-based residency test independent of federal NRA status; F-1 students are generally MI nonresidents.
- **(b) Treaty conformity: YES, via federal-AGI flow-through — medium-high confidence.** Michigan's Schedule NR instructions state that "any applicable treaty benefits should already be reflected in line 11 of the Federal 1040-NR, which equals line 10 of MI-1040" — i.e., MI-1040 adopts the federal AGI figure directly, which already excludes treaty-exempt income, with no MI-specific add-back identified. **High-confidence conformity-by-mechanics, but still worth a DOR-helpdesk confirmation before go-live** given the thinness of the sourcing.
- **(c) Form:** Form MI-1040 with Schedule NR (Nonresident and Part-Year Resident Schedule).
- **(d) Standard deduction/exemption:** Michigan uses a personal/dependent exemption allowance ($5,800 for 2025, plus $3,400 per special exemption), **prorated for nonresidents** by the ratio of MI-source income to total income — available independent of federal NRA deduction-bar rules.
- **(e) Filing threshold:** Nonresident must file if MI income exceeds the prorated exemption allowance; because the exemption is prorated per-taxpayer, there is no single flat dollar threshold — must be computed per return.
- **(f) Reciprocity:** Michigan's old reciprocity agreements with several states (including Ohio and others) for wage income were ended for many partner states years ago; current reciprocity status should be re-verified by the engine per tax year — do not assume any specific agreement is still in force without current confirmation, and in any event this is a residents' framework, not an NRA one.
- **(g) E-file:** MI supports e-file for ordinary Schedule NR filings; a federal-1040-NR-linked return will typically be paper-filed.

### 2.10 Indiana

- **(a) Residency test:** Indiana has its own residency rules; F, J, Q, and M visa holders who are nonresident aliens for federal purposes are treated as Indiana nonresidents and must file **if they have any Indiana-source income**, per Indiana DOR's dedicated "International Students" guidance page.
- **(b) Treaty conformity: LOW-MEDIUM CONFIDENCE — likely conforms via federal-AGI flow-through, but no explicit, unambiguous Indiana DOR statement on treaty add-back was verified in primary form instructions during this research pass.** Indiana DOR's own international-student guidance states that "most treaty considerations only affect taxes at the federal level" and that the federal return's AGI feeds the state return starting point — language that suggests conformity-by-mechanics (same pattern as IL/OH/MI) rather than an explicit add-back regime like CA/PA. Indiana's IT-40PNR does have a Schedule B "Add-Backs" for various other federal/state differences (e.g., certain federal depreciation items, municipal bond interest from other states) — no treaty-income line item was confirmed present or absent with certainty. **Flag explicitly for Indiana DOR helpline or legal-review confirmation before shipping — this is the weakest-sourced conformity conclusion in this file.**
- **(c) Form:** Form IT-40PNR (Part-Year and Full-Year Nonresident Individual Income Tax Return).
- **(d) Standard deduction/exemption:** Indiana uses a flat $1,000 personal exemption (plus $1,000 per dependent, with additional amounts for qualifying children/other categories under current law) rather than a federal-style standard deduction; available regardless of federal NRA deduction-bar status.
- **(e) Filing threshold:** Not required to file if gross income is less than total exemptions (i.e., below $1,000 single / $2,000 MFJ plus $1,000 per dependent) — otherwise must file IT-40PNR if there is any Indiana-source income.
- **(f) Reciprocity:** Indiana has a reciprocity agreement with Michigan, Kentucky, Ohio, Pennsylvania, and Wisconsin for wages of **residents** of those states; not a framework an NRA F-1 student can generally invoke — flag for human review.
- **(g) E-file:** Indiana supports e-file (INTIME and commercial software) for ordinary IT-40PNR filings; federal-1040-NR-linked returns will typically be paper-filed per the general pattern.

---

## 3. Summary Table

| State | Own residency test (independent of federal NRA)? | Conforms to federal treaty exemption? | NRA-specific form | Confidence | Notes |
|---|---|---|---|---|---|
| California | Yes | **No — explicit add-back required** | Form 540NR + Sch. CA (540NR) | High | FTB Pub. 1001 is explicit and unambiguous |
| New York | Yes | Yes (via fed-AGI flow-through), but provision-specific caveats | Form IT-203 | Medium | NY itself says to verify "provision-by-provision" |
| Texas | N/A — no income tax | N/A | None | High | No state income tax exists at all |
| Florida | N/A — no income tax | N/A | None | High | No state income tax exists at all |
| Massachusetts | Yes | **Yes — explicit** (gross-up-then-deduct on Sch. Y) | Form 1-NR/PY | High | 830 CMR 62.5A.1 + Directive 87-4 are explicit |
| Illinois | Yes | Yes (via fed-AGI flow-through) | Form IL-1040 + Sch. NR | Medium | Inferred from AGI-starting-point mechanics, not an explicit DOR statement found |
| Pennsylvania | Yes | **No — explicit non-recognition**, narrow treaty-specific-language exception | Form PA-40 (no separate NR number) | High | PA PIT Guide states treaties "have no effect" on PA law |
| Ohio | Yes | Likely yes (via fed-AGI flow-through) | Form IT 1040 (+ Nonresident Statement) | Low-Medium | No explicit DOR add-back statement found; inferred |
| Michigan | Yes | Yes (via fed-AGI flow-through) | Form MI-1040 + Sch. NR | Medium-High | MI Schedule NR instructions reference line-11 flow-through directly |
| Indiana | Yes | Likely yes (via fed-AGI flow-through) | Form IT-40PNR | Low | Weakest-sourced; explicit DOR confirmation needed |

---

## 4. General Decision Framework for States Not Individually Covered

For any of the remaining ~39 states/DC not detailed above, apply this framework **and route the specific state to human/legal review before launch** — do not infer a treaty-conformity answer purely from this framework without a named sign-off, because (as seen above) the correct answer ranges from "explicit full conformity" (MA) to "explicit full add-back" (CA/PA) and primary-source documentation quality varies enormously by state.

```
STEP 1 — Does the student have state-source income in this state?
    (wages for services physically performed there, income from property located
    there, business income apportioned there, etc.)
    IF NO -> no filing obligation in this state (stop)
    IF YES -> continue

STEP 2 — Does the state have an income tax at all?
    IF the state is one of the no-income-tax states (as of this writing: Alaska,
       Florida, Nevada, South Dakota, Tennessee, Texas, Washington, Wyoming — and
       New Hampshire, which taxes only certain investment income, not wages)
       -> no personal income tax filing obligation (stop)
    ELSE -> continue

STEP 3 — Does state-source income exceed the state's filing threshold?
    (varies by state: flat dollar amount, standard-deduction-equivalent, or
    exemption-allowance comparison — must be looked up per state, per tax year)
    IF NO -> generally no filing obligation (verify: some states require filing
       to claim a withholding refund even below the threshold)
    IF YES -> continue

STEP 4 — Does the state conform to the federal NRA treaty exemption?
    LOOK UP: does the state return start from federal AGI/taxable income with NO
       state-specific addition-modification line for treaty-exempt income?
         IF YES (and no DOR guidance says otherwise) -> tentatively conforms
            (flows through untaxed) -> HUMAN REVIEW REQUIRED to confirm no hidden
            addition-modification code exists
         IF the state has an explicit addition-modification line for
            "income exempt under a tax treaty" or similar -> does NOT conform;
            add back the treaty-exempt amount -> HUMAN REVIEW REQUIRED to confirm
            exact line/code and whether any treaty-specific state-tax-exemption
            carve-out applies
    IF STATE POSITION IS AMBIGUOUS OR UNDOCUMENTED (the common case for states
       without a large international-student population and correspondingly thin
       public guidance) -> DEFAULT TO CONSERVATIVE ADD-BACK (treat as taxable) AND
       FLAG FOR MANDATORY HUMAN/LEGAL REVIEW before the return is finalized —
       never silently assume conformity.

STEP 5 — Which form?
    LOOK UP the state's nonresident/part-year-resident form name (commonly named
    "[State] NR," "Schedule NR," "IT-203," "540NR," "PY," etc. — naming is not
    standardized across states) and confirm current-year revision.
```

**Explicit flag:** Every state not individually documented in Section 2 of this file — i.e., all states other than CA, NY, TX, MA, IL, PA, OH, MI, IN, FL — requires dedicated legal/tax research before the engine ships a determination for that state's NRA treaty-conformity question or filing threshold. This file does not substitute for that per-state verification. Priority candidates for the next research pass (by typical F-1 population size and documented treaty non-conformity issues raised in this research): Maryland (confirmed non-conformity to tax treaties, relevant to any student with D.C.-area internships), New Jersey, Virginia, Washington, Georgia, North Carolina, Minnesota, Wisconsin, Connecticut, Arizona.

---

## Sources

- [FTB Publication 1001 (2024), Supplemental Guidelines to California Adjustments — ftb.ca.gov](https://www.ftb.ca.gov/forms/2024/2024-1001-publication.pdf)
- [FTB Publication 1031, Guidelines for Determining Resident Status — ftb.ca.gov](https://www.ftb.ca.gov/forms/2024/2024-1031-publication.pdf)
- [2025 Form 540NR Booklet — ftb.ca.gov](https://www.ftb.ca.gov/forms/2025/2025-540nr-booklet.html)
- [2025 Instructions for Schedule CA (540NR) — ftb.ca.gov](https://www.ftb.ca.gov/forms/2025/2025-540nr-ca-instructions.html)
- [Residents — California filing thresholds — ftb.ca.gov](https://www.ftb.ca.gov/file/personal/residency-status/index.html)
- [Part-year resident and nonresident — ftb.ca.gov](https://www.ftb.ca.gov/file/personal/residency-status/part-year-and-nonresident.html)
- [2025 Instructions for Form IT-203 — tax.ny.gov](https://www.tax.ny.gov/forms/current-forms/it/it203i.htm)
- [Form IT-203 (2025) — tax.ny.gov](https://www.tax.ny.gov/pdf/2025/inc/it203_2025_fill_in.pdf)
- [New York nonresident income tax: 2026 guide — taxesforexpats.com](https://www.taxesforexpats.com/articles/expat-tax-rules/new-york-nonresident-income-tax.html)
- [New York State Taxes for International Students: Complete IT-203 Guide — f1taxreturn.com](https://f1taxreturn.com/blog/new-york-state-tax-international-student)
- [2025 Form 1-NR/PY Instructions — mass.gov](https://www.mass.gov/doc/2025-form-1-nrpy-instructions/download)
- [Legal and Residency Status in Massachusetts — mass.gov](https://www.mass.gov/info-details/legal-and-residency-status-in-massachusetts)
- [830 CMR 62.5A.1, Non-resident Income Tax — Cornell Law / law.cornell.edu](https://www.law.cornell.edu/regulations/massachusetts/830-CMR-62-5A-1)
- [Directive 87-4: Non-Residents From Other Countries — Effect of Tax Treaty — mass.gov](https://www.mass.gov/directive/directive-87-4-non-residents-from-other-countries-effect-of-tax-treaty)
- [Illinois Department of Revenue, 2025 Schedule NR Instructions — tax.illinois.gov](https://tax.illinois.gov/content/dam/soi/en/web/tax/forms/incometax/documents/currentyear/individual/il-1040-schedule-nr-instr.pdf)
- [Illinois personal exemption allowance — tax.illinois.gov](https://tax.illinois.gov/questionsandanswers/answer.851.html)
- [Illinois Filing Requirements — tax.illinois.gov](https://tax.illinois.gov/individuals/filingrequirements.html)
- [Illinois State Taxes for International Students: Complete IL-1040 Guide — f1taxreturn.com](https://f1taxreturn.com/blog/illinois-state-tax-international-student)
- [PA Personal Income Tax Guide — Income Subject to Withholding; Estimated Payments; Penalties, Interest and Other Additions — pa.gov](https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/income-subject-withholding-estimated-payments-penalties-interest-other-additions)
- [PA Personal Income Tax Guide — Brief Overview and Filing Requirements — pa.gov](https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/brief-overview-and-filing-requirements)
- [PA Personal Income Tax Guide — Gross Compensation (DSM-12) — pa.gov](https://www.pa.gov/content/dam/copapwp-pagov/en/revenue/documents/formsandpublications/papersonalincometaxguide/documents/pitguide_grosscompensation.pdf)
- [2025 Ohio IT 1040 Instructions Booklet — tax.ohio.gov](https://dam.assets.ohio.gov/image/upload/v1767095693/tax.ohio.gov/forms/ohio_individual/individual/2025/it1040-booklet.pdf)
- [What's New for Tax Year 2024/2025 — Ohio Department of Taxation](https://tax.ohio.gov/wps/portal/gov/tax/individual/resources/whatsnew)
- [Ohio State University — Nonresident Alien Taxation — busfin.osu.edu](https://busfin.osu.edu/buy-sell-travel/payroll-services/nonresident-alien-taxation)
- [Michigan Schedule NR (2025) — michigan.gov](https://www.michigan.gov/taxes/-/media/Project/Websites/taxes/Forms/IIT/TY2025/Schedule-NR.pdf)
- [MI-1040 Individual Income Tax Forms and Instructions (2025) — michigan.gov](https://www.michigan.gov/taxes/-/media/Project/Websites/taxes/Forms/IIT/TY2025/MI-1040-Book.pdf)
- [University of Michigan International Center — Non-Residents for Tax Purposes](https://internationalcenter.umich.edu/resources/tax/non-residents)
- [Indiana DOR — International Students — in.gov](https://www.in.gov/dor/i-am-a/individual/student-taxes/international-students/)
- [Indiana IT-40PNR (2025) — forms.in.gov](https://forms.in.gov/Download.aspx?id=16921)
- [Purdue International Students & Scholars — Tax Return Information — purdue.edu](https://www.purdue.edu/IPPU/ISS/_Documents/Student/TaxReturnInformation.pdf)
- [Minnesota State — Tax Procedures for Nonresident Alien (Foreign) Student Employees — minnstate.edu](https://www.minnstate.edu/system/finance/taxinformation/nonresident/nra_studentemployees/handbook_procedures.html)
- [Virginia Tax Commissioner Ruling 13-187 (standard deduction for NRAs not itemizing) — tax.virginia.gov](https://www.tax.virginia.gov/laws-rules-decisions/rulings-tax-commissioner/13-187)

**Verification note:** All dollar thresholds, exemption amounts, and standard deduction figures cited above are tax-year 2025 values pulled from each state's current-year form instructions and must be re-verified against the current-year booklet before each filing season. The Ohio and Indiana treaty-conformity conclusions in particular rest on inference from return mechanics rather than an explicit department-of-revenue statement and should be confirmed directly with each state's DOR (or by state tax counsel) before the engine relies on them in production.
