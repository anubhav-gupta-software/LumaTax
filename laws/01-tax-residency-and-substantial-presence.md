# 01 — Tax Residency Determination: Green Card Test, Substantial Presence Test, and Related Mechanics

**Scope:** This file is the foundational residency-classification engine. Every other file (income classification, FICA, dual-status, etc.) depends on the output of this file: is the individual, for a given calendar year (or portion of it), a **Nonresident Alien (NRA)** or a **Resident Alien (RA)** for U.S. federal income tax purposes? This file does **not** cover the "exempt individual" (F/J/M/Q) day-exclusion rules in depth — those are the entire subject of File 02 and are only referenced here as an input to the day-counting algorithm. It also does not fully re-derive File 13 (resident-alien transition / dual-status mechanics) but gives the residency start/end date rules that feed it.

**Primary authority:** IRC §7701(b) (26 U.S.C. §7701(b)); Treas. Reg. §§301.7701(b)-1 through -9; IRS Publication 519 (2025), Chapter 1, "Nonresident Alien or Resident Alien?"

---

## 1. The Master Rule

**Plain English:** An alien (non-U.S.-citizen) is a **resident alien** for a calendar year if they meet *either* the Green Card Test *or* the Substantial Presence Test (SPT) for that year. If they meet neither test, they are a **nonresident alien** for that year — unless they affirmatively make the **First-Year Choice** (Section 6) to be treated as a resident for part of the year. If they meet one of the tests for only part of the year (typically the year of arrival or departure), they have a **dual-status year** (File 13).

```
FUNCTION determine_residency_status(individual, year):

    is_green_card_resident = GREEN_CARD_TEST(individual, year)      // Section 2
    is_spt_resident        = SUBSTANTIAL_PRESENCE_TEST(individual, year)  // Section 3

    IF is_green_card_resident OR is_spt_resident:
        status = "RESIDENT_ALIEN" (for at least part of the year)
        residency_start_date = EARLIEST qualifying date (Section 5)
        // Check Closer Connection Exception -- can override SPT result only
        // (never overrides the green card test)
        IF is_spt_resident AND NOT is_green_card_resident:
            IF CLOSER_CONNECTION_EXCEPTION_MET(individual, year):   // Section 4
                status = "NONRESIDENT_ALIEN"
                -> ROUTE TO HUMAN REVIEW to confirm Form 8840 filed correctly
    ELSE:
        status = "NONRESIDENT_ALIEN"
        IF FIRST_YEAR_CHOICE_ELIGIBLE(individual, year):            // Section 6
            -> flag optional election; do not auto-apply without
               explicit user confirmation (it is irrevocable without
               IRS consent)

    RETURN status, residency_start_date, residency_end_date
```

**Citation:** IRC §7701(b)(1)(A)–(B); Pub. 519 (2025), p.4, "Nonresident Aliens" / "Resident Aliens."

**Note on scope of "resident for tax purposes":** This status is wholly independent of immigration status. A person can be undocumented and a tax resident; a lawful permanent resident can, in rare treaty-tiebreaker cases, be treated as a nonresident (Section 2.3). Never infer tax residency from visa category alone — F-1/J-1/M-1/Q-1 visa holders are the input to File 02's exempt-individual analysis, which in turn feeds the SPT day count here.

---

## 2. The Green Card Test

**Plain English:** You are a resident alien for a calendar year if you were a lawful permanent resident (LPR) of the United States — i.e., USCIS issued you a Form I-551 ("green card") — at **any time** during that calendar year. This status continues until it is taken away or administratively/judicially determined to be abandoned; a single day of LPR status in a year is enough to make the whole test "met" for that year (subject to the residency start/end date rules in Section 5, which determine which *portion* of the year is taxed as a resident).

**Citation:** IRC §7701(b)(1)(A)(i), §7701(b)(6); Treas. Reg. §301.7701(b)-1(b); Pub. 519 (2025), p.4.

### Decision Logic

```
FUNCTION GREEN_CARD_TEST(individual, year):
    IF individual.held_lawful_permanent_resident_status_on_any_day(year):
        RETURN TRUE
    RETURN FALSE
```

### How LPR status ends (relevant for residency termination date, Section 5.2)

