# 14 — Filing Deadlines and E-File Rules (Federal 1040-NR / Form 8843)

**Scope:** Deadlines for Form 1040-NR and Form 8843; consequences of missing them; current IRS Modernized e-File (MeF) support for Form 1040-NR and which providers can actually e-file it; what LumaTax itself would need to do to become an IRS-authorized Electronic Return Originator (ERO) for 1040-NR; and state e-file interactions. Ends with an operational checklist with explicit uncertainty flags.

---

## 1. Federal Filing Deadlines

### 1.1 The standard rule: April 15

Form 1040-NR is due **April 15** of the year following the tax year **if the taxpayer was an employee and received wages subject to U.S. income tax withholding** during the year (Instructions for Form 1040-NR, "What's New"/"When To File"). This is the common case for F-1 students with on-campus, CPT, or OPT W-2 wages.

### 1.2 The NRA-specific exception: June 15

If the taxpayer **did not receive wages subject to U.S. income tax withholding** (e.g., only scholarship/fellowship income reported on Form 1042-S, only Form 8843 to file with no income, or only FDAP investment income with no wage withholding) **and did not have an office or place of business in the United States**, the deadline is **June 15** of the year following the tax year instead of April 15. This is a straightforward later statutory due date for this category of filer — it is **not** an extension and requires **no separate extension form or attached statement** to use; the taxpayer simply files by June 15. (Instructions for Form 1040-NR, "When and Where Should You File?"; corroborated by multiple university international-tax-office and tax-prep-industry summaries of the same instruction language.)

```
IF taxpayer received U.S. wages subject to income-tax withholding during the tax year
    THEN federal due date = April 15 of following year
ELSE IF taxpayer had no such withheld wages AND no U.S. office/fixed place of business
    THEN federal due date = June 15 of following year (no extension form needed to get
         this later date — it is the ordinary due date for this category)
ELSE
    -> ROUTE TO HUMAN REVIEW (edge case: e.g., self-employment with a U.S. office,
       which is itself an immigration-sensitive edge case for F-1 status)
```

**Engine implication:** the due-date determination must be driven by **whether Form W-2/withheld wages exist for the year**, not by visa category or by whether Form 1040-NR vs. 8843-only is being filed. A student who files only Form 8843 (no income at all) and a student with only treaty-exempt 1042-S scholarship income (no wage withholding) both fall into the June 15 bucket; a student with even one paycheck with federal withholding falls into the April 15 bucket.

### 1.3 Form 8843 deadline

Form 8843 follows the same April 15 / June 15 logic as the taxpayer's overall filing category: if Form 8843 is attached to a Form 1040-NR that is due April 15 (wage-withholding case), it is due April 15; if filed standalone (no income tax return required at all, which is the common case for a student with zero U.S. income who still must establish "exempt individual" days) or attached to a return in the no-withholding category, it is due June 15.

---

## 2. Consequences of Missing the Deadline

### 2.1 Form 1040-NR — late filing / late payment

- **Extension:** Form 4868 (Application for Automatic Extension of Time to File) can be filed by the original due date (April 15 or June 15, as applicable) to extend the filing deadline by **six months** — i.e., to October 15 for the April-15 group, or to December 15 for the June-15 group. An extension of time to **file** is not an extension of time to **pay**; any tax owed is still due by the original deadline, and interest accrues from that date regardless of the extension.
- **Failure-to-file penalty:** generally 5% of unpaid tax per month (or part of a month), up to a maximum of 25%, assessed when a return is filed late **and tax is owed**. If no tax is owed, there is generally no failure-to-file dollar penalty, but filing late can still jeopardize other things (see 2.2 and 2.3 below).
- **Failure-to-pay penalty:** generally 0.5% of unpaid tax per month (or part of a month), up to 25%, separate from and in addition to the failure-to-file penalty (combined cap generally 5%/month between the two, per IRC §6651). Interest accrues separately on top of both penalties at the federal short-term rate plus 3%, compounded daily, from the original due date until paid.
- **Refund claims:** no penalty at all applies if the taxpayer is due a refund and simply files late to claim it, subject to the general 3-year refund statute of limitations.

### 2.2 Form 8843 — no monetary penalty, but a substantive risk

