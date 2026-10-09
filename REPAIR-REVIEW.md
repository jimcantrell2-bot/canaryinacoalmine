# Career check: focused repair for review

Prepared October 8, 2026 against GitHub commit `afb2a34`. The homepage, career page, and About page were byte-identical to the live Netlify versions when fetched. Work is on local branch `repair/career-check`; it has not been pushed to GitHub or deployed to Netlify.

## Why the scoring changed

The original tool assigned tasks values from 10 to 90, averaged up to three choices equally, and added modifiers for review, adoption, error cost, and staffing changes. Holding combined four factors with weights of .35, .28, .20 and .17; a personally held license then forced it above the threshold of 50. Exposure used a separate threshold of 55. The repository provided no empirical calibration for these numbers or thresholds.

That allowed a license alone to produce an “Augmented” or “Anchored” result. It treated staff attrition as displacement and daily AI use as measured displacement pressure. Broad task selections were also treated as equal shares of a week. These assumptions could reassure or alarm someone more strongly than their answers justified.

The repaired check keeps nine questions, the birds, existing colors and typography, and Exposure/Holding as explanatory concepts. It removes numerical scores and the four safety-like labels. It describes selected tasks individually, reports human involvement without ranking it, and treats deployment and staffing as separate observations. This is an intentional product change: a practical checklist rather than a job-loss prediction.

## Question review

| Question | Finding | Repair |
| --- | --- | --- |
| Task mix | Broad tasks cannot establish percentages of a week or precise automation exposure. | Describe each selected task; no average or numerical estimate. |
| Review | Being the final reviewer does not reduce the capability of a tool to draft the same material. | Context only; no exposure adjustment. |
| AI use | Visitors may not know their entire field; adoption does not establish displacement. | Ask about their employer and support “Not sure.” |
| Error cost | Serious mistakes may require review but do not establish staffing needs. | Describe checking needs; no safety points. |
| License | Required sign-off may survive while preparation and staffing change. | Preserve this distinction; remove automatic protection threshold. |
| Presence | A workplace attendance rule differs from work that needs physical action. | Ask whether the work itself requires presence; distinguish generative AI from equipment automation. |
| Accountability | Responsibility can be reassigned; naming someone does not secure every task. | Explain authority and responsibility without treating them as immunity. |
| Judgment | Incomplete information does not demonstrate that AI will underperform in every application. | Ask for concrete examples; avoid categorical superiority claims. |
| Staffing | Attrition, budgets and demand can change headcount without AI. | Add cuts for other/unclear reasons and unknown; distinguish cited causes from proof. |

## Behavior and accessibility

- Native checkbox/radio controls grouped with fieldsets and legends; visible keyboard focus and selected states.
- Completion count and explicit unanswered-question feedback; focus moves to the first gap.
- Up to three tasks, with instructions for changing the selection.
- “Not sure” for questions 2–9; unknown values stay unknown.
- Results are hidden after any edit, then recomputed on submission.
- Results receive focus; an edit button returns to the questions.
- Reduced motion respected; mobile email form wraps instead of overflowing.
- No answers/results are stored or transmitted. The existing optional Mailchimp subscription is separate.

## Copy and evidence

Homepage, About and Support wording now matches a checklist rather than claiming a calibrated deployment score. The ILO–NASK May 2025 study is linked as background on task exposure and job transformation, with an explicit statement that its scores are not used and it does not validate this checklist’s groupings:

https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure

Task guidance is qualitative editorial judgment. No claim is made that it is a continuously refreshed labor-market dataset. Cher Ami’s resources and review date have not been reverified in this repair.

## Validation

- JavaScript syntax checks passed.
- Eight model regression tests passed, including licenses, attrition, adoption, mixed tasks, unknowns, non-AI cuts, invalid answers and every offered choice.
- Form checks in jsdom passed: question/option contracts, incomplete submission and focus, task limit/release, complete result, unknowns, stale result clearing, changed result and edit focus.
- Visual browser QA was unavailable in this session. Mobile wrapping was implemented but has not been confirmed on a rendered phone viewport. A private preview is for reviewing wording, interaction and layout before any production deployment.

Run model tests with `node --test tests/check.test.js`. Static site files have no build dependency.

## Follow-up: make the result useful

The first repair overcorrected into an answer recap. The revised result synthesizes task mix, adoption, human involvement and staffing into a short assessment with two reasons and one priority action. The answer details are expandable.

Priority order is explicit: reported cuts, attrition, substantial unknowns, then the interaction of digital tasks, adoption and specific human requirements. This is editorial decision logic, not an estimated probability of job loss. The methodology explains the rules. Script URLs are now absolute so loading does not depend on a trailing slash.

Twelve model tests passed, including scenario changes that must produce different conclusions and observed cuts overriding apparent protection. Simulated form checks also passed. A visual browser check remains outstanding.

## DV Quick Exit repair — October 9, 2026

Quick Exit remains fixed on screen and responds to a single Escape keypress.
It now has a native link fallback when JavaScript is disabled, a visible keyboard
focus indicator, a 44px minimum target and bottom spacing. With JavaScript it
replaces the current history entry; it cannot erase prior visits, other tabs,
browser history or monitoring. The page no longer promises otherwise or suggests
private browsing prevents monitoring. A no-referrer policy avoids sending this
page's address to linked destinations.

DV resource links open in the same tab. Hotline telephone numbers are tappable;
no calls or texts were placed. Provider details and guidance were checked against:

- https://www.thehotline.org/
- https://www.thehotline.org/plan-for-safety/
- https://www.thehotline.org/plan-for-safety/internet-safety/
- https://www.loveisrespect.org/

This dated check applies to the DV card, not the rest of the directory. The wider
resource audit is still incomplete. Three Quick Exit regression tests passed,
as did all twelve existing career tests. Tests simulate navigation and validate
the native fallback markup; rendered browser and mobile checks remain outstanding.
No GitHub push or Netlify production deployment was performed.


## Completed directory review — October 8, 2026, New York time

The wider Cher Ami review described above as incomplete is now complete for the
46 entries retained in this version. See CHER-AMI-REVIEW.md for scope, corrections,
verification limits and maintenance instructions. The earlier October 9 heading
used UTC; the user-facing review date is October 8 in New York.