```
LPR status is considered TAKEN AWAY if:
    - U.S. Government issues a final administrative or judicial order
      of exclusion or deportation.

LPR status is considered ABANDONED if:
    (a) Individual-initiated:
        individual files Form I-407 (or a signed letter of intent to
        abandon) WITH the green card attached, with USCIS or a U.S.
        consular officer -> status abandoned on the date that filing
        is RECEIVED (not mailed). Must be sent by certified mail/foreign
        equivalent with proof of mailing and receipt.
        CAUTION: until proof of receipt exists, individual remains a
        resident alien for tax purposes even if USCIS would consider
        the physical card invalid (e.g., expired >10 years).
    (b) Government-initiated: status abandoned when the final
        administrative order of abandonment is issued (or final
        judicial order, if appealed).

EDGE CASE: An LPR who is required to file as a resident and fails to do
so may be deemed under U.S. IMMIGRATION law to have abandoned LPR
status. This is an immigration consequence of a tax-filing failure, not
a tax rule per se -> ROUTE TO HUMAN REVIEW / compliance flag, do not
silently resolve.

EDGE CASE: "Long-Term Resident" (LTR) expatriation. An LPR who held
green-card status in at least 8 of the last 15 tax years and then
ceases to be an LPR may be subject to IRC §877A expatriation tax
(a specialized regime). -> ROUTE TO HUMAN REVIEW (out of scope for a
student-focused engine, but must be flagged if an F-1 student later
becomes an LPR and then abandons status).
```

### 2.3 Tax-Treaty Tiebreaker Override (narrow edge case)

Even if the Green Card Test is met, if the individual claims to be a resident of a foreign country under an applicable U.S. income tax treaty's residency tiebreaker article, they are treated as a nonresident alien for computing tax liability (though still treated as a U.S. resident for other purposes, e.g., information reporting). This can also trigger §877A expatriation tax exposure for certain LPRs.

**Citation:** IRC §7701(b)(6)(B); Pub. 519 (2025), p.4 note.

```
IF green_card_test == TRUE AND individual_claims_treaty_tiebreaker_residency(foreign_country):
    -> ROUTE TO HUMAN REVIEW (treaty tiebreaker claims are fact-intensive,
       require Form 8833 disclosure, and can trigger expatriation tax
       exposure; never auto-apply)
```

This scenario is extremely unlikely for an F-1 student (who by definition does not hold a green card while on F-1 status) but is included for completeness and because F-1 students can transition to LPR status later (e.g., via marriage or employer sponsorship) while still in the user base.

---

## 3. The Substantial Presence Test (SPT)

**Plain English:** You meet the SPT for a calendar year — and are therefore a resident alien — if you are physically present in the United States for:

1. At least **31 days** during the current calendar year, **AND**
2. At least **183 days** during the 3-year period consisting of the current year and the two preceding years, where the days are **weighted**:
   - 100% (all) of the days present in the **current year**, plus
   - **1/3** of the days present in the **first preceding year**, plus
   - **1/6** of the days present in the **second preceding year**.

Both conditions must be satisfied. If current-year presence is 30 days or fewer, the SPT is **never** met for that year regardless of how large the 3-year weighted total is (the 31-day floor is an independent gate, not folded into the 183).

**Citation:** IRC §7701(b)(3)(A); Treas. Reg. §301.7701(b)-1(c); Pub. 519 (2025), p.5.

### 3.1 Core Formula — Pseudocode

```
FUNCTION SUBSTANTIAL_PRESENCE_TEST(individual, current_year):

    days_current  = COUNT_DAYS_OF_PRESENCE(individual, current_year)
    days_prior_1  = COUNT_DAYS_OF_PRESENCE(individual, current_year - 1)
    days_prior_2  = COUNT_DAYS_OF_PRESENCE(individual, current_year - 2)

    // Gate 1: 31-day minimum in current year
    IF days_current < 31:
        RETURN FALSE   // SPT not met, full stop -- no need to compute weighted sum

    // Gate 2: weighted 3-year total >= 183
    weighted_total = days_current
                    + (days_prior_1 / 3)
                    + (days_prior_2 / 6)

    IF weighted_total >= 183:
        RETURN TRUE
    ELSE:
        RETURN FALSE
```

**Worked example (from Pub. 519):** 120 days present in each of 2023, 2024, 2025. Weighted total for 2025 = 120 + (120/3=40) + (120/6=20) = 180 < 183 → SPT **not** met for 2025.

### 3.2 Day-Counting Algorithm — "Days of Presence"

**Plain English:** You are treated as present in the U.S. on any day you are physically present in the country **at any time during that day** (i.e., even a few minutes after midnight counts as a full day — there is no pro-rating by hours, except for the specific statutory exceptions below). Six categories of days are carved out and **do not count** toward either the 31-day or the 183-day calculation.

