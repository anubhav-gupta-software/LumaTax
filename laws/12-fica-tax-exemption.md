# FICA Tax Exemption for F-1/J-1/M-1/Q-1 Students — Logic Spec

**Scope:** Social Security + Medicare (FICA) tax exemption rules relevant to F-1 international students at LumaTax — when they're exempt, when the exemption ends, how it interacts with the separate "enrolled student" FICA exception, and the remedy process when an employer wrongly withholds.

**Cross-reference note:** This file assumes an existing/forthcoming rules file determines **nonresident-alien status under the Substantial Presence Test (SPT) and the 5-calendar-year "exempt individual" window for F/J/M/Q students** (days-counting, closer-connection exception, etc.). That SPT/5-year-exemption logic is NOT re-derived here — this file only consumes its output as a boolean/date input (`is_nonresident_alien`, `exempt_individual_years_used`, `became_resident_alien_date`). Wire this file's `visa_status_check()` to call that module rather than re-implementing day-counting.

---

## 1. Two separate, independently-operating FICA exemptions

LumaTax's engine must treat these as **two distinct legal exemptions** that can each apply on their own, and can also overlap:

| | **Exemption A — Nonresident Alien Student Exemption** | **Exemption B — Enrolled Student Exemption** |
|---|---|---|
| Statute | IRC §3121(b)(19) | IRC §3121(b)(10) |
| Who it protects | F-1, J-1, M-1, Q-1/Q-2 nonresident aliens | ANY student (any visa status, including U.S. citizens/residents) enrolled and regularly attending classes at the school employing them |
| Tied to visa/residency? | **Yes** — requires nonimmigrant status + being a nonresident alien under SPT | **No** — tied purely to enrollment/employment relationship with a school, college, or university (SCU) |
| Tied to employer? | **No** — covers wages for services performed to carry out the purpose of the visa (on-campus work, CPT, OPT), regardless of whether the employer is the student's own school | **Yes** — only covers wages paid BY the SCU (or an affiliated §509(a)(3) organization) at which the student is enrolled |
| Governing guidance | IRS student FICA page; IRC §3121(b)(19) | Rev. Proc. 2005-11 (safe harbor); 26 CFR §31.3121(b)(10)-2 |
| Ends when | Student becomes a resident alien under SPT (typically after 5 calendar years as an exempt individual) or fails closer-connection test earlier | Student drops below half-time enrollment, becomes a "full-time employee" (40+ hrs/week normal schedule), or otherwise fails the Rev. Proc. 2005-11 safe harbor/facts-and-circumstances test |

**Plain-English overlap rule:** An F-1 student working on-campus at their OWN university during years 1–5 typically qualifies for **both** exemptions simultaneously — either one is independently sufficient. A nonresident F-1 student working CPT/OPT for an **outside employer** (not their school) can only rely on Exemption A (§3121(b)(19)), since Exemption B requires the SCU itself to be the payer. A **resident alien** F-1 student (post-5-year, SPT resident) who is still enrolled half-time and working for their own university can still be FICA-exempt **solely under Exemption B** — residency status is irrelevant to §3121(b)(10).

```
IF (is_F1_J1_M1_Q1_visa == TRUE) AND (is_nonresident_alien_per_SPT == TRUE)
   AND (work is on-campus OR CPT OR OPT, i.e., authorized to carry out purpose of visa)
THEN Exemption_A_applies = TRUE

IF (employer == the SCU at which the student is enrolled, OR an affiliated §509(a)(3)
   organization of that SCU)
   AND (student meets Rev. Proc. 2005-11 half-time safe harbor OR facts-and-circumstances
   student status — see §4)
THEN Exemption_B_applies = TRUE

is_FICA_exempt_right_now = Exemption_A_applies OR Exemption_B_applies
```

**Citations:** IRC §3121(b)(10); IRC §3121(b)(19); Rev. Proc. 2005-11, §1.01–.03 (read directly from `irs.gov/pub/irs-drop/rp-05-11.pdf`); IRS, [Foreign Student Liability for Social Security and Medicare Taxes](https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes).

