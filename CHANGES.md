# Change log

## Round 4: five assessment labels

The four-level model (Not Yet Achieved, Developing, Consistent, Mastered) is replaced by the
programme's five labels: Not Assessed, Needs Practice, Fair, Good, Pass.

| Area | Change | Files |
| --- | --- | --- |
| Model | Four assessed levels plus Not Assessed, which is the absence of a record and is never counted as an attempt. | `src/types/index.ts`, `src/lib/status.ts` |
| Calculation | One figure: "Skills marked Pass: X of Y assessed skills". The old "targets achieved" figure (which counted the top two levels) is removed. Good is never counted as Pass. No score or average is derived from the labels. | `src/lib/progress.ts` |
| Achievements | Triggered by Pass. Every achievement states it is a Pass for one skill and not a stage award. | `src/lib/assessmentService.ts`, `src/data/skills.ts` |
| Provisional wording | Level descriptions are flagged as awaiting teacher confirmation wherever they are shown. | `src/lib/status.ts`, `src/components/ui/Status.tsx` |
| Parent screens | Dashboard ring, level breakdown, Not Assessed count, skill page five-step scale, journey figures and chart (Not Assessed drawn as a separate outlined segment), filters, achievements. | `src/pages/parent/*`, `src/components/charts/*`, `src/components/skills/HowCalculated.tsx` |
| Instructor screens | Assessment controls, save summary, filters, overview, swimmer plan, swimmer list. | `src/pages/instructor/*`, `src/components/skills/AssessmentPanel.tsx` |
| Demo data | Same fictional history, relabelled one for one. Data saved in a browser by the old version is discarded and reseeded (`SCHEMA_VERSION` 2). | `src/data/seed.ts` |
| Tests | Unit tests 17 to 23; browser test 33 to 35 checks. | `src/lib/progress.test.ts`, `e2e/journey.mjs` |
| Documents | README, skills review and teacher sign-off checklist updated. | `README.md`, `SWIMMING_SKILLS_REVIEW.md`, `docs/TEACHER_SIGNOFF_CHECKLIST.md` |

**Effect on the demo figures.** Nothing in the fictional history changed, but the headline did:
the old figure counted Consistent and Mastered (8 of 16, 50%); the new one counts Pass only
(3 of 16, 19%).

## Round 3: honesty and first-minute clarity

Small changes only. No new product features beyond an optional guide.

| Area | Change | Files |
| --- | --- | --- |
| Demo notice | The notice was cut to one word on phones. It now reads in full at every width and says "no real children's data" and "not a live service". | `src/components/layout/AppShell.tsx` |
| Start screen | Plain statement of the offer, the four-step route through the demo, and a clear "demonstration only" box. | `src/pages/Login.tsx` |
| Demo guide | Optional button in the top bar that jumps to any of the four steps. | `src/components/layout/DemoGuide.tsx` |
| Parent dashboard | Each "needs more work" item now shows the next target, so the page answers what comes next. | `src/pages/parent/Home.tsx` |
| Percentages | Stated as measured against the targets chosen for the programme, not overall swimming ability. | `src/pages/parent/Home.tsx`, `src/components/skills/HowCalculated.tsx` |
| Neutral wording | Venue is "Example pool (demo venue)"; provider is "their usual lesson provider"; programme and session details are labelled as examples with nothing agreed. | `src/config/demo.ts`, `src/pages/parent/Profile.tsx`, `src/pages/instructor/Sessions.tsx` |
| Instructor | Each class shows how many swimmers have been updated today. | `src/pages/instructor/Assessments.tsx` |
| Accessibility | Automated scan (axe, 13 screens at two widths) found invalid description lists, content outside landmarks and a skipped heading level. All fixed; the scan is now clean. | `src/pages/parent/Home.tsx`, `src/components/ui/Status.tsx`, `src/pages/instructor/Overview.tsx`, `src/pages/instructor/SwimmerPlan.tsx`, `src/components/ui/Toast.tsx`, `src/components/layout/AppShell.tsx` |
| Tests | Browser test extended from 31 to 33 checks. | `e2e/journey.mjs` |
| Documents | Teacher sign-off checklist; README rewritten to describe a concept, not a partnership. | `docs/TEACHER_SIGNOFF_CHECKLIST.md`, `README.md` |