Form 8843 is an **informational statement**, not a tax return, and carries **no flat-dollar penalty and no per-day late-filing fine** for filing it late. The real risk is not monetary: Form 8843 is how an "exempt individual" (F/J/M/Q visa holder) excludes days of U.S. presence from the **Substantial Presence Test (SPT)**. If Form 8843 is not filed timely for a given year, the IRS's default position is that those exempt days **cannot** be excluded from the SPT for that year. If including those days pushes the individual over the 183-day SPT threshold, the IRS may treat the individual as a **resident alien** for that tax year instead of an NRA — triggering worldwide-income reporting and a fundamentally different tax posture than the one the engine computed.

- **Cure:** this default consequence does not automatically apply if the taxpayer can show, with "clear and convincing evidence," that they did not know of the Form 8843 requirement and took "meaningful steps to comply" once they learned of it — filing the delinquent Form 8843 as soon as the omission is discovered is itself the primary evidence of good faith.
- **Engine implication:** any detected late or missing Form 8843 for a prior year should be flagged for immediate catch-up filing (one Form 8843 per missed year, which can be mailed together) and should trigger a secondary check of whether the missed exempt days would, if disallowed, flip the person's residency status for that year or a later one (since SPT is a rolling, multi-year lookback) — this is a status-level, not just a compliance-level, risk and should be surfaced prominently rather than only as a soft reminder.

---

## 3. IRS e-File (MeF) Support for Form 1040-NR

### 3.1 History and current baseline capability

The IRS first opened Form 1040-NR to electronic filing for **tax year 2016 returns, in the 2017 filing season** — over a decade after Form 1040 e-file became widespread. Historically, Form **1040NR-EZ** (discontinued as a separate form after tax year 2019, folded into 1040-NR) could **not** be e-filed and always required paper filing. As of current MeF, the general individual 1040-series MeF program — which includes Form 1040-NR — supports e-filing for the **current tax year plus the two immediately preceding tax years** (the standard MeF "current + 2 prior years" window that applies across the 1040 series); years older than that must be paper-filed. **Amended** returns for Form 1040-NR specifically became MeF-eligible starting with **tax year 2023 and forward**, per IRS's MeF program documentation — amended 1040-NR for years before 2023 must be paper-filed (Form 1040-X by mail).

### 3.2 Known limitations — **flag for direct IRS e-help desk confirmation before launch**

- Dual-status-year returns (part resident / part nonresident in the same tax year) are commonly cited across tax-software vendor documentation as **not** eligible for e-file and must be paper-filed — this is a long-standing MeF business-rule limitation, but **the current-year authoritative IRS source (Pub. 4164 MeF Guide for Software Developers, or the current MeF business-rules/schema package) should be checked directly each season**, since this is exactly the kind of rule that changes without much public fanfare and the research for this file relied partly on tax-software-vendor summaries rather than a direct, dated IRS line-item confirming dual-status e-file is still blocked for the current tax year.
- Certain attachments/elections and ITIN-application-in-progress returns (Form W-7 filed concurrently) generally still require paper filing, since an e-filed return needs a valid, already-issued TIN.
- **This is explicitly flagged as ambiguous and in need of direct confirmation:** whether there remain any current-year forms/schedules commonly used by F-1 students (e.g., Schedule OI, Form 8843 as an attachment, Form 8833 treaty-position disclosure) that are unsupported as e-file attachments to Form 1040-NR in the current MeF schema version. The research for this file found general confirmation that the 1040-NR MeF program exists and is active for TY2025/TY2026, but did not find a definitive, current, line-by-line "supported forms and schedules" list specific to 1040-NR attachments. **LumaTax must pull the current Publication 4164 / MeF schema and business-rules package (irs.gov/tax-professionals/tax-year-2026-modernized-e-file-schema-and-business-rules-for-individual-tax-returns-and-extensions) and cross-check every form/schedule the engine produces against it before claiming e-file support for any specific scenario.**

### 3.3 Which providers can actually e-file 1040-NR today

This is the central, well-documented pain point for this market:

- **Mainstream consumer products (TurboTax, H&R Block's consumer/online product) generally do not support Form 1040-NR at all** — a taxpayer who is an NRA and mistakenly uses these products risks incorrectly filing a resident Form 1040, which is a substantive misfiling (wrong form, wrong deduction rules, wrong income sourcing), not merely a missed e-file convenience.
- **Sprintax** (Sprintax Returns) is IRS-approved to e-file **federal** nonresident returns (Form 1040-NR) and is the most commonly cited specialized e-file provider for F-1/J-1 students in university-partnership contexts (many universities license Sprintax for their international student populations).
- **GLACIER Tax Prep** is widely used to **prepare** Form 1040-NR for nonresident students/scholars/researchers, but per the research for this file, GLACIER Tax Prep output is **mailed to the IRS as a paper return** rather than transmitted electronically — i.e., it is a preparation tool, not an e-file transmitter, for the federal return. **This should be reconfirmed directly with GLACIER/Arctic International before being stated as settled fact in any external-facing LumaTax material**, since preparation-software e-file capabilities do change and this research relied on secondary summaries rather than a direct current statement from the vendor.
- **Practitioner-grade professional software** (Drake Tax, Lacerte, UltraTax CS, TaxAct professional/ProSeries-type products) generally supports 1040-NR creation and e-file for current and recent years, gated behind the preparer holding their own EFIN (see Section 4).

### 3.4 IRS Free File and Form 1040-NR

IRS Free File (the guided-software partner program, income-gated at an AGI ceiling that is adjusted annually — $89,000 or below cited for the 2025 filing season) is **not generally usable for Form 1040-NR**: most Free File Alliance partner products do not support nonresident returns (e.g., FreeTaxUSA explicitly excludes Form 1040NR from its supported-forms list), and **Free File Fillable Forms**, the IRS's own no-income-limit fillable-PDF e-file option, likewise **does not list Form 1040-NR among its supported forms** (only Form 1040/1040-SR). **Net effect: there is currently no IRS Free File pathway for a nonresident alien to e-file Form 1040-NR directly through IRS.gov's free programs** — NRAs are functionally routed to specialized paid software (Sprintax) or a paid/professional preparer. This conclusion should be reconfirmed each filing season directly against the IRS Free File partner list and the Free File Fillable Forms "known limitations" page, since Free File partner terms change annually by agreement between IRS and the Free File Alliance.

---

## 4. Becoming an IRS-Authorized e-File Provider for 1040-NR (What LumaTax Would Need To Do)

To have LumaTax itself transmit 1040-NR e-filed returns (rather than relying on a third-party transmitter relationship), LumaTax would need to become an **Authorized IRS e-file Provider**, specifically in the **Electronic Return Originator (ERO)** role (and/or Transmitter role, if LumaTax wants to transmit directly to IRS rather than through another transmitter).

### 4.1 Core application steps

1. **Form 8633, Application to Participate in the IRS e-file Program** — must be completed and submitted (via the IRS e-Services online e-file application) for every "Principal" and "Responsible Official" of the firm.
2. **Suitability check** — IRS performs a check on every listed Principal/Responsible Official covering: criminal background, credit history, prior noncompliance with IRS e-file requirements, and federal tax compliance (e.g., no outstanding unresolved tax issues).
3. **Fingerprinting** — a fingerprint card/IRS-authorized-vendor fingerprinting appointment is required for each Principal/Responsible Official **unless** that person already holds an exempting professional credential (e.g., active CPA, attorney, or enrolled agent status) — credentialed individuals are generally exempt from the fingerprinting step.
4. **EFIN issuance** — once the application is accepted, the IRS assigns an **Electronic Filing Identification Number (EFIN)** to the firm/office. An EFIN is mandatory to transmit any e-filed return; it is tied to the specific firm and is **not transferable** if the business is sold or restructured (a new Form 8633 application is required in that event). An EFIN can lapse if no returns are filed under it in a filing season, so a dormant EFIN obtained far ahead of launch could expire before LumaTax uses it.
5. **Typical timeline:** commonly cited as **4-6 weeks** from application to EFIN issuance, with up to **12 weeks** in some cases depending on suitability-check and fingerprinting scheduling — this is a real lead-time constraint for a launch date and should be built into the project plan with buffer, not treated as a same-season formality.
6. **MeF Assurance Testing System (ATS)** — separately from the ERO/EFIN process, if LumaTax is also acting as (or using) **software** that generates the e-file transmission file (as opposed to using a third-party professional product under its own EFIN), LumaTax's software must pass the IRS's **Assurance Testing System (ATS)** test scenarios for the **1040 and 1040-NR MeF program** for the relevant tax year before that software can be used to transmit returns. This is a distinct, software-specific certification layer on top of the firm-level ERO/EFIN approval, and both are prerequisites to in-house e-filing of 1040-NR.

### 4.2 Does MeF currently support 1040-NR? — Answer and residual ambiguity

**Yes, at the program level** — Form 1040-NR is an active part of the IRS 1040-series MeF program for current tax years (original returns since TY2016, amended returns since TY2023), and IRS's own ATS testing materials explicitly reference a "1040 and 1040-NR MeF Program" software developers must pass. **This should NOT be read as "every 1040-NR scenario is e-fileable"** — see Section 3.2's flagged limitations (dual-status, certain attachments, ITIN-pending returns). **Given how directly this bears on LumaTax's core business model, this entire section should be independently reconfirmed with the IRS e-help desk for electronic filers (e-help Desk, 866-255-0654) or outside tax/e-file counsel before any public or investor-facing claim is made about LumaTax's ability to e-file 1040-NR returns at launch.** The research underlying this file used IRS.gov pages, IRS-published MeF schema/ATS pages, and secondary industry/vendor commentary, but did not include a direct phone/API confirmation from IRS e-help desk, which is the appropriate authoritative source for a decision this consequential to the business.

### 4.3 Build vs. rely on a transmitter — a real design choice

LumaTax has at least three paths, each with different timelines and dependencies, and this file does not pick one — that is a product/legal decision:

1. **LumaTax becomes its own ERO + obtains its own EFIN**, and either builds MeF-schema-compliant transmission software in-house (requiring ATS certification) or uses a third-party **transmitter** service to actually send the already-ERO-originated return to IRS infrastructure.
2. **LumaTax partners with/white-labels an existing authorized 1040-NR e-file provider** (e.g., a Sprintax-style arrangement or a professional-software API), avoiding the ERO application and ATS certification burden but creating a commercial dependency and likely per-return cost/revenue-share.
3. **LumaTax prepares returns but routes actual filing to paper mail or to the taxpayer self-filing**, deferring the e-file infrastructure question entirely for an initial launch — slower/worse UX but zero regulatory lead time.

---

## 5. State E-File Interactions for NRAs

- **Sprintax, the leading specialized federal NRA e-file provider, does not e-file state tax returns at all** — it prepares state-return documents for the taxpayer to print and mail. This is a documented, current limitation of the dominant tool in this space, not a historical footnote.
- More generally, **many states do not accept e-filed nonresident/part-year-resident returns when they are linked to a federal return that itself was paper-filed**, because most state "fed/state" e-file pipelines are built to transmit the state return bundled with (or referencing the already-accepted) federal submission. If the federal 1040-NR is paper-filed (common, per Sections 3-4 above), the linked state nonresident return commonly must be paper-filed too, even in states whose e-file systems otherwise support nonresident filing for citizens/resident-alien taxpayers.
- Example of a related, narrower state-specific restriction found in research: New Jersey's e-file mandate explicitly **excludes** nonresident, part-year-resident, and prior-year/amended returns, and a taxpayer who must file both a resident and a nonresident-style NJ return in the same year cannot e-file both — at least one must be paper-filed.
- **Net effect for LumaTax's product design:** for the foreseeable near-term, assume **state returns for NRA F-1 students will typically be prepared by the engine but filed on paper**, and do not advertise state e-file as a default capability without per-state verification. Treat any specific state's e-file claim as requiring its own confirmation, the same way each state's treaty-conformity rule required individual verification in File 08.

---

## 6. What LumaTax Needs To Do Operationally To Support E-Filing — Checklist

**Near-term / no regulatory lead time required:**
- [ ] Build the engine to correctly branch the April-15-vs-June-15 federal deadline logic off of "was there withheld-wage income," not visa category (Section 1.2).
- [ ] Build a standing Form-8843-specific reminder/catch-up workflow that treats a missed 8843 as a status-risk flag (potential SPT exempt-days loss), not merely a "file it, no big deal" item (Section 2.2).
- [ ] Decide and document, for launch, which of the three paths in Section 4.3 LumaTax will use for actual transmission (own ERO vs. partner/white-label vs. paper-only at first) — this is a go/no-go product decision, not a tax-logic decision, and should not be left implicit.
- [ ] Build explicit user-facing messaging that state returns will likely be paper-filed even when the federal return is e-filed (Section 5), so this is not discovered as a surprise mid-filing-season.

**Requires direct IRS confirmation before any public e-file claim — FLAGGED, do not assume:**
- [ ] Confirm with the IRS e-help Desk (866-255-0654) or MeF Providers help line the **current, complete list of forms/schedules/attachments supported for e-filed Form 1040-NR** for the upcoming filing season, specifically: Schedule OI, Form 8843 as an e-filed attachment, Form 8833 (treaty position disclosure), Form 1116 (foreign tax credit, rare but possible), and dual-status-year handling.
- [ ] Confirm current MeF ATS testing requirements and timeline for the specific tax year LumaTax intends to launch e-file (schema versions change yearly, sometimes mid-season, per the "2026v3.0 / 2026v4.0" version churn observed in this research).
- [ ] Confirm whether GLACIER-style "prepare-only, mail-only" limitations are still accurate for comparison purposes, and whether any newer entrant now e-files 1040-NR that was not identified in this research pass.
- [ ] Confirm current IRS Free File Alliance partner terms each season to verify the "no Free File path for 1040-NR" conclusion in Section 3.4 still holds (partner lineup and supported-forms lists are renegotiated annually).

**Requires tax/e-file counsel before committing a launch timeline — FLAGGED:**
- [ ] Engage counsel to scope the Form 8633 ERO application (Principals/Responsible Officials to name, suitability-check risk review, fingerprinting logistics) and build a realistic timeline with the observed 4-12 week range plus buffer, not a best-case assumption.
- [ ] If choosing the partner/white-label path (Section 4.3, option 2) instead of becoming LumaTax's own ERO, have counsel review the commercial and liability terms of that arrangement (who is the ERO/EFIN holder of record, who bears responsibility for e-file rejections/errors, revenue share) before committing it to the product roadmap.
- [ ] Have counsel independently confirm the dual-status-return e-file limitation and the ITIN-pending e-file limitation referenced in Section 3.2, since both are common real-world scenarios for F-1 students (dual-status in arrival/departure years; many F-1 students are mid-ITIN-application in their first filing season) and a wrong assumption here would cause a visible product failure, not just a minor edge case.

---

## Sources

- [Instructions for Form 1040-NR (2025) — IRS.gov PDF](https://www.irs.gov/pub/irs-pdf/i1040nr.pdf)
- [Instructions for Form 1040-NR (2025) — IRS.gov](https://www.irs.gov/instructions/i1040nr)
- [About Form 1040-NR — IRS.gov](https://www.irs.gov/forms-pubs/about-form-1040-nr)
- [Form 4868, Application for Automatic Extension of Time To File — IRS.gov](https://www.irs.gov/pub/irs-pdf/f4868.pdf)
- [Drake Software KB — 1040/1040-NR Extending Due Date to June 15](https://kb.drakesoftware.com/kb/Drake-Tax/13646.htm)
- [Form 1040-NR guide: Filing, deadlines & rules — taxesforexpats.com](https://www.taxesforexpats.com/articles/non-us-citizens/form-1040-nr.html)
- [IRS Form 8843 guide for international students & nonresidents — taxesforexpats.com](https://www.taxesforexpats.com/articles/non-us-citizens/form-8843-statement-for-exempt-inidividuals-and-individuals-with-medical-condition.html)
- [Form 8843 for Visa Holders Explained: Exempt Individual Statement — greenbacktaxservices.com](https://www.greenbacktaxservices.com/knowledge-center/form-8843/)
- [Tax year 2025 Modernized e-File schema and business rules for individual tax returns and extensions — IRS.gov](https://www.irs.gov/tax-professionals/tax-year-2025-modernized-e-file-schema-and-business-rules-for-individual-tax-returns-and-extensions)
- [Tax year 2026 Modernized e-File schema and business rules for individual tax returns and extensions — IRS.gov](https://www.irs.gov/tax-professionals/tax-year-2026-modernized-e-file-schema-and-business-rules-for-individual-tax-returns-and-extensions)
- [Publication 4164, Modernized e-File (MeF) Guide for Software Developers — IRS.gov PDF](https://www.irs.gov/pub/irs-pdf/p4164.pdf)
- [Publication 4163, Modernized e-File (MeF) Information for Authorized IRS e-file Providers — IRS.gov PDF](https://www.irs.gov/pub/irs-pdf/p4163.pdf)
- [Tax year 2025 Form 1040 series and extensions MeF Assurance Testing System (ATS) information — IRS.gov](https://www.irs.gov/e-file-providers/tax-year-2025-form-1040-series-and-extensions-modernized-e-file-mef-assurance-testing-system-ats-information)
- [Benefits of Modernized e-File — IRS.gov](https://www.irs.gov/e-file-providers/benefits-of-1040-modernized-e-file)
- [Form 1040NR enters the 21st century — thetaxadviser.com](https://www.thetaxadviser.com/newsletters/2017/mar/form-1040nr-enters-21st-century/)
- [Electronic Filing for Form 1040NR, Finally! — GW Carter Ltd](https://gwcarter.com/efile-1040nr/)
- [3.42.10 Authorized IRS e-file Providers — Internal Revenue Manual, IRS.gov](https://www.irs.gov/irm/part3/irm_03-042-010r)
- [Tax pros: Apply to be an IRS authorized e-file provider in a few simple steps — IRS.gov Newsroom](https://www.irs.gov/newsroom/tax-pros-apply-to-be-an-irs-authorized-e-file-provider-in-a-few-simple-steps)
- [IRS e-File: A History — IRS.gov PDF (FS-11-10)](https://www.irs.gov/pub/irs-news/fs-11-10.pdf)
- [Sprintax Returns — Nonresident Alien Tax Preparation Software](https://www.sprintax.com/returns/)
- [How to E-file 2025 Nonresident Federal Tax Return with Sprintax — blog.sprintax.com](https://blog.sprintax.com/nonresident-federal-tax-efiling-live/)
- [Warning: Sprintax doesn't e-file state tax returns for non-resident aliens! — claimyr.com](https://claimyr.com/government-services/irs/Warning-Sprintax-doesnt-e-file-state-tax-returns-for-non-resident-aliens/2025-04-11)
- [How to file a nonresident state tax return — blog.sprintax.com](https://blog.sprintax.com/how-to-file-nonresident-state-tax-return/)
- [Filing Multiple Nonresident State Tax Returns — F1/J1 visa holders — blog.sprintax.com](https://blog.sprintax.com/filing-multiple-state-tax-returns-nonresidents/)
- [Free File Fillable Forms: Program limitations and available forms — IRS.gov](https://www.irs.gov/e-file-providers/free-file-fillable-forms-program-limitations-and-available-forms)
- [Free File Fillable Forms — IRS.gov](https://www.irs.gov/e-file-providers/free-file-fillable-forms)
- [IRS Free File: Here's who qualifies for the 2025 filing season — CNBC](https://www.cnbc.com/2025/01/21/irs-free-file-who-qualifies-for-2025-taxes.html)
- [FreeTaxUSA Supported Tax Forms — freetaxusa.com](https://www.freetaxusa.com/forms/)
- [NJ Division of Taxation — NJ-1040 and NJ-1041 E-File Mandate FAQ — nj.gov](https://www.nj.gov/treasury/taxation/efilemandate-faqs.shtml)
- [IRS UPDATES REQUIREMENTS FOR FORM 1040NR ELECTRONIC FILING PROGRAM — Tax Notes](https://www.taxnotes.com/research/federal/irs-guidance/revenue-procedures/irs-updates-requirements-for-form-1040nr-electronic-filing-program/dn5s)

**Verification note:** The MeF-support-scope conclusions in Section 3.2, the GLACIER Tax Prep e-file-capability claim in Section 3.3, and the IRS Free File exclusion in Section 3.4 are the three lowest-confidence, highest-business-impact claims in this file and are each explicitly flagged for direct IRS e-help desk or vendor reconfirmation before LumaTax relies on them for a go-live decision or any external claim about e-file capability.