---

## 2. Exemption A — IRC §3121(b)(19) nonresident alien student/scholar exemption

**Plain-English rule:** Wages paid to a nonresident alien temporarily present in the U.S. under an F-1, J-1, M-1, or Q-1/Q-2 visa are exempt from Social Security and Medicare tax, **as long as**:
1. The individual remains a **nonresident alien** under the Substantial Presence Test (i.e., is still within the "exempt individual" window — generally the first 5 calendar years of presence for F/J/M/Q students; 2 calendar years for J-1 non-student scholars/teachers/trainees, counted under separate SPT rules not re-derived here), and
2. The services performed are **allowed under the individual's immigration status** and are performed **to carry out the purpose for which the visa was issued** — i.e., on-campus employment (up to 20 hrs/week during the academic session, up to 40 hrs/week during official school breaks/summer), Curricular Practical Training (CPT), or Optional Practical Training (OPT), whether pre- or post-completion.

```
IF visa_status IN {F-1, J-1, M-1, Q-1, Q-2}
   AND is_nonresident_alien_per_SPT == TRUE   # from the 5-year-exemption module
   AND employment_type IN {on_campus, CPT, OPT, economic_hardship_EAD_tied_to_F1}
THEN FICA_exempt_under_3121_b_19 = TRUE

IF is_nonresident_alien_per_SPT == FALSE  (i.e., became a resident alien under SPT)
THEN FICA_exempt_under_3121_b_19 = FALSE
     # Exemption A ends automatically and immediately as of the date residency begins —
     # it does NOT phase out; see §3.

IF employment_type NOT IN {on_campus, CPT, OPT, authorized-training-tied-to-status}
   (e.g., unauthorized work, or work unrelated to visa purpose)
THEN FICA_exempt_under_3121_b_19 = FALSE
     AND route_to_human_review = TRUE   # unauthorized work has bigger problems than FICA
```

**Edge case — J-1 non-students:** J-1 research scholars, professors, and trainees (not students) get only a **2-calendar-year** exempt-individual window under SPT, not 5 years. If `visa_subtype == J-1-non-student`, the engine must pull the 2-year figure from the SPT/exemption module rather than assuming 5 years. **This file does not own that number — flag if the SPT module returns an unexpected value for a J-1 non-student.**

**Citations:** IRC §3121(b)(19); IRS, [Foreign Student Liability for Social Security and Medicare Taxes](https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes) ("Foreign students temporarily present in the U.S. in F-1, J-1, M-1... status for less than 5 calendar years are generally nonresident aliens... exempt from Social Security Tax and Medicare Tax on wages... for on-campus student employment up to 20 hours a week (40 hrs. during summer vacations)... off-campus student employment allowed by USCIS... Practical Training student employment on or off campus"); IRS Pub. 519, ch. 1 (Substantial Presence Test, exempt individual).

---

## 3. When Exemption A ends — the precise trigger

**Plain-English rule:** Exemption A is a function of **residency status**, not years of visa validity. It ends on the date the student first becomes a **resident alien** under the Substantial Presence Test — which is normally the first day of the 6th calendar year of F/J/M/Q presence (once the 5 exempt-individual calendar years are exhausted and SPT days start counting), **but can end earlier** if:
- The student fails the **closer-connection exception** test and is deemed to have SPT-countable days starting earlier than expected (rare for students, more relevant to scholars), or
- The student changes to a non-exempt visa status (e.g., H-1B) mid-year, in which case days after the status change count toward SPT immediately.

```
IF current_date >= became_resident_alien_date  (from SPT module)
THEN FICA_exempt_under_3121_b_19 = FALSE  (effective that date forward)
     employer_must_start_withholding_FICA = TRUE

# Mid-year transition edge case:
IF student becomes a resident alien partway through a calendar year
   (e.g., crosses into 6th calendar year, or changes to H-1B mid-year)
THEN wages paid BEFORE the transition date remain FICA-exempt (if conditions in §2
     were met at the time), and wages paid ON/AFTER the transition date are FICA-taxable
     → ROUTE TO HUMAN REVIEW for any single pay period that straddles the transition
       date, since payroll systems often get this wrong (employer may withhold FICA
       for the whole pay period or none of it)
```

