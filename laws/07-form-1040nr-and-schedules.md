# Form 1040-NR and Schedules — Structure and Line-Level Logic Spec

**Scope:** Logic spec for the 2025 Form 1040-NR main form plus Schedule OI (Other Information), Schedule NEC (tax on non-effectively-connected income), and Schedule A (itemized deductions). For each schedule, lines are tagged **[ALWAYS]** (nearly every F-1 student return touches this), **[SOMETIMES]** (common in specific scenarios — brokerage account, treaty claim, etc.), or **[RARE]** (edge case, flag for review if populated). A full "extracted data field → form line" mapping table is in §6.

---

## 1. Main Form 1040-NR — Structure

### 1A. Filing Status (top of page 1) — decision logic

```
options = {Single, Married Filing Separately (MFS), Qualifying Surviving Spouse (QSS),
           Estate, Trust}
# Head of Household and Married Filing Jointly are NOT options on Form 1040-NR.
```

**[ALWAYS]** for the F-1 student population: **Single**.

**MFS — the default for married NRAs:**
```
IF taxpayer is married (regardless of whether living with spouse)
   THEN filing status = MFS
   UNLESS taxpayer qualifies for the "married persons who live apart" exception below
   UNLESS taxpayer makes the one-time "election to be taxed as a resident alien" (§1D) —
      which takes them OFF Form 1040-NR entirely and onto a joint Form 1040
```

