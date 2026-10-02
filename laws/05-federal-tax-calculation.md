# Federal Tax Calculation for Nonresident Aliens (Form 1040-NR)

**Scope:** This document is the logic spec for computing U.S. federal income tax liability for a nonresident alien (NRA) filing Form 1040-NR, with emphasis on the F-1 student population. All dollar figures are **tax year 2025** (returns filed in 2026) unless noted. Figures that are inflation-adjusted annually (brackets, standard deduction) MUST be stored in a rates-by-year table in the engine, not hardcoded — see §1.

---

## 0. Computational Decision Tree (Master Flow)

This is the end-to-end order of operations. Every subsequent section maps into one node of this tree. Line numbers refer to the 2025 Form 1040-NR.

```
1. CLASSIFY every income item as one of:
   (a) Effectively Connected Income (ECI) — taxed at graduated rates — reported on page 1 (lines 1a-8)
   (b) Not Effectively Connected (NEC) — taxed flat 30% or treaty rate — Schedule NEC
   (c) Treaty-exempt income — reported on line 1k + Schedule OI Item L (excluded from tax base entirely)
   See §1A for the ECI/NEC classification test.

2. SUM ECI items → Form 1040-NR line 9 "Total effectively connected income"

3. SUBTRACT above-the-line adjustments (Schedule 1, Part II; e.g., student loan interest —
   see §6 eligibility restrictions) → line 10

4. line 9 − line 10 = line 11a/11b  ADJUSTED GROSS INCOME (AGI)

5. SUBTRACT deduction (line 12):
   IF taxpayer is eligible for India Article 21(2) standard deduction (§2) AND elects it
       THEN line 12 = standard deduction amount for filing status (§2 table)
   ELSE
       THEN line 12 = Schedule A (Form 1040-NR) itemized deductions, which may be $0 (§3)
   (NRAs otherwise get NEITHER the standard deduction NOR an exemption amount by default.)

6. SUBTRACT (if applicable):
   - line 13a: Qualified Business Income (QBI) deduction (§8) — rare for students
   - line 13b: estate/trust exemption only (N/A to individuals)
   - line 13c: Schedule 1-A additional deductions (no tax on tips/overtime/senior — rarely
     applicable to NRAs; see §3A)

7. line 11b − (12+13a+13b+13c) = line 15  TAXABLE INCOME (floor at $0)

8. COMPUTE TAX on line 15 using the Tax Table / Tax Computation Worksheet for the taxpayer's
   filing status (§1), using ONLY Single / MFS / QSS columns — NEVER Head of Household, even if
   the underlying table shows that column → line 16.
   (Estates/trusts use Tax Rate Schedule W instead — see §1 note.)

9. ADD line 17 (Schedule 2, Part I — AMT, excess APTC repayment) → line 18

10. SUBTRACT credits:
    - line 19: Child Tax Credit / Credit for Other Dependents (§5, §6 — heavily restricted)
    - line 20: Schedule 3 credits (foreign tax credit, child/dependent care credit, etc. — §6)
    → line 21; line 18 − line 21 = line 22 (floor at $0)

11. ADD line 23a: Schedule NEC tax (flat 30%/treaty-rate tax on NEC income, §1A/§1C)
    ADD line 23b: Schedule 2 Part II other taxes (self-employment tax, Additional Medicare
       Tax — §7; NOT NIIT for a pure full-year NRA — §7)
    ADD line 23c: 4% transportation tax (rare; vessel/aircraft income)
    → line 23d; line 22 + line 23d = line 24  TOTAL TAX

12. COMPUTE total payments (line 33): withholding (W-2 line 25a, 1099 line 25b, 1042-S line 25g,
    etc.) + estimated payments (line 26) + refundable credits (line 32).

13. IF line 33 > line 24 → REFUND (line 34). IF line 24 > line 33 → AMOUNT OWED (line 37),
    plus possible estimated-tax penalty (line 38).
```

