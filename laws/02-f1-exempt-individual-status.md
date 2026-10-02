# 02 — F-1/J-1/M-1/Q-1 "Exempt Individual" Status for the Substantial Presence Test

**Scope:** This file governs the single most important residency rule for LumaTax's core user base: when does time spent in the U.S. on an F, J, M, or Q visa **not count** toward the Substantial Presence Test (SPT) day count defined in File 01, Section 3? It covers the statutory definition of "exempt individual," the lifetime 5-calendar-year rule for students, the rolling 2-of-6-calendar-year rule for teachers/trainees (and why these two clocks are NOT independent), what happens when the exemption is exhausted, and how visa-status changes interact with the exemption clock. File 01 calls into this file's `IS_EXEMPT_INDIVIDUAL()` function as one of six day-exclusion categories; this file does not re-derive the SPT formula itself.

**Primary authority:** IRC §7701(b)(5) (26 U.S.C. §7701(b)(5)); Treas. Reg. §301.7701(b)-3; IRS Publication 519 (2025), Chapter 1, "Days of Presence in the United States — Exempt individual"; Form 8843 (2025) and its Instructions.

**Critical framing for the engine:** "Exempt individual" does **not** mean exempt from U.S. tax. It is a term of art meaning only that the person's days of physical presence are excluded from the SPT calculation. An exempt individual with U.S.-source income (wages, taxable scholarship, etc.) is still fully taxable as a nonresident alien on that income — see File 03 (Income Classification).

---

## 1. The Four Exempt-Individual Categories

**Plain English:** IRC §7701(b)(5)(A) defines exactly four categories of "exempt individual." LumaTax's user base (F-1 students, and often their F-2/J-2 dependents, plus some J-1 scholars/researchers) falls into categories (ii) and (iii).

```
Category A — Foreign-government-related individual:
    Present under an "A" or "G" visa (EXCLUDING "A-3"/"G-5" visas, which
    are for personal employees/domestic staff and do NOT qualify).

Category B — Teacher or trainee:
    Present under a "J" or "Q" visa, OTHER THAN as a student, who
    substantially complies with the visa's requirements.

Category C — Student:
    Present under an "F," "J," "M," or "Q" visa, who substantially
    complies with the visa's requirements.
    --> THIS IS THE CORE F-1 CATEGORY.

Category D — Professional athlete:
    Temporarily present to compete in a CHARITABLE sports event (main
    purpose = benefit a 501(c)(3); 100% of net proceeds to charity;
    volunteers perform substantially all the work). Only the days of
    ACTUAL COMPETITION are excludable -- not practice, promotional
    activity, or travel-between-events days.
```

**Citation:** IRC §7701(b)(5)(A); Pub. 519 (2025), pp.6–8.

```
FUNCTION IS_EXEMPT_INDIVIDUAL(individual, calendar_day):

    visa = individual.visa_status_on(calendar_day)

    IF visa IN {"A", "G"} AND visa NOT IN {"A-3", "G-5"}:
        RETURN TRUE   // foreign-government-related; household staff
                       // under A-3/G-5 do NOT qualify, must count all days
    IF visa IN {"J", "Q"} AND individual.role != "student":
        RETURN substantially_complies_with_visa(individual, calendar_day)
               AND NOT TEACHER_TRAINEE_2_OF_6_DISQUALIFIED(individual, calendar_day) // Section 3
    IF visa IN {"F", "J", "M", "Q"} AND individual.role == "student":
        RETURN substantially_complies_with_visa(individual, calendar_day)
               AND NOT STUDENT_5_YEAR_DISQUALIFIED(individual, calendar_day)         // Section 2
    IF individual.is_professional_athlete_at_charitable_event(calendar_day):
        RETURN individual.actually_competed_on(calendar_day)  // not practice/travel/promo days

    RETURN FALSE
```

### "Substantially complies with the requirements of the visa"

```
substantially_complies_with_visa(individual, day) =
    NOT individual.engaged_in_activity_prohibited_by_US_immigration_law
        (that could result in loss of visa status), as of `day`

EDGE CASE: unauthorized employment (e.g., F-1 working off-campus without
CPT/OPT authorization) is exactly the kind of immigration-law violation
that can break "substantial compliance." If engine detects unauthorized
work patterns -> ROUTE TO HUMAN REVIEW (this has both tax AND
immigration-status consequences; do not silently keep treating the
person as exempt).
```