**Citation:** IRC §7701(b)(7); Treas. Reg. §301.7701(b)-3; Pub. 519 (2025), pp.5–8; Form 8843 Instructions (2025).

```
FUNCTION COUNT_DAYS_OF_PRESENCE(individual, year):
    countable_days = 0
    FOR EACH calendar_day IN year:
        IF individual.physically_present_in_US(calendar_day) == FALSE:
            CONTINUE  // not present at all, doesn't count

        // Individual was physically present at some point on this day.
        // Now check the 6 statutory exclusion categories, IN ANY ORDER
        // (they are not mutually exclusive but any ONE hit excludes the day):

        IF is_regular_commuter_day(individual, calendar_day):              // 3.2.1
            CONTINUE
        IF is_transit_day_under_24_hours(individual, calendar_day):        // 3.2.2
            CONTINUE
        IF is_foreign_vessel_crew_day(individual, calendar_day):           // 3.2.3
            CONTINUE
        IF is_medical_condition_excluded_day(individual, calendar_day):    // 3.2.4
            CONTINUE
        IF is_NATO_force_or_civilian_component_day(individual, calendar_day): // 3.2.5
            CONTINUE
        IF is_exempt_individual_day(individual, calendar_day):            // 3.2.6, see File 02
            CONTINUE

        // Survived all exclusions -> counts as a day of presence
        countable_days += 1

    RETURN countable_days
```

#### 3.2.1 Regular commuters from Canada or Mexico

```
Definition of a "workday": a day on which the individual works in the
U.S., Canada, or Mexico.
Definition of "working period": begins on the first day in the current
year the individual is physically present in the U.S. to work, ends on
the last such day in the current year. Seasonal/cyclical work uses the
season/cycle's first/last day instead. An individual can have multiple
working periods in one year; a working period can straddle two
calendar years.
"Commute" = travel to work and return to the residence within a
24-hour period.

IF individual regularly commutes to work in the U.S. from a residence
   in Canada or Mexico
   AND (workdays physically commuting into the U.S.) / (total workdays
        in the working period, U.S. + Canada/Mexico) > 75% (0.75):
    THEN every day of commuting into the U.S. during that working
         period is EXCLUDED from the day count.
ELSE:
    all days of presence count normally (no partial credit at <=75%).
```

**Edge case:** This exception is essentially irrelevant to F-1 students (who do not typically live in Canada/Mexico and commute daily), but should remain in the engine for completeness/other visa categories on the same platform.

#### 3.2.2 Days in transit (<24 hours, between two foreign points)

```
IF individual is physically present in the U.S. for < 24 hours
   AND the sole purpose of the presence is to travel between two
       points OUTSIDE the U.S. (e.g., connecting flights)
   AND the individual's activities are "substantially related to
       completing travel" (e.g., changing planes at an airport):
    THEN that day is EXCLUDED.

EXCEPTION: If the individual attends a business meeting while in the
U.S. during that layover -- even if the meeting is physically at the
airport -- the day is NOT excluded (not considered "in transit").
```

#### 3.2.3 Crew members of a foreign vessel

```
IF individual is temporarily present in the U.S. as a regular crew
   member of a foreign vessel engaged in transportation between the
   U.S. and a foreign country/U.S. territory:
    THEN those days are EXCLUDED,
    UNLESS the individual otherwise engages in a trade or business in
    the U.S. on that day (then it counts).
```

#### 3.2.4 Medical condition exception

**Plain English:** Days the individual intended to leave the U.S. but could not, because of a medical condition or problem that **arose while in the United States**, do not count. This requires a Form 8843 filing.

```
IF individual intended_to_leave_on(day)
   AND individual.actual_departure_prevented_by_medical_condition
   AND medical_condition.arose_while_in_US == TRUE
   AND NOT (any disqualifying circumstance below):
    THEN day is EXCLUDED
    REQUIRES: Form 8843, Part V, fully completed (Section 17a-18,
              including physician's certification), filed by the due
              date of Form 1040-NR.

DISQUALIFYING CIRCUMSTANCES (day is NOT excludable even with a medical
issue):
    - Individual was initially prevented from leaving, later became
      able to leave, but stayed beyond a reasonable period to arrange
      departure.
    - Individual returned to the U.S. for treatment of a condition
      that arose during a PRIOR stay (i.e., re-entered specifically
      for treatment).
    - The condition existed BEFORE arrival and individual was aware of
      it, regardless of whether treatment was needed at time of entry.

SPECIAL RULE: If individual is judged mentally incompetent, intent to
leave is inferred from their pattern of behavior BEFORE being judged
incompetent.

IF Form 8843 not timely filed:
    -> the medical-condition days CANNOT be excluded, UNLESS individual
       can show "clear and convincing evidence" of reasonable actions
       taken to learn of and comply with the filing requirement.
       -> ROUTE TO HUMAN REVIEW (facts-and-circumstances reasonable-
          cause determination; do not auto-waive the filing miss).
```

