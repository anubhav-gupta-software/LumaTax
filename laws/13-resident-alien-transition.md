# 13 — Resident Alien Transition: Dual-Status Mechanics for F-1 Students Who Exhaust the Exemption / Meet SPT

**Scope:** This file governs the mechanics once an F-1 (or former F-1) student stops being an "exempt individual" (File 02) and either (a) meets the Substantial Presence Test (SPT) for the first time, becoming a resident alien mid-year or from the start of a year, or (b) experiences any other event producing a dual-status year (nonresident alien for part of the year, resident alien for the rest). It covers: computing the residency starting date in the transition year, which form(s) to file, the mandatory "dual-status statement," the restrictions that apply specifically in a dual-status year, and the tax regime the person moves into as a full-year resident alien going forward (worldwide income, FICA, etc.).

**Primary authority:** IRC §7701(b); Treas. Reg. §§301.7701(b)-4, -7; IRS Publication 519 (2025), Chapters 1 and 6, "Dual-Status Tax Year"; IRC §3121(b)(19) and (b)(10) (FICA); IRC §6013(g)/(h).

**Dependency:** This file consumes the outputs of File 01 (residency tests, residency start/end dates) and File 02 (exempt-individual clock). It does not recompute those tests; it assumes `residency_start_date`, `residency_end_date`, and the current year's resident/nonresident split are already known.

---

## 1. When Does a Dual-Status Year Occur?

**Plain English:** A dual-status year happens whenever a person is a nonresident alien for part of a calendar year and a resident alien for the rest of it. For LumaTax's typical F-1 user, this happens in exactly one of two moments:

1. **The year the 5-calendar-year (or 2-of-6) exemption clock runs out** and SPT is met for the first time partway through counting (though note: because the SPT look-back includes weighted prior-year days, a person can sometimes satisfy SPT from January 1 itself if enough countable days already existed in the two prior years — producing a FULL resident year rather than a dual-status year. Dual status specifically arises only when the `residency_starting_date` computed in File 01 Section 5 falls **after** January 1).
2. **The year of a status change** (e.g., F-1 → H-1B) where countable (non-exempt) days begin mid-year and accumulate enough to meet SPT before year-end.

It can also occur in a departure year (resident alien who leaves the U.S. permanently and has an earlier residency termination date under File 01 Section 5.2), though this is less common for a student whose trajectory is usually "arrive as NRA → become RA" rather than the reverse.

**Citation:** Pub. 519 (2025), p.9 ("Dual-Status Aliens"); p.45 ("Dual-Status Tax Year" introduction).

```
FUNCTION IS_DUAL_STATUS_YEAR(individual, year):
    start = File01.RESIDENCY_STARTING_DATE(individual, year)
    end   = File01.RESIDENCY_ENDING_DATE(individual, year)

    was_resident_entire_year = (start == Jan_1_of(year)) AND (end == Dec_31_of(year))
    was_nonresident_entire_year = (start == NULL AND end == NULL)
         // i.e., individual was never a resident this year under either test

    IF was_resident_entire_year OR was_nonresident_entire_year:
        RETURN FALSE   // full-year resident or full-year nonresident; NOT dual-status

    RETURN TRUE   // resident for only PART of the year -> dual-status
```

```
EXCEPTION — married election overrides: if the individual (or their
spouse) makes the §6013(g) "Nonresident Spouse Treated as a Resident"
election OR the §6013(h) "Choosing Resident Alien Status" election
(File 01, Section 7), the dual-status restrictions in this file (Section
4) DO NOT APPLY for that year, even though the person was technically a
nonresident alien for part of the year. These elections convert the
WHOLE year to resident-alien treatment for filing purposes.
-> ROUTE TO HUMAN REVIEW before applying: these elections are
   consequential (irrevocable or hard-to-revoke, require marriage to a
   USC/RA, mandate a joint return and worldwide income reporting for
   BOTH spouses) and should never be auto-selected by the engine.
```