**Citation:** Form 1040-NR (2025), p.1-2; Instructions for Form 1040-NR (2025), "Line Instructions," pp. 16-23.

---

## 1. Graduated Tax Rate Brackets

### 1A. ECI vs. NEC classification (threshold question before any rate applies)

```
IF income is effectively connected with a U.S. trade or business (performing personal
   services in the U.S. — including F-1/CPT/OPT wages — is per se a U.S. trade or business)
   THEN tax at graduated rates (this section) via Form 1040-NR page 1 / line 16
ELSE IF income is U.S.-source "fixed or determinable annual or periodical" (FDAP) income not
   connected to a trade/business (e.g., bank interest on a non-business account, portfolio
   dividends, certain scholarship non-tuition amounts received by a non-degree candidate, gambling
   winnings)
   THEN tax at flat 30% OR lower treaty rate via Schedule NEC → line 23a (see File 3, §Schedule NEC)
ELSE IF income is exempt from U.S. tax entirely under a treaty article (e.g., France/India
   student wage exemption, scholarship treaty exemption)
   THEN exclude from both line 9 and Schedule NEC; report on line 1k + Schedule OI Item L
```
Wages from on-campus employment, CPT, and OPT are ECI. Bank savings-account interest is generally NOT taxed at all for NRAs (exception, below). Capital gains are NEC-taxable ONLY if the NRA was present in the U.S. 183+ days in the tax year using the **non-exempt-individual day count** (exempt-individual days, e.g., most F-1 days within the 5-year window, do NOT count toward this 183-day test) — otherwise U.S.-source capital gains of an NRA are **not taxed at all**.
**Citation:** Instructions for Form 1040-NR (2025), "How To Report Income," p.15; "Kinds of Income"; Schedule NEC instructions, pp.42-44.

### 1B. 2025 graduated rate brackets (Single / Married Filing Separately)

An NRA filer may ONLY use the **Single**, **Married Filing Separately (MFS)**, or **Qualifying Surviving Spouse (QSS)** columns of the Tax Table / Tax Computation Worksheet — never Head of Household, and Married Filing Jointly is essentially unavailable (see File 3, §Filing Status). QSS uses the MFJ bracket widths.

| Rate | Single — Taxable income over | MFS — Taxable income over |
|------|-------------------------------|----------------------------|
| 10%  | $0 | $0 |
| 12%  | $11,925 | $11,925 |
| 22%  | $48,475 | $48,475 |
| 24%  | $103,350 | $103,350 |
| 32%  | $197,300 | $197,300 |
| 35%  | $250,525 | $250,525 |
| 37%  | $626,350 | $375,800 |

**IF/THEN:** `tax = bracket formula applied to Form 1040-NR line 15, using Tax Table if line 15 < $100,000, else Tax Computation Worksheet, using Section A (Single), Section B (QSS), or Section C (MFS) as applicable.`

**Engine requirement:** store brackets in a `tax_brackets(year, filing_status) → [(rate, lower_bound)]` table. These thresholds are inflation-adjusted annually by the IRS (Rev. Proc.) — do NOT hardcode a single year's values in business logic.

**Estates/trusts (not individuals) filing Form 1040-NR** use a separate compressed schedule (Tax Rate Schedule W, 2025): 10% to $3,150; 24% to $11,450; 35% to $15,650; 37% above $15,650. Flag any Form 1040-NR with filing status = Estate/Trust for specialized handling — out of scope for the typical F-1 student engine.

**Citation:** Instructions for Form 1040-NR (2025), p.52 (Schedule W); 2025 brackets per IRS Rev. Proc. 2024-40, reported by Kiplinger, NerdWallet, H&R Block (see Sources).

---

## 2. Standard Deduction — General Rule and the India Treaty Exception

### 2A. General rule
```
IF taxpayer files Form 1040-NR AND is NOT eligible for the India Article 21(2) exception (§2B)
   THEN standard deduction = $0. Taxpayer MUST itemize (Schedule A) or take $0 deduction.
```
This applies even for the resident-alien portion of a dual-status year — a dual-status taxpayer gets NO standard deduction for any part of the year.
**Citation:** Instructions for Form 1040-NR (2025), p.14 "Restrictions for Dual-Status Taxpayers — Standard deduction"; Form 1040-NR (2025) line 12 caption: "Itemized deductions ... or, for certain residents of India, standard deduction."

