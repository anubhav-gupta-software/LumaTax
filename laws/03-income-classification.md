# 03 — Income Classification for Nonresident Alien (NRA) Individuals: ECI vs. FDAP

**Scope:** This file defines the master income-classification framework that every other income-type rule file (scholarships, CPT/OPT wages, dividends, interest, capital gains, etc.) must plug into. It applies to individuals who are **nonresident aliens (NRAs)** for U.S. federal tax purposes during the tax year — the default status for most F-1 students under the Substantial Presence Test "exempt individual" rule for their first 5 calendar years (see FICA/SPT file; not re-derived here).

This document is the top-level router: given a payment, decide (1) is it U.S.-source, (2) if U.S.-source, is it ECI or FDAP, and (3) how is it taxed and reported.

---

## 1. Why This Classification Exists

A nonresident alien is taxed under a **dual system**, IRC §871:

- **§871(b)** — income that is **Effectively Connected with a U.S. Trade or Business ("ECI")** is taxed at the same **graduated rates** that apply to U.S. citizens/residents (IRC §1/§11 brackets), on a **net** basis (gross income minus allowable deductions), filed on **Form 1040-NR**.
- **§871(a)** — U.S.-source income that is **Fixed, Determinable, Annual, or Periodical ("FDAP")** and is **NOT** effectively connected with a U.S. trade or business is taxed at a **flat 30%** rate (or lower treaty rate) on the **gross** amount, with **no deductions**, typically collected via withholding under IRC §1441 and reported on **Form 1042-S**, then reconciled on **Form 1040-NR Schedule NEC**.

A threshold rule for F-1 students: **the performance of personal services in the U.S. (including as a student, on-campus employee, or CPT/OPT worker) is, by statute, treated as being engaged in a U.S. trade or business.** IRC §864(b) states that "the performance of personal services within the United States" constitutes engaging in a trade or business in the United States (with a narrow de minimis exception for certain short-term, low-value nonresident performances that does not apply to F-1 employment). This is why wages are ECI, not FDAP, even though a student does not own a "business."

### Rule Logic — Top-Level Router

```
IF payment/income item has a foreign source (per Section 4 sourcing rules below)
    THEN NOT subject to U.S. tax (no further classification needed)
    EXCEPT IF the foreign-source income is attributable to a U.S. office or
          fixed place of business of the NRA (rare for F-1 students) -> ECI (§864(c)(4))
          -> ROUTE TO HUMAN REVIEW (edge case, rare for students)

IF payment/income item has a U.S. source:
    IF income arises from the performance of personal services in the U.S.
       (wages, self-employment, most stipends tied to work) by this individual
        THEN classify as ECI (§864(b), §871(b))
    ELSE IF income is passive-type (interest, dividends, rents, royalties,
         scholarship/fellowship amounts not tied to services) AND NOT
         effectively connected to a U.S. trade or business
        THEN classify as FDAP (§871(a))
    ELSE IF income is a capital gain
        THEN apply special capital-gain rule (Section 6 below)
    ELSE
        -> ROUTE TO HUMAN REVIEW (unclassified income type)
```

---

## 2. ECI — Effectively Connected Income

**Plain-English rule:** If the money was paid to the student for labor/services performed in the U.S., or is otherwise connected to a U.S. trade or business the student is engaged in (which, for a student, is created automatically by performing services here), it is ECI. ECI is taxed just like a U.S. resident's income — graduated brackets, net of deductions — but reported on **Form 1040-NR** instead of Form 1040, and with NRA-specific deduction restrictions (NRAs generally cannot claim the standard deduction, with the narrow exception of Indian students/business apprentices eligible for U.S.–India treaty Article 21(2), who may elect the standard deduction instead of itemizing — IRS Pub. 519, "Students and Business Apprentices From India").

**Citations:** IRC §871(b); IRC §864(b)-(c); IRC §1 (rate schedule); Form 1040-NR instructions.

### IF/THEN Logic