#### 3.2.5 NATO visa days

```
IF individual is present in the U.S. under a NATO visa as a member of
   a force or civilian component to NATO:
    THEN those days are EXCLUDED.
EXCEPTION: This does NOT apply to immediate family members present
under a NATO visa as dependents -- a dependent family member must
count EVERY day of presence.
```
Essentially irrelevant to F-1 students; retained for platform completeness.

#### 3.2.6 Exempt individual days (F/J/M/Q students, teachers/trainees, etc.)

This is the single most important exclusion category for F-1 students and is governed entirely by **File 02**. In brief: days on which the individual is classified as an "exempt individual" under IRC §7701(b)(5) do not count toward the SPT at all, for either the 31-day or 183-day prongs. Call `IS_EXEMPT_INDIVIDUAL_DAY()` from File 02's logic here; do not re-implement the 5-year/2-of-6-year rules in this file.

```
is_exempt_individual_day(individual, calendar_day) =
    File02.IS_EXEMPT_INDIVIDUAL(individual, calendar_day)
```

### 3.3 What counts as "the United States" for SPT purposes

```
"United States" INCLUDES:
    - the 50 states + District of Columbia
    - territorial waters of the U.S.
    - the seabed/subsoil of submarine areas adjacent to U.S. territorial
      waters over which the U.S. has exclusive exploration/exploitation
      rights under international law

"United States" DOES NOT INCLUDE:
    - U.S. territories (Puerto Rico, Guam, USVI, American Samoa, CNMI)
    - U.S. airspace
```
**Citation:** Pub. 519 (2025), p.5. (Note: U.S. territories have their own, separate residency regimes — see Pub. 519 "Aliens From American Samoa or Puerto Rico"; out of scope here but flag if a student has days physically in a U.S. territory, since those days are not automatically "U.S." presence days for this test.)

---

## 4. Closer Connection Exception to the Substantial Presence Test

**Plain English:** Even if the SPT (Section 3) is technically met, an individual can still be treated as a **nonresident alien** for the year if they (a) were present in the U.S. for **fewer than 183 days** in that year, (b) maintained a **tax home** in a foreign country throughout the year, and (c) had a **closer connection** to that one foreign country (or, under stricter conditions, to each of **two** foreign countries) than to the United States. This exception requires filing **Form 8840**.

**Important scope limit:** This exception overrides only the *Substantial Presence Test*. It can **never** override a Green Card Test result, and it does **not** apply to days excluded for the exempt-individual determination (File 02) — those operate as a separate, prior gate. In practice, it is most useful to an F-1 student only in edge-case scenarios (e.g., someone who is a resident under SPT purely because their 5-year exemption expired and they are now testing whether they still have strong enough foreign ties) and is **distinct from** the "intent to reside permanently" facts-and-circumstances test under the student 5-year exemption rule in File 02 (which uses an overlapping-but-not-identical list of factors).

**Citation:** IRC §7701(b)(3)(B)–(C); Treas. Reg. §301.7701(b)-2; Pub. 519 (2025), pp.8–9.

### Decision Logic