---

## 2. Computing the Residency Starting Date in the Transition Year

This is fully specified in **File 01, Section 5.1** (`RESIDENCY_STARTING_DATE`) and is not re-derived here. The key output this file needs is a single date, `residency_start_date`, which splits the tax year into:

```
Period A ("nonresident period"): January 1 -> (residency_start_date - 1)
Period B ("resident period"):    residency_start_date -> December 31
```

**Reminder of the SPT-based rule (File 01 Sec 5.1), restated for this file's context:** if the transition is driven by SPT (the typical F-1 case), `residency_start_date` = the first day of actual physical presence in the transition year, subject to the up-to-10-day de minimis exclusion if the individual can establish a closer connection to a foreign country and a foreign tax home for those specific days (requires a timely-filed statement).

```
EDGE CASE SPECIFIC TO THE F-1 TRANSITION SCENARIO: because exempt-
individual days (File 02) are excluded from the SPT COUNT, but are
STILL days of physical presence, a student whose exemption clock runs
out mid-way through an academic year may have been physically present
in the U.S. since January 1 of the transition year (e.g., still
enrolled, in the country the whole time) even though the exemption
itself ends on a specific date determined by File 02's year-boundary
logic (File 02 Section 2.2's year-count mechanic). In that common
scenario:
    residency_start_date = January 1 of the transition year (the
    FIRST DAY PHYSICALLY PRESENT, per File 01 Sec 5.1 -- the exemption
    expiring mid-year does NOT itself create a later starting date;
    it only determines which days COUNT. Once the exemption no longer
    protects ANY days that year, and the weighted SPT math using those
    now-countable days plus prior-year carryover pushes the person over
    183, the starting date reverts to the literal first-day-present
    rule, which for a continuously-present student is January 1).
    -> PRACTICAL IMPLICATION: many F-1 students whose exemption expires
       mid-year end up as FULL-YEAR residents for that year (not
       dual-status), because they were physically present from Jan 1.
       Dual-status years are more common in the ARRIVAL year (first
       year in the U.S., mid-year entry) or in visa-status-change
       scenarios with an actual travel gap. -> Re-run
       IS_DUAL_STATUS_YEAR() (Section 1) explicitly rather than
       assuming every "exemption expires this year" case is dual-status.
```

---

## 3. Dual-Status Return Mechanics — Which Form(s) to File

**Plain English:** Which primary form you file depends entirely on your status on the **last day of the tax year** (December 31), not on which status applied for more of the year.

**Citation:** Pub. 519 (2025), p.48, "Forms To File."

```
FUNCTION WHICH_FORMS_TO_FILE(individual, year):

    status_on_dec_31 = determine_status_on(individual, Dec_31_of(year))

    IF status_on_dec_31 == "RESIDENT_ALIEN":
        // Became resident during the year AND still resident at year-end
        primary_form = "Form 1040 or 1040-SR"
        primary_form_annotation = 'Check "Other" checkbox at top of
            return; write "Dual-Status Return" on the entry line.'
        attachment = "Statement showing income for the NONRESIDENT
            portion of the year (Period A)."
        attachment_vehicle = 'Can use Form 1040-NR as the statement
            format; check "Other" checkbox and write "Dual-Status Stmt"
            on ITS entry line (it is a statement, not a separately
            filed return).'
        due_date_basis = "Resident-alien due date rules" (Section 6)

    ELSE IF status_on_dec_31 == "NONRESIDENT_ALIEN":
        // Was resident earlier in the year, gave up residence before
        // year-end (less common for students; more relevant to a
        // departure scenario)
        primary_form = "Form 1040-NR"
        primary_form_annotation = 'Check "Other" checkbox at top of
            return; write "Dual-Status Return" on the entry line.'
        attachment = "Statement showing income for the RESIDENT portion
            of the year (Period B)."
        attachment_vehicle = 'Can use Form 1040 or 1040-SR as the
            statement format; check "Other" checkbox and write
            "Dual-Status Stmt" on ITS entry line.'
        due_date_basis = "Nonresident-alien due date rules" (Section 6)

    RETURN { primary_form, attachment, annotations }
```

