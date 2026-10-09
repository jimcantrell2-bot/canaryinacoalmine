# Cher Ami resource review — October 8, 2026 (America/New_York)

## Scope and result

Reviewed the provider information used in all 46 distinct resource entries,
including six NYC entries. The directory has 16 national categories; civil legal
aid appears in both Legal Help and Divorce & Separation. Domestic Violence is
first, above the national directory. NYC is a separate section reached directly
from the top of the page.

Every entry includes a dated source disclosure. `pigeon/resources.json` is the
maintained source of truth, including sources and next-review dates. The static
HTML is generated ahead of deployment and remains usable without JavaScript.

The final network check covered 56 distinct resource, evidence and supplementary
URLs; all returned HTTP 200 with relevant page titles. Results are recorded in
`pigeon/link-review-2026-10-08.json`. HTTP success is only an availability check.
The provider text was separately read to assess the descriptions, contact details,
hours, costs and eligibility language actually included on the page.

No test calls or texts were placed, no applications submitted, and no live bed,
appointment, funding or program availability was confirmed. Embedded provider
search tools and chats were not exercised. The page explains these limits.

## Material corrections

- Removed universal “free” and “always confidential” claims. The directory is
  free, but providers may charge or apply eligibility requirements.
- Replaced “call or text 211” with “call 211”; local texting options vary.
- NFCC: free and low-cost services, with fees to confirm before accepting a plan.
- HUD: foreclosure, eviction and homelessness counseling is free; other housing
  counseling can have fees. Health centers use sliding-scale charges.
- Separated Medicare from Medicaid, and SSDI from SSI, with distinct official links.
- NAMI: information and peer support, not a crisis line; current weekday hours and
  federal-holiday exception. SAMHSA: treatment referrals, not counseling or a
  promise of free treatment.
- Veterans: 988 then press 1, or text 838255; no VA enrollment required. Free VSO
  claims representation is distinguished from attorneys or agents who may charge.
- Replaced the Child Care Aware number directed at military/DoD fee assistance
  with the general family resource page.
- Corrected GriefShare and DivorceCare fee claims and disclosed their Christian
  orientation. No blanket free-services label remains on Alliance of Hope.
- ABA's general finder includes paid referrals, not solely free pro bono help.
- Removed unconfirmed Eldercare hours; retained the provider-confirmed phone.
  Elder Fraud hours, age scope and number were checked against DOJ's page.
- NeedyMeds and LawHelp could not be inspected reliably; they are omitted in favor
  of the reviewed RxAssist/HRSA and LSC/ABA routes. This does not mean either
  organization has ceased operating.
- The direct disaster-assistance application was access-blocked during review;
  the resource now links to USA.gov's official application guidance and includes
  the corroborated FEMA application phone number.
- NYC HOPE's app landing page had no readable title in the direct check. The
  directory uses HRA's readable DV guidance; Safe Horizon corroborates the
  1-800-621-4673 hotline and 24/7 hours.
- Replaced the unsourced dramatic pigeon story with a short Smithsonian link.
  Smithsonian's record identifies Cher Ami as male; the previous female pronoun
  and unqualified rescue statistic were not retained.
- Homepage and About descriptions now match the directory's scope and limits.

## Validation

19 Node tests passed, covering the career check, Quick Exit and directory safety
regressions. DOM checks confirmed all 46 resources (47 appearances), six separate
NYC cards, DV first, unique IDs, working topic anchors and telephone link markup.
The generated page matches its source data and template. External links open in
the current tab, and the no-referrer policy is retained.

Rendered desktop/mobile browser QA was unavailable. Before approving a public
release, inspect the private preview on desktop and phone, including text zoom,
source disclosures, topic navigation and the Quick Exit link/key behavior.

## Keeping it current

Edit `pigeon/resources.json` and review provider sources before changing the
review dates. The next content review is due November 7, 2026. Do not advance dates
merely because an HTTP request succeeds.

From the repository root:

```sh
python scripts/build-resources.py
python scripts/build-resources.py --check
node --test tests/*.test.js
python scripts/check-resource-links.py --report /tmp/cher-ami-link-report.json
```

The checker flags inaccessible/suspect destinations and overdue content reviews.
It never changes resource details or their review dates. No recurring monitor has
been activated; running this command is a maintenance step, not a guarantee.

## Established alternatives

- https://211.org/ — local referrals with human help by phone.
- https://www.findhelp.org/ — local social-service search by ZIP code. Its provider
  documentation at https://company.findhelp.com/products/the-findhelp-network/
  was reviewed; the public search site blocked automated retrieval here.
- https://findahelpline.com/ — crisis/emotional-support helplines by country; the
  provider describes direct verification relationships with helpline operators.
- https://access.nyc.gov/ and https://portal.311.nyc.gov/ — city-specific benefits
  information and non-emergency services.

Cher Ami is a concise starting directory. These established services have deeper
local or specialist coverage; directing visitors to them is part of its purpose.

Only the owner-private Sites review was deployed. No GitHub push or live Netlify
release was authorized or performed.
