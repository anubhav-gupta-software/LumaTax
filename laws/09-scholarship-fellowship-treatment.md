# 09 — Scholarship and Fellowship Treatment for NRA F-1 Students

**Scope:** Detailed decision logic for taxability, withholding, and reporting of scholarship, fellowship, and grant income paid to nonresident alien (NRA) F-1/J-1/M-1/Q visa holders. Builds on the ECI/FDAP framework in File 03. Does not re-derive general ECI/FDAP mechanics or treaty-specific rates — see File 03 and the separate treaty-lookup file, respectively.

---

## 1. The Core Statutory Framework

Two Code sections govern this area and must both be applied, in sequence:

1. **IRC §117** — determines how much of a scholarship/fellowship is **excluded from gross income** in the first place (the "is it taxable at all" question).
2. **IRC §1441(b)** and its regulations — determine the **withholding rate** applied to whatever portion IS taxable, specifically for NRAs (the "how much gets withheld" question).

These are independent questions. A payment can be: fully excluded (no tax, no withholding); partially excluded; or fully taxable. Only the taxable part ever reaches the §1441 withholding step.

---

## 2. Step 1 — Is the Recipient a "Candidate for a Degree"? (Threshold Gate)

**Plain-English rule:** IRC §117 exclusion is available only to a person who is a **candidate for a degree** at an eligible educational organization (one with a regular faculty, curriculum, and regularly enrolled student body). Nearly all F-1 undergraduate and graduate students at accredited U.S. universities qualify as degree candidates. Non-degree-candidate recipients — e.g., postdoctoral fellows, visiting researchers not enrolled in a degree program, or high-school-equivalent non-degree exchange visitors — get **no exclusion at all**, even for amounts nominally labeled "tuition."

**Citation:** IRC §117(b)(2); Treas. Reg. §1.117-3; IRC §25A(b)(3)/§170(b)(1)(A)(ii) (eligible educational institution definition, cross-referenced by §117).

```
IF recipient is enrolled as a degree candidate (undergraduate or graduate)
   at an eligible educational organization
THEN proceed to Step 2 (qualified scholarship exclusion analysis)

ELSE (non-degree candidate: postdoc, visiting scholar, non-degree exchange
   visitor, etc.)
THEN:
    excluded_amount = $0
    entire scholarship/fellowship/grant = TAXABLE
    -> proceed directly to Step 3 (withholding rate) on the FULL amount
    -> FLAG: this is a common point of confusion; a "postdoctoral fellowship"
       or "training grant" is virtually always 100% taxable to an NRA
       regardless of what it's spent on. ROUTE TO HUMAN REVIEW if unclear
       whether recipient is formally enrolled as a degree candidate.
```

---

## 3. Step 2 — Qualified Scholarship Exclusion (Degree Candidates Only)

**Plain-English rule:** For a degree candidate, the exclusion under §117(a) applies ONLY to the portion of the award that pays for:
- Tuition and fees **required for enrollment or attendance**, and
- Fees, books, supplies, and equipment **required for courses of instruction**.

Everything else is taxable, including — explicitly, per the statute and regulations — **room and board, travel, research allowances not required for coursework, clerical help, and any amount designated as a stipend for general living expenses.**

**Citation:** IRC §117(b)(1); Treas. Reg. §1.117-3; IRS Pub. 970 (general scholarship taxability, cross-reference).

```
qualified_amount = amount actually used for:
    tuition + mandatory fees + required books/supplies/equipment
    (capped at the amount actually designated/available for these purposes
     under the terms of the grant)

nonqualified_amount = total_award - qualified_amount
    (room, board, stipend, travel, optional expenses, etc.)

IF degree_candidate = TRUE:
    excluded_amount = qualified_amount   # tax-free, IRC §117(a)
    taxable_amount  = nonqualified_amount
ELSE:
    excluded_amount = $0
    taxable_amount  = total_award
```

### 3a. The §117(c) Service-Condition Override (Critical Rule — Check Before Excluding Anything)

**Plain-English rule:** Regardless of the above, **no exclusion is ever allowed** for any portion of an award that represents **payment for teaching, research, or other services** the student is **required to perform as a condition of receiving the award** (e.g., a teaching assistantship or research assistantship stipend tied to performing TA/RA duties). That portion is **compensation**, taxed as **wages** — i.e., it becomes **ECI** under File 03, not FDAP scholarship income — even if the student uses every dollar of it on tuition.