```
IF income = wages/salary from:
    - on-campus employment, OR
    - CPT (Curricular Practical Training) employment, OR
    - OPT/STEM OPT (Optional Practical Training) employment, OR
    - any W-2 reporting employer-employee relationship for services performed in U.S.
THEN:
    classification = ECI
    tax_basis = NET (gross wages, no itemized/standard deduction unless India treaty)
    tax_rate = graduated rates under IRC §1 (10%-37% bands, same as resident)
    withholding_mechanism = IRC §3402 (regular wage withholding via Form W-4,
        using the special NRA withholding adjustment procedure — Pub. 515 "Withholding
        on Wages")
    reporting_form = Form W-2 (from employer) -> Form 1040-NR, Line 1a (wages)
    See File 10 (CPT/OPT income) for full treatment.

IF income = taxable portion of scholarship/fellowship that represents
    compensation for teaching, research, or other services REQUIRED as a
    condition of the award (IRC §117(c)(1))
THEN:
    classification = ECI (treated as wages under IRC §3401(a))
    reporting_form = Form W-2, Form 1040-NR Line 1a
    -> see File 09 for full scholarship logic
```

---

## 3. FDAP — Fixed, Determinable, Annual, or Periodical Income

**Plain-English rule:** Passive-type U.S.-source income not connected to the performance of services — interest, dividends, rents, royalties, the non-compensatory taxable part of scholarships/fellowships, etc. — is generally taxed at a **flat 30%** of the **gross** amount, with **no deductions allowed**, unless (a) a tax treaty reduces the rate (see treaty lookup file — not re-derived here), or (b) a specific Code exemption applies (e.g., bank deposit interest).

**Citations:** IRC §871(a)(1); Treas. Reg. §1.1441-2 (defining FDAP); IRC §1441 (withholding).

### IF/THEN Logic

```
IF income = U.S.-source interest, dividends, rents, royalties, taxable
    scholarship/fellowship (non-service portion), or other passive annual/
    periodical payment
    AND income is NOT effectively connected with a U.S. trade or business
THEN:
    classification = FDAP
    tax_basis = GROSS (no deductions)
    tax_rate = 30% flat, UNLESS:
        - a specific statutory exemption applies (e.g., §871(i) bank interest
          -> see Section 5), OR
        - an applicable income tax treaty specifies a lower rate or exemption
          -> ROUTE TO TREATY LOOKUP (separate treaty file; do not hardcode
          treaty rates here)
    withholding_mechanism = IRC §1441 (withholding agent withholds at source)
    reporting_form = Form 1042-S (from payer) -> Form 1040-NR, Schedule NEC
        (Tax on Income Not Effectively Connected With a U.S. Trade or Business)
```

---

## 4. Sourcing Rules — U.S.-Source vs. Foreign-Source

NRAs are taxed **only** on U.S.-source income, plus certain foreign-source income that is effectively connected to a U.S. trade or business (rare for students — flag for human review if it arises, e.g., a student with a foreign-source consulting fee attributable to a U.S. fixed base). Determining source is therefore a **mandatory first step**, not an afterthought.

| Income type | Sourcing rule | Citation |
|---|---|---|
| Compensation for personal services (wages, CPT/OPT pay, self-employment) | Sourced to **where the services are physically performed**, regardless of where paid from, where contract was signed, or payer's residence. If services are performed partly in and partly outside the U.S., allocate on a time (days) basis. | IRC §861(a)(3)/§862(a)(3); Treas. Reg. §1.861-4; IRS "Source of Income — Personal Service Income" |
| Scholarship, fellowship, grant, prize, or award | Sourced to the **residence of the payer**, regardless of who disburses the funds. Grant from a U.S. university/U.S. government/domestic corp = U.S.-source. Grant from a foreign government or foreign corp = foreign-source, even if a U.S. agent cuts the check. Also: amounts for activities performed, or to be performed, OUTSIDE the U.S. are **not** U.S.-source regardless of payer. | IRC §861(a)(3) note; Pub. 519, "Scholarships, Grants, Prizes, and Awards" |
| Interest | Generally sourced to residence of the **payer/obligor** (U.S. bank, U.S. corp, U.S. government = U.S.-source) | IRC §861(a)(1) |
| Dividends | Generally sourced to the **country of incorporation** of the paying corporation (U.S. corp = U.S.-source) | IRC §861(a)(2) |
| Capital gains (sale of stock/securities by individual) | Generally sourced to the seller's **tax home/residence** (for NRAs, usually treated as foreign-source UNLESS effectively connected); special 183-day rule overrides (Section 6) | IRC §865(a); §871(a)(2) |