```
STATEMENT CONTENT REQUIREMENT: the attached statement must show name,
address, and TIN. NO SEPARATE SIGNATURE is required on the statement --
the signature on the primary return covers all attached statements and
schedules.

E-FILING CAUTION: Dual-status taxpayers CANNOT e-file their U.S. income
tax return (confirmed current for tax year 2025 per Pub. 519). -> ENGINE
MUST ROUTE DUAL-STATUS RETURNS TO A PAPER-FILE WORKFLOW, not the
standard e-file pipeline. This is a hard platform-routing rule, not
just an edge case.

EXPATRIATION OVERLAY: if the individual expatriated or terminated U.S.
residency during the year in a way that triggers §877A, Form 8854 may
also be required -> ROUTE TO HUMAN REVIEW (out of scope for the typical
F-1 arrival-transition scenario, relevant mainly to former-LPR
departures; see File 01 Section 2's LTR note).
```

### 3.1 The "Dual-Status Statement" — common confusion to engineer around

```
CLARIFICATION: there is no IRS form literally named "Dual-Status
Statement." The term refers to the ATTACHED STATEMENT described above
(using the OTHER form -- 1040-NR or 1040/1040-SR -- as the statement's
format, annotated "Dual-Status Stmt"). The engine's document-generation
step must:
    1. Generate the PRIMARY return (1040 or 1040-NR, per Section 3
       logic) covering ONLY the period-appropriate income per the
       computation in Section 5.
    2. Generate a SECOND document using the OTHER form's layout,
       populated with the OTHER period's income, annotated as the
       "Dual-Status Stmt," NOT e-filed/transmitted as an independent
       return -- it is an attachment PDF.
    3. Attach Form 8843 if any exempt-individual days were claimed in
       the nonresident period (File 02).
    4. Attach Form 1116 if a foreign tax credit is claimed (common for
       students with home-country-sourced scholarship income taxed
       abroad -- see File 05/09 cross-reference, not re-derived here).
```

---

## 4. Restrictions That Apply ONLY in a Dual-Status Year

**Citation:** Pub. 519 (2025), pp.45–46, "Restrictions for Dual-Status Taxpayers."

