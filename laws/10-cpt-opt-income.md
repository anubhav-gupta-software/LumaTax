# 10 — CPT/OPT Income Tax Treatment

**Scope:** Tax treatment of wages earned by F-1 students under Curricular Practical Training (CPT) and Optional Practical Training (OPT), including the 24-month STEM OPT extension. This file establishes that CPT/OPT income is **ordinary ECI wage income** — not a special tax category — and addresses the FICA-withholding failure mode that commonly confuses both employers and students. This file does not re-derive the full ECI/FDAP framework (File 03), the full §117/§1441 scholarship logic (File 09), the Substantial Presence Test "exempt individual" mechanics, or state-tax specifics — each is cross-referenced to its own file.

---

## 1. The Core Rule: CPT/OPT Wages Are Plain ECI

**Plain-English rule:** CPT and OPT are **immigration work-authorization categories** (governed by DHS/USCIS regulations under 8 CFR §214.2(f)), not tax categories. The Internal Revenue Code does not contain a special rule for "CPT income" or "OPT income." Wages earned under CPT or OPT are taxed exactly like any other wages earned by a nonresident alien performing personal services in the United States:

- Classified as **Effectively Connected Income (ECI)** because the performance of personal services in the U.S. constitutes engaging in a U.S. trade or business (IRC §864(b)).
- Taxed at **graduated rates** (IRC §1/§11 brackets) on a **net** basis, same mechanism as any other NRA wage income.
- Reported by the employer on **Form W-2** (not Form 1042-S, which is for FDAP/scholarship-type payments).
- Filed by the student on **Form 1040-NR**, Line 1a (wages), subject to the same NRA deduction restrictions described in File 03 (generally no standard deduction, with the narrow India-treaty Article 21(2) exception).
- Subject to regular federal income tax withholding under IRC §3402, using the IRS's special nonresident-alien wage withholding adjustment procedure (Pub. 515, "Withholding on Wages" — employers add a fixed amount to NRA wages before applying withholding tables to approximate the unavailable standard deduction; this is a payroll mechanic, not a change in tax classification).

**Citation:** IRC §871(b); IRC §864(b); IRC §3402; Form 1040-NR Instructions; Pub. 515.

### Why People Confuse This (Flag for Product/UX, Not a Tax Rule)

Students and even some payroll departments sometimes assume CPT/OPT income gets special tax treatment because:
1. It is tied to a specific, time-limited **immigration authorization** (EAD card for OPT; CPT authorization on Form I-20) that students closely track, leading them to conflate immigration status with tax status.
2. It frequently **coincides** with the FICA exemption (Section 3 below), which IS a real, distinct tax rule — but the FICA exemption is about Social Security/Medicare, not income tax, and does not change the income-tax (ECI, graduated-rate, Form 1040-NR) treatment at all.
3. OPT employment often starts/stops the same calendar year a student's visa status or SPT exemption changes, creating partial-year complexity that gets misattributed to "OPT having its own rules" rather than ordinary dual-status-year mechanics.

```
IF income_source = CPT employment OR OPT employment OR STEM OPT employment
THEN:
    classification = ECI  (same as any other NRA wage income; see File 03 §2)
    tax_basis = NET, graduated rates
    reporting_form = W-2 -> Form 1040-NR Line 1a
    NO special income-tax rule applies beyond standard NRA wage treatment
```

---

## 2. STEM OPT Extension (24-Month Extension) — No Special Income Tax Rules

**Plain-English rule:** The STEM OPT extension (an additional 24 months of OPT for students with qualifying STEM degrees, for up to 36 months of OPT total) is purely an immigration-law extension of work authorization. It carries **additional employer compliance obligations under immigration law** (e.g., Form I-983 Training Plan, E-Verify employer requirement) but **no additional or different federal income tax rules**. Income tax treatment remains identical to Section 1 above for the entire STEM OPT period.

**The only tax-relevant issue that commonly arises during STEM OPT is a residency-status transition**, not a STEM-specific rule: because STEM OPT can extend a student's authorized stay well past their first 5 calendar years in F-1 status, a student working under STEM OPT is more likely than one on regular (12-month) OPT to **cross the 5-calendar-year Substantial Presence Test exemption** during the OPT period and become a **resident alien** for tax purposes partway through — potentially triggering a dual-status tax year. This is a residency-determination issue, not an OPT-income-classification issue.

**Citation:** 8 CFR §214.2(f)(10)(ii)(C) (STEM extension, immigration reg.); IRC §7701(b)(5) (5-calendar-year F-1 exempt-individual rule — full mechanics in the SPT/residency file, not re-derived here).