### 2B. India Article 21(2) exception — the unique carve-out
```
IF taxpayer is a student OR business apprentice
   AND eligible for benefits of Article 21(2) of the U.S.–India Income Tax Treaty
      (i.e., was a resident of India immediately before coming to the U.S., per the treaty's
       residency tie-breaker rules — this is a treaty-eligibility determination, not merely
       "holds an Indian passport")
   AND filing status is Single or Qualifying Surviving Spouse
   THEN taxpayer MAY elect to take the standard deduction (Form 1040 standard deduction amount
      for their filing status) on Form 1040-NR line 12, INSTEAD OF itemizing on Schedule A.
      This is the ONLY nationality/treaty-based standard-deduction exception in the entire
      1040-NR regime.
```

**2025 standard deduction amounts (for this exception):**

| Filing status | 2025 standard deduction |
|---|---|
| Single | $15,750 |
| Qualifying Surviving Spouse | $31,500 |

**Filing-threshold interaction:** A student/business apprentice eligible for Article 21(2) benefits does NOT even need to file a return if gross income ≤ $15,750 (single) / $31,500 (QSS) for 2025 — see Form 1040-NR filing-requirement Exception 2.

**Edge case — net qualified disaster loss:** an India-treaty filer who elects the standard deduction AND has a net qualified disaster loss (Form 4684) can claim an *increased* standard deduction by combining both amounts on Schedule A line 7 and carrying the sum to line 12 — a narrow combination rule. Flag for human review if both conditions are present.

**Route to human review:** Any taxpayer claiming this exception should be flagged for a treaty-residency check (was the student an India tax resident immediately before arriving in the U.S.?) since this is a factual/legal determination the engine should not silently assume from citizenship alone.

**Citation:** Instructions for Form 1040-NR (2025), p.20-21 "Standard deduction for certain residents of India"; p.7 filing-requirement Exception 2; p.41-42 Schedule A line 7 "Increased standard deduction reporting for certain students and business apprentices from India."

---

## 3. Itemized Deductions (Schedule A, Form 1040-NR)

**Threshold rule:** Only deductions and losses *properly allocated and apportioned to ECI* are deductible — EXCEPT gifts to U.S. charities and casualty/theft losses, which are deductible even if unrelated to ECI.
**Citation:** Instructions for Schedule A (Form 1040-NR) (2025), p.39, "Before you begin" note; IRC §861(b).

### Allowed line items (Schedule A, Form 1040-NR):

| Line | Item | Rule |
|---|---|---|
| 1a | State and local income taxes paid/withheld on ECI during the year | Deductible as paid/withheld; do NOT reduce by expected refunds |
| 1b | SALT cap | Lesser of line 1a or **$40,000** ($20,000 if MFS) for 2025 (increased from $10,000 by the One Big Beautiful Bill Act, OBBBA, P.L. 119-21); phases down (not below $10,000/$5,000 MFS) if MAGI > $500,000 ($250,000 MFS) |
| 2 | Gifts by cash/check to U.S. qualified charities | Limited to 30%/60% of line 11b depending on type; carryover allowed 5 years |
| 3 | Gifts other than cash/check | Form 8283 required if >$500 |
| 4 | Carryover of prior-year excess gifts | 5-year carryforward |
| 6 | Casualty/theft losses | ONLY losses attributable to a **federally declared disaster**; each loss reduced by $100, aggregate reduced by 10% of line 11b (AGI) |
| 7 | "Other" — a narrow enumerated list ONLY | Gambling losses connected to a U.S. trade/business (limited to gambling winnings reported on Schedule 1 line 8b); casualty/theft losses of income-producing property; claim-of-right repayments >$3,000; impairment-related work expenses; net qualified disaster loss |
| 8 | Total | Sum of 1b+5+6+7 → Form 1040-NR line 12 |