**Important — the "exempt individual" clock is per-calendar-year presence, not per-visa-issuance:** a student who leaves the U.S. and re-enters on a new F-1 visa does NOT reset the 5-year count; the 5 calendar years are cumulative from first arrival as an exempt individual (this is a function of the SPT module, not re-derived here — but the engine must NOT assume a new I-20/visa stamp means a fresh FICA-exemption clock).

```
IF a new F-1 (or J/M/Q) period starts AND prior F/J/M/Q exempt-individual years
   were already used in the lookback period tracked by the SPT module
THEN DO NOT reset FICA exemption clock — defer entirely to SPT module's cumulative count
     ROUTE TO HUMAN REVIEW if student reports "this is a new visa so I should have
     5 fresh years" — this is a common and costly misconception.
```

**Citations:** IRC §3121(b)(19) (tied to nonresident alien status); IRC §7701(b) and Treas. Reg. §301.7701(b)-3 (Substantial Presence Test, exempt individual, closer connection exception); IRS Pub. 519, ch. 1.

---

## 4. Exemption B — IRC §3121(b)(10) enrolled-student exemption & the Rev. Proc. 2005-11 safe harbor

**Plain-English rule:** Separately from visa/residency status, wages paid by a school, college, or university (SCU) — or an affiliated §509(a)(3) organization — to a student **enrolled and regularly attending classes at that same SCU** are excluded from the definition of "employment" for FICA purposes entirely. Rev. Proc. 2005-11 provides an objective **safe harbor**: if met, the exemption applies automatically without a facts-and-circumstances inquiry.

### 4.1 Safe harbor requirements (ALL must be true)

```
safe_harbor_met =
    employer_is_SCU_or_affiliated_509a3(employer)                     # Rev. Proc. 2005-11 §5
    AND student_enrolled_at_that_same_SCU(student, employer)          # §7.01
    AND enrollment_at_least_half_time(student)                       # §7.01, §8.02/.04
    AND NOT is_full_time_employee(student)                            # normal schedule < 40 hrs/wk — §6.01
    AND NOT is_professional_employee(student)                        # §6.02 — advanced-field judgment work
    AND NOT eligible_for_disqualifying_benefits(student)              # §6.03 — see list below
    AND NOT covered_under_section_218_state_agreement(student, state) # §7.06 (rare)

disqualifying_benefits (ANY of these makes the employee ineligible for the safe harbor,
though they may still qualify under facts-and-circumstances per §6.03):
  - paid vacation, sick leave, or paid holiday benefits
  - eligibility for a §401(a) retirement plan
  - eligibility for §403(b) employer contributions (beyond the student's own elective deferrals)
  - eligibility for a §457(b) deferred comp plan (nonelective employer contributions)
  - reduced tuition BECAUSE of the employment relationship (note: a §117(d)(5) qualified
    tuition reduction for a graduate TA/RA does NOT disqualify — explicit carve-out)
  - eligibility for group life insurance (§79), educational assistance (§127),
    dependent care assistance (§129), or adoption assistance (§137) tied to employment
  EXCEPTION: benefits mandated by state/local law do not disqualify (§6.04)
```

### 4.2 "Full-time employee" bright-line rule

```
IF normal_work_schedule_hours_per_week >= 40
THEN is_full_time_employee = TRUE (ALWAYS, regardless of employer's own job classification)
     → safe_harbor_met = FALSE
     → Exemption_B does NOT apply via safe harbor (facts-and-circumstances is also
       unavailable for a true full-time employee per Rev. Proc. 2005-11 §9)
```
(Academic-break work schedule is excluded from this 40-hour calculation — §31.3121(b)(10)-2(d)(3)(iii).)