```
IF student is in STEM OPT period
THEN:
    income tax classification/rate rules = IDENTICAL to Section 1 (no special
        STEM rule exists)
    -> CHECK: has the student's F-1 5-calendar-year SPT exemption lapsed
       during this period? (cross-reference SPT/residency-determination file)
    IF yes -> ROUTE TO dual-status-year / residency-transition logic
       (out of scope for this file)
    IF no -> continue applying NRA wage treatment as normal
```

---

## 3. FICA Exemption Interaction (Cross-Reference Only)

**Plain-English rule:** Separate from income tax, F-1 students performing CPT/OPT/STEM OPT work are generally **exempt from FICA (Social Security and Medicare) tax withholding** under **IRC §3121(b)(19)**, for as long as they remain a nonresident alien **and** an "exempt individual" for Substantial Presence Test purposes (generally the first 5 calendar years of F-1 status) **and** the work is authorized under, and performed to carry out the purpose of, their F-1 status (which CPT and OPT, by definition, are). This file does not re-derive the full FICA exemption rule, the exempt-individual/SPT mechanics, or the 5-calendar-year counting convention — **see the dedicated FICA-exemption file** for that logic. The point relevant here is narrower:

```
IF employee is on F-1 status performing CPT, OPT, or STEM OPT work
   AND employee is still a nonresident alien / "exempt individual" for SPT
       purposes (not yet past the 5-calendar-year F-1 threshold)
THEN wages from this employment = FICA-EXEMPT (no Social Security/Medicare
    withholding should occur), REGARDLESS of income-tax (ECI) treatment above
    -> this is a withholding-mechanics rule, fully independent of the
       income-tax computation in Sections 1-2
    -> full exemption logic lives in the FICA-exemption file; this file only
       flags the interaction point and the common failure mode below
```

**Once the student is no longer an "exempt individual"** (post-5-year F-1 presence, or has otherwise become a resident alien), **FICA exemption ends** even if the student is still technically employed under an OPT/STEM OPT EAD — the immigration work authorization continuing does not extend the tax exemption. This is a frequent edge case for STEM OPT workers (36 months can straddle the 5-year mark).

---

## 4. Common Failure Mode: Employer Mistakenly Withholds FICA — Form 843 Refund Process

**Plain-English rule:** A very common real-world problem: payroll systems are often not configured to recognize F-1/CPT/OPT FICA-exempt status, and employers mistakenly withhold Social Security and Medicare tax from exempt students' paychecks. The IRS-prescribed remedy has two stages:

### Stage 1 — Request Correction From the Employer First (Required)

The student must first ask the employer to refund the over-withheld FICA tax and issue a corrected Form W-2 / Form 941-X correction. The IRS **requires** this step before it will consider a direct refund claim from the employee — the employer is the party that actually remitted the tax and is in the best position to correct it (and may itself claim an offsetting credit on its own employment tax return).

### Stage 2 — If Employer Refuses or Cannot Refund: File Form 843 With the IRS Directly

If the employer will not or cannot refund the erroneously withheld FICA tax, the employee may file directly with the IRS using:

- **Form 843**, *Claim for Refund and Request for Abatement* — the actual refund claim.
- **Form 8316**, *Information Regarding Request for Refund of Social Security Tax Erroneously Withheld on Wages Received by a Nonresident Alien on an F, J, or M Type Visa* — a required supporting statement attached to Form 843 that certifies the IRC §3121(b)(19) exemption basis and that the employer was asked first and declined/failed to refund.
- Supporting documents typically required: W-2(s) showing the erroneous withholding, copies of EAD/I-20 (OPT/CPT authorization) or I-94, visa documentation, and a written statement/proof that the employer was asked for a refund and refused (or a statement that the employer cannot be located/is unresponsive).

**Time limit:** The general refund statute of limitations applies — the later of **3 years from the date the original return was filed** or **2 years from the date the tax was paid**.

**Citation:** IRC §3121(b)(19); Form 843 and Instructions; Form 8316.

```
IF employer withheld Social Security/Medicare tax from CPT/OPT/STEM-OPT wages
   AND employee was FICA-exempt per Section 3 at the time
THEN:
    STEP 1: employee requests refund + W-2 correction from employer
    IF employer refunds -> resolved; corrected W-2 used for filing; no
        Form 843 needed
    IF employer refuses/fails to respond/cannot be reached ->
        STEP 2: file Form 843 + Form 8316 + supporting docs directly with IRS
        -> within statute of limitations (later of 3 yrs from filing date or
           2 yrs from date tax was paid)
    -> ROUTE TO HUMAN REVIEW if: (a) employer partially refunds, (b) multiple
       employers involved in the same year with different withholding
       errors, or (c) student has already crossed the 5-year exempt-
       individual threshold mid-year, making exemption eligibility for part
       of the wages fact-dependent
```