```
RESTRICTION 1 -- Standard deduction:
    CANNOT use the standard deduction on Form 1040/1040-SR.
    CAN itemize allowable deductions (Schedule A) instead.
    -> NOTE: this is a DIFFERENT rule from the general NRA restriction
       on the standard deduction (File 03's discussion of the US-India
       treaty Article 21(2) exception for Indian students/business
       apprentices, which allows the STANDARD deduction during a
       NONRESIDENT-only year). Pub. 519's dual-status chapter does NOT
       state a treaty exception to the no-standard-deduction rule for
       dual-status returns specifically. -> DO NOT assume the India
       treaty standard-deduction allowance carries over into a
       dual-status year without confirming current guidance ->
       ROUTE TO HUMAN REVIEW for any Indian student in a dual-status
       transition year who would otherwise want to claim it.

RESTRICTION 2 -- Head of household:
    CANNOT use the Head of Household tax table column / computation
    worksheet.

RESTRICTION 3 -- Joint return:
    CANNOT file a joint return, PERIOD -- EXCEPT via the §6013(g) or
    §6013(h) elections (File 01 Section 7), which convert the whole
    year to resident treatment and REMOVE this chapter's restrictions
    entirely for that year (Section 1's exception, above).

RESTRICTION 4 -- Tax rate / filing-status computation for the
nonresident portion:
    If married and an NRA for all or part of the year, and NOT
    electing joint filing: must use the MARRIED FILING SEPARATELY
    tax table/computation worksheet for income effectively connected
    with a U.S. trade or business. Cannot use the married-filing-jointly
    or single columns.
    NARROW EXCEPTION: may file as "single" if lived apart from spouse
    during the last 6 months of the year AND is a married resident of
    Canada, Mexico, or South Korea, OR a married U.S. national.
    -> Rare for the F-1 population but should exist in the engine's
       rule table for completeness; -> ROUTE TO HUMAN REVIEW if
       detected (uncommon enough that auto-handling risk outweighs
       benefit).

RESTRICTION 5 -- Dependents:
    Dual-status taxpayers CAN generally claim dependents (qualifying
    child/relative), SUBJECT TO the same NRA dependent restrictions
    that apply generally (full dependent rules are out of scope for
    this file -- see dependents/credits file if one exists; flag for
    cross-reference). U.S. nationals and residents of Canada/Mexico get
    dependent rules identical to U.S. citizens; residents of South
    Korea or India have separate treaty-based rules.

RESTRICTION 6 -- Certain credits unavailable absent a joint-resident
election:
    CANNOT claim education credits, Earned Income Credit (EIC), or the
    credit for the elderly/disabled UNLESS married and electing full-
    year resident treatment via a joint return with a U.S. citizen/
    resident spouse (Section 1 exception).
    Child Tax Credit / Additional CTC / Credit for Other Dependents
    REMAIN available subject to their own SSN/ITIN/ATIN and residency-
    of-the-child requirements (not restricted by dual-status per se).
    Foreign tax credit, child/dependent care credit, retirement savings
    contribution credit (saver's credit), and adoption credit each have
    their OWN specific dual-status interaction rules (see Pub. 519 Ch.
    6, "Tax Credits and Payments") -- notably, the child/dependent care
    credit and adoption credit are ALSO limited to joint-filers or
    certain "married living apart" fact patterns for dual-status
    taxpayers.
```

### 4.1 How Income Is Computed and Taxed Within the Dual-Status Year

**Citation:** Pub. 519 (2025), p.46, "How To Figure Your Tax" / "Income."

```
FUNCTION COMPUTE_DUAL_STATUS_TAX(individual, year, period_A_end, period_B_start):

    // Period A = nonresident portion; Period B = resident portion

    period_B_income = ALL income received during Period B, REGARDLESS OF
        SOURCE (worldwide), REGARDLESS of when it was EARNED (even if
        earned during Period A but RECEIVED during Period B, it is
        taxed as resident income -- cash/accrual timing of RECEIPT
        controls, not when earned)

    period_A_income = ONLY:
        (a) U.S.-source income, AND
        (b) certain foreign-source income that is effectively connected
            with a U.S. trade or business (rare for students; see
            File 03's ECI/FDAP sourcing rules)
        -- regardless of when EARNED, as long as RECEIVED during
           Period A. Foreign-source income that is NOT effectively
           connected is NOT taxable if received during Period A, even
           if earned while a resident alien later / or if the person
           later becomes a resident/citizen before year-end.

    combined_graduated_base = period_B_income (net of deductions)
        + period_A_income THAT IS effectively connected with a U.S.
          trade or business (net of allowable deductions)
        -> taxed at graduated IRC §1 rates (same table as citizens/
           residents)

    period_A_non_ECI_US_source_income = period_A_income that is FDAP
        (not effectively connected)
        -> taxed at flat 30% (or lower treaty rate), GROSS, no
           deductions allowed (see File 03)

    RETURN total_tax = TAX(combined_graduated_base) +
                        0.30 * period_A_non_ECI_US_source_income
                        (or treaty rate if applicable -> treaty lookup)
```