### Immediate family members

```
Immediate family of an exempt individual (spouse + unmarried children
<21, who reside regularly in the household and are not members of
another household) are ALSO exempt individuals for SPT purposes IF
their visa status is DERIVED FROM AND DEPENDENT ON the primary exempt
individual's visa classification (e.g., F-2 derivative of F-1, J-2
derivative of J-1).

IMPORTANT CROSS-REFERENCE: this SPT exemption for dependents is
SEPARATE from the FICA exemption analysis (File 13), and separate from
whether the dependent has any U.S. tax filing obligation at all (F-2/J-2
dependents generally cannot work and often have no U.S.-source income).
```

---

## 2. The Student Exemption: 5-Calendar-Year Lifetime Rule (F-1 core rule)

**Plain English:** An individual present as a "student" under F/J/M/Q status is NOT an exempt individual for a calendar year if they have already been exempt as a **teacher, trainee, OR student** (note: all three categories pool together) for any part of **more than 5 calendar years** — UNLESS they affirmatively establish BOTH that they do not intend to reside permanently in the U.S., AND that they have substantially complied with their visa's requirements.

**Citation:** IRC §7701(b)(5)(C)(iv), (E); Treas. Reg. §301.7701(b)-3(b)(7); Pub. 519 (2025), p.7; Form 8843 Instructions (2025), Part III.

### 2.1 Core mechanic: this is a LIFETIME count, NOT a rolling window

```
FUNCTION STUDENT_5_YEAR_DISQUALIFIED(individual, calendar_day):

    current_year = YEAR_OF(calendar_day)

    // Count ALL distinct calendar years, over the individual's ENTIRE
    // history in the U.S. (no lookback window limit), in which the
    // individual was exempt as a teacher, trainee, OR student for ANY
    // PART of that year.
    exempt_years_used = COUNT_DISTINCT_YEARS(
        individual.history,
        WHERE role IN {"student", "teacher", "trainee"}
          AND was_present_in_US_for_at_least_one_day_that_year == TRUE
          AND year < current_year
    )

    IF exempt_years_used <= 5:
        RETURN FALSE   // still within the 5-year allowance; exempt as normal

    // exempt_years_used > 5 -- the clock has run out. Student exemption
    // for THIS year now REQUIRES the facts-and-circumstances override:
    IF individual.established_no_intent_to_permanently_reside(current_year)
       AND substantially_complies_with_visa(individual, calendar_day):
        RETURN FALSE   // still treated as exempt (override successful)
    ELSE:
        RETURN TRUE    // disqualified; days now count toward SPT
```

### 2.2 "Even one day in a calendar year counts as a full year"

```
EXTREMELY IMPORTANT ENGINE RULE:
    A calendar year in which the individual was present as an exempt
    student/teacher/trainee for ONLY ONE DAY consumes one full unit of
    the 5-year allowance -- there is no pro-rating.

Example: Individual enters on F-1 status on December 29, 2021 and
remains continuously present thereafter.
    Year 2021 -> counts as exempt year #1 (even though only 3 days)
    Year 2022 -> exempt year #2
    Year 2023 -> exempt year #3
    Year 2024 -> exempt year #4
    Year 2025 -> exempt year #5
    Year 2026 -> exempt_years_used (from years < 2026) = 5
                 -> 5 is NOT > 5, so 2026 is STILL within the
                    allowance and is exempt as normal (this is exempt
                    year #6 in absolute terms, but the test only
                    disqualifies once PRIOR years exceed 5)

    CAUTION -- verify exact boundary: Pub. 519's statutory language is
    "exempt... for any part of MORE THAN 5 calendar years." Read
    literally and applied as above, a person gets the benefit of the
    exemption for years 1 through 6 inclusive (the 6th year is the
    first year where the PRIOR-years count, 5, first exceeds... wait:
    5 is not > 5). The disqualification trigger fires in the first year
    where PRIOR exempt years >= 6, i.e. the 7th calendar year of
    presence as an exempt student. THIS BOUNDARY IS COUNTERINTUITIVE
    and is a HIGH-PRIORITY HUMAN-REVIEW / QA-TEST-CASE ITEM. Build an
    explicit unit test around a student who enters Dec 29 of Year 1 and
    remains through Year 7, and verify against Form 8843, Part III,
    Line 12 ("Were you exempt... for any part of MORE THAN 5 calendar
    years?") before shipping. Do not assume the "5-year rule" means
    "exempt for exactly 5 years then automatically taxable in year 6" --
    the precise statutory trigger is prior-years-count EXCEEDING five.
```

