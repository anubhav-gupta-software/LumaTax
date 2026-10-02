# U.S. Tax Treaties for F-1 Students — Logic Spec

**Purpose:** This document is a deterministic logic spec for LumaTax's rule-based tax engine covering U.S. income tax treaty benefits available to F-1 international students (all nationalities) on (a) scholarship/fellowship income and (b) compensation for personal services (wages) earned during study/training. It is built from primary IRS sources (Pub. 901, Pub. 519, the IRS Tax Treaty Tables, and the IRS LB&I "Examining Treaty Exemptions of Income — NRA Students, Trainees, Teachers and Researchers" practice unit), cross-checked against the actual Table 2 data pulled from irs.gov on 2026-10-02.

**Status note:** Treaty data changes (terminations, suspensions, new treaties). This spec reflects IRS Tax Treaty Table 2 and Table 3 as updated through **September 26, 2025**, retrieved live on 2026-10-02. Build a periodic re-verification job against `irs.gov/individuals/international-taxpayers/tax-treaty-tables` into the product — do not treat this file as permanently authoritative.

---

## 1. Treaty Mechanics Overview

### 1.1 How the Student/Trainee article generally works

Most (not all) U.S. income tax treaties contain a **Students/Trainees article** (sometimes combined with, sometimes separate from, a **Teachers/Researchers article**). These articles can exempt up to three distinct categories of income, and a given treaty may cover only some of them:

1. **Remittances/allowances from abroad** — money sent from home country sources (family, home-government, home employer) for maintenance, education, or training. Almost universally **uncapped in dollar amount** when covered, because it's not U.S.-source income to begin with; the IRS table tracks it mainly because treaties sometimes attach a time limit to it (commonly only for "apprentices/business trainees," not degree students).
2. **Scholarship or fellowship grants** (Form 1042-S income code 16) — typically **uncapped**, but usually requires the grant to come from a **nonprofit organization**, or a U.S./foreign governmental or educational source (exact payer requirements vary by treaty — see footnote 5 pattern below). The sole exception historically was the U.S.–USSR treaty (predecessor to the CIS treaty), which caps even this category.
3. **Compensation for personal services performed while studying or training** (Form 1042-S income code 19/20) — this is the category most relevant to F-1 CPT/OPT wages, on-campus jobs, and paid internships. This is **almost always dollar-capped**, typically in the **$2,000–$10,000 per year** range, and is frequently also **time-limited** (commonly tied to a fixed number of years from arrival, e.g., 2 or 5 years, or "while a full-time student").

Key structural rules that recur across treaties:

