# Swim Progress Plan

Working prototype of a supplementary swimming development platform. Parents see exactly how their
child is progressing through individual swimming skills; instructors record assessments in a few
taps; the parent's view updates from those assessments.

> **Demonstration only.** Every person in the app is fictional. Sign-in is simulated and nothing
> here is secure. Do not enter real children's information. The prototype is not production-ready
> and makes no claim of UK GDPR or safeguarding compliance.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
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

## Five-minute demo script

1. Start screen: **Continue as Parent** (Sarah Williams, parent of Oliver, 7).
2. Dashboard: 50% of assessed development targets achieved, latest achievement, next coaching
   priority, six-week journey, latest instructor update. Open **How this is calculated**.
3. **My Skills** > **Side breathing**: objective, why it matters, success criteria, current
   assessment (Developing), instructor feedback, next target, video slots, history.
4. Top bar: switch to **Instructor**. **Swimmers** > **Oliver Williams**.
5. Set **Side breathing** to **Consistent**, then **Save assessment**. The banner shows targets
   achieved moving from 50% to 56%. Press **View as parent**.
6. Parent dashboard now shows 56%, the skill page shows Consistent, the Progress Journey shows the
   change in week 3, and there is a new notification.
7. Back as instructor, set a skill to **Mastered** and save. Returning to the parent view shows the
   achievement celebration, a new achievement card and a notification.
8. **Profile** > **Reset demo data** restores the original examples before the next run.

Tip: open the parent view and the instructor view in two browser windows side by side. The parent
window updates the moment the instructor saves.

## What is implemented

**Parent experience**
- Demo entry screen with clearly labelled Parent and Instructor views
- Dashboard: child profile, circular progress chart with a plain-English explanation, current
  development focus, skill summary by area, latest achievement, next coaching priority, six-week
  journey, latest instructor update
- Skill library: front crawl in 17 skills across five areas, four assessment states, filter
- Skill detail: objective, why it matters, success criteria, current assessment, instructor
  feedback, next development target, two video slots, supervision reminder, assessment history
- Progress Journey: week-by-week timeline, any-week-to-any-week comparison, chart of skills in each
  state by week, per-skill comparison
- Achievements, notification bell with unread count, read and unread states, one-off celebration
- Profile: programme format and sessions, how the programme fits with regular lessons, privacy
  notes, demo controls
- Parents cannot edit anything and never see other swimmers or group members

**Instructor experience**
- Overview: programme completion per swimmer, next sessions, recent assessments
- Swimmers list with search; five fictional swimmers including one who has not started
- Assessment sheet: one tap or one arrow key per skill, staged changes, undo, save
- Per-skill feedback and next target; written updates for parents; next coaching priority
- Full assessment history per swimmer; sessions with each swimmer's objectives

**On save**, the app adds a history entry, recalculates progress, updates the parent dashboard,
and creates an achievement and notification when a skill newly reaches Mastered. Changes persist in
the browser (localStorage) until **Reset demo data**.

## How progress is calculated

All rules live in `src/lib/progress.ts` and are covered by `src/lib/progress.test.ts`.

- A plan lists its development targets (skills). Progress is measured against those and nothing
  else. It is never a prediction about an official lesson stage.
- A skill's current state is its most recent assessment.
- A target is **achieved** when its state is Consistent or Mastered.
- **Targets achieved %** = achieved targets / assessed targets x 100
- **Skills mastered %** = mastered targets / assessed targets x 100
- Skills not yet assessed (including newly added targets) are counted separately and left out of
  both percentages. With nothing assessed there is no percentage, and the app says so.
- A skill moved back down from Mastered (a correction) has its achievement withdrawn.

## Project structure

```
src/
  types/            Domain model: Parent, Child, Instructor, SwimmingSkill, SkillAssessment,
                    DevelopmentPlan, CoachingSession, ProgressUpdate, Achievement, Notification
  config/demo.ts    Brand, partner wording, programme phases, demo account ids
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
    selectors.ts    selectParentScope is the only way parent screens read data
  components/       ui (primitives), layout (shell, navigation, notifications),
                    skills (assessment sheet, video card, celebration), charts
  pages/            Login, parent/*, instructor/*
e2e/journey.mjs     Browser test of the full demo journey
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
};
```

The placeholder is replaced by a real player. Nothing else changes.

**Partner wording.** The app uses neutral wording ("regular swimming lessons", "your leisure
centre", "Demo Leisure Centre") and no partner name or logo. Change it in one place:
`PARTNER` in `src/config/demo.ts`.

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
- Videos are placeholders. Skill content and distances are illustrative and should be reviewed
  against your own teaching criteria before use.
- Demo dates move forward automatically so the programme always reads as "week 3 of 6".
- Front crawl only.
- Accessibility has been built in (keyboard use, focus states, labels, contrast, reduced motion)
  and partly tested automatically, but has not had a full WCAG 2.2 AA audit or screen reader
  testing.

## Recommended next phase

1. **Agree the assessment framework** with the partner: skill list, success criteria and how the
   four states map to what teachers already record.
2. **Backend and accounts:** hosted database, secure sign-in, role-based access enforced on the
   server (parent, instructor, centre manager), audit trail of assessment changes.
3. **Data protection and safeguarding:** DPIA, lawful basis and parental consent, retention policy,
   data-sharing agreement defining controller and processor responsibilities between partners.
4. **Film the first video set** for the front crawl skills and replace the placeholders.
5. **Poolside use:** offline-tolerant assessment entry on a phone or tablet, with sync.
6. **Multi-centre structure:** centres, programmes, cohorts, instructor assignment, manager reporting.
7. **Pilot** one six-week cohort and measure parent engagement and retention in regular lessons.
8. Later: booking and payment, real notifications, further strokes.