### 2.3 The facts-and-circumstances override (post-5-year continuation)

**Plain English:** Once the 5-year lifetime allowance is exhausted, a student can still be treated as exempt (and therefore still exclude SPT days) in later years, but only by affirmatively proving they do not intend to reside permanently in the U.S. This is a subjective, facts-and-circumstances test — not a bright-line rule — reported via **Form 8843, Part III**.

**Citation:** IRC §7701(b)(5)(D); Pub. 519 (2025), p.7; Form 8843 (2025), Part III, Lines 12–14.

```
established_no_intent_to_permanently_reside(individual, year):
    // Non-exhaustive factors (same conceptual family as, but not
    // identical to, File 01 Section 4's Closer Connection factors):
    factors = {
        maintained_closer_connection_to_foreign_country: ?,  // File 01 Sec 4 concepts
        took_affirmative_steps_toward_LPR_status: ?,          // disqualifying if YES
        has_pending_LPR_adjustment_application: ?             // disqualifying if YES
    }

    IF took_affirmative_steps_toward_LPR_status == TRUE
       OR has_pending_LPR_adjustment_application == TRUE:
        RETURN FALSE   // cannot claim the override -- these are
                        // affirmatively disqualifying facts, same as
                        // the Closer Connection Exception in File 01
    ELSE:
        -> ROUTE TO HUMAN REVIEW: this is NOT a bright-line
           determination the engine should auto-resolve. Collect
           supporting facts (housing ties abroad, family location,
           bank/driver's license/voting jurisdiction, any green-card
           sponsorship in progress, etc.) and present to the user /
           preparer for judgment, then require an attached statement
           to Form 8843 providing "sufficient facts" per the
           instructions.

REQUIRED: Form 8843, Part III, Line 12 = "Yes," plus an attached
statement with sufficient facts establishing no intent to permanently
reside (per Line 12 instruction). Line 13 asks directly whether the
individual applied for/took affirmative steps toward LPR status or has
a pending adjustment application during the year; if "Yes," Line 14
requires an explanation -- and per Pub. 519, a "Yes" here forecloses
the override entirely.
```

### 2.4 Filing requirement if claiming the student exemption

```
IF individual claims exempt-individual (student) status for any day in
the tax year:
    REQUIRES: Form 8843 fully completed -- Part I (general info) +
              Part III (students) -- attached to Form 1040-NR, or filed
              standalone by the Form 1040-NR due date if no return is
              otherwise required.
    IF NOT timely filed:
        -> Pub. 519's "clear and convincing evidence of reasonable
           cause" safe harbor applies to the PROFESSIONAL ATHLETE and
           MEDICAL CONDITION categories explicitly (per Pub. 519's
           "Form 8843" discussion). Treatment of a late Form 8843 for
           the STUDENT/TEACHER category specifically is less explicit
           in the statute text -- DO NOT assume the same safe harbor
           automatically extends; -> ROUTE TO HUMAN REVIEW if a
           student's Form 8843 is late, rather than assuming either
           outcome.
```

---

## 3. The Teacher/Trainee Exemption: Rolling 2-of-6-Calendar-Year Rule

**Plain English:** This is a DIFFERENT rule from the student 5-year rule, uses a DIFFERENT (rolling, not lifetime) lookback window, and applies to individuals present under **J or Q visas in a role other than student** (e.g., J-1 research scholars, professors, short-term scholars). It is directly relevant to LumaTax if the platform ever serves J-1 scholars/postdocs, and is critical to model correctly because years spent as an exempt **student** also count against this clock (and vice versa) — see Section 4.

