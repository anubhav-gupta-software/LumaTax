# Form 1042-S Handling — Logic Spec for F-1 International Student Tax Engine

**Scope:** How LumaTax's rule engine must interpret Form 1042-S ("Foreign Person's U.S. Source Income Subject to Withholding") for F-1 nonresident alien (NRA) filers, and how each box maps into Form 1040-NR / Schedule NEC / Schedule OI.

**Primary sources verified directly:** IRS Form 1042-S (2026 revision, as downloaded to `/Users/anubhavgupta/Downloads/LumaTax/forms/f1042s.pdf`, "Explanation of Codes" pages 3, 5, 7) and `i1042s.pdf`. All other claims are cross-checked against IRS.gov pages cited in the Sources section.

---

## 1. What Form 1042-S is, and when an F-1 student gets one

**Plain-English rule:** Form 1042-S reports U.S.-source income paid to a foreign person (including an F-1 nonresident alien) that is subject to NRA withholding rules under Internal Revenue Code (IRC) Chapter 3 (§§1441–1443) or Chapter 4 (FATCA). It is issued by a "withholding agent" (university, employer, bank, brokerage) for payments such as:

- Taxable and treaty-exempt **scholarship/fellowship grants** (income code 16)
- **Wages/compensation that a tax treaty exempts** from withholding, in whole or in part (income codes 17–20)
- **Other FDAP** (Fixed, Determinable, Annual, or Periodical) income: bank/portfolio interest, dividends, royalties, gambling winnings, etc.

**What it is NOT for:** Regular U.S. wages that are fully subject to graduated income-tax withholding are reported on **Form W-2**, not Form 1042-S. An F-1 student's normal on-campus job or CPT/OPT paycheck (no treaty claim) is W-2 income.

### IF/THEN — document routing
```
IF a document is labeled "Form 1042-S"
  THEN treat income as NRA-withholding-reportable (Chapter 3 or 4), route toward
       Form 1040-NR (not Form 1040), and do NOT merge amounts with any W-2 wage box.

IF a document is labeled "Form W-2"
  THEN treat as regular wage income (graduated withholding already applied),
       route to 1040-NR line 1a, and do NOT process through this 1042-S logic file.

IF the same employer issues BOTH a W-2 and a 1042-S to the same student for the same year
  THEN this is normal and expected when a tax treaty exempts only PART of the wages
       (e.g., first $X of compensation under a treaty article, remainder on W-2).
       Do not flag as a duplicate; sum federal withholding from both (1042-S box 7a +
       W-2 box 2) for total payments on 1040-NR line 25.
  EDGE CASE: if W-2 and 1042-S gross amounts look identical (not complementary),
       ROUTE TO HUMAN REVIEW — possible employer reporting error or true duplicate.
```

