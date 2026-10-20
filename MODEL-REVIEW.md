# Canary recovery and assessment review — October 20, 2026

## Source and scope

The restoration uses `afb2a34a8037c674c1f57acbf21fc86af3d343fe`, the version Jim originally supplied in this conversation. The current production version was `cf069c7` when work began. Git history preserves both. The original separate ChatGPT project instructions were not recovered through available conversation and Library searches; the recovered HTML and JavaScript are the original implementation, not a recovered prompt.

The original navigation, bird illustrations, warm background, typography, home-page structure, About and Support layouts, and nine-question format are restored. Text changes align the site with the revised assessment. The existing Cher Ami resource audit, quick exit, NYC and LGBTQ+ sections, and resource share image are retained. Those resources were not re-audited or assigned a new review date in this assessment repair.

The private review includes the exact original career HTML as a separate comparison page. The new assessment is not a claim that the original scoring was valid.

## What went wrong

The production three-step tool put free task text into the result but never interpreted it. Its primary answer was chosen mostly by staffing and adoption. An equipment repairer and a report writer could receive the same headline. It provided questions to ask rather than answering the site's central question about exposure to AI.

The original nine-question scorer had the stronger Exposure × Holding concept, but its numerical scores and thresholds were not empirically calibrated. It averaged equally selected tasks, and a license could force a reassuring classification. Reintroducing that arithmetic would repeat a different problem.

## Revised model

`career/assessment.js` is a transparent editorial rule system, not a trained AI predictor or a live occupational database. It does not contact an AI service. It uses structured task categories rather than pretending to understand free text.

- Visitors choose up to three main task categories and explicitly allocate 100% of the week. The default even split is visibly labeled and editable.
- Repeatability and actual tool performance are answered separately for each task. An untested possibility differs from assistance, a failed trial, or demonstrated completion.
- The core job answer uses the time-weighted task mix and essential human work. It does not turn a staffing cut into proof that AI can do the visitor's job.
- Physical work is separated from its paperwork. Claimed software completion of physical work gets an explicit clarification about machinery, robotics, and task allocation.
- People-facing work is not exempt from actual reported automation. A report that tools completed most of the real activity can change the assessment.
- Required approval is attributed to its holder. Approval does not erase exposure or guarantee current staffing. Review, relationships, judgment, and error costs are explained without immunity claims.
- Employer adoption, intentions for time saved, staffing changes, and stated reasons are separate observations. A reduction warning remains visible even for a role with lower direct software exposure.
- Unknown work and unknown context remain visible. Job-loss percentages are not generated. Time shares are labeled as time shares throughout.
- Results explain each task, what AI may do, what remains, a next step, and what could change the conclusion. Editing invalidates old results; copy and download include the actual computed assessment.

The 50% boundary is an editorial way to discuss a large part of a visitor's reported week, not an empirically estimated risk threshold. The method discloses this. The detailed task results remain visible near boundaries.

Background read on October 20: ILO Working Paper 140, *Generative AI and Jobs: A Refined Global Index of Occupational Exposure*, May 20, 2025. The paper supports distinguishing task exposure from employment outcomes. This tool does not use its scores or claim validation by it.

https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure

## Verification

- 12 substantive model tests cover task weights, actual performance, licenses, staffing causes, adoption and hiring, unknowns, people-facing automation, physical contradictions, invalid inputs, summaries, and all 260 single-task/category/routine/performance combinations.
- 9 simulated DOM tests use jsdom and native form events: initialization and validation; task limit and allocation; weighted outcome changes; exclusive choices; conditional reasons; stale-result invalidation; edits and reset; copy fallback and downloads; privacy and reload.
- The 7 existing Cher Ami resource and quick-exit regression tests continue to pass. No calls or text messages were placed, and no fresh resource review is claimed.
- All 28 tests pass. JavaScript syntax and local links/anchors are checked. No rendered desktop/mobile browser check was possible: the required browser-control capability was unavailable. DOM interaction tests do not establish visual quality.

Run model/resource tests with `node --test tests/check.test.js tests/quick-exit.test.js tests/resources.test.js`.
UI tests require jsdom 24: `CANARY_TEST_DOM=/absolute/path/to/node_modules/jsdom node --test tests/ui.test.js`.

## Release state

This candidate is prepared for private review. Public Netlify publication and the GitHub main branch have not been changed by this repair. Review the original comparison and contrasting sample outcomes before approving replacement of production.