### NOT allowed for NRAs (contrast with Form 1040 Schedule A for residents):
- Medical and dental expenses — **no line exists** on Schedule A (Form 1040-NR)
- Home mortgage interest
- General "other itemized deductions" available to residents
- Any deduction/loss not allocable to ECI (unless the charity/casualty exception applies)

**IF/THEN:**
```
IF line_item NOT IN {state/local income tax, gifts to U.S. charity, casualty/theft loss from
   federally declared disaster, the narrow §7 list}
   THEN deduction = $0 (not allowed on Schedule A (Form 1040-NR))
```

**Citation:** Instructions for Schedule A (Form 1040-NR) (2025), pp.39-42; Instructions for Form 1040-NR (2025) "What's New," p.5 (SALT cap increase to $40,000 under OBBBA).

### 3A. Schedule 1-A additional deductions (new for 2025 — rarely applicable to NRAs)
OBBBA created "no tax on tips," "no tax on overtime," and an "enhanced senior deduction," claimable via new Schedule 1-A regardless of itemizing/standard deduction status, flowing to line 13c. **"No tax on car loan interest" explicitly does NOT apply to nonresident aliens** per the instructions. The tips/overtime deductions are not barred for NRAs by the instructions, but require effectively connected wage/tip/overtime income — uncommon but not impossible for an F-1 student with service-industry CPT/OPT work. Flag any Schedule 1-A claim for review given its novelty and the general pattern of NRA exclusions.
**Citation:** Instructions for Form 1040-NR (2025), p.34, "Instructions for Schedule 1-A... Part IV No Tax on Car Loan Interest — Generally, nonresident aliens are not eligible."

---

## 4. Personal Exemption

```
personal_exemption_deduction = $0 for ALL individual taxpayers (resident or nonresident),
   for tax years 2018 through at least 2025, and made PERMANENT at $0 by the One Big Beautiful
   Bill Act (OBBBA, P.L. 119-21, enacted July 4, 2025), which permanently extended the TCJA's
   suspension of the personal exemption. There is no future "sunset" to plan for.
```
Estates get a $600 exemption; simple trusts $300; qualified disability trusts $5,100 (2025) — but these apply to Form 13b for estate/trust filers only, never to individual NRAs.
**Citation:** Instructions for Form 1040-NR (2025), p.21, "Line 13b... You can't claim an exemption deduction in 2025 if you're an individual"; Tax Foundation 2025/2026 bracket summaries; Congressional Research Service RL34498.

---

## 5. Dependents / Qualifying Relatives for NRAs

```
IF filer is a U.S. national, OR a resident of Canada, OR a resident of Mexico
   THEN may claim dependents on the SAME terms as a U.S. citizen (full Pub. 501 rules)
ELSE IF filer is a resident of South Korea
   THEN may claim dependents only on the LIMITED terms in Pub. 519 ch. 5 (generally: dependent
      must have lived with the taxpayer in the U.S. at some point in the tax year, among other
      restrictions)
ELSE IF filer is a student or business apprentice eligible for India Article 21(2) benefits
   THEN may claim dependents only on the LIMITED terms in Pub. 519 ch. 5 (generally: spouse —
      if not separately claiming personal exemption/deduction elsewhere — and children who
      were born in or came to live with the taxpayer in the U.S., subject to additional
      conditions)
ELSE
   THEN NO dependents may be claimed on Form 1040-NR — this is an absolute bar, regardless of
      the dependent's own facts (e.g., a U.S.-citizen child)
```
**New for 2025:** every dependent claimed for CTC or Credit for Other Dependents purposes must have a valid SSN or ITIN issued **on or before the due date of the return (including extensions)**.
**Citation:** Instructions for Form 1040-NR (2025), p.17, "Dependents — Exception"; p.5, "SSN or ITIN needed to claim the credit for other dependents"; Form 1040-NR (2025) p.1 "Dependents" section (new numbered-row format for 2025).