### Rule Logic — Sourcing Gate

```
IF payer is the U.S. federal government, a U.S. state/local government,
   a noncorporate U.S. resident, or a domestic (U.S.) corporation
   AND payment is a scholarship/fellowship/grant/prize/award
THEN source = U.S., proceed to ECI/FDAP classification

IF payer is a foreign government or foreign corporation
   AND payment is a scholarship/fellowship/grant/prize/award
THEN source = foreign -> NOT taxable by U.S. (no further action)
   EDGE CASE: confirm funds are not merely routed through a U.S. disbursing
   agent on behalf of a foreign payer (disbursing agent's location is
   irrelevant per Pub. 519) -> if ambiguous, ROUTE TO HUMAN REVIEW

IF payment is for personal services
THEN source = location where services were physically performed
   (days-worked allocation if split U.S./non-U.S.)
```

---

## 5. Lookup Table — Common F-1 Student Income Types

| Income type | Source determination | ECI or FDAP? | Tax treatment | Form / Line |
|---|---|---|---|---|
| Wages — on-campus job | Services performed in U.S. | **ECI** | Graduated rates, net basis | W-2 -> 1040-NR Line 1a |
| Wages — CPT employment | Services performed in U.S. | **ECI** | Graduated rates, net basis | W-2 -> 1040-NR Line 1a |
| Wages — OPT / STEM OPT employment | Services performed in U.S. | **ECI** | Graduated rates, net basis | W-2 -> 1040-NR Line 1a (see File 10) |
| Scholarship — qualified tuition/fees portion (degree candidate) | Residence of payer (usually U.S. university) | **Excluded from gross income** (not ECI or FDAP) | Tax-free if §117(a) conditions met | Not reported, or 1042-S Income Code 16 w/ exemption code |
| Scholarship — room/board/stipend/living-expense portion | Residence of payer | **FDAP** (unless tied to required teaching/research service, then ECI) | 14% withholding (F/J/M/Q visa) or 30% (other NRA), or lower treaty rate | 1042-S Income Code 16 -> 1040-NR Schedule 1, Line 8r -> Line 8 (see File 09) |
| Bank account interest (savings/checking, U.S. bank) | Residence of payer (U.S. bank) | FDAP in form, but **statutorily exempt from tax** | $0 U.S. tax | Generally not reported on 1042-S; informational 1099-INT only if TIN on file, not taxable |
| Dividends from U.S. corporation stock | Country of incorporation (U.S.) | **FDAP** | 30% flat on gross, or lower treaty rate | 1042-S Income Code 06 -> 1040-NR Schedule NEC |
| Capital gains — sale of U.S. stock/securities | Seller's tax home (generally foreign for NRA) | Generally **not taxed** if present <183 days in the tax year and gain is not ECI | Exempt, UNLESS present ≥183 days (then 30% flat on NET U.S.-source capital gains for the year) | If taxable: 1040-NR Schedule NEC, not Schedule D |
| Portfolio interest (corporate/government bonds meeting requirements) | Residence of payer | FDAP in form, but **statutorily exempt** | $0 U.S. tax | §871(h) exemption |

---

## 6. Special Rule — Capital Gains and the 183-Day Test

**Plain-English rule:** For NRAs, U.S.-source capital gains that are not effectively connected with a U.S. trade or business are generally tax-exempt *unless* the individual was physically present in the U.S. for **183 days or more** during the tax year, in which case such gains are taxed at a **flat 30%** (or treaty rate) on the **net** amount of U.S.-source capital gains over U.S.-source capital losses for the year.

**Critical edge case:** This 183-day test under **IRC §871(a)(2)** is a *separate, standalone test* from the Substantial Presence Test (§7701(b)(3)) used to determine resident/nonresident status. Days do not carry the same exemptions (e.g., the "exempt individual" F-1 carve-out for SPT does **not** apply here) — a student could be an NRA under SPT yet still be present ≥183 days in a single calendar year and trigger this rule. **Flag for engine: compute this day-count independently; do not reuse the SPT exempt-individual day count.**