### 4.3 Half-time enrollment & school-break rules

```
IF enrollment_credit_hours >= half_time_threshold_per_DOE_regs(institution)
THEN meets_half_time = TRUE

IF student is in FINAL term/semester/quarter of a program requiring 2+ terms,
   AND enrolled in exactly the remaining credits needed to finish (even if < normal half-time)
THEN meets_half_time = TRUE  (deemed half-time — §7.02 special rule)

IF school_break_duration > 5 weeks (including summer) AND student is not enrolled
   during that break
THEN safe_harbor_does_NOT_apply for wages paid during that break
     EXCEPTION: IF student qualified for the exemption on the last day of classes/exams
     before the break AND is eligible to enroll for the next term after the break,
     THEN exemption continues through breaks of 5 weeks or less (not >5 weeks)
```

### 4.4 Carve-outs — safe harbor never available regardless of other facts

```
IF role IN {postdoctoral_student, postdoctoral_fellow, medical_resident, medical_intern}
THEN safe_harbor_NOT_applicable (Rev. Proc. 2005-11 §3.02) — these roles cannot assume
     their work is "incident to and for the purpose of pursuing a course of study";
     requires full facts-and-circumstances analysis outside the safe harbor
     → ROUTE TO HUMAN REVIEW
```

### 4.5 Facts-and-circumstances fallback

If the safe harbor isn't met (e.g., student is below half-time, or has a disqualifying benefit, or is a "professional employee"), Exemption B **may still apply** under a facts-and-circumstances test weighing whether the "educational aspect" or "service aspect" of the relationship predominates — this is inherently judgmental.

```
IF safe_harbor_met == FALSE AND is_full_time_employee == FALSE
THEN ROUTE TO HUMAN REVIEW — facts-and-circumstances determination is not a
     deterministic rule the engine can resolve; do not auto-approve or auto-deny
     Exemption B in this case. (If is_full_time_employee == TRUE, no review needed —
     it's a hard FALSE per §4.2.)
```

### 4.6 Anti-abuse rule

Rev. Proc. 2005-11 §9 explicitly disregards the safe harbor's mechanical form if it's being manipulated (e.g., converting a full-time lab employee to "non-full-time" and enrolling them in a token 6-credit certificate program to claim the exemption). The engine should flag for review any case where a student's enrollment appears to have changed specifically coincident with a payroll classification change.

```
IF enrollment_status_change_date is within ~30 days of employment_classification_change_date
   AND hours_worked did not meaningfully decrease
THEN ROUTE TO HUMAN REVIEW (possible anti-abuse rule concern)
```

**Citations:** IRC §3121(b)(10); Rev. Proc. 2005-11, 2005-1 C.B. 275 — https://www.irs.gov/pub/irs-drop/rp-05-11.pdf, §§2–9 (safe harbor standards, full-time/professional/benefit carve-outs, half-time definitions, school-break rule, postdoc/medical-resident exclusion, anti-abuse rule); 26 CFR §31.3121(b)(10)-2 (final Employment Tax Regulations); IRS, [Foreign Student Liability for Social Security and Medicare Taxes](https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes).

---

## 5. Combined "is this person FICA-exempt right now" decision table