## Round 2: review fixes

No rebuild. The architecture, data model and screens from the first version are kept.

## Fixed

| Problem | Fix | Files |
| --- | --- | --- |
| README said Node 20 worked. The router needed Node 22.22 and the test runner Node 22.12, so installs on older Node failed. | Router moved to v7 (same API, wider Node support). Supported range is now Node 22.12+ or 24, recorded in `.nvmrc`, `engines` and the README. | `package.json`, `package-lock.json`, `.nvmrc`, `README.md` |
| `npm audit` reported 3 high-severity advisories, all from the single-file build plugin (build-time only). | Plugin removed and replaced with a 30-line script. `npm audit` now reports 0. | `vite.config.ts`, `scripts/inline-single.mjs`, `package.json` |
| Unsaved assessment changes were lost silently when the instructor changed tab, swimmer or page. | Drafts are held per swimmer for the visit and restored on return. Swimmers with unsaved work are marked. | `src/store/AssessmentDrafts.tsx`, `src/components/skills/AssessmentPanel.tsx`, `src/App.tsx` |
| Three text colour pairings were below 4.5:1 contrast, and input and empty-gauge outlines were below 3:1. | Tokens darkened; new `control` colour for boundaries. Every pairing was recomputed. | `src/index.css`, `src/components/ui/Status.tsx` |
| Tabs and the swimmer picker declared tab and radio roles without arrow-key support. | Tabs take arrow keys; the picker is now a plain button group. | `src/pages/instructor/SwimmerPlan.tsx`, `src/pages/instructor/Assessments.tsx`, `src/components/skills/VideoSection.tsx` |
| One 920 kB script loaded up front. | Instructor screens and the chart page load on demand. Initial script is about 420 kB (128 kB gzipped). | `src/App.tsx`, `src/components/layout/AppShell.tsx`, `src/components/ui/primitives.tsx` |
| Assessment rows were cramped at 1024px. | Rows stack below 1280px. | `src/components/skills/AssessmentPanel.tsx`, `src/pages/instructor/SwimmerPlan.tsx` |
| The video placeholder had a play button that opened a description. | No play button on placeholders. Real footage gets native controls. | `src/components/skills/VideoSection.tsx` (replaces `VideoCard.tsx`) |
| Switching from instructor to parent could open the dashboard part-way down the page. | Scroll resets on every view change. | `src/components/layout/AppShell.tsx` |

## Improved

| Area | Change | Files |
| --- | --- | --- |
| Parent dashboard | Visible one-line explanation of the progress figure. New section: what improved at the last session, and what needs more work with the instructor's reason. | `src/pages/parent/Home.tsx` |
| Parent skill page | Third video slot, "What parents should notice", with poolside cues for all 17 skills. | `src/data/skills.ts`, `src/types/index.ts`, `src/pages/parent/SkillDetail.tsx` |
| Parent empty states | Not-started swimmer reads correctly on every parent screen. | `src/pages/parent/Home.tsx` |
| Instructor speed | Assessments page grouped by class. Session note and next priority on the same sheet. One save. "Next swimmer" after saving. "Working on" filter. "Updated today" marker. | `src/pages/instructor/Assessments.tsx`, `src/components/skills/AssessmentPanel.tsx`, `src/store/AppStore.tsx` |
| Parent and instructor views | Instructor view has a deep sidebar and a view label; parent view stays light. | `src/components/layout/AppShell.tsx`, both layout files |
| Assessment states | Definitions rewritten to separate practising, consistency and mastery. | `src/lib/status.ts` |
| Tests | Browser test extended from 27 to 31 checks. | `e2e/journey.mjs` |
| Documentation | Skills review document, this file, README corrections. | `SWIMMING_SKILLS_REVIEW.md`, `CHANGES.md`, `README.md`, `scripts/skills-review.mjs` |

## Deliberately not built

Real accounts, a database, payments, booking, real notifications, a video library, AI coaching or
pass predictions, multi-centre administration, and the centre-manager insight view. The manager view
needs outcome figures that do not exist yet; inventing them for a demo would be misleading.