```
SPECIAL RULE -- Social Security / railroad retirement benefits spanning
the transition: 85% of benefits received during the NONRESIDENT period
is subject to the flat 30%-or-treaty rate; benefits received during the
RESIDENT period follow the normal graduated-rate "taxable portion"
worksheet (same as a full-year resident). The SSA/RRB will send ONE
combined-year statement (Form SSA-1042S or RRB-1042S/1099-R) that does
NOT separate the two periods -- the individual (or engine, from
payment-date records) must independently track which payments fell in
which period. -> Low relevance for most F-1 students (rarely receive
Social Security benefits) but included for completeness given the
platform's "comprehensive" requirement; low priority to build.
```

---

## 5. When and Where to File (Due Dates in a Dual-Status Year)

**Citation:** Pub. 519 (2025), p.48, "When and Where To File."

```
FUNCTION DUE_DATE(individual, year):

    status_on_dec_31 = determine_status_on(individual, Dec_31_of(year))

    IF status_on_dec_31 == "RESIDENT_ALIEN":
        IF individual.reports_on_calendar_year_basis:
            RETURN April_15_of(year + 1)
        ELSE:
            RETURN 15th_day_of_4th_month_after_fiscal_year_end

    ELSE IF status_on_dec_31 == "NONRESIDENT_ALIEN":
        IF individual.received_wages_subject_to_US_withholding:
            RETURN April_15_of(year + 1)   // calendar-year filer
                // (15th day of 4th month after FY end, if fiscal year)
        ELSE:
            RETURN June_15_of(year + 1)    // calendar-year filer, no
                // withheld wages (15th day of 6th month after FY end,
                // if fiscal year)

    // Standard weekend/holiday rollover applies to any of the above.
    // Extension: Form 4868 available in either case (does NOT extend
    // time to PAY, only to FILE); mail to the dual-status address shown
    // in the Form 1040 instructions (resident-at-year-end case) or the
    // Form 1040-NR instructions' "dual-status year" filing address
    // (nonresident-at-year-end case).
```

---

## 6. Life as a Full-Year Resident Alien Going Forward

Once the transition year closes with the individual as a resident alien on December 31 (and, per File 01 Section 5.3, resident for any part of the FOLLOWING year), the person is a **full-year resident alien** for all subsequent years (until/unless a later departure event changes that). The consequences compound several regimes simultaneously:

### 6.1 Worldwide income taxation

```
RULE: Starting with the first FULL resident-alien calendar year
(i.e., the year after the dual-status transition year, assuming
residency continues), the individual reports ALL income from ALL
sources, worldwide, on Form 1040/1040-SR -- identical in scope to a
U.S. citizen. This includes foreign bank interest, foreign scholarship/
stipend amounts, foreign investment income, etc., regardless of
whether any tax treaty between the U.S. and the home country would
have sheltered that income under NRA-only treaty articles (many
student/trainee treaty articles, e.g., Article 21 exemptions, apply
ONLY while the individual qualifies as a nonresident alien and are
LOST upon becoming a resident alien, absent a specific "saving clause"
carve-out in that treaty -> ROUTE TO TREATY-LOOKUP FILE for the
specific treaty; do not assume the treaty benefit survives).

ANCILLARY COMPLIANCE EXPOSURE (flag, do not silently ignore):
    - FBAR (FinCEN Form 114) if aggregate foreign financial account
      balances exceed $10,000 at any point in the year.
    - FATCA Form 8938 if foreign financial assets exceed the applicable
      (filing-status- and residence-dependent) threshold.
    -> These are WHOLE-FILE topics in their own right; this file only
       flags that resident-alien status plus any foreign accounts
       (common for students with home-country bank accounts) TRIGGERS
       the need to evaluate them. -> ROUTE TO HUMAN REVIEW / dedicated
       FBAR-FATCA file if one exists on this platform.
```

### 6.2 FICA (Social Security and Medicare tax) treatment

**Citation:** IRC §3121(b)(19) (nonimmigrant F/J/M/Q services exemption); IRC §3121(b)(10) (half-time-enrolled student exemption, status-independent); IRS "Foreign Student Liability for Social Security and Medicare Taxes."