| visa_status | is_nonresident_alien (SPT) | employer_type | enrollment_status (at that employer) | Result |
|---|---|---|---|---|
| F-1 | Yes | On-campus, own university | Half-time+ | **Exempt** (A and B both apply) |
| F-1 | Yes | CPT/OPT, outside employer | N/A | **Exempt** (A only — B doesn't apply, outside employer isn't the SCU) |
| F-1 | **No** (resident alien, post-5-yr) | CPT/OPT, outside employer | N/A | **NOT exempt** (A ended; B doesn't apply — not the SCU) |
| F-1 | **No** (resident alien, post-5-yr) | On-campus, own university | Half-time+, safe harbor met | **Exempt** (B only — A ended, but B is residency-independent) |
| F-1 | **No** | On-campus, own university | Below half-time / full-time employee | **NOT exempt** (neither A nor B applies) |
| F-1 | Yes | On-campus, own university | Full-time employee (40+ hrs/wk normal schedule) | **NOT exempt** (A requires visa-purpose-consistent work — 40 hr/wk on-campus likely exceeds the 20-hr/wk USCIS on-campus limit too, which is a separate immigration problem; B fails full-time carve-out) → **ROUTE TO HUMAN REVIEW** (possible immigration-status violation, not just a tax issue) |
| J-1 (non-student scholar) | Yes (within 2-yr window) | Research host institution | N/A | **Exempt** (A only; B requires the payer to be the SCU where THIS person is enrolled as a student — scholars aren't enrolled) |
| H-1B (post-F-1) | No (resident, or never exempt-individual) | Any | N/A | **NOT exempt** under either — standard FICA applies |

```
FUNCTION is_fica_exempt(visa_status, years_since_entry, is_nonresident_alien_per_SPT,
                         employer_type, employer_is_own_SCU, enrollment_status,
                         hours_per_week, has_disqualifying_benefit, is_professional_employee):

    exemption_A = (visa_status in {F-1,J-1,M-1,Q-1,Q-2}
                   AND is_nonresident_alien_per_SPT
                   AND employer_type in {on_campus, CPT, OPT})

    exemption_B = (employer_is_own_SCU
                   AND enrollment_status >= half_time
                   AND hours_per_week < 40
                   AND NOT has_disqualifying_benefit
                   AND NOT is_professional_employee)
                  # NOTE: if the above is False only because of a soft factor
                  # (benefit eligibility / professional status / under-half-time with
                  # unclear facts), this is NOT a hard "False" — route to human review
                  # per §4.5 rather than returning False outright.

    RETURN exemption_A OR exemption_B
```

**Citations:** Synthesized from IRC §3121(b)(10), §3121(b)(19), and Rev. Proc. 2005-11 as cited above.

---

## 6. Remedy when an employer wrongly withholds FICA from an exempt F-1 worker

**Plain-English rule:** The IRS requires a strict **two-step sequence**. A nonresident alien cannot skip directly to filing with the IRS — they must first attempt to get the employer to correct it.

### Step 1 — Request a refund from the employer FIRST
```
IF FICA_was_withheld AND is_fica_exempt(...) == TRUE
THEN required_first_action = "Contact the employer (payroll/HR) in writing and request
     a refund/adjustment of the erroneously withheld Social Security and Medicare tax."
     # The employer corrects this via its own payroll tax adjustment process
     # (e.g., Form 941-X on the employer's side) and reimburses the employee directly.
     # This step is MANDATORY before Step 2 — the IRS will not process a Form 843
     # claim from the employee if this step was skipped and the employer never
     # had a chance to adjust it.
```

### Step 2 — If the employer refuses or won't fully refund, file with the IRS directly
```
IF employer_refused_or_partial_refund_only == TRUE
THEN required_filing_package = {
       Form_843: "Claim for Refund and Request for Abatement"
                 — check the box "Refund to employee of social security, Medicare, or
                 RRTA tax withheld in error, but only if your employer will not adjust
                 the overcollection" (per the form's own instructions, this exact box
                 applies to the NRA-FICA scenario)
                 — line 1: tax period dates; line 2: amount; line 3: payment dates;
                 line 4: check box "a" (Employment); line 5: generally leave blank/"n Other"
                 since this isn't tied to a specific employer return; line 8: written
                 explanation + computation,
       Form_8316: "Information Regarding Request for Refund of Social Security Tax
                   Erroneously Withheld on Wages Received by a Nonresident Alien on an
                   F, J, or M Type Visa" — attached to Form 843,
       supporting_documents: [
          copy of visa/I-94 (proof of nonimmigrant status for the period at issue),
          copy of I-20 (F-1) or DS-2019 (J-1),
          copy of EAD card if CPT/OPT,
          copies of W-2(s) showing the erroneous SS/Medicare withholding (boxes 4 & 6),
          copy of the employer's written refusal (letter/email) to refund —
             REQUIRED per Form 8316's own instructions as proof Step 1 was attempted,
          proof of nonresident alien status for the tax year(s) at issue (e.g., Form
             8843, or a statement of SPT exempt-individual years from the student's
             own SPT/5-year-exemption determination)
       ]
     }
     file_with = "IRS service center for the student's location (per Form 843
                  instructions — NOT e-filed; paper filing only)"
```

### Decision logic
```
FUNCTION remedy_path(fica_wrongly_withheld, employer_contacted, employer_response):
    IF fica_wrongly_withheld == FALSE:
        RETURN "No remedy needed"
    IF employer_contacted == FALSE:
        RETURN "STEP 1 REQUIRED: contact employer in writing before any IRS filing"
    IF employer_response == "refunded in full":
        RETURN "Resolved at employer level — no IRS filing needed. Retain correspondence
                 for records."
    IF employer_response IN {"refused", "partial refund only", "no response after
                              reasonable time (IRS doesn't set a fixed day count, but
                              practitioners generally wait a full payroll/tax season)"}:
        RETURN "STEP 2: file Form 843 + Form 8316 + supporting docs listed above"
    ROUTE TO HUMAN REVIEW if employer_response is ambiguous or partial
```

**Edge case — multi-year erroneous withholding:** Form 843 instructions require a **separate Form 843 for each tax period/year**. If FICA was wrongly withheld across multiple calendar years, the engine must generate one Form 843 + Form 8316 package per year, not a single combined claim.

```
IF years_with_erroneous_withholding > 1
THEN generate_separate_843_per_year = TRUE
     ROUTE TO HUMAN REVIEW if any year is close to or past the statute of limitations
     for refund claims (generally the later of 3 years from the return's filing date
     or 2 years from when the tax was paid, under IRC §6511) — do not auto-file a
     claim the engine cannot verify is still timely.
```

**Edge case — student can't get a response from employer / employer is defunct:** Document the attempt (date, method) and proceed to Step 2 with whatever evidence of the attempt exists; note on Form 843 line 8 that the employer did not respond. **Route to human review** — this is a facts-heavy narrative the IRS may scrutinize.

**Citations:** Form 843 (Rev. 12-2024), checkbox list p.1 (read directly from `/Users/anubhavgupta/Downloads/LumaTax/forms/f843.pdf`); IRS, [Foreign Student Liability for Social Security and Medicare Taxes](https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes) ("contact the employer... for a refund. If you are unable to get a full refund... file a claim for refund with the Internal Revenue Service on Form 843... Attach... Form 8316"); IRS Form 8316, "Information Regarding Request for Refund of Social Security Tax Erroneously Withheld on Wages Received by a Nonresident Alien on an F, J, or M Type Visa" — https://www.irs.gov/pub/irs-access/f8316_accessible.pdf; IRC §6511 (refund claim statute of limitations).

---

## 7. Current FICA rates & wage base (for computing the erroneously-withheld amount)

```
social_security_rate_employee = 6.2%
medicare_rate_employee        = 1.45%     # no wage base cap; additional 0.9% Medicare
                                           # surtax applies above $200,000 single (not
                                           # typically relevant to a student's wages,
                                           # but flag if applicable)
social_security_wage_base_2025 = $176,100
social_security_wage_base_2026 = $184,500

erroneously_withheld_estimate = (box4_social_security_wages_from_W2 × 6.2%)
                               + (box6_medicare_wages_from_W2 × 1.45%)
                               # Cross-check against actual box 4 / box 6 withheld
                               # amounts shown on the W-2 — use the ACTUAL withheld
                               # figures from W-2 boxes 4 and 6 as the claim amount,
                               # not a recomputation, since employer rounding/timing
                               # can create small variances. ROUTE TO HUMAN REVIEW if
                               # the recomputed estimate differs from W-2 boxes 4/6 by
                               # more than a trivial rounding amount.
```

**Citations:** Social Security Administration, Contribution and Benefit Base — https://www.ssa.gov/oact/cola/cbb.html (2026 base $184,500, up from $176,100 in 2025; employee/employer OASDI rate 6.2% each per statute); IRC §3101 (FICA employee tax rates — 6.2% OASDI, 1.45% Medicare); IRC §3101(b)(2) (0.9% Additional Medicare Tax above threshold).

---

## 8. Consolidated "route to human review" triggers for this file

1. J-1 non-student subtype where the SPT module doesn't clearly return a 2-year (not 5-year) exempt-individual window.
2. A pay period that straddles the date a student transitions from nonresident to resident alien (or from F-1 to H-1B).
3. Student claims a "fresh" 5-year FICA clock after re-entering on a new F-1 visa (cumulative-years misconception).
4. On-campus work reported at 40+ hours/week (both a FICA and a likely immigration-status concern).
5. Exemption B safe harbor fails only on a soft factor (benefit eligibility, professional-employee status, ambiguous half-time enrollment) — requires facts-and-circumstances judgment, not automatable.
6. Postdoctoral student/fellow, medical resident, or medical intern — safe harbor categorically unavailable; needs manual facts-and-circumstances review.
7. Enrollment status change within ~30 days of a payroll classification change with no real hours reduction (anti-abuse rule concern).
8. Employer's response to a refund request is ambiguous, partial, or undocumented.
9. Multiple years of erroneous withholding — verify statute-of-limitations timeliness per year before auto-generating claims.
10. Recomputed FICA estimate differs materially from the actual W-2 box 4/box 6 withheld amounts.
11. Any case where Chapter-4/FATCA-type employer status appears alongside a personal wage FICA question (unusual combination warranting a second look).

---

## Sources

- Internal Revenue Code §3121(b)(10) (student FICA exception); §3121(b)(19) (FICA exemption for nonimmigrant students/exchange visitors/cultural exchange visitors); §3101 (FICA tax imposition and rates); §3101(b)(2) (Additional Medicare Tax); §6511 (refund claim statute of limitations); §7701(b) (Substantial Presence Test).
- IRS, Rev. Proc. 2005-11, 2005-1 C.B. 275 — https://www.irs.gov/pub/irs-drop/rp-05-11.pdf (read in full; student FICA exception safe harbor standards).
- 26 CFR §31.3121(b)(10)-2 (final Employment Tax Regulations implementing the student FICA exception).
- IRS, Foreign Student Liability for Social Security and Medicare Taxes — https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes
- IRS, Alien Liability for Social Security and Medicare Taxes of Foreign Teachers, Foreign Researchers, and Other Foreign Professionals — https://www.irs.gov/individuals/international-taxpayers/alien-liability-for-social-security-and-medicare-taxes-of-foreign-teachers-foreign-researchers-and-other-foreign-professionals
- IRS, Social Security Tax / Medicare Tax and Self-Employment — https://www.irs.gov/individuals/international-taxpayers/social-security-tax-medicare-tax-and-self-employment
- IRS Form 843, Claim for Refund and Request for Abatement (Rev. 12-2024) — read directly from `/Users/anubhavgupta/Downloads/LumaTax/forms/f843.pdf`; also https://www.irs.gov/forms-pubs/about-form-843
- IRS Form 8316, Information Regarding Request for Refund of Social Security Tax Erroneously Withheld on Wages Received by a Nonresident Alien on an F, J, or M Type Visa — https://www.irs.gov/pub/irs-access/f8316_accessible.pdf
- IRS Publication 519, U.S. Tax Guide for Aliens — https://www.irs.gov/publications/p519 (also read locally: `/Users/anubhavgupta/Downloads/LumaTax/forms/p519.pdf`)
- Social Security Administration, Contribution and Benefit Base — https://www.ssa.gov/oact/cola/cbb.html (2026 wage base $184,500 / 2025 wage base $176,100).