**Citation:** IRC §7701(b)(5)(D); Treas. Reg. §301.7701(b)-3(b)(6); Pub. 519 (2025), p.7; Form 8843 Instructions (2025), Part II.

### 3.1 Core mechanic

```
FUNCTION TEACHER_TRAINEE_2_OF_6_DISQUALIFIED(individual, calendar_day):

    current_year = YEAR_OF(calendar_day)
    lookback_window = [current_year - 6, current_year - 1]   // preceding 6 years, ROLLING

    exempt_years_in_window = COUNT_DISTINCT_YEARS(
        individual.history,
        WHERE role IN {"student", "teacher", "trainee"}
          AND was_present_in_US_for_at_least_one_day_that_year == TRUE
          AND year IN lookback_window
    )

    IF exempt_years_in_window < 2:
        RETURN FALSE   // not disqualified; exempt as teacher/trainee

    // exempt_years_in_window >= 2 -- normally disqualified, UNLESS the
    // narrow 4-part exception below is met:
    IF TEACHER_TRAINEE_EXCEPTION_MET(individual, lookback_window):
        RETURN FALSE
    ELSE:
        RETURN TRUE
```

### 3.2 The narrow exception (all 4 conditions required)

```
FUNCTION TEACHER_TRAINEE_EXCEPTION_MET(individual, lookback_window):
    RETURN (
        exempt_years_in_window <= 3                                    // (1)
        AND a_foreign_employer_paid_100pct_of_compensation_this_year    // (2)
        AND individual.was_present_as_teacher_or_trainee_in_any_of(lookback_window) // (3)
        AND a_foreign_employer_paid_100pct_of_compensation_in_EVERY_prior_year_present_as_teacher_or_trainee_within(lookback_window) // (4)
    )

"Foreign employer" = includes an office/place of business of an
AMERICAN entity located in a foreign country or U.S. territory (i.e.,
the employer doesn't have to be a foreign company -- a U.S. company's
foreign branch paying the compensation still counts as "foreign
employer" for this purpose).
```

**Worked example (Pub. 519):** Carla, J-1 teacher, foreign-employer-paid this year, but was an exempt teacher for 2 of the prior 6 years WITHOUT foreign-employer pay in those years → exception fails on condition (4) → Carla is **disqualified**, not exempt this year. If those 2 prior years HAD been foreign-employer-paid, Carla WOULD be exempt (assuming conditions (1) and (3) also independently hold).

### 3.3 Filing requirement

```
IF individual claims exempt-individual (teacher/trainee) status:
    REQUIRES: Form 8843, Part I + Part II, attached to Form 1040-NR (or
              standalone if no return otherwise required), by the
              Form 1040-NR due date.
    Q-visa holders: complete Part I and ONLY Lines 6-8 of Part II
    (name/address/phone of cultural exchange program director on
    Line 6, in lieu of an academic institution).
```

---

## 4. Why the Two Clocks Are NOT Independent — Cross-Contamination Rule

**This is the single highest-risk modeling error for this file.** Both the student 5-year test (Section 2) and the teacher/trainee 2-of-6 test (Section 3) count years where the individual was exempt as **"a teacher, trainee, OR student"** — the statute pools all three roles into one shared history for lookback purposes. This means:

```
RULE: A single unified `exempt_tnt_student_years` history must be
maintained per individual, tagging EACH calendar year with whichever
role(s) applied (a person could even be a student part of a year and
switch to a teacher role later in the same year, though this is rare).
Do NOT maintain separate, siloed counters for "years as exempt
student" vs. "years as exempt teacher/trainee" that are blind to each
other -- both the 5-year AND the 2-of-6 tests must query the SAME
combined history.

EXAMPLE SCENARIO the engine must get right:
    Person is F-1 student for years 2020-2023 (4 exempt years, pooled
    history), then changes to J-1 research scholar (teacher/trainee
    role) in 2024.
    -> For the 2024 teacher/trainee 2-of-6 test: lookback window =
       2018-2023. Exempt years in window (pooled) = 2020, 2021, 2022,
       2023 = 4 years, which is >= 2 -> PRESUMPTIVELY DISQUALIFIED as
       teacher/trainee in 2024, UNLESS the narrow exception (Section
       3.2) is met (foreign-employer-paid in a qualifying pattern --
       which is unlikely for someone who was a student, since the
       "was present as teacher or trainee in the lookback window"
       condition (3) in Section 3.2 would need separate analysis of
       whether ANY of those years were specifically teacher/trainee
       roles, not student roles -- if ALL 4 prior years were STUDENT
       years, not teacher/trainee years, then condition (3) of the
       exception FAILS too, since it requires having been present
       "as a teacher or trainee" in one of the lookback years, not
       merely "exempt." -> ROUTE TO HUMAN REVIEW for this exact
       pattern -- it is a known pitfall and should never be
       auto-resolved silently).
```