```
FUNCTION FICA_LIABLE(individual, pay_period_date):

    // Exemption Path 1 -- nonimmigrant exempt-individual exemption
    // (IRC 3121(b)(19)): requires BOTH nonresident-alien tax status
    // AND F/J/M/Q status AND services performed consistent with the
    // visa's purpose (e.g., on-campus work, authorized CPT/OPT).
    path_1_exempt = (
        File01.status_on(pay_period_date) == "NONRESIDENT_ALIEN"
        AND individual.visa_status_on(pay_period_date) IN {"F","J","M","Q"}
        AND individual.services_consistent_with_visa_purpose(pay_period_date)
    )

    // Exemption Path 2 -- half-time-enrolled student exemption
    // (IRC 3121(b)(10)): INDEPENDENT of alien/residency status.
    // Applies to ANY student (citizen, resident alien, or nonresident
    // alien) employed BY the school/college/university at which they
    // are enrolled at least half-time, where the work is incidental to
    // and for the purpose of pursuing a course of study.
    path_2_exempt = (
        individual.enrolled_at_least_half_time(pay_period_date)
        AND individual.employer == individual.school_of_enrollment
        AND individual.employment_incidental_to_course_of_study
    )

    IF path_1_exempt OR path_2_exempt:
        RETURN FALSE   // no FICA withholding
    ELSE:
        RETURN TRUE    // FICA (Social Security + Medicare) applies,
                        // same as any U.S. employee
```

```
CRITICAL TRANSITION-YEAR CONSEQUENCE: Path 1 exemption requires
NONRESIDENT ALIEN status. The moment an individual becomes a resident
alien (post-transition), Path 1 is PERMANENTLY unavailable to them for
that employment going forward, REGARDLESS of remaining F-1 visa status
or OPT authorization. This is a frequently-missed real-world trap:

    COMMON FAILURE PATTERN: An F-1 student on post-completion OPT, now
    in their 6th+ calendar year of U.S. presence, becomes a resident
    alien under SPT (File 01/02). Their employer (often unfamiliar with
    this nuance) continues treating them as FICA-exempt because they
    still physically hold an F-1 EAD card. This is WRONG once resident-
    alien status attaches -- FICA becomes due from the residency
    starting date forward, UNLESS Path 2 (half-time student employed
    BY the school itself) independently applies (which it generally
    does NOT for OPT employment with an external employer).
    -> ROUTE TO HUMAN REVIEW / explicit user-facing alert whenever
       File 01 determines a residency_start_date for a currently-F-1
       individual: surface a FICA-withholding-correction prompt,
       since any over-withheld FICA from Path-1-exempt EMPLOYER ERROR
       (exempt-individual still being wrongly withheld) would need a
       refund claim (Form 843 + Form 8316, generally only after trying
       to get the employer to refund first), while UNDER-withheld FICA
       post-transition is the EMPLOYEE'S and EMPLOYER'S shared
       compliance problem going forward.
    -> Also note the reverse error pattern: an employer who correctly
       withheld FICA believing the person was already a resident alien,
       when in fact they were still within their exempt-individual
       window, creates an OVER-withholding refund scenario under Path 1.
       Either direction of employer error should be flagged, not
       silently corrected by assumption.

CASE -- change of status to H-1B specifically: IRS guidance explicitly
confirms employers MUST withhold FICA taxes for aliens who change visa
status to H-1B (H-1B is not an exempt category under 3121(b)(19)),
effective from the status-change date -- consistent with File 02
Section 6, Case 2's day-level SPT split logic.
```

### 6.3 Other consequences of becoming a full resident alien (summary pointers; not re-derived here)