```
FUNCTION CLOSER_CONNECTION_EXCEPTION_MET(individual, year):

    IF days_present(individual, year) >= 183:
        RETURN FALSE    // hard gate -- 183+ actual days in CURRENT year
                         // always defeats this exception, no matter the
                         // facts on foreign ties

    IF NOT individual.maintained_tax_home_in_foreign_country(year):
        RETURN FALSE

    num_foreign_tax_homes_this_year = count of foreign countries where
        individual maintained a qualifying tax home during the year

    IF num_foreign_tax_homes_this_year == 1:
        connection_test_country = that one country
    ELSE IF num_foreign_tax_homes_this_year == 2:
        // Two-country exception requires ALL of:
        IF NOT (
            tax_home_1_began_on_jan_1_of_year AND
            individual_changed_tax_home_mid_year_to_country_2 AND
            tax_home_2_maintained_through_dec_31 AND
            closer_connection_to_country_1_during_its_period AND
            closer_connection_to_country_2_during_its_period AND
            ( subject_to_tax_as_resident_of_either_country_for_full_year
              OR subject_to_tax_as_resident_of_BOTH_countries_for_their
                 respective_tax_home_periods )
        ):
            RETURN FALSE   // doesn't qualify for 2-country variant
        // else proceed, testing closer connection separately per period
    ELSE:
        RETURN FALSE   // more than 2 foreign tax homes in a year is not
                        // covered by this exception -> ROUTE TO HUMAN REVIEW

    IF NOT HAS_CLOSER_CONNECTION(individual, connection_test_country, year):
        RETURN FALSE

    REQUIRES: Form 8840 filed by Form 1040-NR due date (incl. extensions).
    IF Form 8840 not timely filed:
        RETURN FALSE  // cannot claim exception
        UNLESS clear-and-convincing reasonable-cause evidence exists
        -> ROUTE TO HUMAN REVIEW

    RETURN TRUE
```

### "Tax home" definition

```
tax_home = general area of main place of business/employment/post of
duty (regardless of where the family home is).
    IF individual has a regular/main place of business or employment:
        tax_home = location of that place
    ELSE IF no regular/main place of business (nature of work requires
         travel):
        tax_home = place where individual regularly LIVES
    ELSE (itinerant, fits neither):
        tax_home = wherever individual is currently working

REQUIREMENT for this exception specifically: the claimed foreign tax
home must have existed for the ENTIRE current calendar year and be
located in the same country claimed for closer connection.
```

### "Closer connection" facts and circumstances (non-exhaustive list per Pub. 519 / Treas. Reg. §301.7701(b)-2)

```
Factors considered (no single factor controls):
    1. Country of residence designated on official forms/documents
    2. Type of forms filed (e.g., W-9 vs. W-8BEN vs. W-8ECI)
    3. Location of: permanent home, family, personal belongings
       (cars, furniture, clothing, jewelry), current social/political/
       cultural/professional/religious affiliations, business
       activities (other than the tax home itself), driver's license
       jurisdiction, voting jurisdiction, charitable-giving jurisdiction

"Permanent home" need not be owned; a rented apartment/furnished room
qualifies IF available at all times, continuously, and not solely for
short stays.

DISQUALIFYING FACTS (closer connection CANNOT be claimed if either is
true, regardless of other facts):
    - Individual personally applied for, or took other affirmative
      steps toward, a change of status to LPR during the year, OR
    - Individual had a pending application for adjustment of status
      to LPR during the year.
    -> These same two facts are also directly relevant to File 02's
       "intent not to permanently reside" test for students past their
       5-year exemption -- the two tests share this disqualifying
       condition but are NOT the same test and must be evaluated
       separately when both could apply.
```

---

## 5. Residency Starting Date and Residency Ending Date

These dates matter because they delimit exactly which days of the year are taxed under resident-alien rules vs. nonresident-alien rules — i.e., they define the boundary for a dual-status year (full mechanics in File 13).

### 5.1 Residency Starting Date

**Citation:** Treas. Reg. §301.7701(b)-4(a); Pub. 519 (2025), pp.9–10.