A common companion rule (not itself an NRA-specific exclusion, but relevant context): a *tuition reduction/waiver* that accompanies a TA/RA assistantship is a separate benefit under §117(d) and is analyzed separately from the cash stipend; the stipend itself is never excludable under §117(c).

**Citation:** IRC §117(c)(1); IRC §3401(a) (amounts under §117(c) treated as wages for withholding purposes); IRC §117(d) (qualified tuition reduction, separate provision).

```
IF any portion of the award is paid CONDITIONED on the student performing
   teaching, research, or other services (e.g., TA/RA stipend)
THEN:
    that portion = ALWAYS TAXABLE, no §117(a) exclusion available
    classification = ECI (wages), per File 03
    reporting = Form W-2 (not 1042-S), subject to standard wage withholding
       under IRC §3402, NOT the §1441(b) scholarship withholding rates below
    -> do NOT apply the 14%/30% scholarship withholding logic in Section 4
       to this portion
```

---

## 4. Step 3 — Withholding Rate on the Taxable (Non-ECI) Portion

Once Steps 1-3a establish a `taxable_amount` that is genuinely scholarship/fellowship in character (not disguised compensation), apply NRA-specific withholding under **IRC §1441(b)**.

**Plain-English rule:** The default statutory withholding rate on U.S.-source taxable scholarship/fellowship/grant income paid to an NRA is **30%**. This is reduced to **14%** if **both** of the following are true:
1. The recipient is a nonresident alien **temporarily present in the U.S. under an F, J, M, or Q visa** (as a student, researcher, trainee, or grantee), **and**
2. The taxable amount is either (a) incident to a qualified scholarship to which §117(a) would apply (i.e., it's genuine scholarship/fellowship money, just not excludable because it's for room/board/stipend), or (b) granted by an organization described in §1441(b)(2) (tax-exempt orgs, governments, and certain other qualifying grantors).

If a tax treaty applies and specifies a lower rate (including full exemption), the treaty rate controls instead of 14%/30% — **this file does not compute treaty rates; call the treaty-lookup logic.**

**Citation:** IRC §1441(b); IRS, "Withholding Federal Income Tax on Scholarships, Fellowships, and Grants Paid to Nonresident Aliens"; IRS Pub. 515.

```
IF taxable_amount > 0 (from Steps 2/3a, excluding any ECI/wage portion):
    IF visa_status IN {F, J, M, Q}
       AND (amount is incident to a §117(a)-type qualified scholarship
            OR grantor is a §1441(b)(2)-described organization):
        base_withholding_rate = 14%
    ELSE:
        base_withholding_rate = 30%

    IF an income tax treaty between the U.S. and the recipient's country of
       tax residence (immediately prior to U.S. entry) provides a lower rate
       or full exemption for scholarship/fellowship income, AND recipient has
       filed Form W-8BEN (or equivalent certification) claiming the treaty
       benefit:
        applicable_rate = treaty_rate   # -> call treaty-lookup file
    ELSE:
        applicable_rate = base_withholding_rate

    withholding_due = taxable_amount * applicable_rate
```

**Edge case:** Withholding is required even if the student has no other U.S. tax liability and will ultimately be entitled to a refund on filing — withholding happens at payment time, refund (if any) is reconciled on Form 1040-NR.

---

## 5. Form 1042-S Reporting — Income Code and Reading the Form

Scholarship and fellowship grant payments to NRAs that are U.S.-source are reported by the paying institution on **Form 1042-S**, Box 1, using:

- **Income Code 16 — "Scholarship or fellowship grants."** (Verified against current IRS Form 1042-S instructions and confirmed independently by multiple university payroll-office references; this is the correct current code. Older/secondary sources online sometimes cite "Income Code 15" for this category — that figure is **outdated/incorrect** and should not be used. **Engine note:** read the income code directly from the 1042-S data field rather than hardcoding; if a 1042-S arrives with an unexpected code paired with "scholarship" narrative, ROUTE TO HUMAN REVIEW rather than assuming.)

The same income code (16) is used whether the amount is ultimately taxable or treaty-exempt — the **distinguishing fields are Box 3a/4a (Exemption Code) and Box 3b/4b (Tax Rate)**, not a different income code. A compensation-for-services portion tied to §117(c) duties, by contrast, is reported on **Form W-2**, not Form 1042-S, and carries income-code logic from File 10 instead.