**"Married persons who live apart" exception → file as Single:** ALL FIVE of the following must be true:
1. Lived apart from spouse for the last 6 months of 2025 (temporary absences for business/medical/school/military don't break this)
2. Files a separate return from spouse
3. Paid over half the cost of keeping up the home for 2025
4. Home was the main home of taxpayer's child/stepchild/foster child for more than half of 2025
5. Taxpayer could claim (or could have claimed but for the noncustodial-parent rule) that child as a dependent

AND taxpayer must also be a married resident of Canada, Mexico, or South Korea; a married U.S. national; or a married student/business apprentice eligible for India Article 21(2) benefits. **[RARE]** for F-1 students — flag for review rather than auto-applying, since it requires both a marital-separation fact pattern and a qualifying-country status.
**Citation:** Instructions for Form 1040-NR (2025), p.17, "Married Filing Separately — Exception."

**Qualifying Surviving Spouse (QSS)** — requires BOTH: (1) for 2025, resident of Canada/Mexico/South Korea, OR U.S. national, OR India Article 21(2) student/apprentice; AND (2) taxpayer was a resident alien or U.S. citizen in the year the spouse died (actual status, not an election). **[RARE]** for the F-1 student population.
**Citation:** Instructions for Form 1040-NR (2025), p.17, "Qualifying Surviving Spouse — Exception."

**Estate / Trust:** filing status for a personal representative or foreign trust filer — out of scope for individual student engine; route to specialized handling.

### 1B. Digital Assets question **[ALWAYS]**
Every filer must answer Yes/No: did you receive (as reward/award/payment) or sell/exchange/dispose of a digital asset during 2025? Must be answered regardless of the answer's tax impact.
**Citation:** Form 1040-NR (2025) p.1.

### 1C. Dependents section **[RARE for F-1 students — see File 1 §5 for the hard country bar]**
New for 2025: numbered-row format collecting more detail per dependent (to support CTC/ODC eligibility determination). Only populate if country of residence (Schedule OI Item B) is Canada/Mexico and the dependent otherwise qualifies, or the limited South Korea/India exceptions apply.
**Citation:** Instructions for Form 1040-NR (2025), p.5, "Changes to Dependents section"; p.17, "Dependents."

### 1D. Election to Be Taxed as a Resident Alien — exit ramp from 1040-NR
```
IF taxpayer was married AND spouse was a U.S. citizen/resident alien on the last day of the
   tax year AND taxpayer files a joint Form 1040/1040-SR with a statement attached
   THEN taxpayer elects to be taxed as a resident alien for the WHOLE year (worldwide income),
      files Form 1040 (NOT 1040-NR), and this is a one-time, generally irrevocable election.
      → ROUTE OUT of the 1040-NR engine path entirely if this election is indicated.
```
**Citation:** Instructions for Form 1040-NR (2025), p.13, "Election To Be Taxed as a Resident Alien."

### 1E. Income (ECI) section — lines 1a–9 **[see File 1 §1A for ECI/NEC classification test]**
| Line | Field | Student relevance |
|---|---|---|
| 1a | W-2 box 1 wages (ECI only — exclude any wage amount claimed as treaty-exempt) | **[ALWAYS]** for any student with a campus job/CPT/OPT |
| 1b–1h | Household employee wages, tips, Medicaid waiver payments, dependent care benefits, adoption benefits, Form 8919 wages, other earned income | **[RARE]** |
| 1k | Total income exempt by treaty (from Schedule OI Item L, line 1(e)) | **[SOMETIMES]** — populated whenever a treaty wage/scholarship exemption is claimed (e.g., a French or Indian student excluding treaty-exempt wages per Article 21) |
| 2a/2b | Tax-exempt / taxable interest (ECI only) | **[RARE]** — most student bank interest isn't ECI; if NEC, goes on Schedule NEC instead, and is usually exempt from the 30% tax anyway (bank-deposit-interest exception) |
| 3a/3b | Qualified/ordinary dividends (ECI only) | **[RARE]** for students; brokerage dividends are usually NEC |
| 7a | Capital gain/loss (ECI only — real property dispositions are automatically ECI) | **[RARE]** |
| 8 | Additional income from Schedule 1, line 10 | **[SOMETIMES]** — this is where the non-tuition/non-fee portion of a scholarship (Schedule 1 line 8r) flows through |
| 9 | Total effectively connected income | **[ALWAYS]** (computed) |

### 1F. Deductions and Taxable Income — lines 10–15 (full mechanics in File 1 §0/§2/§3)
| Line | Field |
|---|---|
| 10 | Adjustments to income (Schedule 1 Part II) |
| 11a/11b | AGI |
| 12 | Itemized deductions (Schedule A) OR India-treaty standard deduction |
| 13a–13c | QBI deduction / estate-trust exemption / Schedule 1-A additions |
| 15 | Taxable income |

### 1G. Tax and Credits — lines 16–24
| Line | Field | Student relevance |
|---|---|---|
| 16 | Tax (Tax Table/Computation Worksheet, Single/MFS/QSS column only) | **[ALWAYS]** |
| 17 | Schedule 2 Part I (AMT, excess APTC) | **[RARE]** |
| 19 | CTC/ODC (restricted — File 1 §5) | **[RARE]** |
| 20 | Schedule 3 credits | **[SOMETIMES]** (foreign tax credit most common) |
| 23a | Schedule NEC tax | **[SOMETIMES]** (whenever any NEC income exists) |
| 23b | Schedule 2 Part II other taxes (self-employment tax, Additional Medicare Tax) | **[RARE]** |
| 23c | 4% transportation tax | **[RARE]** |
| 24 | Total tax | **[ALWAYS]** (computed) |

### 1H. Payments, Refund, Amount Owed — lines 25–38
| Line | Field | Student relevance |
|---|---|---|
| 25a | W-2 withholding | **[ALWAYS]** if employed |
| 25b | 1099 withholding | **[SOMETIMES]** |
| 25g | 1042-S withholding (box 10) | **[SOMETIMES]** — common for scholarship/fellowship or treaty-reported income |
| 26 | Estimated tax payments | **[RARE]** |
| 33–38 | Total payments / refund / amount owed / penalty | **[ALWAYS]** (computed) |

**Citation throughout 1E–1H:** Form 1040-NR (2025), pp.1-2; Instructions for Form 1040-NR (2025), pp.16-23.

---

## 2. Schedule OI (Form 1040-NR) — Other Information

Every filer must answer **all** items. This schedule is the primary data source for residency/treaty/SPT determinations.

| Item | Field | Relevance |
|---|---|---|
| A | All countries of citizenship/nationality during the tax year | **[ALWAYS]** |
| B | Country claimed as tax residence | **[ALWAYS]** — drives the dependents/credits country test (File 1 §5-6) |
| C | Ever filed USCIS Form I-485 / DOS Form DS-230/DS-260 (green card application)? | **[ALWAYS]** asked; "Yes" → **route to review** (parallels Form 8843 Part III line 13) |
| D | Expatriation-related questions (former U.S. citizen/long-term resident) | **[RARE]**; "Yes" → route to review (covered-expatriate rules) |
| E | Visa type held on last day of tax year (or immigration status if no visa) | **[ALWAYS]** — e.g., "F-1 Academic Student" |
| F | Did visa type/immigration status ever change? | **[ALWAYS]** asked; if "Yes," requires a dated explanation |
| G | Dates entered/left the U.S. during 2025 (short trips) | **[ALWAYS]** — feeds day-count; Canada/Mexico regular commuters (>75% of workdays) are exempt from itemizing each date |
| H | Days actually present in U.S. during 2025/2024/2023 | **[ALWAYS]** — this is the SPT raw input, cross-referenced against Form 8843 Part I line 4a |
| I | Latest prior-year U.S. return filed (year + form) | **[SOMETIMES]** |
| J | Trust-specific questions | **[RARE]** (N/A to individual filers) |
| K | Total compensation ≥$250,000 and alternative sourcing method used? | **[RARE]** for students; if "Yes" to the second sub-question, a detailed statement must be attached |
| L | **Treaty claim table**: country, treaty article, months claimed in prior years, amount of exempt income this year | **[SOMETIMES]** — populated whenever any treaty exemption is claimed (wages under a student/trainee article, scholarship exemption, India standard-deduction eligibility, etc.); total (line 1e) must tie to Form 1040-NR line 1k |
| M | Section 871(d) real property election (new/continuing) | **[RARE]** — not applicable to students without U.S. real property |

**Decision logic for Item L (most consequential for F-1 students claiming a wage or scholarship treaty exemption):**
```
IF taxpayer claims any treaty-based exemption from U.S. tax on income otherwise reportable on
   page 1 or Schedule NEC
   THEN Schedule OI Item L MUST be completed: country (a), treaty article (b), months claimed
      in prior years (c), amount exempt this year (d); sum column (d) into line 1(e), and carry
      that total to Form 1040-NR line 1k.
   AND attach any Form 1042-S received for the treaty-exempt income.
   AND determine whether Form 8833 (treaty-based return position disclosure) is independently
      required — see File 1 §9 "Edge Cases," and the 5 narrow exceptions in Item L instructions
      (most routine student wage/scholarship/pension treaty claims and totalization-agreement
      claims are EXEMPT from the Form 8833 requirement; claims aggregating ≤$10,000 are also
      exempt).
```
**Citation:** Instructions for Form 1040-NR (2025), pp.44-46, "Instructions for Schedule OI."

---

## 3. Schedule NEC (Form 1040-NR) — Tax on Income Not Effectively Connected

Structure: a grid of income categories (rows) × tax-rate columns (a) 10%, (b) 15%, (c) 30%, (d) Other/treaty rate (including 0%). Income is placed in the row for its category and the column for the rate that applies (treaty rate if a treaty reduces the default 30%).

| Line(s) | Category | Student relevance |
|---|---|---|
| 1a–1c | Dividends (U.S. corp / foreign corp U.S.-source / dividend-equivalent payments) | **[SOMETIMES]** — if the student holds a U.S. brokerage account; default 30%, often reduced to 15%/0% by treaty |
| 2a–2c | Interest | **[RARE]** — bank deposit interest and portfolio interest on post-7/18/1984 obligations are generally EXEMPT from the 30% tax entirely (not merely treaty-reduced) — verify against the exception list before taxing any interest line |
| 6 | Real property income / natural resources royalties | **[RARE]** |
| 8 | Social Security benefits (85% of SSA-1042S/RRB-1042S box 5 total) | **[RARE]** for students |
| 9 | Capital gain (from line 18) | **[RARE]** — ONLY taxable if present ≥183 days during the year counting non-exempt-individual days (see File 1 §1A); most F-1 students in years 1-5 have 0 countable days and thus $0 taxable capital gain here even with real brokerage gains |
| 10a–10c | Gambling — Canada residents only | **[RARE]** |
| 11 | Gambling — all other country residents | **[RARE]**; many treaties exempt gambling winnings (enter in column (d), 0%) |
| 12 | "Other" (certain alimony, prizes/awards, §5000C withholding, ABLE account distributions, certain personal-property sale gains) | **[RARE]** |
| 16–18 | Capital gains/losses from sales/exchanges of property | **[RARE]** — same 183-day gate as line 9; losses in excess of gains are NOT deductible; no capital loss carryover permitted |

**Decision logic — the 183-day capital gains gate (distinct from the SPT lookback test):**
```
IF taxpayer was physically present in the U.S. ≥183 days during the CURRENT tax year
   (this is a simple current-year day count, NOT the 3-year weighted SPT calculation, and
    "exempt individual" days generally ARE counted for THIS specific 183-day gambling/capital-
    gains test even though they are excluded from the SPT itself — verify against Pub. 519
    "Capital gains" discussion for the precise day-counting nuance before finalizing)
   THEN U.S.-source capital gains in excess of U.S.-source capital losses are taxed at 30% (or
      treaty rate) via Schedule NEC lines 16-18
ELSE
   THEN U.S.-source capital gains are NOT taxed at all for that year
```
→ **Flag for human/tax-counsel verification**: the precise interaction between "exempt individual" status and the 183-day capital-gains test is a nuanced area of Pub. 519 that this spec treats as a rule-of-thumb, not a guaranteed-correct computation; do not let the engine silently zero out large capital gains without a review step the first time this scenario appears for a given user.

**Citation:** Instructions for Form 1040-NR (2025), pp.42-44, "Instructions for Schedule NEC"; line-specific exceptions for dividends/interest.

---

## 4. Schedule A (Form 1040-NR) — Itemized Deductions

(Full rule detail in File 1 §3; this table is the line-level student-relevance flag.)

| Line | Field | Student relevance |
|---|---|---|
| 1a/1b | State and local income tax paid/withheld (capped at $40,000 / $20,000 MFS for 2025) | **[ALWAYS]** the most commonly (and often ONLY) populated line for a typical F-1 student who itemizes — state income tax withheld from a W-2 |
| 2 | Gifts by cash/check to U.S. charity | **[SOMETIMES]** |
| 3 | Gifts other than cash/check | **[RARE]** |
| 4 | Carryover from prior year | **[RARE]** |
| 6 | Casualty/theft loss (federally declared disaster only) | **[RARE]** |
| 7 | "Other" (narrow enumerated list — gambling losses to extent of winnings, income-property casualty loss, claim-of-right repayment, impairment work expenses, net qualified disaster loss) | **[RARE]** |
| 8 | Total → Form 1040-NR line 12 | **[ALWAYS]** (computed) |

**Practical note for the engine:** for the large majority of F-1 students who do NOT qualify for the India Article 21(2) standard deduction, Schedule A often reduces to "line 1a/1b only" — state income tax withheld, nothing else — because mortgage interest, medical expenses, and general miscellaneous deductions are categorically unavailable. Design the default itemized-deduction UI/flow around this single data point, with the other lines as progressive-disclosure options.

**Citation:** Instructions for Schedule A (Form 1040-NR) (2025), pp.39-42.

---

## 5. Which Schedules Does a Typical F-1 Student Actually Need?

| Schedule | Needed when |
|---|---|
| Schedule OI | **ALWAYS** — mandatory for every Form 1040-NR filer |
| Schedule A | Only if itemizing (not taking India-treaty standard deduction) and has state tax withheld and/or charitable gifts/casualty loss |
| Schedule NEC | Only if there is ANY U.S.-source income not effectively connected with a trade/business (brokerage dividends/interest not covered by an exemption, gambling winnings, capital gains with 183+ days) |
| Schedule P | Only if the taxpayer transferred an interest in a partnership engaged in a U.S. trade/business or holding U.S. real property — **[RARE]**, always route to human review if triggered |
| Schedule 1 (Form 1040) | If there's additional income not entered directly on page 1 (notably: scholarship/fellowship non-tuition amounts, Schedule 1 line 8r) or adjustments to income (student loan interest — barred if MFS; educator expenses; HSA deduction) |
| Schedule 1-A (Form 1040) | Rare — "no tax on tips/overtime"/senior deduction; "no car loan interest" explicitly barred for NRAs |
| Schedule 2 (Form 1040) | If AMT, self-employment tax (totalization-agreement countries only), or Additional Medicare Tax applies — **[RARE]** for students (File 1 §7) |
| Schedule 3 (Form 1040) | If claiming foreign tax credit, child/dependent care credit (restricted), or other listed credits/payments |
| Schedule 8812 | Only for the restricted CTC/ODC-eligible country set (File 1 §5-6) |

---

## 6. Extracted Data Field → Form Line Mapping

| Extracted data field | 1040-NR line / Schedule |
|---|---|
| W-2 Box 1 wages (U.S. employer, ECI) | Form 1040-NR line 1a |
| Treaty-exempt wage amount (e.g., Form 1042-S box 2, exemption code 15/16) | Form 1040-NR line 1k + Schedule OI Item L |
| Scholarship/fellowship — non-tuition portion (room/board/travel), Form 1042-S box 2 (income code 16) | Schedule 1 (Form 1040) line 8r → Form 1040-NR line 8 |
| Scholarship — fully treaty-exempt | Form 1040-NR line 1k + Schedule OI Item L (not line 8r) |
| 1042-S federal tax withheld, box 10 | Form 1040-NR line 25g |
| W-2 federal tax withheld, box 2 | Form 1040-NR line 25a |
| 1099 federal tax withheld | Form 1040-NR line 25b |
| State income tax withheld (W-2 box 17 / 1099 state box) | Schedule A line 1a (capped at line 1b) |
| Brokerage 1099-DIV ordinary/qualified dividends (NEC) | Schedule NEC lines 1a-1c |
| Brokerage 1099-INT interest (NEC, if not exempt) | Schedule NEC lines 2a-2c |
| Brokerage capital gains (NEC, only if 183+ day gate met) | Schedule NEC lines 16-18 |
| Visa type / entry date | Schedule OI Item E; Form 8843 Part I line 1a |
| Country of tax residence | Schedule OI Item B |
| Country(ies) of citizenship | Schedule OI Item A |
| Days present in U.S. (current + 2 prior years) | Schedule OI Item H; Form 8843 Part I line 4a |
| Treaty country / article / exempt amount | Schedule OI Item L columns (a)-(d) |
| Charitable contributions (U.S. org, cash) | Schedule A line 2 |
| Dependent SSN/ITIN (restricted-country filers only) | Form 1040-NR "Dependents" section |
| Filing status indicator | Form 1040-NR top-of-page-1 checkbox |
| India Article 21(2) eligibility flag | Form 1040-NR line 12 (standard deduction path) |

---

## 7. Route-to-Human-Review Triggers (Form 1040-NR / Schedules — summary)

- Married filing status with "married persons who live apart" exception claimed (§1A) — multi-fact test
- Any election to be taxed as a resident alien (§1D) — exits the 1040-NR path entirely
- Schedule OI Item C or Item D = "Yes" (green card application steps; expatriate) — immigration/expatriation flags
- Schedule OI Item K second sub-question = "Yes" (alternative sourcing method for ≥$250,000 comp) — requires an attached technical statement
- Any Schedule NEC capital gain claim resting on the 183-day gate — verify day-counting methodology before finalizing (§3)
- Any Schedule P transaction (partnership interest transfer) — always route
- AMT (Schedule 2 line 2), self-employment tax via totalization agreement (Schedule 2 line 4) — both uncommon and technical
- Any treaty claim (Schedule OI Item L) where the aggregate exceeds $10,000 — check whether Form 8833 is independently required
- Dependent/CTC/ODC claims outside the Canada/Mexico/U.S.-national/South-Korea/India-treaty set — hard bar, should error rather than silently drop (File 1 §5)

---

## Sources

- Form 1040-NR (2025), IRS, created 9/8/2025 (local copy: `/Users/anubhavgupta/Downloads/LumaTax/forms/f1040nr.pdf`) — main form structure, pp.1-2
- Instructions for Form 1040-NR (2025), IRS, rev. Jan 29, 2026 (local copy: `/Users/anubhavgupta/Downloads/LumaTax/forms/i1040nr.pdf`) — filing status (pp.16-17), line instructions (pp.17-23), Schedule 1/1-A/2/3 instructions (pp.29-38), Schedule A instructions (pp.39-42), Schedule NEC instructions (pp.42-44), Schedule OI instructions (pp.44-46), Schedule P instructions (pp.47-49)
- [Publication 519 (2025), U.S. Tax Guide for Aliens — IRS.gov](https://www.irs.gov/publications/p519) — referenced throughout the 1040-NR instructions for capital gains 183-day rule, treaty exemption mechanics, and dependents chapter 5 detail
- [Guide to IRS Form 1040-NR for Nonresident Aliens — TaxAct blog](https://blog.taxact.com/guide-to-form-1040-nr/)
- [Form 1040-NR: 2025 Filing Rules & Instructions for Nonresident Aliens — ourtaxpartner.com](https://ourtaxpartner.com/1040-nr-2025-instructions/)

All line numbers, schedule structures, and dollar figures (SALT cap $40,000, standard deduction $15,750/$31,500) reflect the **tax year 2025** revision of Form 1040-NR (the first year using the new numbered-row Dependents section and the new Schedule 1-A). Form line numbers can shift between IRS revisions — re-verify against the current-year released form before each filing season.