**Route to human review:** Any dependent claim on a 1040-NR where country of residence (Schedule OI Item B) is NOT Canada/Mexico/South Korea/India, or filer is not a U.S. national — reject/flag automatically, this is a hard bar.

---

## 6. Credits Available to NRAs

| Credit | Availability for 1040-NR filers |
|---|---|
| **Earned Income Tax Credit (EITC)** | **Never available.** Absolute bar for all Form 1040-NR filers. |
| **Child Tax Credit (CTC) / Credit for Other Dependents (ODC)** | Full availability only for U.S. nationals and residents of Canada/Mexico. **Limited** availability for South Korea and India residents (per Pub. 519 ch. 5 — tied to the limited dependents rule, §5 above). **Unavailable** to all other NRAs. 2025: max CTC = **$2,200/qualifying child** ($1,700 refundable as ACTC); valid SSN required by return due date (new 2025 rule, made permanent by OBBBA). |
| **Additional Child Tax Credit (ACTC)** | Same country restriction as CTC. |
| **Education credits (AOTC/LLC)** | **Never available** to Form 1040-NR filers (explicit bar — Schedule 3 line 3 left blank). |
| **Child and Dependent Care Credit** | Generally available (Schedule 3 line 2) — BUT requires a qualifying dependent, which for most NRAs is barred per §5. In practice, only usable by the same restricted-country filers who can claim dependents. |
| **Premium Tax Credit (for dependents)** | Only U.S. nationals, residents of Canada/Mexico/South Korea, and India Article 21(2) students/apprentices. Married NRAs generally cannot claim it absent a Form 8962 "married taxpayers" exception. |
| **Foreign Tax Credit** | Available, limited to the smaller of total foreign taxes paid or the U.S. tax on line 16 + Schedule 2 line 1a, if 5 conditions in the instructions are met; otherwise Form 1116 required. |
| **Retirement Savings Contributions Credit (Saver's Credit)** | Available, no NRA-specific exception noted. |
| **Residential Energy Credits** | Available if the NRA owns and improves U.S. residential property — rare for students. |
| **Adoption Credit** | Available (Form 8839); up to $5,000 refundable starting 2025 (OBBBA). |
| **Credit for the Elderly or Disabled** | **Never available** — explicit bar. |
| **Mortgage interest credit, DC first-time homebuyer, clean vehicle credits, etc.** | Generally available if the underlying activity/asset qualifies — rare for students but not barred by NRA status per se. |

**IF/THEN (practical engine rule for the F-1 student population):**
```
IF country_of_residence NOT IN {Canada, Mexico, South Korea, India} AND NOT US_national
   THEN CTC = $0, ODC = $0, ACTC = $0, child_dependent_care_credit = $0 (no eligible dependent),
        premium_tax_credit_for_dependents = $0
ALWAYS: EITC = $0, education_credits = $0, elderly_disabled_credit = $0
```
**Citation:** Instructions for Form 1040-NR (2025), p.21 "Line 19 — Exception"; p.22 "Line 28 — Exception"; p.37 "Line 2," "Line 3," "Line 4"; p.25 "Exception 3/4"; p.5-6 "Changes to child tax credit," "Changes to the adoption credit," "SSN or ITIN needed."

---

## 7. Net Investment Income Tax (NIIT) and Additional Medicare Tax

### 7A. Net Investment Income Tax (Form 8960, Schedule 2 line 12) — generally N/A
```
IF taxpayer is a full-year nonresident alien (not dual-status)
   THEN NIIT = $0 — NOT applicable, regardless of investment income level.
IF taxpayer is a dual-status taxpayer (became resident or ceased residency mid-year)
   THEN NIIT MAY apply, but ONLY to net investment income attributable to the portion of the
      year the taxpayer was a U.S. resident. Compute via Form 8960 for that period only.
```
This is a direct, authoritative rule from the IRS instructions, not merely a general "NRAs are excluded" statement — confirm against this logic for any dual-status edge case (e.g., a student who adjusts to resident status, H-1B transition, or green-card sponsorship mid-year).
**Citation:** Instructions for Form 1040-NR (2025), p.35, "Line 12 — Net Investment Income Tax... Exception. You're only liable for the net investment income tax if you're a dual-status taxpayer."

### 7B. Additional Medicare Tax (Form 8959, Schedule 2 line 11)
```
IF Medicare wages/self-employment income (effectively connected) > $200,000 (single/MFS/QSS
   threshold — NOT inflation-indexed, fixed by statute since 2013)
   THEN Additional Medicare Tax of 0.9% applies on the excess, same as for U.S. residents —
      there is NO NRA-specific exception in the Form 1040-NR instructions.
```
**Critical interaction for F-1 students:** Most F-1/J-1/M-1/Q students are **exempt from FICA (Social Security + Medicare) withholding entirely** for their first 5 calendar years of U.S. presence under IRC §3121(b)(19), provided the work is authorized (on-campus, CPT, OPT) and consistent with visa purpose. During this exempt period, there are no "Medicare wages" at all, so Additional Medicare Tax cannot apply even at very high income. After the 5-calendar-year exemption window expires, the individual typically also meets the Substantial Presence Test and becomes a resident alien for income-tax purposes (filing Form 1040, not 1040-NR) — so a true Form-1040-NR filer with Additional-Medicare-Tax exposure is an uncommon edge case (e.g., a dual-status year, or a non-student NRA with high U.S. wages).

**Route to human review:** Any Form 1040-NR filer reporting Medicare wages AND claiming F/J/M/Q student status in year 1-5 of presence should be flagged — the employer may have improperly withheld FICA (recoverable via Form 843, see File 1 "Social security or Medicare taxes withheld in error," cited in i1040nr.pdf p.10), rather than genuinely owing Additional Medicare Tax.
**Citation:** Instructions for Form 1040-NR (2025), p.35, "Line 11 — Additional Medicare Tax"; p.10 "Social security or Medicare taxes withheld in error"; IRC §3121(b)(19); IRS Questions and Answers for the Additional Medicare Tax (irs.gov).

---

## 8. Qualified Business Income (QBI) Deduction

```
IF taxpayer has income effectively connected with a U.S. trade or business that constitutes
   "qualified business income" (generally income from a sole proprietorship, partnership, or
   REIT/PTP — NOT W-2 wages, NOT investment income)
   THEN QBI deduction may be claimed via Form 8995/8995-A → Form 1040-NR line 13a
ELSE
   THEN QBI deduction = $0
```
**Why this is almost always N/A for F-1 students:** (1) the overwhelming majority of student income is W-2 wages (on-campus job, CPT, OPT employer), which is categorically excluded from QBI; (2) nonresident aliens cannot be shareholders of an S corporation, eliminating one common QBI source available to residents; (3) a student running a genuine U.S. sole proprietorship (e.g., self-employed OPT consulting) is both rare and immigration-sensitive (unauthorized self-employment can jeopardize visa status) — any such case should be flagged for human/immigration-counsel review regardless of the tax treatment.
**Citation:** Instructions for Form 1040-NR (2025), p.21, "Line 13a... Exception. You must have income effectively connected with a U.S. trade or business"; general QBI rules (IRC §199A) re: S-corp shareholder eligibility.

---

## 9. Edge Cases Flagged for Special Handling

- **Dual-status year** (arrival/departure year, or status change to/from resident): different rules apply to each portion of the year; standard deduction barred for the whole year; NIIT may apply to the resident portion; tax computed via a blended method. Flag for specialized dual-status logic, not the standard engine path.
- **Election to be taxed as a resident alien** (nonresident spouse married to a U.S. citizen/resident, filing jointly on Form 1040): this takes the taxpayer OUT of the 1040-NR path entirely. One-time, irrevocable-if-terminated election. Flag and route to resident-filing logic.
- **Dual-resident taxpayer claiming treaty tie-breaker residency** (Form 8833 attached, treated as NRA for U.S. purposes despite meeting SPT/green card test): requires treaty analysis — route to human review.
- **Treaty-based return position disclosure (Form 8833)** required whenever a treaty position overrides the Code and reduces tax, UNLESS one of 5 listed exceptions applies (the most common of which — reduced withholding on FDAP income, and taxation of students/trainees/scholarships — DOES cover most F-1 treaty wage/scholarship exemptions, so Form 8833 is often NOT required for routine student treaty claims). Engine should still flag any treaty claim exceeding $10,000 in aggregate for a Form 8833 completeness check.
- **Former U.S. citizens/long-term residents (expatriates)**: special covered-expatriate rules apply — out of scope for typical F-1 population but flag if Schedule OI Item D is "Yes."
- **Any Schedule P (partnership interest transfer) activity**: complex effectively-connected-gain sourcing rules — always route to human review.

---

## Sources

- Form 1040-NR (2025), IRS, created 9/8/2025 (local copy: `/Users/anubhavgupta/Downloads/LumaTax/forms/f1040nr.pdf`)
- Instructions for Form 1040-NR (2025), IRS, rev. Jan 29, 2026, Catalog No. 11368V (local copy: `/Users/anubhavgupta/Downloads/LumaTax/forms/i1040nr.pdf`) — all 2025 dollar figures, brackets citation (Schedule W, p.52), standard deduction (pp.20-21), personal exemption (p.21), dependents (p.17), credits (pp.21-22, 25, 37-38), NIIT (p.35), Schedule A (pp.39-42)
- [Federal income tax rates and brackets — IRS.gov](https://www.irs.gov/filing/federal-income-tax-rates-and-brackets)
- [2025 Tax Brackets and Federal Income Tax Rates — NerdWallet](https://www.nerdwallet.com/taxes/learn/2025-tax-brackets)
- [2025-2026 Tax Brackets & Federal Income Tax Rates — H&R Block](https://www.hrblock.com/tax-center/irs/tax-brackets-and-rates/what-are-the-tax-brackets/)
- [IRS Announces 2025 Income Tax Brackets — Kiplinger](https://www.kiplinger.com/taxes/new-income-tax-brackets-are-set)
- [F-1 Indian Students & Standard Deduction: Article 21(2) Guide — kkca.io](https://kkca.io/f1-visa-holders/f-1-indian-students-standard-deduction/)
- [Publication 519 (2025), U.S. Tax Guide for Aliens — IRS.gov](https://www.irs.gov/publications/p519)
- [Federal Individual Income Tax Brackets, Standard Deductions, and Personal Exemption: 1988 to 2026 — Congressional Research Service RL34498](https://www.congress.gov/crs-product/RL34498)
- [2025 Tax Brackets — Tax Foundation](https://taxfoundation.org/data/all/federal/2025-tax-brackets/)
- [Instructions for Form 8959 (2025), Additional Medicare Tax — IRS.gov](https://www.irs.gov/pub/irs-pdf/i8959.pdf)
- [Questions and answers for the Additional Medicare Tax — IRS.gov](https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax)
- [Net Investment Income Tax Guide — nationaltaxtools.com](https://nationaltaxtools.com/guides/net-investment-income-tax/)
- [Exemption from FICA (Social Security & Medicare) Taxes for International Students — howellmgmt.com](https://www.howellmgmt.com/post/exemption-from-fica-social-security-medicare-taxes-for-international-students)

All numeric figures (brackets, standard deduction, SALT cap, CTC amount, Additional Medicare Tax/NIIT thresholds) are **tax year 2025** values. The One Big Beautiful Bill Act (P.L. 119-21, enacted July 4, 2025) made several of these provisions (zero personal exemption, $2,200 CTC, increased SALT cap) **permanent** rather than subject to a TCJA-style sunset — but inflation-adjusted figures (brackets, standard deduction dollar amount) still change annually and must be re-verified each filing season via Rev. Proc. updates on IRS.gov.