---

## 5. What Happens When the Exemption Expires — Transition Decision Tree

```
                 [Individual present under F/J/M/Q, current year]
                                    |
                 Has the applicable lookback test
                 (5-year lifetime for students /
                  2-of-6 rolling for teachers) been
                 exceeded as of this calendar year?
                                    |
                +-------------------+-------------------+
                | NO                                    | YES
                v                                        v
      Exempt individual for this      Does individual meet the narrow
      year (File 01 excludes          override?
      these days from SPT)              - Student: "no intent to
                |                          permanently reside" +
                v                          substantial compliance
      Continue filing NRA returns          (Section 2.3)
      (Form 1040-NR + Form 8843)         - Teacher/trainee: 4-part
      as long as other NRA                 foreign-employer exception
      conditions hold                      (Section 3.2)
                                              |
                                +-------------+-------------+
                                | YES                       | NO
                                v                            v
                      STILL exempt individual      NOT an exempt individual
                      this year (rare for most     this year. ALL days this
                      F-1 students in practice      year count toward SPT
                      -- most students don't        (File 01, Section 3).
                      keep studying past 5 yrs      Run SUBSTANTIAL_PRESENCE_
                      without a status change,      TEST() with full day
                      but PhD students and           counting.
                      multi-degree students                |
                      legitimately can hit this)            v
                                                   Does individual now meet
                                                   SPT (31-day + weighted
                                                   183-day gates)?
                                                              |
                                                  +-----------+-----------+
                                                  | YES                   | NO
                                                  v                        v
                                        RESIDENT ALIEN as of      Still NONRESIDENT
                                        residency starting date   ALIEN this year
                                        (File 01 Sec 5) ->        (will likely become
                                        -> go to FILE 13          resident once enough
                                        (dual-status / resident   days accumulate in a
                                        transition mechanics)     later year -- re-run
                                                                   this test each year)
```

---

## 6. Visa Status Changes and the Exemption Clock

**Plain English:** Changing visa status (e.g., F-1 → H-1B, F-1 → OPT) does not retroactively alter years already counted, but it does determine whether CURRENT days are exempt-individual days going forward.