### Decision Logic — Given a 1042-S with Income Code 16

```
INPUT: Form 1042-S with Box 1 Income Code = 16
       Box 2 = Gross income
       Box 3a or 4a = Exemption code (e.g., "04" = exempt under tax treaty;
                       other codes indicate taxable / statutory withholding)
       Box 3b or 4b = Tax rate actually applied
       Box 7a = Federal tax withheld

STEP 1: exemption_code = read(Box 3a/4a)
STEP 2:
    IF exemption_code indicates "exempt under treaty":
        taxable_amount_for_1040NR = $0 (or treaty-limited partial amount if
            the treaty caps the exemption at a dollar threshold -> treaty file)
        -> report gross amount on Form 1040-NR Schedule OI (treaty disclosure)
           but NOT as taxable income on Schedule 1
    ELSE IF exemption_code indicates "not exempt" / statutory withholding applied:
        taxable_amount_for_1040NR = Box 2 (gross income), REDUCED by any
            amount the student can independently substantiate as excluded
            §117(a) qualified tuition/fees NOT already backed out by the
            institution (institutions typically already withhold only on the
            non-qualified portion, so Box 2 is often already net of tuition —
            verify against the institution's own breakdown/award letter;
            do not double-subtract)
        withheld_amount = Box 7a (credit this against total tax liability)
STEP 3: -> flow taxable_amount_for_1040NR to Form 1040-NR, Schedule 1, Line 8r
         (for amounts not already reported on a W-2), which flows to
         Form 1040-NR, Line 8 (total income), then combines with other
         income for the graduated-rate computation.

    NOTE ON RATE TREATMENT: taxable non-compensatory scholarship/fellowship
    income is reported on Schedule 1, Line 8r -> Form 1040-NR Line 8 (total
    income), and is taxed at the SAME GRADUATED RATES as ECI once included
    in taxable income on Form 1040-NR. This is a specific statutory/
    procedural convention for scholarship income, distinct from dividends/
    interest/other classic FDAP items, which stay on Schedule NEC and are
    taxed at a flat 30% (or treaty rate).
    -> ENGINE RULE: taxable scholarship amounts flow through Schedule 1 ->
       Form 1040-NR Line 8 -> taxed at graduated rates, NOT flat 30%, UNLESS
       a treaty or other provision states otherwise. The 14%/30% figures in
       Section 4 are WITHHOLDING rates (amounts collected during the year),
       which are credited against the final graduated-rate liability on the
       return — they are not necessarily the FINAL effective tax rate.
```

**Important engine distinction — withholding rate ≠ final tax rate:** The 14%/30% under §1441(b) governs what the institution must *withhold at the time of payment*. The amount ultimately owed is computed on Form 1040-NR using graduated rates (because taxable scholarship income, per the IRS instructions for Schedule 1/Form 1040-NR, is included in income taxed at graduated rates, not reported on Schedule NEC). Withholding shown in 1042-S Box 7a is a **credit** against that computed liability, which may produce a refund or additional balance due. **This is a frequent source of confusion and a good candidate for an explanatory UI note to the student**, but the computation itself is mechanical: compute graduated tax on total taxable income (including the scholarship amount), then subtract total withholding credits (1042-S Box 7a + W-2 withholding) to get refund/balance due.

---

## 6. Degree Candidate vs. Non-Degree Candidate — Summary Table

| Recipient type | Tuition/fees/required books portion | Room/board/stipend/living portion | Service-conditioned stipend (TA/RA) |
|---|---|---|---|
| Degree candidate (typical F-1 undergrad/grad) | Excluded under §117(a) | Taxable; 14% withholding (F/J/M/Q) or 30%, or treaty rate; reported 1042-S code 16 | Taxable as wages (ECI); W-2; no §117 exclusion ever (§117(c)) |
| Non-degree candidate (postdoc fellow, visiting researcher, non-degree exchange visitor) | NOT excluded — fully taxable | Fully taxable; same withholding logic | Taxable as wages (ECI), same as above |

---

## 7. Interaction with Tax Treaties (Flag Only — Do Not Re-Derive Here)