```
IF individual is an NRA for the tax year
   AND has U.S.-source capital gain income not effectively connected to a U.S. trade/business
    IF days physically present in U.S. during the tax year < 183
        THEN gain = tax-exempt
    ELSE (days present >= 183)
        THEN gain = taxed at flat 30% (or treaty rate) on NET U.S.-source
             capital gains for the year, reported on Schedule NEC
        -> ROUTE TO HUMAN REVIEW if day count is near the 183 threshold
           (counting conventions can be fact-sensitive)
```

**Citation:** IRC §871(a)(2); Pub. 519, "Capital Gains and Losses."

---

## 7. Statutory Exemption — Bank Deposit Interest (IRC §871(i))

**Plain-English rule:** Interest on deposits with U.S. banks, savings-and-loan associations, credit unions, and insurance companies (the kind of plain savings/checking account a student would have) is **not taxable** to an NRA, provided it is not effectively connected with a U.S. trade or business. This is distinct from "portfolio interest" (§871(h)), which exempts certain registered-form debt obligation interest (e.g., many corporate/Treasury bonds) subject to additional requirements.

**Citation:** IRC §871(i)(2)(A); Pub. 519, "Interest Income."

```
IF income = interest paid by a U.S. bank, savings institution, or similar
   depositary institution on a deposit account
   AND not effectively connected with a U.S. trade or business
THEN tax = $0 (statutorily exempt); do not withhold; do not include in
     taxable income even though a 1099-INT may be issued informationally
```

---

## 8. Edge Cases and Human-Review Triggers

- **Mixed-source scholarships/stipends**: If a single payment combines a tuition-exempt portion and a taxable living-stipend portion and the institution's 1042-S does not clearly break this out -> ROUTE TO HUMAN REVIEW.
- **Dual-status years** (student becomes resident mid-year, e.g., crosses the 5-calendar-year F-1 exemption during the tax year): ECI/FDAP framework in this file assumes full-year NRA status. A dual-status year requires separate treatment for the resident and nonresident portions -> ROUTE TO HUMAN REVIEW (out of scope for this file; cross-reference residency-determination file).
- **Independent contractor / 1099 income** for services performed in the U.S. by an F-1 student: this is ECI, but F-1 work authorization rules (not tax rules) may make the underlying work itself unauthorized -> flag as a potential immigration-compliance issue, ROUTE TO HUMAN REVIEW (outside tax engine scope, but do not silently process).
- **Capital gains near the 183-day boundary**: see Section 6.
- **Any income item the engine cannot match to a row in the Section 5 lookup table**: ROUTE TO HUMAN REVIEW rather than guessing a default classification.
- **Treaty overrides**: This file intentionally does NOT hardcode treaty rates/exemptions. Every FDAP (and some ECI, e.g., teaching/research treaty articles) computation must call the separate treaty-lookup logic before finalizing tax owed.

---

## Sources

- IRS Publication 519, *U.S. Tax Guide for Aliens* (2025 revision): https://www.irs.gov/pub/irs-pdf/p519.pdf
- IRS, "Taxation of Nonresident Aliens": https://www.irs.gov/businesses/taxation-of-nonresident-aliens-international-tax-gap-series
- IRS, "Source of Income — Personal Service Income": https://www.irs.gov/individuals/international-taxpayers/source-of-income-personal-service-income
- IRS, "Nontaxable Types of Interest Income for Nonresident Aliens": https://www.irs.gov/individuals/international-taxpayers/nontaxable-types-of-interest-income-for-nonresident-aliens
- IRS, "Nonresident — Figuring Your Tax": https://www.irs.gov/individuals/international-taxpayers/nonresident-figuring-your-tax
- IRC §871 (26 U.S.C. §871) — Tax on nonresident alien individuals: https://codes.findlaw.com/us/title-26-internal-revenue-code/26-usc-sect-871/
- IRC §864(b)-(c) — Definition of trade or business within the United States; effectively connected income
- IRC §861/§862/§865 — Source rules
- IRC §1441 — Withholding of tax on nonresident aliens
- 26 CFR §1.871-7 — Taxation of nonresident alien individuals not engaged in U.S. business: https://www.law.cornell.edu/cfr/text/26/1.871-7
- IRS Publication 515, *Withholding of Tax on Nonresident Aliens and Foreign Corporations*: https://www.irs.gov/pub/irs-pdf/p515.pdf
- Form 1040-NR and Instructions (2025): https://www.irs.gov/pub/irs-pdf/i1040nr.pdf