**This Form 843/8316 process is entirely independent of the income-tax return (Form 1040-NR).** It does not flow through Form 1040-NR and is filed as its own standalone claim; the engine should treat it as a parallel workflow, not a line item on the income tax return.

---

## 5. State Tax Implications (Flag Only — Full Rules Live in State Tax File)

**Plain-English rule:** CPT/OPT wage income is, as a general matter, taxed by states the same way as any other wage income: based on the state(s) where the work was **physically performed** (and, for some states, where the employee resides/is domiciled, which for an NRA F-1 student is typically the state of physical presence while studying/working). There is **no federal preemption or special state exemption for CPT/OPT wages** as such — a state either taxes wages earned within its borders or it doesn't (a handful of states have no personal income tax at all, e.g., Texas, Florida; this is a general state-law feature, not an OPT-specific rule). Multi-state issues (e.g., remote OPT work for an out-of-state employer, or a student relocating mid-year for a new OPT job) follow ordinary state sourcing/apportionment rules.

```
IF state tax question arises re: CPT/OPT wages
THEN -> ROUTE TO dedicated state-tax file for sourcing/apportionment rules,
     reciprocity agreements, and state-specific NRA treatment (most states
     piggyback on federal NRA/ECI classification but some have quirks)
-> DO NOT attempt to resolve state tax questions within this file
```

---

## 6. Edge Cases and Human-Review Triggers

- **Pre-completion OPT / CPT overlapping with on-campus employment in the same pay period**: ensure wages aren't double-reported or misclassified; verify against W-2(s) issued.
- **Unpaid or stipend-style CPT (e.g., CPT tied to a course credit with a nominal/no stipend)**: confirm whether any payment exists at all before applying this file; a zero/near-zero payment may not trigger a filing requirement for that income item (though Form 8843 filing for presence/status purposes still applies — separate from income tax, not covered here).
- **Student crosses the 5-calendar-year F-1 exempt-individual threshold mid-year while on OPT/STEM OPT**: wages before the threshold are FICA-exempt; wages after are not — this requires a split calculation within a single employer relationship. -> ROUTE TO HUMAN REVIEW / residency-transition logic.
- **Employer issues a 1099-NEC instead of a W-2** for OPT work (misclassifying the student as an independent contractor): still ECI (personal services performed in U.S.), but changes withholding mechanics (no withholding at all vs. under-withholding) and may indicate the arrangement is not valid under OPT work-authorization rules (immigration issue, flag separately) -> ROUTE TO HUMAN REVIEW.
- **STEM OPT employer fails E-Verify/I-983 compliance**: immigration-compliance issue, not a tax issue, but may signal the work authorization itself is questionable -> flag for awareness, do not let it alter the tax computation on its own.
- **Partial-year FICA exemption with retroactive employer correction** spanning a prior tax year: Form 843 claims can span a different year than the current return being prepared -> treat as a separate, year-specific claim.

---

## Sources

- IRC §864(b) — Engaging in trade or business within the United States (personal services rule)
- IRC §871(b) — Tax on nonresident alien individuals engaged in U.S. business (ECI, graduated rates)
- IRC §3121(b)(19) — FICA exemption for nonresident alien students/teachers/trainees on F, J, M, Q visas
- IRC §3402 / IRC §7701(b)(5) — Wage withholding; 5-calendar-year F-1 exempt-individual rule (full mechanics in SPT/residency file)
- IRS Publication 515, *Withholding of Tax on Nonresident Aliens and Foreign Corporations* (NRA wage withholding adjustment procedure): https://www.irs.gov/pub/irs-pdf/p515.pdf
- IRS Publication 519, *U.S. Tax Guide for Aliens*: https://www.irs.gov/pub/irs-pdf/p519.pdf
- Form 1040-NR and Instructions: https://www.irs.gov/pub/irs-pdf/i1040nr.pdf
- Form 843, *Claim for Refund and Request for Abatement*: https://www.irs.gov/forms-pubs/about-form-843
- Form 8316, *Information Regarding Request for Refund of Social Security Tax Erroneously Withheld on Wages Received by a Nonresident Alien on an F, J, or M Type Visa*: https://www.irs.gov/forms-pubs/about-form-8316
- 8 CFR §214.2(f) — CPT, OPT, and STEM OPT extension regulations (DHS/USCIS; immigration law, not Title 26, cited for work-authorization context only)
- Study in the States (DHS), "STEM OPT Frequently Asked Questions": https://studyinthestates.dhs.gov/stem-opt-hub/additional-resources/stem-opt-frequently-asked-questions