```
- Standard deduction: becomes available again (full-year resident,
  NOT a dual-status year) -- ordinary Form 1040 rules apply.
- Filing status options: single, MFJ, MFS, HOH, qualifying surviving
  spouse all become available on the same terms as a U.S. citizen
  (subject to normal non-alienage eligibility rules for each).
- State tax residency: frequently DIFFERENT triggers/thresholds than
  federal; NOT governed by IRC 7701(b) at all -> separate state-tax
  file/jurisdiction lookup, out of scope here -- flag as a related but
  distinct determination the platform must not conflate with federal
  residency.
- Estimated tax payments (Form 1040-ES) may now be required given
  worldwide income and changed withholding patterns -> cross-reference
  estimated-tax file if one exists.
- Treaty benefits: as noted in 6.1, many NRA-only treaty articles
  terminate upon becoming a resident alien -> treaty-lookup file.
```

---

## 7. Decision Logic Summary — "Which Form(s) Does This Person File in Year N?"

```
FUNCTION FORMS_FOR_YEAR(individual, year_N):

    status_start = File01.RESIDENCY_STARTING_DATE(individual, year_N)
    status_end   = File01.RESIDENCY_ENDING_DATE(individual, year_N)
    dual_status  = IS_DUAL_STATUS_YEAR(individual, year_N)            // Section 1
    married_election_in_effect = CHECK_6013G_OR_6013H_ELECTION(individual, year_N)  // File 01 Sec 7

    IF married_election_in_effect:
        RETURN {
            forms: ["Form 1040 or 1040-SR (joint, full-year resident treatment)"],
            notes: "Dual-status restrictions (Section 4) do NOT apply; " +
                   "worldwide income both spouses for full year."
        }

    IF NOT dual_status:
        IF individual.status_this_year == "RESIDENT_ALIEN":
            RETURN {
                forms: ["Form 1040 or 1040-SR"],
                notes: "Full-year resident; standard deduction available; " +
                       "worldwide income; FICA per Section 6.2 on all wages."
            }
        ELSE: // full-year NONRESIDENT_ALIEN
            RETURN {
                forms: ["Form 1040-NR", "Form 8843 (if exempt-individual " +
                        "or medical-condition days claimed)",
                        "Form 8840 (if claiming Closer Connection Exception)"],
                notes: "U.S.-source + ECI foreign-source income only; " +
                       "no standard deduction (unless India treaty Art. " +
                       "21(2) applies); FICA exemption per Section 6.2 " +
                       "Path 1 (if F/J/M/Q and visa-consistent services) " +
                       "or Path 2 (half-time student employed by own school)."
            }

    ELSE: // dual_status == TRUE
        forms_info = WHICH_FORMS_TO_FILE(individual, year_N)   // Section 3
        RETURN {
            forms: [forms_info.primary_form + ' (annotated "Dual-Status Return")',
                     forms_info.attachment_vehicle + ' (annotated "Dual-Status Stmt")',
                     "Form 8843 (if exempt-individual days claimed during the " +
                     "nonresident period)",
                     "Form 1116 (if claiming foreign tax credit)"],
            notes: "SUBJECT TO Section 4 restrictions (no standard deduction, " +
                   "no HOH, no joint filing absent an election, MFS rates if " +
                   "married-and-not-electing). CANNOT E-FILE -- route to paper " +
                   "filing workflow. Due date per Section 5, based on status " +
                   "on Dec 31."
        }
```

---

## 8. Edge Cases and Human-Review Triggers (This File)