```
FUNCTION RESIDENCY_STARTING_DATE(individual, year):

    was_resident_prior_year = individual.was_US_resident_any_part_of(year - 1)
    IF was_resident_prior_year:
        RETURN January 1 of `year`   // deemed resident from Jan 1, no
                                      // gap year allowed -- see "Residency
                                      // during the preceding year" rule

    met_green_card = GREEN_CARD_TEST(individual, year)
    met_spt        = SUBSTANTIAL_PRESENCE_TEST(individual, year)

    date_under_spt = NULL
    IF met_spt:
        date_under_spt = first_day_physically_present_in_US(year)
        // De minimis exception: up to 10 days of actual presence can be
        // EXCLUDED from this starting-date calculation (but NOT from the
        // SPT day count itself, which still includes them) IF, for each
        // excluded day:
        //   (a) individual had a closer connection to a foreign country
        //       than to the U.S. on that day, AND
        //   (b) individual's tax home was in that foreign country on
        //       that day.
        // Constraints on the 10-day exclusion:
        //   - can span more than one period of presence, total <= 10 days
        //   - CANNOT exclude only SOME days of a single consecutive
        //     block of presence -- either the whole consecutive block
        //     is excludable or none of it is
        // REQUIRES a signed, dated, penalties-of-perjury statement
        // attached to the return (or filed separately if no return
        // required) containing: name/address/TIN/visa #, passport #
        // and issuing country, tax year, first/last day present that
        // year, dates excluded, and facts establishing tax home +
        // closer connection for the excluded period. Due by Form
        // 1040-NR due date.
        // IF statement not timely filed -> the 10-day exclusion is LOST
        // and residency starting date reverts to the literal first day
        // of presence, UNLESS clear-and-convincing reasonable cause.
        date_under_spt = APPLY_10_DAY_DEMINIMIS_EXCLUSION(date_under_spt)

    date_under_green_card = NULL
    IF met_green_card:
        date_under_green_card = first_day_in_year_present_as_LPR(individual)

    IF met_spt AND met_green_card:
        RETURN MIN(date_under_spt, date_under_green_card)  // the EARLIER date
    ELSE IF met_spt:
        RETURN date_under_spt
    ELSE IF met_green_card:
        RETURN date_under_green_card
    ELSE:
        RETURN NULL   // not a resident this year under either test;
                       // check First-Year Choice (Section 6) separately
```

**Worked example (Pub. 519):** Citizen of Russia enters U.S. Jan 6, 2025 for a business meeting, leaves Jan 10 (closer connection to Russia maintained for Jan 6–10), returns and resides permanently from March 1, 2025. Residency starting date = **March 1, 2025** (the 5-day January visit is excluded via the de minimis rule).

### 5.2 Residency Ending Date ("Last Year of Residency")

**Citation:** Treas. Reg. §301.7701(b)-4(b); Pub. 519 (2025), pp.11–12.

```
FUNCTION RESIDENCY_ENDING_DATE(individual, year):

    will_be_resident_next_year = individual.will_be_US_resident_any_part_of(year + 1)
    IF will_be_resident_next_year:
        RETURN December 31 of `year`   // treated as resident through
                                        // year-end, no early termination
                                        // permitted if resident status
                                        // resumes next year

    default_end_date = December 31 of `year`

    IF individual qualifies for an EARLIER termination date:
        candidate_dates = []
        IF met_spt_this_year:
            candidate_dates.append( last_day_physically_present_in_US(year) )
        IF met_green_card_this_year:
            candidate_dates.append( first_day_no_longer_LPR(year) )

        earlier_date = MAX(candidate_dates)   // "later of the two" if both apply
        // Eligibility requirement: for the REMAINDER of the year after
        // the candidate date, individual's tax home must be in a
        // foreign country AND individual must have a closer connection
        // to that country than to the U.S. (same Section 4 concepts).

        // De minimis exception: up to 10 days of actual presence AFTER
        // the candidate end date can be disregarded for THIS calculation
        // only (not for the SPT day count) under the same rules as 5.1
        // (cannot split a consecutive block; must still have closer
        // connection + tax home abroad during the excluded days).

        REQUIRES a signed, dated, penalties-of-perjury statement (same
        required contents as the starting-date statement, plus: date
        LPR status was abandoned/rescinded if applicable, and supporting
        documents). Due by Form 1040-NR due date.

        IF statement not timely filed:
            -> earlier termination date CANNOT be claimed; ending date
               reverts to Dec 31, UNLESS clear-and-convincing reasonable
               cause -> ROUTE TO HUMAN REVIEW

        RETURN earlier_date
    ELSE:
        RETURN default_end_date
```

**Worked example (Pub. 519):** Citizen of Malta present Mar 1–Aug 25, 2025 (178 days), then returns Dec 12–16, 2025 (5 days) for vacation. Total presence = 183 days → SPT met for 2025. But individual establishes closer connection to Malta from Aug 25 onward; the 5 December days are excluded via de minimis rule → **residency termination date = August 25, 2025**.

### 5.3 "Residency during the preceding/next year" continuity rule

```
IF resident any part of year N-1 AND resident any part of year N:
    -> deemed resident from January 1 of year N (no starting-date
       gap; overrides the normal "first day present" starting-date
       calculation entirely)

IF resident any part of year N AND resident any part of year N+1:
    -> deemed resident through December 31 of year N (no early
       termination date permitted for year N, even if closer-connection
       facts would otherwise support one)
```
This "bridge" rule exists specifically to prevent a resident from manufacturing a short nonresident gap between two residency periods that straddle a single absence.

---