- **Residency rule**: the individual must be a resident of the treaty country (as defined by that treaty) in the year the benefit is claimed, or in several treaties must have been a resident of that country **immediately before** arriving in the U.S. If the person is simultaneously a tax resident of the U.S. and the treaty country, the treaty's **tie-breaker rule** (permanent home → center of vital interests → habitual abode → nationality) decides the country of residence, and a **Form 8833** disclosure is required when this tie-breaker position is taken.
- **Primary-purpose rule**: the person must be in the U.S. principally to study or train (Student/Trainee article) vs. principally to teach/research (Teacher/Researcher article). Visa type (F-1/J-1/M-1/Q-1 generally = student; J-1 research scholar/H-1B post-doc at a nonprofit = can be teacher/researcher) and supporting documents (I-20, DS-2019, appointment/grant letters) are used to determine this. A student engaged in OPT as a "teacher-in-training" is still analyzed under the **Student/Trainee** article, not the Teacher/Researcher article, because their primary purpose remains studying/training (IRS LB&I practice unit, citing *Kiselev v. Comm'r*).
- **"Not-for-private-benefit" rule**: most articles exclude compensation for research undertaken primarily for the private benefit of a specific person/entity.
- **Once-in-a-lifetime clause**: some treaties (e.g., Slovak Republic Art. 21(5)) allow the Teacher/Researcher benefit only once ever, or disqualify someone who already used a related sub-paragraph of the Student/Trainee article in an immediately preceding period (see footnotes 33–44 across many Table 2 entries — these "cannot have claimed benefits of Article X during the immediately preceding period" clauses are common and must be tracked per-taxpayer across years).
- **Retroactive loss ("cliff effect") clause**: a minority of treaties **retroactively** eliminate the entire exemption (not just the excess) if the person overstays the allowed period. Confirmed cliff-effect treaties: **India** (Teacher/Researcher Art. 22(1)), **Luxembourg** (Art. 21(2)), **Netherlands** (Art. 21(1)), **United Kingdom** (Art. 20A). Germany's Student/Trainee compensation benefit (Art. 20(4), 4-year/$9,000 cap) is also retroactively lost in full if the 4-year limit is exceeded. **This is a high-value rule for the engine**: once a taxpayer crosses the time limit under one of these treaties, prior-year returns must be flagged for amendment, not just the current year.
- **Combination clause**: several treaties cap the *combined* duration across the Student/Trainee and Teacher/Researcher articles (e.g., France and Slovenia: 5-year combined cap).
- **Abroad clause**: scholarship/fellowship payments from sources **outside** the U.S. are essentially never taxed regardless of treaty (this is really a source-of-income rule, not a treaty exemption, but functions similarly).

### 1.2 Interaction with scholarship income under IRC §117

Before even reaching treaty analysis: a **qualified scholarship** under IRC §117 (tuition and required fees/course materials only, at a degree-seeking student, with no services required in exchange) is **tax-free by statute regardless of treaty**, not subject to withholding, and not reported on Form 1042-S. Treaty exemptions for "scholarship or fellowship grants" (income code 16) matter for the **non-qualified** portion — e.g., room/board stipends, or any scholarship from a U.S. source where a treaty specifically shelters it. The engine should apply §117 first, then layer the treaty exemption on top of any remaining taxable scholarship/stipend amount.

### 1.3 Claiming treaty benefits procedurally

**Two distinct procedural paths, which can run in parallel for different income streams:**

**(A) Form 8233 — for compensation subject to withholding, filed with the employer/payer.**
Used by a nonresident alien to claim a treaty exemption from withholding on compensation for independent or dependent personal services (wages), and can also cover non-compensatory scholarship/fellowship income paid by the *same* withholding agent. Requirements:
- Must state the specific treaty country and treaty article relied upon.
- Must attach the relevant statement from **Pub. 519 Appendix A** (for compensation) or **Appendix B** (for scholarship/fellowship income from the same payer), describing the required facts for that specific treaty article.
- A new Form 8233 must be filed for **each calendar year** the benefit is claimed, and generally for each new employer.
- The withholding agent reviews, signs, and must forward the accepted Form 8233 to the IRS within 5 days.
- For non-compensation payments (e.g., scholarships not tied to an employer relationship), the analogous form is **Form W-8BEN** given to the payer; the payer **cannot** honor the treaty claim without the recipient's U.S. TIN (SSN or ITIN) — a W-7/SS-5 pending-application receipt can be attached temporarily, but the exemption cannot be approved without an eventual TIN on file.

**(B) Direct claim on Form 1040-NR — reporting at filing time.**
- Wages/compensation claimed as treaty-exempt are **not** reported on Form 1040-NR line 1a; instead they go on **line 1k** ("other compensation exempt under a tax treaty"), together with **Schedule OI, Item L**.
- Schedule OI Item L requires: (a) country, (b) specific treaty article, (c) number of months the benefit was claimed in **prior** tax years (tracks time-limit consumption), (d) amount of income exempt in the **current** year.
- Treaty-exempt scholarship/fellowship income follows the same path: **not** on 1040-NR line 1a and **not** on Schedule 1 line 8r; instead on **1040-NR line 1k** plus Schedule OI Item L.
- **Form 8833** (Treaty-Based Return Position Disclosure) is a *separate, additional* disclosure required in narrower circumstances — notably when relying on the tie-breaker residency rule, or more generally whenever a treaty position overrides or modifies an Internal Revenue Code provision — but is **not required** merely to claim the standard Student/Trainee or Teacher/Researcher exemption on compensation (per IRS guidance; the $10,000/per-category and several-specific-exceptions carve-outs under IRC §6114 cover most routine student treaty claims). The engine should default to **not** requiring Form 8833 for a routine Article-20-type compensation/scholarship claim, but **should** require it when the taxpayer is asserting treaty residence in a country other than their citizenship/visa-sponsor country (tie-breaker scenario) or taking any other treaty position that reduces/modifies a Code-based tax liability outside the routine student exemption.

**(C) Resident alien using the saving-clause exception (post-1040-NR status).**
A taxpayer who has become a U.S. resident alien (met the Substantial Presence Test, typically in year 6 of F-1 status after the 5-calendar-year SPT exemption runs out) but whose treaty has a saving-clause exception for students/trainees attaches a statement to **Form 1040** (not 1040-NR): the exempt amount is first included in income on Form 1040 line 1 (if it was on a W-2/1042-S), then **backed out** as a negative entry on **Schedule 1, line 8z**, labeled "Exempt income," with the treaty country and article cited. A **Form W-9** with an attached statement (name, U.S. TIN, residency statement, treaty article, and the saving-clause-exception assertion) is given to the payer going forward so the payer stops withholding on the exempt portion.

### 1.4 The saving clause and its exceptions

Nearly every U.S. tax treaty contains a **saving clause**: language preserving the United States' right to tax its own citizens and residents (including resident aliens) as if the treaty did not exist. This means that **once an F-1 student becomes a U.S. resident alien** (green card, or passes the Substantial Presence Test after the 5-year F-1 exemption window), they generally **lose** the ability to use most treaty articles — **unless** the specific article they're relying on carries an **exception to the saving clause**.

- **Most modern treaties DO carry a saving-clause exception for the Student/Trainee and Teacher/Researcher articles** specifically — meaning a resident alien who is still a bona fide student/trainee under the treaty's definition can keep using the article even after becoming a resident alien, as long as they'd otherwise qualify.
- **Confirmed exceptions to this general pattern — treaties WITHOUT a saving-clause exception for students (oldest treaties):** **Greece** (1953 treaty) and **Pakistan** (1959 treaty). F-1 students from these two countries **lose all treaty benefits entirely** the moment they become resident aliens for U.S. tax purposes — there is no fallback.
- **Enhanced version:** the **China** and the former-**USSR/CIS** treaties extend the saving-clause exception even to **lawful permanent residents (green-card holders)**, not just SPT resident aliens, as long as the person remains a bona fide student/trainee — this is unusually generous and should be flagged as a special rule in the engine.
- The saving clause is itself usually found in the treaty's "General Rules of Taxation" or Residency article (often numbered Article 1 or an early article); the exception language is typically embedded within the Student/Trainee and Teacher/Researcher articles themselves or in a dedicated saving-clause article (watch for "notwithstanding the provisions of paragraph X of Article [saving clause]").

### 1.5 Mid-year status change: what happens if circumstances change after Form 8233/W-8BEN was filed

Scenarios the engine must handle:
- **Taxpayer crosses the treaty's time limit mid-year** (e.g., a China Art. 20(c) trainee hits a different country's 5-year cap mid-year, or a Germany Art. 20(4) student crosses the 4-year mark): income earned *after* the limit is reached becomes taxable; for **cliff-effect treaties** (India, Luxembourg, Netherlands, UK, Germany-compensation-only), the *entire* prior exemption is also retroactively disallowed and prior-year returns need amendment. The employer's withholding agent is not automatically aware of this — the student is responsible for correcting withholding (new W-4/8233) and for any true-up at filing.
- **Taxpayer becomes a resident alien mid-year** (crosses SPT threshold): triggers dual-status or full resident-alien filing for the year, requires moving off Form 1040-NR treaty mechanics onto the Form 1040 + Schedule 1 saving-clause-exception mechanics described in §1.3(C) — but **only if** the treaty has a saving-clause exception; otherwise all treaty benefits end as of the residency-start date (or, per some treaties' "once nonresident, always eligible for that calendar year" nuances — treaty-specific, flag for review).
- **Employer continued over-withholding or under-withholding** because the original 8233 was filed under outdated facts: the employee should file a corrected Form 8233/W-4, and any shortfall/overpayment reconciles at Form 1040/1040-NR filing — this does not require amending prior filed returns unless a retroactive-loss clause is implicated.
- **Visa/purpose change mid-year** (e.g., F-1 → H-1B, or F-2 dependent → F-1 primary): primary-purpose-of-visit analysis must be redone for the portion of the year under each status; a dual-purpose year may require splitting income by period and applying different treaty articles (or none) to each period.

---

## 2. Country-by-Country Table

### 2.1 Headline findings for priority F-1-sending countries

| Country | Has a student treaty article? | Notable / unusual terms |
|---|---|---|
| **China** | **Yes — Art. 20** | **No specific time limit** on the Student/Trainee article (scholarship, remittances, AND the $5,000/yr training-compensation line are all open-ended in duration, confirmed by both Table 2 and the IRS LB&I practice unit) — unusually generous vs. the 2–5 year limits most other treaties impose. Also one of only two treaties (with former USSR/CIS) extending saving-clause protection to **green-card holders**, not just SPT residents. Does **not** apply to Hong Kong, Macau, or Taiwan residents. |
| **India** | **Yes — Art. 21** | Remittances exempt for a "reasonable period" (Art. 21(1), no fixed year count). **Article 21(2)** gives Indian students/business-apprentices who were Indian residents immediately before U.S. arrival the unique right to claim the **U.S. standard deduction** on Form 1040-NR (write "Standard Deduction Allowed under US-India Income Tax Treaty, Article 21(2)" and cite it on Schedule OI Item L) — nonresident aliens from every other country cannot claim the standard deduction at all. The companion **Teacher/Researcher article (Art. 22(1)) has a retroactive "cliff effect"** if the 2-year limit is exceeded. |
| **South Korea** | **Yes — Art. 21** | Compensation during training capped at **$2,000/yr**, 5-year limit; unusually, Korea's *general* independent/dependent personal-services articles (not the student article) are also capped at $3,000/yr, lower than most countries' uncapped general articles. |
| **Taiwan** | **No treaty in force.** Taiwan is excluded from the U.S.–China treaty by its own terms. Congress passed the U.S.-Taiwan Expedited Double-Tax Relief Act framework (H.R. 33, passed House Jan. 2025) but as of this writing **no comprehensive bilateral tax treaty exists**; the Senate has not enacted full treaty authorization. **Treat as a no-treaty country for now**, but flag for a periodic recheck since legislative activity is ongoing. |
| **Vietnam** | **No treaty in force.** A treaty was reportedly negotiated/signed in some press coverage but is **not yet in force**; absent from current IRS Table 2/Table 3. |
| **Canada** | **Yes**, but structured differently — no dedicated dollar-capped "compensation during study" sub-article. Instead: (a) **remittances from abroad** are uncapped under Art. XX C (time-unlimited for full-time students; apprentices limited to 1 year), and (b) wage income is commonly sheltered via the **general Dependent Personal Services article (Art. XV)**, which carries a **$10,000/year** de minimis threshold below which Canadian-resident employees owe no U.S. tax regardless of days present — this is the mechanism informally called the "Canada $10,000 exemption" for F-1/J-1 students. |
| **Nigeria** | **No treaty.** |
| **Brazil** | **No treaty.** (Negotiations have been discussed publicly for years; none concluded.) |
| **Saudi Arabia** | **No treaty.** |
| **Bangladesh** | **Yes — Art. 21.** Scholarship uncapped, 2-year limit; compensation during training capped **$8,000/yr**, 2-year limit. |
| **Pakistan** | **Yes — Art. XIII**, but this is one of the **oldest treaties (1959) and has NO saving-clause exception** — a Pakistani F-1 student who becomes a U.S. resident alien loses 100% of treaty benefits with no fallback, unlike almost every other country. Also, the scholarship exemption (Art. XIII(1)) only applies if the grant is from a **Pakistani nonprofit organization** specifically (narrower payer condition than most countries' "any U.S. or foreign resident"). |
| **Nepal** | **No treaty.** |
| **Mexico** | **Yes — Art. 21**, but narrow: only remittances/allowances from abroad are exempted (uncapped, no time limit); there is **no dedicated compensation-during-study exemption** in the Mexico treaty's student article. |
| **Japan** | **Yes — Art. 19/20.** Remittances uncapped but limited to **1 year** (applies to apprentice/business trainee only per the standard footnote; full-time degree students typically have no such cap in practice for remittances but confirm against the treaty text). Teacher/researcher: 2 years. |
| **Indonesia** | **Yes — Art. 19.** Scholarship uncapped/5 yrs; compensation during training **$2,000/yr**, 5 yrs; compensation while gaining experience $7,500, 1 yr. |
| **Thailand** | **Yes — Art. 22/23.** Scholarship uncapped/5 yrs; compensation during training **$3,000/yr**, 5 yrs. |
| **United Kingdom** | **Yes — Art. 20** (students: remittances only, uncapped, 1-year limit for apprentices). **Teacher/Researcher Art. 20A has a retroactive cliff-effect** if the 2-year limit is exceeded. |
| **Germany** | **Yes — Art. 20.** Scholarship and remittances fully uncapped with **no time limit**; BUT compensation-during-study is capped **$9,000/yr for 4 years**, and exceeding the 4-year limit **retroactively voids the entire compensation exemption**. |
| **France** | **Yes — Art. 21.** Scholarship uncapped/5 yrs; compensation during training $5,000–$8,000/yr depending on payer residency; combined Student+Teacher benefit period capped at 5 years total. |
| **Spain** | **Yes — Art. 22.** Scholarship uncapped/5 yrs; compensation during training **$5,000/yr**, 5 yrs; compensation while gaining experience $8,000/yr, 1 yr. |
| **Turkey** | **Yes — Art. 20**, but narrow: remittances only (uncapped, no time limit); no dedicated compensation-during-study dollar exemption in the student article. |
| **Egypt** | **Yes — Art. 23.** Scholarship uncapped/generally 5 yrs; compensation during training **$3,000/yr**, generally 5 yrs. |
| **Philippines** | **Yes — Art. 22.** Scholarship uncapped/5 yrs; compensation during study **$3,000/yr**, 5 yrs. |
| **Ghana** | **No treaty.** |
| **Kenya** | **No treaty.** |
| **Iran** | **No treaty.** |

### 2.2 Full reference table — all confirmed treaty countries (IRS Table 2, retrieved 2026-10-02)

Columns: **Scholarship/Fellowship** = income code 16 cap / time limit / payer condition. **Compensation during Study/Training** = income code 20 (or equivalent) cap / time limit. "—" means that category is not separately listed for that country in Table 2 (either not covered by the treaty's student article, or folded into the general personal-services articles).

| Country | Scholarship/Fellowship (Art., cap, duration) | Compensation during Study/Training (Art., cap, duration) | Teaching/Research (Art., duration) | Notes |
|---|---|---|---|---|
| Australia | — | — (remittances only, Art. 20, no limit/no limit) | — | |
| Austria | — | — (remittances only, Art. 20, no limit/3 yrs, apprentice) | — | |
| Bangladesh | Art. 21(2), no limit, 2 yrs | Art. 21(2), $8,000 p.a., 2 yrs | Art. 21(1), 2 yrs | |
| Barbados | — | — (remittances only, Art. 20, no limit/no limit) | — | Students may elect resident taxation (Art. 18) but forfeit Student/Trainee exemption if so |
| Belgium | — (folded into remittances) | Art. 19(1)(b), $9,000 p.a., 2 yrs | Art. 19(2), 2 yrs | Remittances Art. 19(1)(a) no limit/2 yrs |
| Bulgaria | — (folded into remittances) | Art. 19(1)(b), $9,000 p.a., 2 yrs | Art. 19(2), 2 yrs | |
| Canada | — | — (see §2.1: $10,000 general wage threshold, Art. XV) | — | Remittances Art. XX C, no limit/no limit (apprentice 1 yr) |
| Chile | — | Art. 20, **no limit**, no limit (students); apprentice no limit/2 yrs | — | Unusually, no dollar cap on student compensation at all |
| China | Art. 20(b), no limit, **no specific limit** | Art. 20(c), $5,000 p.a., **no specific limit** | Art. 19, 3 yrs | Does not apply to HK/Macau/Taiwan residents |
| CIS (Armenia, Azerbaijan, Belarus, Georgia, Kyrgyzstan, Moldova, Tajikistan, Turkmenistan, Uzbekistan) — U.S.–USSR treaty | Art. VI(1), **limited** (up to $10,000 living-expense carve-out, less for students, case-by-case), 5 yrs | Art. VI(1), no limit, 1 yr (while gaining experience, non-employer payer) | Art. VI(1), 2 yrs | Only treaty besides pre-2024 Russia with a capped scholarship category. Belarus: one narrow provision suspended Dec. 17, 2024 (not the student article) |
| Cyprus | Art. 21(1), no limit, generally 5 yrs | Art. 21(1), $2,000 p.a., generally 5 yrs | — | Also: gaining-experience $7,500/1yr; US-govt-program $10,000/1yr |
| Czech Republic | Art. 21(1), no limit, 5 yrs | Art. 21(1), $5,000 p.a., 5 yrs | Art. 21(5), 2 yrs | Gaining-experience $8,000/12mo; govt program $10,000/1yr |
| Denmark | — | — (remittances only, Art. 20, no limit/3 yrs, apprentice) | — | |
| Egypt | Art. 23(1), no limit, generally 5 yrs | Art. 23(1), $3,000 p.a., generally 5 yrs | Art. 22, 2 yrs | Gaining-experience $7,500/12mo; govt program $10,000/1yr |
| Estonia | Art. 20(1), no limit, 5 yrs | Art. 20(1)/(2), $5,000–$8,000 p.a. depending on payer, 5yrs/12mo | — | Govt program $10,000/1yr |
| Finland | — | — (remittances only, Art. 20, no limit/no limit) | — | |
| France | Art. 21(1), no limit, 5 yrs (combined cap w/ teaching) | Art. 21(1)/(2), $5,000–$8,000 p.a. depending on payer, 5yrs/12mo | Art. 20, 2 yrs (combined 5-yr cap) | |
| Germany | Art. 20(3), no limit, **no limit** | Art. 20(4), $9,000 p.a., **4 yrs — retroactive loss if exceeded** | Art. 20(1), 2 yrs | Gaining-experience $10,000/1yr |
| Greece | — | — (remittances only, Art. XIII, no limit/no limit) | Art. XII, 3 yrs | **No saving-clause exception** (oldest treaty, 1953) |
| Iceland | Art. 19(1), no limit, 5 yrs | Art. 19(1), $9,000 p.a., 5 yrs | — | Gaining-experience $9,000/12mo; govt program $9,000/1yr |
| India | — (remittances "reasonable period," Art. 21(1)) | — (no dedicated compensation sub-cap in Table 2) | Art. 22, 2 yrs — **retroactive loss if exceeded** | **Art. 21(2): unique standard-deduction equivalent for students/apprentices** |
| Indonesia | Art. 19(1), no limit, 5 yrs | Art. 19(1), $2,000 p.a., 5 yrs | Art. 20, 2 yrs | Gaining-experience $7,500/12mo |
| Ireland | — | — (remittances only, Art. 20, no limit/1 yr, apprentice) | — | |
| Israel | Art. 24(1), no limit, 5 yrs | Art. 24(1), $3,000 p.a., 5 yrs | Art. 23, 2 yrs | Gaining-experience $7,500/12mo; govt program $10,000/1yr |
| Italy | — | — (remittances only, Art. 21, no limit/no limit) | Art. 20, 2 yrs | |
| Jamaica | Art. 21(1) folded into remittances, no limit, no limit | Art. 21(2), $7,500 p.a., 12 consec. mo. | Art. 22, 2 yrs | |
| Japan | — | — (remittances only, Art. 19, no limit/1 yr, apprentice) | Art. 20, 2 yrs | |
| Kazakhstan | Art. 19, no limit, 5 yrs (training/research only) | — | — | |
| Korea, South | Art. 21(1), no limit, 5 yrs | Art. 21(1), $2,000 p.a., 5 yrs | Art. 20, 2 yrs | Gaining-experience $5,000/1yr; govt program $10,000/1yr; general personal-services articles capped $3,000/yr (unusual) |
| Latvia | Art. 20(1), no limit, 5 yrs | Art. 20(1)/(2), $5,000–$8,000 p.a. depending on payer, 5yrs/12mo | — | Govt program $10,000/1yr |
| Lithuania | Art. 20(1), no limit, 5 yrs | Art. 20(1)/(2), $5,000–$8,000 p.a. depending on payer, 5yrs/12mo | — | Govt program $10,000/1yr |
| Luxembourg | — | — (remittances only, Art. 21(1), no limit/2 yrs, apprentice) | Art. 21(2), 2 yrs — **retroactive loss if exceeded** | |
| Malta | — | Art. 20(2), $9,000 p.a., no limit | — | Remittances Art. 20(1) no limit/1yr; gaining-experience $9,000/no limit |
| Mexico | — | — (remittances only, Art. 21, no limit/no limit) | — | |
| Morocco | Art. 18, no limit, 5 yrs | Art. 18, $2,000 p.a., 5 yrs | — | |
| Netherlands | Art. 22(2), no limit, 3 yrs | Art. 22(1)/(2), $2,000 p.a., reasonable period | Art. 21(1), 2 yrs — **retroactive loss if exceeded** | |
| New Zealand | — | — (remittances only, Art. 20, no limit/no limit) | — | |
| Norway | Art. 16(1), no limit, 5 yrs | Art. 16(1), $2,000 p.a., 5 yrs | Art. 15, 2 yrs | Gaining-experience $5,000/12mo; govt program $10,000/1yr |
| Pakistan | Art. XIII(1), no limit, no limit — **Pakistani nonprofit payer only** | Art. XIII(1), $5,000 p.a., no limit | Art. XII, 2 yrs | **No saving-clause exception** (oldest treaty, 1959). Gaining-experience $6,000/1yr; govt program $10,000/no limit |
| Philippines | Art. 22(1), no limit, 5 yrs | Art. 22(1), $3,000 p.a., 5 yrs | Art. 21, 2 yrs | Gaining-experience $7,500/12mo; govt program $10,000/1yr |
| Poland | Art. 18(1), no limit, 5 yrs | Art. 18(1), $2,000 p.a., 5 yrs | Art. 17, 2 yrs | Gaining-experience $5,000/1yr; govt program $10,000/1yr |
| Portugal | Art. 23(1), no limit, 5 yrs | Art. 23(1)/(2), $5,000–$8,000 p.a. depending on payer, 5yrs/12mo | Art. 22, 2 yrs | |
| Romania | Art. 20(1), no limit, 5 yrs | Art. 20(1), $2,000 p.a., 5 yrs | Art. 19, 2 yrs | Gaining-experience $5,000/1yr; govt program $10,000/1yr |
| Slovak Republic | Art. 21(1), no limit, 5 yrs | Art. 21(1), $5,000 p.a., 5 yrs | Art. 21(5), 2 yrs — once-in-a-lifetime clause | Gaining-experience $8,000/12mo; govt program $10,000/1yr |
| Slovenia | Art. 20(1), no limit, 5 yrs (extendable for postgrad candidates) | Art. 20(1)/(2), $5,000–$8,000 p.a. depending on payer, 5yrs/12mo | Art. 20(3), 2 yrs (combined 5-yr cap) | |
| South Africa | — | — (remittances only, Art. 20, no limit/1 yr, apprentice) | — | |
| Spain | Art. 22(1), no limit, 5 yrs | Art. 22(1), $5,000 p.a., 5 yrs | — | Gaining-experience $8,000/12mo |
| Sri Lanka | — | — (remittances only, Art. 21(1), no limit/no limit) | — | Gaining-experience $6,000/1yr |
| Sweden | — | — (remittances only, Art. 21, no limit/no limit) | — | |
| Switzerland | — | — (remittances only, Art. 20, no limit/no limit) | — | |
| Thailand | Art. 22(1), no limit, 5 yrs | Art. 22(1), $3,000 p.a., 5 yrs | Art. 23, 2 yrs | Gaining-experience $7,500/12mo; govt program $10,000/1yr |
| Trinidad and Tobago | Art. 19(1), no limit, 5 yrs | Art. 19(1), $2,000–$5,000 p.a. (study vs. professional training), 5 yrs | Art. 18, 2 yrs | Gaining-experience $5,000/1yr; govt program $10,000/1yr |
| Tunisia | Art. 20, no limit, 5 yrs | Art. 20, $4,000 p.a., 5 yrs | — | |
| Turkey | — | — (remittances only, Art. 20(1), no limit/no limit) | Art. 20(2), 2 yrs | |
| Ukraine | Art. 20, no limit, 5 yrs (training/research) | — | — | |
| United Kingdom | — | — (remittances only, Art. 20, no limit/1 yr, apprentice) | Art. 20A, 2 yrs — **retroactive loss if exceeded** | |
| Venezuela | Art. 21(1), no limit, 5 yrs (extendable for postgrad) | Art. 21(1)/(2), $5,000–$8,000 p.a. depending on payer, 5yrs/12mo | Art. 21(3), 2 yrs (combined 5-yr cap) | |

**Also have treaties, but not F-1-priority countries / not independently re-verified line-by-line for this table version:** Bangladesh, Barbados, Belgium, Bulgaria, Chile, CIS block, Cyprus, Czech Republic, Estonia, Iceland, Israel, Jamaica, Kazakhstan, Latvia, Lithuania, Malta, Morocco, Norway, Poland, Portugal, Romania, Slovak Republic, Slovenia, Sri Lanka, Trinidad & Tobago, Tunisia, Ukraine, Venezuela are all captured above directly from the official IRS table and should be considered reasonably reliable, but — per instructions — every row should be re-validated against the live treaty text before being hard-coded into deterministic logic, because footnote interactions (payer-residency conditions, "unless previously claimed" exclusions, combined-period caps) are numerous and easy to mis-encode.

### 2.3 Countries with NO U.S. income tax treaty (confirmed)

These appear on neither the current IRS Table 2 nor Table 3 (as of Sept. 26, 2025). An F-1 student who is a citizen/tax-resident of one of these countries has **zero treaty-based exemption available** — all U.S.-source wages and any taxable (non-qualified) scholarship income are fully taxable under standard NRA rules (IRC §871), subject only to the ordinary §117 qualified-scholarship exclusion and the personal exemption/filing rules otherwise available to NRAs.

Among the user-prioritized major F-1-sending countries, **no treaty exists** for:
- **Vietnam**
- **Nigeria**
- **Saudi Arabia**
- **Brazil**
- **Nepal**
- **Ghana**
- **Kenya**
- **Iran**
- **Taiwan** (excluded from the China treaty; no independent treaty in force as of this writing — legislative effort pending, see §2.1)

Other common F-1-sending or notable countries also confirmed **without** a treaty (non-exhaustive — flag any country not found in §2.2 and route to manual verification rather than assuming): Singapore, Malaysia, Hong Kong, United Arab Emirates, Qatar, Kuwait, Lebanon, Jordan, Colombia, Peru, Ecuador, Argentina, Ethiopia, Uganda, Tanzania, Zimbabwe, Cameroon, Rwanda, Angola, Myanmar.

### 2.4 Suspended or terminated treaties — special handling required

| Country | Status | Effect on student benefits |
|---|---|---|
| **Hungary** | **Terminated.** Treaty ceased to have effect for amounts paid/credited on or after **Jan. 1, 2024** (withholding) and for taxable periods beginning on or after Jan. 1, 2024 (other taxes). | Treat as **no-treaty country** for any 2024+ income. Pre-2024 income may still have been treaty-eligible — route to manual review if relevant. |
| **Russia** | **Suspended.** The U.S. suspended Articles 5–21 and 23 of the treaty (and the accompanying Protocol) effective **Aug. 16, 2024**, "until otherwise decided by the two governments." Only the residency article (Art. 4) and structural provisions remain nominally in force. | Articles 5–21 cover essentially all substantive income categories, including the student/trainee and teacher/researcher provisions. **Treat Russia as having no usable treaty benefits for students from Aug. 16, 2024 forward.** Monitor for reinstatement. |
| **Belarus** (part of the 9-country CIS/USSR treaty) | **Narrowly suspended.** Only paragraph 1(g) of Article III was suspended (Dec. 17, 2024 – Dec. 31, 2026 or earlier), which is **not** the student/trainee article (Art. VI). | The CIS treaty's Student/Trainee article (Art. VI) **appears to remain usable** for Belarusian students — but this narrow suspension should be re-verified before encoding, since it is unusual and easy to get wrong. |

---

## 3. Decision Logic (pseudocode)

```
FUNCTION determine_treaty_exemption(
    citizenship_country,
    tax_residence_country,       # may differ from citizenship; treaty tests RESIDENCE, not citizenship
    was_resident_of_treaty_country_immediately_before_us_arrival,  # bool
    us_tax_status,                # "NRA" | "resident_alien" (post-SPT) | "dual_status"
    income_type,                  # "wages_compensation" | "scholarship_fellowship" | "remittance_from_abroad"
    income_amount_this_year,
    cumulative_years_in_us_under_this_status,   # or consecutive months, per-treaty unit
    cumulative_treaty_benefit_months_used_prior_years,  # from Schedule OI Item L history
    payer_type,                   # "US_resident" | "foreign_resident" | "home_country_nonprofit" | "US_govt" | ...
    primary_purpose,              # "study" | "train_apprentice" | "teach" | "research"
    prior_period_claims           # list of articles/sub-paragraphs already claimed (for "cannot combine" / "once-in-lifetime" checks)
)

  # STEP 0 — qualified scholarship carve-out (statutory, not treaty)
  IF income_type == "scholarship_fellowship" AND passes_irc_117_qualified_scholarship_test(income):
      RETURN { taxable: 0, basis: "IRC_117_qualified_scholarship", treaty_needed: false }

  # STEP 1 — country has a treaty at all?
  treaty = lookup_treaty(tax_residence_country)
  IF treaty IS NULL OR treaty.status IN ("terminated", "fully_suspended"):
      RETURN { exempt: false, cap: 0, article: null,
               reason: "no_treaty_or_treaty_inactive_for_" + tax_residence_country }

  IF treaty.status == "partially_suspended":
      IF relevant_article(treaty, income_type) IN treaty.suspended_articles:
          RETURN { exempt: false, reason: "relevant_article_suspended" }
      # else fall through — the specific article needed is still active (e.g. Belarus)

  # STEP 2 — residency test
  IF NOT is_treaty_resident(tax_residence_country, treaty) :
      RETURN { exempt: false, reason: "not_a_treaty_resident" }

  IF treaty.requires_residency_immediately_before_arrival
     AND NOT was_resident_of_treaty_country_immediately_before_us_arrival:
      RETURN { exempt: false, reason: "failed_pre_arrival_residency_requirement" }

  IF is_dual_resident(tax_residence_country, "US"):
      apply_tie_breaker_rule()   # -> requires Form 8833 disclosure if treaty residence ≠ citizenship/visa country
      FLAG_FOR_HUMAN_REVIEW("dual_residency_tie_breaker")

  # STEP 3 — saving clause check (only matters once US-resident-alien)
  IF us_tax_status == "resident_alien":
      IF NOT treaty.has_saving_clause_exception_for_students:
          RETURN { exempt: false, reason: "saving_clause_no_exception_" + tax_residence_country }
          # e.g. Greece, Pakistan -> hard stop, no fallback
      ELSE IF treaty.saving_clause_exception_requires_SPT_status_only
           AND taxpayer_is_LPR_greencard:
          IF tax_residence_country NOT IN ("China", "CIS_block"):
              RETURN { exempt: false, reason: "saving_clause_exception_does_not_cover_green_card_holders" }
      # else: proceed, but claim moves from 1040-NR mechanics to 1040 + Schedule 1 line 8z mechanics

  # STEP 4 — primary purpose match
  article = select_article_for_purpose(treaty, primary_purpose)
     # "study"/"train_apprentice" -> Student/Trainee article
     # "teach"/"research"          -> Teacher/Researcher article
  IF article IS NULL:
      RETURN { exempt: false, reason: "no_matching_article_for_purpose" }

  # STEP 5 — once-in-lifetime / combination / "previously claimed" exclusions
  IF article.excluded_if_previously_claimed(prior_period_claims):
      RETURN { exempt: false, reason: "article_already_used_per_once_in_lifetime_or_combination_clause" }

  # STEP 6 — income-category routing
  SWITCH income_type:
    CASE "remittance_from_abroad":
        cap = article.remittance_cap        # almost always "no limit"
        time_limit = article.remittance_time_limit   # often "no limit" for full-time students;
                                                       # 1-2 yrs if payer/person is classified as "apprentice/trainee"
    CASE "scholarship_fellowship":
        IF article.scholarship_payer_requirement NOT satisfied by payer_type:
            RETURN { exempt: false, reason: "payer_does_not_meet_treaty_condition_e.g._Pakistan_nonprofit_only" }
        cap = article.scholarship_cap        # "no limit" for most; CIS/ex-USSR is capped
        time_limit = article.scholarship_time_limit   # e.g. 5 yrs; China/India are open-ended
    CASE "wages_compensation":
        cap = article.compensation_cap       # e.g. $2,000-$10,000/yr; "no limit" for a few (Chile, China's remittance line)
        time_limit = article.compensation_time_limit

  # STEP 7 — time-limit consumption check
  years_or_months_used = cumulative_treaty_benefit_months_used_prior_years
  IF years_or_months_used + current_period >= time_limit AND time_limit != "no_limit":
      IF article.retroactive_loss_clause == true:
          RETURN { exempt: false,
                   reason: "time_limit_exceeded_RETROACTIVE_LOSS",
                   action_required: "AMEND_PRIOR_YEAR_RETURNS_for_" + tax_residence_country + "_" + article.id,
                   prior_years_to_amend: compute_affected_years(cumulative_treaty_benefit_months_used_prior_years) }
      ELSE:
          RETURN { exempt_up_to_limit: true,
                   exempt_amount: 0,  # limit already fully consumed
                   taxable_amount: income_amount_this_year,
                   reason: "time_limit_exceeded_prospective_only" }

  # STEP 8 — dollar-cap application
  exempt_amount = MIN(income_amount_this_year, cap)   # cap = infinity if "no limit"
  taxable_amount = MAX(0, income_amount_this_year - cap)

  # STEP 9 — form/disclosure routing
  disclosure = {
      withholding_time_form: "Form_8233_if_wage_income_and_withholding_not_yet_applied"
                              OR "Form_W-8BEN_if_non-wage_scholarship_with_payer",
      filing_time_form: "Form_1040-NR_line_1k_plus_Schedule_OI_Item_L"
                         IF us_tax_status != "resident_alien"
                         ELSE "Form_1040_line_1_plus_Schedule_1_line_8z_negative_entry_plus_W-9_statement",
      form_8833_required: is_dual_resident(tax_residence_country, "US")   # tie-breaker position
                           OR treaty_position_modifies_other_code_provision,
      article_citation: article.id,
      schedule_OI_item_L_fields: {
          country: tax_residence_country,
          article: article.id,
          prior_months_claimed: cumulative_treaty_benefit_months_used_prior_years,
          current_year_exempt_amount: exempt_amount
      }
  }

  RETURN {
      exempt: exempt_amount > 0,
      exempt_amount: exempt_amount,
      taxable_amount: taxable_amount,
      article: article.id,
      cap: cap,
      time_limit: time_limit,
      disclosure: disclosure
  }
```

---

## 4. Ambiguous / Complex Cases → Route to Human (Tax-Pro) Review

The engine should **not** attempt fully automated determination — and should instead flag for manual/licensed-preparer review — in at least these situations:

1. **Dual citizenship** where the two countries have different (or conflicting, or one-has-no-treaty) treaty outcomes. The relevant test is tax *residence* under each treaty's own residency article, not citizenship per se, and the tie-breaker rule requires fact-specific judgment (permanent home, center of vital interests, habitual abode).
2. **Treaty country affected by border/political changes** — e.g., a person born in a former-USSR state now covered by the CIS "Commonwealth of Independent States" treaty bucket (Armenia, Azerbaijan, Belarus, Georgia, Kyrgyzstan, Moldova, Tajikistan, Turkmenistan, Uzbekistan) vs. a Baltic state or Russia/Ukraine which have their **own separate, different** treaties; a Hong Kong/Macau resident mistakenly assumed to be covered by the China treaty (they are explicitly excluded); a Taiwan-born person whose treaty eligibility depends on how "resident of Taiwan" is characterized (no treaty applies at all).
3. **Person claims tax residence in a treaty country that is not their citizenship/home country** (e.g., claiming UK treaty residence while holding Indian citizenship because of a prior UK posting) — this triggers the tie-breaker rule, **requires Form 8833**, and needs documentary substantiation (certificate of residency, etc.) that an automated engine cannot verify.
4. **Partial-year / status-change years**: F-1 → H-1B change of status mid-year; F-2 → F-1 change of status; first-year or last-year dual-status returns; any year in which SPT is crossed mid-year while a time-sensitive or cliff-effect treaty benefit is in play.
5. **Approaching or crossing a retroactive "cliff effect" time limit** (India Teacher/Researcher, Luxembourg, Netherlands, UK, Germany compensation line) — the financial stakes of getting this wrong (clawing back multiple prior years) are high enough to warrant human sign-off before the engine auto-files a treaty position for these specific treaty/article combinations.
6. **Greece and Pakistan citizens who have crossed into resident-alien status** — because there is no saving-clause fallback, confirm the SPT-crossing date precisely (since it determines the exact date treaty eligibility ends) rather than auto-computing.
7. **Classifying "scholarship" vs. "compensation for services"** where the facts are ambiguous (e.g., a graduate assistantship or fellowship with light service expectations) — the IRS applies a multi-factor facts-and-circumstances test (supervision/time schedules/reporting requirements, W-2 vs. 1042-S issuance, whether the payment primarily benefits the payer vs. furthers the student's own education, size of payment vs. typical fellowships) that cannot be reliably automated from limited user inputs; misclassification changes both the applicable treaty article and the dollar cap.
8. **CIS/USSR-bloc country with a partial suspension** (currently Belarus) or any treaty with a **recent or pending suspension/termination/renegotiation** (watch Russia for reinstatement, Taiwan for a new agreement, any country where press reports indicate treaty renegotiation) — route to review until the engine's treaty data has been refreshed and reconfirmed against the live IRS table.
9. **Treaty benefit for compensation where the employer is not the kind of payer the specific treaty requires** (e.g., Pakistan's nonprofit-only scholarship payer rule, or treaties where the exemption only applies if the payer is "any U.S. or foreign resident" vs. only a "treaty-country resident") — these payer-residency conditions are easy to encode incorrectly and worth a secondary check.
10. **Any country/article combination not explicitly present in §2.2** above — do not infer or extrapolate a cap/time-limit; treat as unverified and route to manual research against the live treaty text.

---

## 5. Sources

- IRS Publication 901, *U.S. Tax Treaties* (Rev. Sept. 2024) — https://www.irs.gov/pub/irs-pdf/p901.pdf and https://www.irs.gov/publications/p901
- IRS, *Tax Treaty Tables* (landing page) — https://www.irs.gov/individuals/international-taxpayers/tax-treaty-tables
- IRS, **Table 2**, *Compensation for Personal Services Performed in United States Exempt from U.S. Income Tax Under Income Tax Treaties* (all 26 pages, including footnotes 1–61), retrieved live 2026-10-02 — https://www.irs.gov/pub/irs-lbi/tax-treaty-table-2.pdf
- IRS, **Table 3**, *List of Tax Treaties* (updated through Sept. 26, 2025), retrieved live 2026-10-02 — https://www.irs.gov/pub/irs-lbi/table-3-list-of-tax-treaties.pdf
- IRS LB&I Process Unit (Practice Unit), *Examining Treaty Exemptions of Income — NRA Students, Trainees, Teachers and Researchers*, DCN INT-P-228, last updated 10/12/21 — https://www.irs.gov/pub/fatca/int_practice_units/examining-treaty-exemptions-nra-students-teachers.pdf
- IRS, *Claiming Tax Treaty Benefits* — https://www.irs.gov/individuals/international-taxpayers/claiming-tax-treaty-benefits
- IRS, *Claiming Treaty Exemption for a Scholarship or Fellowship Grant* — https://www.irs.gov/individuals/international-taxpayers/claiming-treaty-exemption-for-a-scholarship-or-fellowship-grant
- IRS, *Withholding Certificates and Exemptions for Personal Services and Students* — https://www.irs.gov/node/391
- IRS, Instructions for Form 8233 — https://www.irs.gov/pub/irs-prior/i8233--2021.pdf and https://www.irs.gov/instructions/i8233
- IRS, Instructions for Form 1040-NR (2025), including Schedule OI — https://www.irs.gov/instructions/i1040nr and https://www.irs.gov/pub/irs-pdf/i1040nr.pdf
- IRS, Schedule OI (Form 1040-NR) — https://www.irs.gov/pub/irs-pdf/f1040nro.pdf
- IRS, *United States Income Tax Treaties — A to Z* — https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z
- U.S.–India Income Tax Treaty, Article 21 (student/apprentice; standard-deduction-equivalent provision), as discussed in IRS Pub. 519 and secondary professional summaries (VisaVerge, f1taxreturn.com, kkca.io) — cross-checked against the LB&I practice unit's citation of Art. 22(1) for the retroactive-loss rule on the Teacher/Researcher side
- RSM US, *United States suspends income tax treaty with Russia* — https://rsmus.com/insights/tax-alerts/2024/united-states-suspends-income-tax-treaty-with-russia.html
- EY Global Tax News, *US Treasury suspends key provisions of US-Russia Tax Treaty and Protocol, effective 16 August 2024* — https://globaltaxnews.ey.com/news/2024-1294-us-treasury-suspends-key-provisions-of-us-russia-tax-treaty-and-protocol-effective-16-august-2024
- Holland & Knight, *Treasury Department Confirms Suspension of U.S.-Russia Income Tax Treaty* — https://www.hklaw.com/en/insights/publications/2024/07/treasury-department-confirms-suspension-of-us-russia-income-tax-treaty
- Grant Thornton, *Hungary treaty no longer in effect* — https://www.grantthornton.com/insights/newsletters/tax/2024/hot-topics/jan-16/hungary-treaty-no-longer-in-effect
- Bloomberg Tax, *US-Hungary Treaty's Effect on Withheld Taxes Nulled as of 2024* — https://news.bloombergtax.com/daily-tax-report-international/us-hungary-treatys-effect-on-withheld-taxes-nulled-as-of-2024
- Congress.gov, S.1457 / H.R. 33, *Taiwan Tax Agreement Act* / *United States–Taiwan Expedited Double-Tax Relief Act* — https://www.congress.gov/bill/118th-congress/senate-bill/1457 ; RSM, *House passes US-Taiwan Expedited Double-Tax Relief Act with bipartisan support* — https://rsmus.com/insights/tax-alerts/2025/house-passes-us-taiwan-double-tax-relief-act.html

---

## 6. Data Confidence & Manual-Review Routing List

**High confidence (sourced directly from current IRS Table 2/Table 3, cross-checked against the LB&I practice unit):** All ~56 individual countries plus the 9-country CIS block listed in §2.2; the no-treaty status of Vietnam, Nigeria, Saudi Arabia, Brazil, Nepal, Ghana, Kenya, Iran, Taiwan; the Hungary termination date; the Russia suspension scope and date.

**Medium confidence — re-verify against live treaty text before hard-coding into production logic (footnote interactions are dense and this transcription, while sourced from the official PDF, was done by a single automated pass):**
- Every "payer condition" footnote (e.g., which treaties require the scholarship payer specifically be a *nonprofit*, vs. "any U.S. or foreign resident," vs. a narrower treaty-country-resident-only condition).
- All "previously claimed" / "once-in-a-lifetime" / "combination period" exclusion footnotes (these are numerous, numbered differently per treaty, and easy to transpose).
- The precise scope of what counts toward the "cumulative years/months" clock for time-limited benefits (calendar year vs. 12-consecutive-month vs. 365-day definitions vary by treaty).
- Belarus's specific partial-suspension scope (confirmed from the primary Table 3 footnote, but the practical interaction with Article VI for students was not independently tested against a second source).

**Not independently verified at all — explicitly route to manual legal review before the engine makes any representation about these:**
- Any treaty country not appearing in §2.2 (meaning: do not assume no-treaty status from omission — **affirmatively check** the live IRS Table 3 and the IRS A-to-Z treaty list before classifying a country as treaty-less; this document's no-treaty list in §2.3 was confirmed for the named countries only).
- The exact, current legislative status of the U.S.-Taiwan tax relief legislation (moving target — re-check Congress.gov before each filing season).
- Whether the Russia treaty suspension has been lifted, extended, or modified (re-check IRS Table 3's footnote 8 before each filing season).
- Full line-by-line text of every treaty article cited (this document relies on the IRS's own summary Table 2, which the IRS itself instructs preparers to treat only as a "quick reference/starting point" — the underlying treaty text and Treasury Technical Explanations should be the final authority for any specific taxpayer determination with real dollars at stake).
