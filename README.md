# Swim Progress Plan

A demonstration of an idea: supplementary swimming coaching in which every child works on
individual improvement targets and parents can see what improved, what needs more work, and what
comes next. Instructors record assessments in a few taps and the parent's view updates from them.

**Live demo:** https://tahahl.github.io/swim-progress-plan/

> **This is a concept demonstration, not a service.** Every person in the app is fictional. Sign-in
> is simulated and nothing here is secure. Do not enter real children's information. Nothing can be
> booked or paid for, and no venue, timetable, price or partner has been agreed. The assessment
> content is draft and has not been signed off as a teaching standard. The prototype is not
> production-ready and makes no claim of UK GDPR or safeguarding compliance.

## Run it

Requires **Node.js 22.12 or newer** (22 LTS or 24 LTS). The version is recorded in `.nvmrc` and in
`engines` in `package.json`; with nvm, run `nvm use` first. Older Node versions fail at install or
at `npm test`, because the build and test tools no longer support them.

```bash
npm ci               # clean, reproducible install from package-lock.json
npm run dev          # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check, then production build to `dist/` (static files, host anywhere) |
| `npm run build:single` | One self-contained `dist-single/index.html` that opens by double-click, no server |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm test` | Unit tests for the progress and assessment rules (Vitest) |
| `npm run test:e2e` | Builds, then runs the full demo journey in a real browser (Playwright) |

The end-to-end test needs a browser once per machine: `npx playwright install chromium`.

## Publish on GitHub Pages

The repository includes `.github/workflows/deploy.yml`. On every push to `main` it type-checks, runs
the unit tests, builds, and publishes `dist/` to GitHub Pages.

One-time setup: in the repository, open **Settings > Pages** and set **Source** to **GitHub
Actions**. The site then appears at `https://<your-username>.github.io/<repository-name>/`.

The published page is public to anyone with the link, whatever the repository's visibility. On a
free GitHub plan, Pages also requires the repository itself to be public.

## Five-minute demo script

The start screen lists the same route in four steps, and **Demo guide** in the top bar jumps to
any of them.

1. Start screen: **Continue as Parent** (Sarah Williams, parent of Oliver, 7).
2. Dashboard: skills marked Pass (3 of 16 assessed), what improved, what needs more work, latest
   achievement, next coaching priority, six-week journey. Open **How this is calculated**.
3. **My Skills** > **Side breathing**: objective, why it matters, success criteria, current
   assessment (Fair), instructor feedback, next target, three video slots, history.
4. Top bar: switch to **Instructor**. **Assessments** opens on Oliver, grouped with his class.
5. Set **Side breathing** to **Good**, add a session note if you like, then **Save assessment**.
   Press **View as parent**.
6. The skill page shows Good, the dashboard lists it under "improved", the Progress Journey shows the
   change in week 3, and there is a new notification. The Pass count does not change, because
   Good is not counted as Pass.
7. Back as instructor, set a skill to **Pass** and save. Returning to the parent view shows the
   achievement, the Pass count going up by one, and a notification.
8. **Profile** > **Reset demo data** restores the original examples before the next run.

Tip: open the parent view and the instructor view in two browser windows side by side. The parent
window updates the moment the instructor saves.

## What is implemented

**Parent experience**
- Demo entry screen with clearly labelled Parent and Instructor views
- Dashboard: child profile, circular progress chart with a visible plain-English explanation,
  what improved at the last session, what needs more work and why, skill summary by area, latest
  achievement, next coaching priority, six-week journey, latest instructor update
- Skill library: front crawl in 17 skills across five areas, five assessment labels, filter
- Skill detail: objective, why it matters, success criteria, current assessment, instructor
  feedback, next development target, three video slots (correct technique, common mistakes, what
  parents should notice), supervision reminder, assessment history
- Progress Journey: week-by-week timeline, any-week-to-any-week comparison, chart of skills in each
  state by week, per-skill comparison
- Achievements, notification bell with unread count, read and unread states, one-off celebration
- Profile: programme format and sessions, how the programme fits with regular lessons, privacy
  notes, demo controls
- Parents cannot edit anything and never see other swimmers or group members

**Instructor experience**
- Overview: programme completion per swimmer, next sessions, recent assessments
- Swimmers list with search; five fictional swimmers including one who has not started
- Assessments page grouped by class, so a session can be worked through in order with a
  "Next swimmer" button after each save
- Assessment sheet: one tap or one arrow key per skill, an optional session note and the next
  coaching priority on the same sheet, one save for everything
- Unsaved work is kept while moving between swimmers, tabs and pages
- Per-skill coaching notes and next targets; written updates with objectives
- Full assessment history per swimmer; sessions with each swimmer's objectives

**On save**, the app adds a history entry, recalculates progress, updates the parent dashboard,
and creates an achievement and notification when a skill newly reaches Pass. Changes persist in
the browser (localStorage) until **Reset demo data**.

## The five assessment labels

In this order, as confirmed by the programme owner:

| Label | Provisional description (awaiting teacher confirmation) |
| --- | --- |
| Not Assessed | This skill has not yet been evaluated. |
| Needs Practice | The swimmer needs further development of this skill. |
| Fair | The swimmer can demonstrate parts of the skill but is not yet fully proficient. |
| Good | The swimmer demonstrates the skill well, with some room for improvement. |
| Pass | The swimmer has satisfied the agreed assessment requirements for this skill. |

The labels and their order are fixed. **The descriptions are provisional**, and the exact
difference between Good and Pass has not been defined. The app says so wherever the descriptions
appear (`DEFINITIONS_CONFIRMED` in `src/lib/status.ts`).