## 6. First-Year Choice

**Plain English:** If an individual does not meet the Green Card Test or SPT for the current year (call it Year N), but WILL meet the SPT for Year N+1, they may elect to be treated as a resident alien for part of Year N anyway — effectively pulling their residency start date earlier than it would otherwise be. This is an **election**, not an automatic outcome, and it cannot be revoked later without IRS consent.

**Citation:** IRC §7701(b)(4); Treas. Reg. §301.7701(b)-4(c)(3); Pub. 519 (2025), pp.10–11.

### Eligibility and Mechanics

```
FUNCTION FIRST_YEAR_CHOICE_ELIGIBLE(individual, year_N):

    IF GREEN_CARD_TEST(individual, year_N) OR SUBSTANTIAL_PRESENCE_TEST(individual, year_N):
        RETURN FALSE   // only relevant if NEITHER test met in year N

    IF individual.elected_resident_status_for_part_of(year_N - 1):
        RETURN FALSE   // cannot have already chosen residency for the
                        // immediately preceding year

    IF NOT SUBSTANTIAL_PRESENCE_TEST(individual, year_N + 1):
        RETURN FALSE   // must actually meet SPT in the FOLLOWING year;
                        // cannot be determined until that year's data
                        // exists -- this is why filing must be delayed
                        // (see below)

    // Condition 1: at least 31 CONSECUTIVE days of presence in year_N
    thirty_one_day_period = find_any_31_consecutive_day_window_of_presence(year_N)
    // excluding, in this count, any day that would otherwise be excluded
    // under Section 3.2 (commuter/transit/crew/medical/NATO/exempt-
    // individual) -- those days do NOT count toward the 31 consecutive
    // days OR the 75% test below
    IF thirty_one_day_period does not exist:
        RETURN FALSE

    // Condition 2: >=75% presence from start of that 31-day period
    // through Dec 31 of year_N
    period_start = thirty_one_day_period.start_date
    period_end   = Dec 31 of year_N
    total_days_in_window = DAYS_BETWEEN(period_start, period_end) + 1
    actual_days_present   = count of days present (per Section 3.2 rules)
                             in that window
    days_absent           = total_days_in_window - actual_days_present
    deemed_present_absences = MIN(days_absent, 5)   // up to 5 absence
                                                      // days can be
                                                      // TREATED as present
    effective_presence_pct = (actual_days_present + deemed_present_absences)
                              / total_days_in_window

    IF effective_presence_pct < 0.75:
        RETURN FALSE

    RETURN TRUE
    // If multiple qualifying 31-day windows exist, residency starting
    // date = first day of the FIRST window that independently satisfies
    // BOTH conditions above (not necessarily the earliest window overall
    // if an earlier window fails the 75% test).
```

```
MECHANICS / FILING SEQUENCE:
    1. Cannot file Form 1040/1040-SR (or the election statement) until
       SPT is actually MET for year_N+1.
    2. If SPT for year_N+1 is not yet determinable by the normal April 15
       due date of the year_N return, individual must request a filing
       extension (Form 4868) and pay estimated tax for year_N computed
       AS IF a full-year nonresident alien (using Form 1040-NR rates) by
       the extended deadline.
    3. REQUIRED STATEMENT attached to Form 1040/1040-SR must include:
       name/address; statement that this is the First-Year Choice for
       year_N; statement that individual was NOT a resident in year_N-1;
       statement that individual IS a resident under SPT in year_N+1;
       count of days present in year_N+1; the dates of the 31-day
       qualifying period and continuous presence in year_N; dates of any
       absences in year_N being treated as presence.
    4. Once made, the election is IRREVOCABLE without IRS approval.
    5. If procedures not followed correctly -> individual is treated as
       NRA for all of year_N (the election simply fails), UNLESS
       clear-and-convincing reasonable cause shown.

RESIDENCY STARTING DATE IF ELECTED = first day of the qualifying 31-day
period (NOT the first day of actual physical presence in year_N, if
different).
```

**Engine implementation note:** Because this election depends on a *future* year's data and is irrevocable, the engine must never auto-apply it. Surface it as an optional, user-confirmed election with a clear explanation, and block e-filing until the year N+1 SPT outcome is actually known.

---

## 7. Choosing Resident Alien Status / Nonresident Spouse Treated as Resident (cross-reference only)

