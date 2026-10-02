I want to build an AI-native tax filing platform specifically for F-1 international students in the United States.

The main problem is that existing products like Sprintax are confusing, form-heavy, and make users answer a large number of tax questions they often do not understand. International students usually do not know what Form 8843, 1040-NR, Schedule OI, tax treaties, residency tests, or different income classifications mean.

The product should make the experience almost completely automatic.

The core value proposition is:

“Upload your tax documents. We figure out the rest.”

A user should be able to:

1. Enter basic information such as:
- Country of prior tax residence/citizenship
- Visa type
- First date they entered the U.S.
- School
- States they lived or worked in during the year

2. Upload all of their documents, such as:
- W-2
- 1042-S
- 1099 forms
- Scholarship/fellowship documents
- I-20
- Previous tax return
- Other tax-related documents

The platform should automatically extract the information from these documents and determine what the student needs to file.

The system should then ask only the additional questions that are actually necessary for that specific person.

For example, instead of asking:

“Are you claiming a treaty benefit under Article XX?”

It should ask simple factual questions and determine treaty eligibility automatically.

The platform should support all F-1 students regardless of nationality, not only Indian students.

The backend would need several rule-based engines:

- Tax residency determination
- F-1 exempt-individual/substantial-presence rules
- Income classification
- Tax treaty determination by country
- Federal tax calculation
- Form 8843 generation
- Form 1040-NR and associated schedules
- State tax determination and filing
- Scholarship/fellowship treatment
- CPT/OPT income
- 1042-S handling
- FICA tax eligibility/refund situations
- Resident-alien transition after the applicable F-1 exemption period

AI should NOT be responsible for inventing tax calculations.

The actual tax calculation engine should be deterministic and rule-based.

AI should primarily be used for:

- Reading uploaded documents
- Extracting structured tax data
- Understanding natural-language answers
- Detecting missing documents
- Asking personalized follow-up questions
- Explaining tax concepts in simple language
- Identifying unusual situations that require human review

The ideal user experience would look like this:

User:
“I am an F-1 student.”

Platform:
“What country were you living in before coming to the U.S.?”

User:
“India.”

Platform:
“When did you first enter the U.S.?”

User:
“August 2023.”

Platform:
“Upload anything that looks like a tax document.”

User uploads W-2 and 1042-S.

The system processes everything and says:

“We found everything we need.

Your tax status: Nonresident alien

We prepared:
- Form 1040-NR
- Form 8843
- Schedule OI

We also checked whether a U.S. tax treaty applies to you.

Federal refund: $___
State refund/balance: $___

Ready to file.”

If the user's situation is unusually complicated, the system should automatically route it to expert review instead of guessing.

Examples could include:
- Dual-status tax years
- Complicated investment income
- Self-employment
- Multiple immigration statuses
- Complex treaty situations
- Rental income
- Unusual 1099 situations
- Immigration-related issues

The business model could be something like:

- Free: Form 8843-only filing
- $20–40: Simple federal 1040-NR
- Additional fee for state return
- Higher tier for complicated returns
- Premium human tax expert review

Long term, this could become much larger than F-1 tax filing.

The broader vision would be a financial and tax platform for immigrants in the U.S., covering things like:

- F-1 taxes
- OPT taxes
- CPT taxes
- FICA refund claims
- W-4 and withholding setup
- Tax treaty benefits
- H-1B transition
- Resident-alien transition
- Green card tax transition
- State changes
- FBAR/FATCA education and filing workflows
- Leaving the U.S. and final-year tax situations

The company would start with F-1 students because they have a very specific, painful, repeatable tax workflow and are underserved by mainstream tax products.

The product should feel much closer to ChatGPT + document upload + TurboTax than traditional tax software.

I want you to analyze this startup idea deeply and help me with:

1. Market size
2. Competitors, especially Sprintax
3. Regulatory requirements
4. IRS e-file requirements
5. Technical architecture
6. Tax engine design
7. AI architecture
8. Document extraction
9. State tax complexity
10. Tax treaty implementation
11. MVP scope
12. Pricing
13. University distribution strategy
14. Risks/liability
15. How difficult this would be to build
16. What could make this 10x better than Sprintax
17. A realistic roadmap from MVP to a large immigration-fintech company

I want the product to minimize tax jargon and forms as much as possible. The user should provide facts and documents, and the software should determine the tax consequences.