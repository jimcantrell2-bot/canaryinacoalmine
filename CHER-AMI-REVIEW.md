# Cher Ami review — October 20, 2026 (America/New_York)

## Result and scope

Reviewed all 53 unique resource entries (54 appearances, because civil legal aid is used twice), including the seven national/NYC LGBTQ+ resources and ten NYC resources in total. Domestic Violence remains first; LGBTQ+ support is near the top; NYC has a separate section.

All 63 current provider, evidence, fallback and supplementary URLs returned HTTP 200. The revised checker also inspects readable page content: 61 current destinations have readable content; two are declared JavaScript-only search shells with reviewed alternative routes. Interactive searches were not tested. The report is `pigeon/link-review-2026-10-20.json`.

Published provider information was read against the descriptions, contact details, hours, fees, eligibility qualifications and service limits actually listed. The per-resource record is `pigeon/content-review-2026-10-20.json`. Where source HTML was collected locally, the record retains its retrieval timestamp and content hash rather than reproducing provider pages.

Resource review dates and the footer now show October 20, 2026. The next content review is due November 19, 2026. Dates were advanced after reviewing provider information, not merely after successful HTTP requests.

## Changes

- **HUD counseling:** the former `/counseling` destination returned HTTP 200 but contained no useful main information. The link now goes to HUD's substantive About Housing Counseling page. The existing phone and fee qualifications are supported there. An HTTP 200 alone no longer counts as a pass for an empty page.
- **Two search fallbacks:** HRSA's health-center finder and FindTreatment.gov deliver JavaScript app shells. Both retain their search links, with an explicit JavaScript note and a link to readable official guidance or treatment-referral options. Their interactive searches remain untested.
- **Live advocates versus AI:** the domestic-violence provider now promotes Ruth, an AI chatbot, alongside live support. Cher Ami distinguishes those options so visitors looking for a person can choose a live advocate. No chatbot is embedded in Cher Ami.
- **NAMI scope:** clarified that the HelpLine provides information, peer support and resource navigation, rather than crisis counseling. Its weekday hours and holiday exception were confirmed.
- **Text contacts:** the six existing text destinations are now tappable SMS links, with existing keywords retained in the visible labels. Links open the device's messaging app; no message is sent by Cher Ami. Call and text link targets have more generous touch areas.
- **HUD shelter wording:** matches the actual finder categories: shelters, food pantries, health clinics and clothing resources.
- **Evidence:** added GriefShare's FAQ as a specific source for its Christian basis; retained fee qualifications. Reconfirmed Trans Lifeline, LGBT National Hotline, NYC AVP and Legal Services NYC hours without inventing a current holiday schedule or 24/7 coverage.
- **Maintenance:** review documentation now covers all 53 entries. The checker separates meaningful pages, unexpected thin/error pages, and declared interactive searches. The static-page generator now handles `--help` and invalid arguments without silently writing the page.

## Safety and interaction checks

The static directory remains usable without JavaScript. Quick Exit retains a native link plus a single-Escape shortcut; the shortcut replaces the current history entry. The warning accurately explains that it cannot clear prior history, other tabs, call/text records or device monitoring. Links open in the current tab, and the no-referrer policy remains present.

The existing crisis contact details, human/peer/information-service distinctions, national versus NYC scope, Christian-group disclosures, separate Medicare/Medicaid and SSDI/SSI routes, and service fee/eligibility qualifications were reviewed.

No test calls or texts were placed. No provider chat, interactive search, application, booking, funding, open-bed or appointment availability was exercised or confirmed. No blanket assurance of confidentiality, free provider services, or availability is made.

## Validation and limits

- 30 Node tests pass: career model and simulated form checks, resource coverage, Quick Exit, SMS destinations and keywords, fallback routes, and prior safety regressions.
- 3 Python checker tests pass: an empty page with a title/footer does not pass, known JavaScript shells are disclosed rather than treated as verified searches, and substantive content is distinguished from access-denied pages.
- Generated HTML matches the resource data and template. DOM checks cover all 54 resource placements, every phone/SMS destination, IDs, topic links and fallback links.
- The 63-URL network check has no unexpected failures; its two interactive-search limits remain explicit.
- Rendered desktop/mobile browser QA was unavailable. DOM tests do not establish visual layout or prove external service operation.

## Rechecking

```sh
python scripts/build-resources.py --check
node --test tests/check.test.js tests/resources.test.js tests/quick-exit.test.js
CANARY_TEST_DOM=/absolute/path/to/node_modules/jsdom node --test tests/ui.test.js
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests -p 'test_resource_link_checker.py'
python scripts/check-resource-links.py --report /tmp/cher-ami-link-report.json
```

The checker does not change source review dates or verify service details. No recurring monitor or schedule has been activated. The prior October 8 URL report remains available in Git history and at `pigeon/link-review-2026-10-08.json`.

## Publication

This review updates the owner-private candidate and the existing draft GitHub PR. It does not publish the proposed changes to the public Netlify site.