**Citations:** IRS, "Form 1042-S" (2026) p.1 field layout; IRS, [About Form 1042-S](https://www.irs.gov/forms-pubs/about-form-1042-s); IRS, [Foreign Student Liability for Social Security and Medicare Taxes](https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes) (W-2 vs. 1042-S distinction is implicit in standard payroll practice for NRAs — see also IRS Pub. 515, ch. "Withholding on Specific Income").

---

## 2. Full box structure of Form 1042-S (as verified from the downloaded form)

| Box | Field | Engine relevance |
|---|---|---|
| 1 | **Income code** | Determines income type → which 1040-NR line/schedule. See §3. |
| 2 | **Gross income** | The full payment before any withholding allowance. |
| 3 | **Chapter indicator** ("3" or "4") | Tells engine whether box 3a/3b (Chapter 3) or 4a/4b (Chapter 4) governs the exemption/rate. Chapter 3 = standard NRA withholding (§1441); Chapter 4 = FATCA. For F-1 students, almost always **Chapter 3**. |
| 3a | **Exemption code (Chapter 3)** | See §4 table. Governs *why* withholding was reduced/waived. |
| 3b | **Tax rate (Chapter 3)** | Rate actually applied (0.00 if box 3a exemption code present). |
| 4a | **Exemption code (Chapter 4)** | Only populated if Chapter 4 box 3 = "4" or if tax rate in 4b is 00.00 under Chapter 4. Rare for F-1 student income. |
| 4b | **Tax rate (Chapter 4)** | |
| 5 | **Withholding allowance** | Rarely used for students; historically tied to personal exemption amount for certain treaty/business-apprentice articles. |
| 6 | **Net income** | Box 2 minus box 5. |
| 7a | **Federal tax withheld** | **This is the dollar figure that counts toward the student's refund** — flows to 1040-NR line 25g. |
| 7b–7d | Escrow/partnership checkboxes | Informational; not normally applicable to a student recipient. |
| 8 | Tax withheld by other agents | Add to 7a when computing total withholding credit if present. |
| 9 | Overwithheld tax repaid to recipient | **Subtract** this from box 7a equivalent — it means the agent already refunded some tax directly; do not double-count as a 1040-NR credit. |
| 10 | **Total withholding credit** (7a + 8 + 9, net) | If present, this is the authoritative total credit figure — prefer it over manually summing 7a+8 when box 10 is populated. |
| 11 | Tax paid by withholding agent (not withheld) | Rare; agent absorbed the tax. Engine should NOT also credit this to the student unless box 10/7a reflects it. |
| 12a–12m | Withholding agent identity/address, Ch.3/Ch.4 status codes | Identification only; not income-determinative. |
| 13a | Recipient's name | Identity match field. |
| 13b | **Recipient's country code** | Used to validate the treaty country claimed (cross-check against any treaty article claimed in box 3a=04 cases). |
| 13i | Recipient's U.S. TIN | Should match the student's SSN/ITIN on file. **Mismatch → human review.** |
| 13j/13k | Recipient's Ch.3/Ch.4 status codes | Typically "16" (Individual) for a student — see status code table in the form's Explanation of Codes. |
| 13n | LOB code | Limitation-on-benefits category supporting the treaty claim (only relevant when 3a = 04). |
| 13p | Recipient's date of birth | Identity match field. |
| 16a–16e | Payer info | Secondary payer if different from withholding agent (e.g., a scholarship paid via a fiscal sponsor). |
| 17a–17c | State income tax withheld | Route to state return logic (out of scope for this federal spec); do not include in federal withholding total. |

**Citation:** IRS Form 1042-S (2026), all pages, as read directly from `/Users/anubhavgupta/Downloads/LumaTax/forms/f1042s.pdf`.

---

## 3. Income Code lookup table (Box 1) — verified against the current IRS form

> **Correction to common assumptions:** some product specs assume code 15 = scholarship and codes 18–20 cover "teaching/studying/training" in sequence starting at compensation-dependent-services. The **verified current codes** (confirmed directly from the IRS Form 1042-S "Explanation of Codes," which the engine should treat as authoritative over secondary sources) are below. Do not hardcode the guessed mapping from any other source without checking this table.

| Code | Meaning | Typical F-1 relevance | Nature for 1040-NR purposes |
|---|---|---|---|
| 01 | Interest paid by U.S. obligors—general | Bank savings/CD interest | Usually NOT taxable to NRA (see §6) |
| 06 | Dividends paid by U.S. corporations—general | Brokerage account dividends | Schedule NEC, FDAP, flat 30%/treaty rate |
| 09 | Capital gains | U.S. stock sales (rare for NRAs; usually exempt unless present 183+ days) | Schedule NEC line, special NRA capital-gain rule |
| 14 | Real property income and natural resources royalties | Rare for students | Schedule NEC |
| **15** | **Pensions, annuities, alimony, and/or insurance premiums** | Rare for students | Schedule NEC (unless ECI) |
| **16** | **Scholarship or fellowship grants** | **Most common F-1 code** — tuition waivers, stipends, fellowship awards | Taxable portion: Schedule 1, line 8r → 1040-NR line 8 (treated as **effectively connected income (ECI)** under IRC §871(c)); treaty-exempt portion: 1040-NR line 1k |
| 17 | Compensation for independent personal services | 1099-type contractor work performed as an NRA | ECI; Schedule 1 "other earned income" if not treaty-exempt |
| 18 | Compensation for dependent personal services | Treaty-exempt portion of regular wages (W-2 covers the rest) | ECI if taxable; line 1k if treaty-exempt |
| 19 | **Compensation for teaching** | TA/RA/research stipends classified as teaching compensation, esp. under treaty "teacher/researcher" articles | ECI if taxable; line 1k if treaty-exempt |
| **20** | **Compensation during studying and training** | OPT/CPT wages or training stipends treaty-exempt under a "student/trainee" article (e.g., many treaties cap a few thousand dollars/year) | ECI if taxable; line 1k if treaty-exempt |
| 23 | Other income | Catch-all | Schedule NEC unless proven ECI |
| 28 | Gambling winnings | Rare | Schedule NEC, flat 30% unless treaty country listed in Pub. 515 |
| 29 | Deposit interest | Bank deposit interest | Generally **not** taxable/reportable as U.S.-source to NRA under IRC §871(i); exemption code 02 typically paired |

**Decision rule — income code family:**
```
IF income_code IN {17, 18, 19, 20}
  THEN this is COMPENSATION-type income (connected to personal services performed in the U.S.)
       → if NOT treaty-exempt: Effectively Connected Income (ECI), graduated rates
       → if treaty-exempt: excluded from graduated income, goes to line 1k

IF income_code == 16
  THEN this is SCHOLARSHIP/FELLOWSHIP income
       → taxable portion (not covering tuition/required fees/books) is ECI by statute
         (IRC §871(c)), reported on Schedule 1 line 8r regardless of treaty status
       → treaty-exempt portion goes to line 1k instead

IF income_code IN {01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,22,24,...,29,...}
  (i.e., interest/dividend/royalty/pension/capital-gain/other FDAP families)
  THEN this is PASSIVE/FDAP income
       → NOT ECI (unless recipient is engaged in a U.S. trade/business beyond being
         a student, which is unusual) → Schedule NEC, flat 30% or treaty rate

IF income_code NOT IN the verified table above
  THEN ROUTE TO HUMAN REVIEW (unrecognized/rare code; do not guess classification)
```

**Citations:** IRS Form 1042-S (2026), "Explanation of Codes," Box 1, pp. 3 & 5; IRC §871(c) (taxable scholarship/fellowship of an F/J/M/Q nonresident is treated as ECI); IRS, [Taxation of Nonresident Aliens — Scholarship/Fellowship](https://www.irs.gov/individuals/international-taxpayers/taxation-of-nonresident-aliens); IRS, [Claiming Treaty Exemption for a Scholarship or Fellowship Grant](https://www.irs.gov/individuals/international-taxpayers/claiming-treaty-exemption-for-a-scholarship-or-fellowship-grant).

---

## 4. Exemption Code lookup tables (Box 3a / Box 4a)

### Box 3a — Chapter 3 exemption codes (apply when Chapter indicator, Box 3, = "3")

| Code | Meaning | Engine treatment |
|---|---|---|
| 01 | Effectively connected income | Income IS taxable as ECI on graduated-rate lines; withholding was likely done at graduated/backup rate, not flat 30%. |
| 02 | Exempt or reduced withholding under IRC (catch-all; use only if no more specific code applies) | Verify against income code — e.g., paired with code 29 (deposit interest) or 01 (bank interest, §871(i)) → **not taxable**, income still gets listed informationally but excluded from tax computation. |
| 03 | Income is not from U.S. sources | **Not taxable** — exclude entirely from U.S. return income; informational only. |
| **04** | **Exempt or reduced withholding under tax treaty** | **Treaty-exempt.** Full or partial gross income in Box 2 is excluded from graduated/NEC tax and instead reported on 1040-NR **line 1k** (and Schedule OI, Item L). Engine must also require/validate a treaty-position record (country, article, LOB code Box 13n) — see note below. |
| 05 | Portfolio interest exempt under IRC | **Not taxable** — exclude from income (common for student bank/brokerage interest). |
| 06–12, 22 | QI/WFP/WFT/U.S.-branch technical codes | Withholding-agent intermediary mechanics; does not change the income's taxability to the recipient. Pass through to whatever the *underlying* income code dictates. |
| 23 | Exempt under §897(l) (certain QFPF real property gains) | Not applicable to typical F-1 income; **route to human review** if seen. |
| 24 | Exempt under §892 (foreign government income) | Not applicable to students; **route to human review** if seen. |

> **Important correction:** Box 3a does **not** encode "sub-reasons" within code 04 (there is no "04a/04b" treaty sub-code on the form itself). The specific treaty article, country, and number of months claimed are carried in **Schedule OI, Item L** of Form 1040-NR (and in the recipient's W-8BEN on file with the withholding agent), not as a sub-value of Box 3a. Do not invent a sub-code taxonomy under 04 — instead, the engine should pull the treaty article from the student's treaty-position record (built from their W-8BEN / onboarding interview) and cross-validate the recipient country code (Box 13b) against that treaty.

### Box 4a — Chapter 4 exemption codes (apply only when Chapter indicator = "4", or Box 4b rate = 00.00 under Chapter 4)

| Code | Meaning |
|---|---|
| 13 | Grandfathered payment |
| 14 | Effectively connected income |
| 15 | Payee not subject to chapter 4 withholding |
| 16 | Excluded nonfinancial payment |
| 17 | Foreign entity assumes primary withholding responsibility |
| 18 | U.S. payees of participating FFI / registered deemed-compliant FFI |
| 19 | Exempt from withholding under IGA |
| 20 | Dormant account |
| 21 | Other payment not subject to chapter 4 withholding |

**Engine note:** For the overwhelming majority of F-1 student 1042-S forms (scholarships, treaty-exempt wages, student bank interest), **Chapter indicator = "3"** and Box 4a/4b are blank. If Chapter indicator = "4" appears on a student's 1042-S, **route to human review** — this is atypical for an individual student recipient and more commonly appears on institutional/FFI payee forms.

**Citations:** IRS Form 1042-S (2026), "Explanation of Codes," Box 3a & Box 4a, p.5, as read from the downloaded form; IRS Instructions for Form 1042-S, [irs.gov/instructions/i1042s](https://www.irs.gov/instructions/i1042s); IRS, [Claiming Treaty Exemption for a Scholarship or Fellowship Grant](https://www.irs.gov/individuals/international-taxpayers/claiming-treaty-exemption-for-a-scholarship-or-fellowship-grant) (confirms Schedule OI Item L / line 1k mechanism, not a Box-3a sub-code).

---

## 5. Chapter 3 / Chapter 4 status codes & recipient fields (reference only)

Boxes 12b/12c (withholding agent), 13j/13k (recipient), 15b/15c (intermediary), 16d/16e (payer) carry **status codes**, not income/taxability information. For an individual F-1 student recipient, Box 13j (Chapter 3 status) is almost always **"16" (Individual)**. These fields matter for the engine only for:
- **Identity validation** (does the recipient status code make sense for a natural-person student — flag "16" expected; anything else on a personal 1042-S → human review).
- **LOB code (13n)** validation when a treaty claim (exemption code 04) is present — a blank LOB code on a treaty-claimed form is a red flag for review since many treaties require an LOB test.

**Citation:** IRS Form 1042-S (2026), "Explanation of Codes" (status code tables), pp. 5 & 7.

---

## 6. Mapping a 1042-S to Form 1040-NR — master decision logic

**Inputs available per 1042-S record:** `income_code`, `chapter_indicator`, `exemption_code_3a`, `tax_rate_3b`, `gross_income` (Box 2), `net_income` (Box 6), `federal_tax_withheld` (Box 7a), `total_withholding_credit` (Box 10, if present), `recipient_country_code` (13b), treaty-position record (if any, from onboarding).

```
STEP 1 — Determine taxability
IF exemption_code_3a == "03" (not U.S.-source)
  THEN taxable = FALSE; exclude from U.S. return entirely (informational attachment only)

ELSE IF exemption_code_3a == "04" (treaty exemption)
  THEN taxable = PARTIALLY OR FULLY EXEMPT
       - treaty_exempt_amount = gross_income (Box 2) unless the treaty-position record
         specifies a lower annual cap (e.g., some student/trainee articles cap the
         exemption at a fixed dollar amount per year — the excess over the cap, if any,
         is taxable and should appear on a SEPARATE 1042-S record or box breakdown;
         if gross_income appears to exceed a known treaty cap and there's only one
         record, ROUTE TO HUMAN REVIEW)
       - taxable_amount = max(0, gross_income - treaty_exempt_amount)

ELSE IF exemption_code_3a IN {"02","05"} AND income_code is a passive/FDAP code
       (interest/dividend family where IRC itself exempts it, e.g. portfolio interest,
        deposit interest)
  THEN taxable = FALSE; exclude from U.S. return (informational only)

ELSE  (no exemption code, or exemption_code_3a == "01" ECI, or tax_rate_3b > 0)
  THEN taxable = TRUE; taxable_amount = net_income (Box 6) if populated, else gross_income (Box 2)


STEP 2 — Route the taxable amount to the correct 1040-NR location
IF taxable_amount > 0 AND income_code == 16 (scholarship/fellowship)
  THEN route to Schedule 1 (Form 1040), line 8r → flows to Schedule 1 line 9 → line 10
       → Form 1040-NR line 8 ("Additional income from Schedule 1, line 10")
       [This is ECI by statute regardless of whether the student otherwise has a U.S.
        trade or business — IRC §871(c).]

IF taxable_amount > 0 AND income_code IN {17,18,19,20} (compensation)
  THEN route to Form 1040-NR line 1h ("Other earned income") UNLESS the engine has
       independent evidence this specific payment is already included in a W-2 box 1
       figure (in which case do NOT double-count — flag for review instead)

IF taxable_amount > 0 AND income_code is a passive/FDAP code (01,02,03,04,05,06,07,08,
   09,10,11,12,13,14,15,22,23,24,...,28,29,...)
  THEN route to Schedule NEC (Form 1040-NR), matching line for that income category,
       in the rate column equal to tax_rate_3b (10%/15%/30%/"Other treaty rate")

IF exemption_code_3a == "04" (treaty-exempt, in full or part)
  THEN route treaty_exempt_amount to Form 1040-NR line 1k ("Treaty-exempt income")
       AND require Schedule OI, Item L to be populated (treaty country, article,
       number of months claimed in prior years, exempt amount) before the return
       is considered complete
       AND cross-check: recipient_country_code (Box 13b) must match the treaty
       country being claimed — MISMATCH → ROUTE TO HUMAN REVIEW


STEP 3 — Withholding credit
total_credit = total_withholding_credit (Box 10) if populated,
               else (federal_tax_withheld [Box 7a] + tax_withheld_by_other_agents [Box 8]
                     - overwithheld_tax_repaid [Box 9])

ADD total_credit to Form 1040-NR line 25g ("Federal income tax withheld from Form(s)
1042-S") — this is a REFUNDABLE credit against total tax liability regardless of
whether the underlying income was taxable or treaty-exempt (tax withheld on
exempt income should have been $0, but if an amount appears anyway, it still
counts as a payment/credit; flag for review since it suggests the withholding
agent did not apply the treaty correctly in real time — student may want to also
pursue a correction with the withholding agent for future payments).
```

**Citations:** IRS Instructions for Form 1040-NR (2025), [irs.gov/instructions/i1040nr](https://www.irs.gov/instructions/i1040nr) — Schedule 1 line 8r for taxable scholarship/fellowship; line 1k and Schedule OI Item L for treaty-exempt income; line 25g for Form 1042-S withholding credit; Schedule NEC instructions for FDAP income taxed on a gross basis at 30%/treaty rate without deductions; IRC §871(c) (taxable scholarship treated as ECI for F/J/M/Q visa holders); IRS, [Claiming Treaty Exemption for a Scholarship or Fellowship Grant](https://www.irs.gov/individuals/international-taxpayers/claiming-treaty-exemption-for-a-scholarship-or-fellowship-grant).

---

## 7. Scholarship/fellowship special rule (income code 16) — what counts as taxable

**Plain-English rule:** A "qualified scholarship" under IRC §117 that covers **tuition and required fees, books, supplies, and equipment required for courses** (for a degree candidate) is **not taxable**, even though the 1042-S box 2 gross income figure may include it. Amounts that cover **room, board, travel, stipends, or other non-qualified expenses** ARE taxable (as ECI per §871(c)) unless treaty-exempt.

```
IF income_code == 16
THEN
  qualified_education_expenses = (user-reported or school-certified tuition/required-fees
                                   paid in the same year)
  taxable_scholarship = max(0, gross_income_box2 - qualified_education_expenses
                               - treaty_exempt_amount)
  IF taxable_scholarship > 0 → route per Step 2 above (Schedule 1 line 8r)
  IF the 1042-S box 2 amount does not obviously reconcile with the school's billing
     statement (e.g., box 2 is much larger than any stipend the student recalls)
     → ROUTE TO HUMAN REVIEW (common source of confusion: box 2 may show GROSS award
       including tuition remission, while only the stipend portion is cash-in-hand)
```

**Citation:** IRC §117(a)–(b) (qualified scholarship exclusion); IRS Pub. 970, "Tax Benefits for Education," ch. 1; IRS, [Claiming Treaty Exemption for a Scholarship or Fellowship Grant](https://www.irs.gov/individuals/international-taxpayers/claiming-treaty-exemption-for-a-scholarship-or-fellowship-grant).

---

## 8. Withholding rate sanity checks (fraud/data-entry error detection)

```
IF income_code == 16 AND tax_rate_3b NOT IN {0.00, 14.00, 30.00}
  → ROUTE TO HUMAN REVIEW (standard scholarship withholding on an F/J/M/Q visa is 14%
    under IRC §1441(b); 30% applies if the visa/qualification requirement isn't met;
    0% applies only with a valid exemption code)

IF income_code IN {01,06,29} (interest/dividends) AND tax_rate_3b NOT IN {0.00, 10.00,
   15.00, 30.00} AND no explicit treaty rate documented
  → ROUTE TO HUMAN REVIEW (unusual rate for a standard FDAP category)

IF exemption_code_3a == "04" AND tax_rate_3b > 0.00
  → This is normal (treaty often reduces, not eliminates, the rate) — but confirm
    tax_rate_3b matches the specific treaty article's stated rate; mismatch →
    ROUTE TO HUMAN REVIEW

IF federal_tax_withheld (Box 7a) > gross_income (Box 2) × tax_rate_3b (allowing for
   small rounding) 
  → ROUTE TO HUMAN REVIEW (over-withholding beyond the stated rate; may indicate the
    agent applied backup withholding or a data error — student may be entitled to a
    larger-than-expected refund, but verify before filing)
```

**Citation:** IRC §1441(b) (14% statutory withholding rate on taxable scholarship/fellowship income paid to an F/J/M/Q nonresident candidate for a degree, vs. 30% default for other NRA income); IRS Pub. 515, "Withholding of Tax on Nonresident Aliens and Foreign Entities."

---

## 9. Edge cases requiring human review (consolidated list)

1. Income code not in the verified table (§3).
2. Chapter indicator = "4" on an individual student's 1042-S.
3. Recipient TIN on the 1042-S doesn't match the student's SSN/ITIN on file.
4. W-2 and 1042-S gross amounts from the same employer are identical rather than complementary.
5. Treaty exemption (code 04) claimed but recipient country code (13b) doesn't match the treaty country in the student's onboarding treaty-position record.
6. Treaty-exempt gross income (Box 2) exceeds a known per-year dollar cap under the specific treaty article and there's no second record showing the excess as taxable.
7. Scholarship (code 16) box 2 amount doesn't reconcile with school-reported tuition/billing data.
8. Withholding rate (3b) falls outside expected values for the income code (§8).
9. Federal tax withheld (7a) exceeds gross income × stated rate.
10. Any exemption code (3a) of 23 or 24 (§897(l) / §892) — these apply to specialized entities/governments, not individual students, and signal either a data error or a recipient-status misclassification.
11. Box 10 (total withholding credit) is negative or inconsistent with 7a+8-9.
12. Multiple 1042-S forms from the same payer with the same income code and overlapping dates — possible duplicate or amended form (check the "AMENDED"/"AMENDMENT NO." field at the top of the form before summing).

---

## Sources

- IRS, Form 1042-S (2026 revision) — read directly from `/Users/anubhavgupta/Downloads/LumaTax/forms/f1042s.pdf`, including the "Explanation of Codes" pages (Box 1 income codes, Box 3a/4a exemption codes, Chapter 3/4 status codes, LOB codes).
- IRS, Instructions for Form 1042-S — https://www.irs.gov/instructions/i1042s
- IRS, About Form 1042-S — https://www.irs.gov/forms-pubs/about-form-1042-s
- IRS, Instructions for Form 1040-NR (2025) — https://www.irs.gov/instructions/i1040nr
- IRS, Claiming Treaty Exemption for a Scholarship or Fellowship Grant — https://www.irs.gov/individuals/international-taxpayers/claiming-treaty-exemption-for-a-scholarship-or-fellowship-grant
- IRS, Taxation of Nonresident Aliens — https://www.irs.gov/individuals/international-taxpayers/taxation-of-nonresident-aliens
- IRS, Publication 515, Withholding of Tax on Nonresident Aliens and Foreign Entities — https://www.irs.gov/publications/p515 (also read locally: `/Users/anubhavgupta/Downloads/LumaTax/forms/p515.pdf`)
- IRS, Publication 970, Tax Benefits for Education — https://www.irs.gov/publications/p970
- IRS, Publication 519, U.S. Tax Guide for Aliens — https://www.irs.gov/publications/p519 (also read locally: `/Users/anubhavgupta/Downloads/LumaTax/forms/p519.pdf`)
- Internal Revenue Code §117 (qualified scholarships), §871(c) (taxable scholarship/fellowship treated as ECI), §1441(b) (14% statutory withholding rate on scholarship/fellowship income).