```
CASE 1 — F-1 OPT (Optional Practical Training):
    OPT is a WORK AUTHORIZATION, not a new visa category -- the
    individual generally REMAINS in F-1 status during OPT (including
    STEM OPT extensions).
    -> Days during OPT continue to be "student" exempt-individual days,
       SUBJECT TO the same 5-year lifetime clock (OPT years consume
       allowance just like enrolled years -- there is no special OPT
       carve-out in the day-counting rule). If the 5-year allowance is
       already exhausted before or during OPT, OPT days are NOT
       automatically exempt either -- the same Section 2.3 override
       analysis applies.
       -> ROUTE TO HUMAN REVIEW if a student's OPT period straddles
          their 5-year boundary; this is a common real-world scenario
          for 4+ year bachelor's/master's pathways and 5th-year OPT.

CASE 2 — F-1 to H-1B (change of status):
    H-1B is NOT one of the exempt-individual visa categories (A/G/J/Q
    for govt/teacher, F/J/M/Q for student). Once status changes to
    H-1B:
    -> Days FROM THE DATE OF STATUS CHANGE forward are NOT
       exempt-individual days (count normally toward SPT), regardless
       of how much of the 5-year allowance was unused.
    -> Days BEFORE the status change (while still F-1) retain whatever
       exempt-individual treatment they otherwise qualified for.
    -> This frequently creates a mid-year SPLIT: part of the year
       exempt (pre-change), part of the year counting toward SPT
       (post-change). Running SUBSTANTIAL_PRESENCE_TEST() for that year
       must use day-level granularity, not an all-or-nothing annual flag.
    -> Common real-world trigger: October 1 H-1B start date following
       an F-1/OPT cap-gap extension. -> HIGH-FREQUENCY SCENARIO, build
       and test explicitly.

CASE 3 — F-1 to F-1 (e.g., bachelor's to master's, or new SEVIS record):
    Still within the same exempt category ("student," F visa) ->
    5-year LIFETIME clock is UNAFFECTED by the degree change; the
    lifetime count keeps accumulating across different degree programs
    at the same OR different institutions. There is no "reset" of the
    5-year count upon starting a new academic program.
    -> ROUTE TO HUMAN REVIEW / explicit flag: many students incorrectly
       assume a new degree program resets the clock. It does not.

CASE 4 — Change from J-1 student to J-1 non-student (or vice versa):
    Both draw from the SAME pooled history (Section 4) -- changing
    the ROLE within J status does not create a fresh clock; it merely
    changes WHICH test (5-year vs. 2-of-6) governs going forward, while
    both tests still read from the same combined year-history.
```

---

## 7. Edge Cases and Human-Review Triggers (This File)

- **The "5 years means 6th year still exempt, 7th year disqualifies" boundary** (Section 2.2) — build explicit unit tests; this is the most common place a naive implementation gets the off-by-one wrong.
- **Pooled student/teacher/trainee history cross-contamination** (Section 4) — never model these as independent counters.
- **Facts-and-circumstances overrides** (student "no intent to permanently reside," Section 2.3) — never auto-approve; route to human/preparer judgment, but auto-reject if either hard disqualifier (LPR application steps, pending adjustment application) is detected.
- **OPT/STEM OPT straddling the 5-year boundary** (Section 6, Case 1) — common, must be flagged.
- **Mid-year visa status changes** (F-1→H-1B especially) requiring day-level (not year-level) SPT computation — common, must be flagged and tested.
- **Unauthorized employment potentially breaking "substantial compliance"** — flag; this has immigration-status implications beyond tax.
- **Late-filed Form 8843 for student/teacher categories** — the explicit "reasonable cause" safe harbor in Pub. 519 is stated for the athlete/medical categories; do not assume it automatically extends identically to student/teacher without confirming current IRS guidance — route to human review.
- **J-1 scholars with mixed foreign/U.S. employer funding** (Section 3.2 exception) — fact-intensive; route to human review rather than auto-determining "foreign employer" status in ambiguous funding arrangements (e.g., split-funded postdocs).

---

## Sources

- 26 U.S.C. §7701(b)(5) — Exempt individual defined: https://www.law.cornell.edu/uscode/text/26/7701
- IRS Publication 519 (2025), *U.S. Tax Guide for Aliens*, Chapter 1, "Days of Presence in the United States" / "Exempt individual" / "Teachers and trainees" / "Students": https://www.irs.gov/pub/irs-pdf/p519.pdf
- IRS, "Alien Residency — Exempt Individual": https://www.irs.gov/individuals/international-taxpayers/alien-residency-exempt-individual
- 26 CFR §301.7701(b)-3 — Days of presence in the United States not counted toward the substantial presence test: https://www.law.cornell.edu/cfr/text/26/301.7701(b)-3
- IRS Form 8843 (2025), *Statement for Exempt Individuals and Individuals With a Medical Condition*, and Instructions — Parts I, II, III: https://www.irs.gov/pub/irs-pdf/f8843.pdf
- IRS, "Taxation of Nonresident Aliens" (overview, visa categories): https://www.irs.gov/individuals/international-taxpayers/taxation-of-nonresident-aliens
- Cross-reference: File 01 (Tax Residency and Substantial Presence Test), Sections 3–4, for the SPT formula and Closer Connection Exception this file feeds into.
- Cross-reference: File 13 (Resident Alien Transition), for mechanics once exempt-individual status is exhausted and SPT is met.