- **Assuming "exemption expires this year" automatically means "dual-status this year"** — frequently false for continuously-present students (Section 2 edge case); always explicitly run `IS_DUAL_STATUS_YEAR()` rather than inferring it.
- **India treaty standard-deduction allowance inside a dual-status year** (Section 4, Restriction 1) — ambiguous under Pub. 519's dual-status chapter text; do not auto-apply; route to human review.
- **§6013(g)/(h) married elections** — never auto-select; always a confirmed user election given irrevocability/joint-worldwide-income consequences.
- **FICA employer-error patterns at the resident-alien transition** (Section 6.2) — both over- and under-withholding scenarios are common and consequential (refund claims via Form 843/8316 vs. going-forward compliance); always surface explicitly rather than silently reconciling.
- **Treaty-article survival after becoming a resident alien** (Section 6.1 and 6.3) — never assume an NRA-only treaty benefit continues; always route to the treaty-lookup logic for the specific treaty's saving-clause language.
- **E-filing restriction for dual-status returns** — hard platform routing rule; must not be bypassed.
- **FBAR/FATCA triggers upon becoming a resident alien with foreign accounts** — flag for a dedicated compliance file; do not silently skip because the platform's primary focus is income tax.
- **Fiscal-year (non-calendar-year) filers** — Pub. 519's due-date rules branch on this; confirm the individual is calendar-year (true for virtually all F-1 students, but the engine should not hardcode the assumption without a check) before applying the April 15 / June 15 defaults.
- **Expatriation overlay (§877A, Form 8854)** — out of scope for typical arrival transitions; route to human review if a former long-term resident appears in the user base.

---

## Sources

- IRS Publication 519 (2025), *U.S. Tax Guide for Aliens*, Chapter 1 ("Dual-Status Aliens," "First Year of Residency," "Last Year of Residency," "Choosing Resident Alien Status," "Nonresident Spouse Treated as a Resident") and Chapter 6 ("Dual-Status Tax Year"): https://www.irs.gov/pub/irs-pdf/p519.pdf
- 26 U.S.C. §7701(b) — Resident/nonresident alien definitions, residency starting/ending dates: https://www.law.cornell.edu/uscode/text/26/7701
- 26 CFR §301.7701(b)-4 — Residency starting and ending dates: https://www.law.cornell.edu/cfr/text/26/301.7701(b)-4
- 26 CFR §301.7701(b)-7 — Dual-status aliens (general rules): https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ECFR5ffaf3310af6b61/section-301.7701(b)-7
- 26 U.S.C. §6013(g), (h) — Election to treat nonresident spouse / dual-status alien as a resident: https://www.law.cornell.edu/uscode/text/26/6013
- 26 U.S.C. §3121(b)(19) — FICA exemption for nonimmigrant students/teachers/trainees/exchange visitors performing visa-consistent services: https://www.law.cornell.edu/uscode/text/26/3121
- 26 U.S.C. §3121(b)(10) — FICA exemption for students employed by the school at which enrolled at least half-time: https://www.law.cornell.edu/uscode/text/26/3121
- IRS, "Foreign Student Liability for Social Security and Medicare Taxes": https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes
- IRS, "Employers must withhold FICA taxes for aliens who change visa status to H-1B": https://www.irs.gov/newsroom/employers-must-withhold-fica-taxes-for-aliens-who-change-visa-status-to-h-1b (also mirrored at https://www.irs.gov/node/14312)
- Form 1040-NR and Instructions (2025), "Dual-Status Taxpayers" filing address/when-to-file section: https://www.irs.gov/pub/irs-pdf/i1040nr.pdf
- Form 8843 (2025) and Instructions: https://www.irs.gov/pub/irs-pdf/f8843.pdf
- Form 843, *Claim for Refund and Request for Abatement*, and Form 8316, *Information Regarding Request for Refund of Social Security Tax Erroneously Withheld on Wages Received by a Nonresident Alien on an F, J, M, or Q Visa* (referenced for FICA over-withholding correction path): https://www.irs.gov/forms-pubs/about-form-843 ; https://www.irs.gov/pub/irs-pdf/f8316.pdf
- Cross-reference: File 01 (Tax Residency and Substantial Presence Test) for residency start/end date computation this file consumes.
- Cross-reference: File 02 (F-1 Exempt Individual Status) for the exemption-clock mechanics that typically trigger the transition covered here.