Not Assessed is not a level a swimmer is given. It means the skill has no current assessment, so
it is stored as "no value" and is never counted as an attempt. The instructor's sheet shows all
five labels: a skill with no record shows Not Assessed selected, and choosing Not Assessed for an
assessed skill sets it back. The earlier assessments stay in the history, the skill leaves the
assessed count, and an achievement for a Pass on that skill is withdrawn.

## How progress is calculated

All rules live in `src/lib/progress.ts` and are covered by `src/lib/progress.test.ts`.

- The one figure reported is a count: **Skills marked Pass: X of Y assessed skills**, with X / Y
  also shown as a percentage.
- Y is the number of skills with at least one assessment. Not Assessed skills are left out of Y
  and their count is shown separately. With nothing assessed there is no percentage.
- **Only Pass is counted. Good is not counted as Pass.** Whether Good should count towards a
  target being achieved is an open decision for the owner.
- The levels are ordered labels, not numbers. No score, average or weighting is calculated from
  them. "Moved up" means only that the new label comes later in the order.
- A skill's current level is its most recent assessment.
- A Pass is for one skill within this programme. Passing skills here does not mean a swimming
  stage has been passed, and the app says so next to every figure and in every achievement.
- A skill moved back down from Pass, or set back to Not Assessed, has its achievement withdrawn.
- Saving Pass for a skill that is already Pass changes nothing, so achievements cannot duplicate.

## Project structure

```
src/
  types/            Domain model: Parent, Child, Instructor, SwimmingSkill, SkillAssessment,
                    DevelopmentPlan, CoachingSession, ProgressUpdate, Achievement, Notification
  config/demo.ts    Brand, venue wording, programme phases, demo account ids
  data/
    skills.ts       Skill library content and video slots
    seed.ts         Fictional demo data, dated relative to today
    repository.ts   Mock data layer (localStorage) behind a DataRepository interface
  lib/
    progress.ts           Read-side calculations (pure functions)
    assessmentService.ts  Write-side rules (pure functions)
    status.ts, dates.ts, format.ts
  store/
    AppStore.tsx    React context: loads data, exposes actions, persists changes
    AssessmentDrafts.tsx  Unsaved assessment work, kept per swimmer for the visit
    selectors.ts    selectParentScope is the only way parent screens read data
  components/       ui (primitives), layout (shell, navigation, notifications),
                    skills (assessment sheet, video card, celebration), charts
  pages/            Login, parent/*, instructor/*
e2e/journey.mjs     Browser test of the full demo journey
scripts/            inline-single.mjs (single-file build), skills-review.mjs (criteria listing)
SWIMMING_SKILLS_REVIEW.md   Every skill and criterion, with the points needing teacher sign-off
docs/TEACHER_SIGNOFF_CHECKLIST.md   One-page decision list for the assessment rules
```

**Connecting a real backend later.** Screens never touch storage. They call actions on the store,
which calls `DataRepository` (`load`, `save`, `reset`, `subscribe`). Replace
`createLocalRepository()` with an API-backed implementation and move the rules in
`assessmentService.ts` server-side; the screens do not change. `selectParentScope` marks the
boundary a server must enforce: a parent's own children only, sessions without attendee lists.

## Common changes

**Add real videos.** Put files in `public/videos/` and add entries to `VIDEO_SOURCES` in
`src/data/skills.ts`:

```ts
export const VIDEO_SOURCES = {
  'br-side:correct':  { src: 'videos/side-breathing-correct.mp4',  poster: 'videos/side-breathing-correct.jpg' },
  'br-side:mistakes': { src: 'videos/side-breathing-mistakes.mp4' },
  'br-side:notice':   { src: 'videos/side-breathing-poolside.mp4' },
};
```

The placeholder is replaced by a real player. Nothing else changes.

**Venue and provider wording.** The app uses neutral wording ("regular swimming lessons", "their
usual lesson provider", "Example pool (demo venue)") and no organisation's name or logo. It is set
in one place: `PARTNER` in `src/config/demo.ts`.

**Add a stroke or change the skills.** Edit `src/data/skills.ts`; plans reference skills by id.

**Change the fictional swimmers.** Edit `src/data/seed.ts`. Each swimmer's history is one compact
string per week.

## Known limitations

- No real authentication, database, payments, booking, email, SMS or push notifications.
- Data lives in one browser. A second device has its own copy.
- The parent demo is linked to one child (Oliver). The data model supports several children per
  parent, but there is no child switcher yet.
- Assessments are always recorded against the swimmer's current programme week; the demo does not
  advance to week 4.
- Videos are placeholders.
- **The skill content is draft.** Criteria, distances, state definitions and video cue lists have
  not been signed off. `docs/TEACHER_SIGNOFF_CHECKLIST.md` lists the decisions needed.
- The five-minute target for assessing a class of four has not been timed with a real instructor.
  The browser test completes the flow in 19 taps plus four typed notes.
- Demo dates move forward automatically so the programme always reads as "week 3 of 6".
- Front crawl only.
- Accessibility has been built in (keyboard use, focus states, labels, contrast, reduced motion)
  and partly tested automatically, but has not had a full WCAG 2.2 AA audit or screen reader
  testing.

## What should happen next

More engineering is not the next step. The software is ahead of everything else the idea needs.

1. **Permission and advice.** Confirm that the owner is free to run this, and who owns it, before
   any outreach.
2. **Venue feasibility.** A real pool, a real hire cost, and the venue's requirements.
3. **Teaching sign-off.** Complete `docs/TEACHER_SIGNOFF_CHECKLIST.md` and update the app text.
4. **Poolside usability trial** of the assessment workflow, timed, with fictional swimmers.
5. **Demand test**, once permitted: whether parents will pay, not whether they say they like it.
6. Only then: film the first videos, and scope a production system (accounts, database,
   server-side access control, audit trail, data protection work).