Many U.S. income tax treaties contain a specific scholarship/fellowship article (commonly modeled on the OECD framework) that exempts some or all U.S.-source scholarship/fellowship income for students/trainees who were residents of the treaty country immediately before entering the U.S., sometimes with a time limit (e.g., exemption only during a reasonable/defined period of study) or a monetary cap, and sometimes covering an associated amount of compensation for services. **This file flags the existence and interaction point only:**

```
IF recipient claims a treaty benefit for scholarship/fellowship income:
    1. Recipient must have been a tax resident of the treaty country
       immediately before U.S. entry (per Pub. 519 and the specific treaty
       article).
    2. Recipient must properly claim the benefit (Form W-8BEN to the
       withholding agent, and/or Form 8233 if a services-compensation
       component is involved, and treaty disclosure on Form 1040-NR
       Schedule OI at filing).
    3. -> CALL TREATY-LOOKUP FILE for country-specific article, exemption
       amount/duration, and any conditions (e.g., "exemption lost
       retroactively if recipient becomes resident alien before the exempt
       period ends" — a known trap in several treaties).
    4. -> ROUTE TO HUMAN REVIEW if treaty claims combine scholarship
       exemption with other treaty articles (e.g., student clause overlapping
       with employment-income clause) in a way the lookup table doesn't
       cleanly resolve.
```

---

## 8. Edge Cases and Human-Review Triggers

- **Institution issues 1042-S Box 2 already net of excluded tuition** vs. **gross with separate breakdown letter**: practice varies by school; engine must not assume consistent formatting. If the student's own award letter breakdown conflicts with 1042-S Box 2, ROUTE TO HUMAN REVIEW.
- **No 1042-S issued at all** (common when 100% of the award is tuition-only and therefore nothing taxable/withholdable) — confirm this is consistent with Step 2 analysis before treating the student as having no scholarship-reporting obligation.
- **Mixed TA/RA stipend + separate fellowship in the same year**: likely two different reporting streams (W-2 for the service-conditioned part, 1042-S for any separate non-service fellowship) — do not merge without decomposing per Section 3a.
- **Scholarship from a foreign government/foreign university** paid to a student temporarily in the U.S.: check sourcing rule in File 03 Section 4 first — may be foreign-source and entirely outside U.S. tax regardless of §117/§1441.
- **Treaty exemption with a dollar cap** (some treaties exempt only up to a stated annual amount, with excess taxable under the normal rules above): ROUTE TO TREATY FILE for the cap amount; do not assume full exemption.
- **Recipient's degree-candidate status is ambiguous** (e.g., provisional admission, non-matriculated status, bridge/pathway program): ROUTE TO HUMAN REVIEW — this is the single highest-leverage classification decision in this file since it gates the entire §117(a) exclusion.
- **Any case where the amount reported on 1042-S Box 2 does not match the sum of what the student reports as received**: ROUTE TO HUMAN REVIEW before filing.

---

## Sources

- IRC §117 — Qualified scholarships (statutory text): https://irc.bloombergtax.com/public/uscode/doc/irc/section_117
- IRC §1441(b) — Withholding of tax on nonresident aliens (scholarship/fellowship withholding rate)
- IRS, "Withholding Federal Income Tax on Scholarships, Fellowships, and Grants Paid to Nonresident Aliens": https://www.irs.gov/individuals/international-taxpayers/withholding-federal-income-tax-on-scholarships-fellowships-and-grants-paid-to-nonresident-aliens
- IRS Publication 515, *Withholding of Tax on Nonresident Aliens and Foreign Corporations*: https://www.irs.gov/pub/irs-pdf/p515.pdf
- IRS Publication 519, *U.S. Tax Guide for Aliens*: https://www.irs.gov/pub/irs-pdf/p519.pdf
- IRS, Form 1042-S and 2025/2026 Instructions for Form 1042-S (Income Code table, Box 1): https://www.irs.gov/pub/irs-pdf/f1042s.pdf and https://www.irs.gov/instructions/i1042s
- IRS, 2025 Instructions for Form 1040-NR (Schedule 1, Line 8r; Schedule OI treaty disclosure): https://www.irs.gov/pub/irs-pdf/i1040nr.pdf
- Treas. Reg. §1.117-3 (definitions: scholarship, candidate for a degree)
- IRC §117(c) and §3401(a) (service-conditioned amounts treated as wages)
- IRS Pub. 970, *Tax Benefits for Education* (general scholarship taxability background, cross-reference)