Pub. 519 Ch. 1 also describes two **married-couple elections** — (a) a dual-status alien married to a U.S. citizen/resident at year-end can elect full-year resident status jointly with the spouse (IRC §6013(h)); (b) a couple where one spouse is a nonresident alien at year-end and the other is a U.S. citizen/resident can elect to treat the NRA spouse as a resident for the whole year (IRC §6013(g)). Both require a joint return, tax worldwide income for both spouses, and are relevant primarily to File 13 (they each *remove* the dual-status restrictions). These are **not** re-derived in full here — see File 13, Section on "Choosing Resident Alien Status," for complete mechanics, suspension, and termination rules. Both elections require marriage to a U.S. citizen or resident alien, which is uncommon but not rare in the F-1 population (e.g., marriage during OPT); **treat as a human-review trigger** given the complexity and irrevocability of related elections (§6013(g) can be revoked; §6013(h) generally cannot be made again later).

---

## 8. Dual-Status Alien — Pointer

A person can be both a nonresident alien and a resident alien within the same calendar year — most commonly in the year of arrival (nonresident portion before the residency starting date, resident portion after) or departure (resident portion before the residency ending date, nonresident portion after). Full return-mechanics, form selection, and restriction rules for a dual-status year are covered in **File 13 (Resident Alien Transition)** and are intentionally not duplicated here. This file's sole output into that process is the `residency_start_date` / `residency_end_date` pair computed in Section 5.

---

## 9. Edge Cases and Human-Review Triggers (This File)

- **Treaty tiebreaker override of Green Card Test** (Section 2.3) — always route to human review; involves Form 8833 and possible §877A exposure.
- **Closer Connection Exception claims** (Section 4) — fact-intensive; engine should compute the hard numeric gates (183-day ceiling, tax-home existence) automatically but should route the qualitative "closer connection" factor-weighing to human review/document collection rather than auto-approving Form 8840.
- **First-Year Choice** (Section 6) — never auto-apply; always a confirmed, explained user election, and filing must be sequenced correctly (extension + estimated payment) before the following year's SPT outcome is known.
- **Multiple foreign tax homes in a single year** (>2) under the Closer Connection Exception — not covered by the statute; route to human review.
- **LPR status changes (abandonment, deportation order, LTR expatriation)** — route to human review; §877A expatriation tax is a specialized regime outside a standard student-filing engine.
- **Any day-counting input that is ambiguous** (e.g., unclear whether a day in the U.S. was "in transit" vs. attending a business meeting) — do not guess; flag for user confirmation, since misclassifying even a few days can flip the 31-day or 183-day gates.
- **Statement-filing deadlines missed** (10-day de minimis exclusion statement, closer-connection statement, First-Year Choice statement) — the "clear and convincing evidence of reasonable cause" exception is a subjective IRS standard; never auto-grant it. Default assumption should be that the statement was NOT timely filed unless the engine has affirmative confirmation, and route to human review if the user wants to argue reasonable cause.

---

## Sources

- IRS Publication 519 (2025), *U.S. Tax Guide for Aliens*, Chapter 1 "Nonresident Alien or Resident Alien?": https://www.irs.gov/pub/irs-pdf/p519.pdf
- IRS, "Substantial Presence Test": https://www.irs.gov/individuals/international-taxpayers/substantial-presence-test
- IRS, "Alien Residency — Green Card Test": https://www.irs.gov/individuals/international-taxpayers/alien-residency-green-card-test
- IRS, "Alien Residency — Exempt Individual": https://www.irs.gov/individuals/international-taxpayers/alien-residency-exempt-individual
- 26 U.S.C. §7701(b) — Definition of resident alien and nonresident alien: https://www.law.cornell.edu/uscode/text/26/7701
- 26 CFR §301.7701(b)-1 through §301.7701(b)-9 (Treasury Regulations implementing §7701(b)): https://www.ecfr.gov/current/title-26/chapter-I/subchapter-F/part-301/subpart-ECFR5ffaf3310af6b61
- IRS Form 8840, *Closer Connection Exception Statement for Aliens*, and Instructions: https://www.irs.gov/forms-pubs/about-form-8840
- IRS Form 8843, *Statement for Exempt Individuals and Individuals With a Medical Condition*, and Instructions (2025): https://www.irs.gov/pub/irs-pdf/f8843.pdf
- IRC §877A — Expatriation tax (referenced for LTR edge case): https://www.law.cornell.edu/uscode/text/26/877A
- IRC §6013(g)/(h) — Married elections (referenced, full treatment in File 13): https://www.law.cornell.edu/uscode/text/26/6013
