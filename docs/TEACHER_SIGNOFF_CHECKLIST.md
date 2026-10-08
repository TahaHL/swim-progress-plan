# Teacher sign-off checklist

**Status: nothing on this list is approved.** The assessment content in the demo is draft text
written to make the prototype work. It becomes a teaching standard only when the owner, as the
qualified teacher, signs each line. The full criteria for all 17 skills, with a note against each,
are in [`SWIMMING_SKILLS_REVIEW.md`](../SWIMMING_SKILLS_REVIEW.md).

How to use: decide each row, write the decision, initial it. Send the decisions back and the app
text is changed to match (one file: `src/data/skills.ts`, plus `src/lib/status.ts` for the labels).

## A. The five labels

The labels and their order are confirmed: **Not Assessed, Needs Practice, Fair, Good, Pass.**
Everything below about what they mean is undecided. The descriptions shown in the app are
provisional and are marked as such on screen.

| # | Decision needed | Current demo behaviour | Decision | Initials |
| --- | --- | --- | --- | --- |
| A1 | What specifically distinguishes **Fair**, **Good** and **Pass** in observable technique, consistency and independence? | Provisional one-line descriptions only. Nothing measurable. | | |
| A2 | What does **Pass** require that **Good** does not? | Undefined. "Satisfied the agreed assessment requirements" against "some room for improvement". | | |
| A3 | Does **Good** count as achieved for any programme target, or is **Pass** the only achieved state? | Pass only. Good is never counted as Pass. | | |
| A4 | Is a skill marked **Pass** after one successful assessment, or only after repeated demonstration? | One assessment is enough. The app does not enforce a rule. | | |
| A5 | Do the rules change with the swimmer's age, stage or the specific skill? | One set of rules for everyone. | | |
| A6 | How should parents see a move between levels without reading it as guaranteed stage advancement? | The move is shown; every figure and achievement states that a Pass in a skill is not a stage award. | | |
| A7 | May a float or other aid be used at Good, or at Pass? | Not stated. | | |
| A8 | How do the success criteria map to the labels: how many must be met, and how reliably, for Fair, Good and Pass? | Not stated. The criteria describe the skill done well. | | |
| A9 | Is "Needs Practice" the first assessment a new skill normally receives, or is it reserved for a skill that was tried and not managed? | Used in the demo as the usual starting level. | | |
| A10 | Are 17 targets realistic for one six-week block, or should a plan pick a subset per child? | All 17 are in every plan; the instructor picks focus skills. | | |
| A11 | Are the provisional descriptions acceptable as parent-facing wording? | Shown with a "provisional" notice. | | |
| A12 | When should an instructor set an assessed skill back to **Not Assessed**, and should the parent be told? | Allowed at any time. History is kept, the skill stops counting as assessed, and the parent gets a notification. | | |

## B. Arbitrary distances

Every distance below is a placeholder. Set the figure, or remove it.

| Skill | Criterion | Placeholder | Your figure |
| --- | --- | --- | --- |
| Horizontal alignment | Position holds without the legs sinking | 5 m | |
| Streamlined posture | Glide from the wall before kicking | 3 m | |
| Consistent kicking rhythm | Rhythm maintained | 10 m | |
| Arm-and-leg coordination | Coordination holds | 10 m | |
| Breathing rhythm | Pattern holds | 10 m | |
| Maintaining technique over distance | Whole stroke held together | none stated | |

## C. Cues that may be above the level of these swimmers

| # | Skill | Cue in the demo | Keep, soften or remove? |
| --- | --- | --- | --- |
| C1 | Controlled arm recovery | Elbow exits the water before the hand (high-elbow recovery) | |
| C2 | Controlled arm recovery | Straight arm swinging wide is listed as a mistake | |
| C3 | Effective hand entry | Fingertips enter before wrist and elbow | |
| C4 | Alternating arm action | No long pause at the front (conflicts with catch-up timing) | |
| C5 | Relaxed ankles | Feet turn slightly inward, big toes almost brushing | |
| C6 | Side breathing | One goggle stays in the water | |
| C7 | Side breathing | Rolling onto the back to breathe is listed as a mistake | |
| C8 | Body alignment while breathing | Body rotates as one unit | |
| C9 | Streamlined posture | One hand on top of the other, arms squeezed against the ears | |

## D. Criteria that cannot be observed as written

| # | Skill | Criterion | Reword to something you can see? |
| --- | --- | --- | --- |
| D1 | Alternating flutter kick | "Kicks stay small" | |
| D2 | Exhaling underwater | "Most of the air is out before turning to breathe" | |
| D3 | Head position | "Waterline sits around the crown of the head" (crown, hairline or forehead?) | |
| D4 | Returning the face to the water | "Face returns before the recovering arm enters" | |
| D5 | Kick generated from the hips | "Knees bend slightly and stay under the surface" | |
| D6 | Breathing rhythm | "Every two or three arm pulls": one side, both sides, or either? | |

## E. Overlap between skills

The same behaviour is scored in more than one place, so one improvement can move several targets
and one difficulty can hold several back.

| # | Behaviour | Scored under | Keep, remove duplicates, or merge? |
| --- | --- | --- | --- |
| E1 | Kick continues during the breath | Consistent kicking rhythm, Side breathing, Arm-and-leg coordination | |
| E2 | Body stays flat while breathing | Side breathing, Body alignment while breathing, Horizontal alignment | |
| E3 | Exhaling between breaths | Exhaling underwater, Side breathing, Returning the face to the water | |
| E4 | Smooth return after the breath | Side breathing, Returning the face to the water | |
| E5 | Whole stroke over distance | Maintaining technique over distance restates most other skills | |

## F. Wording parents will read

| # | Item | Where | Approved? |
| --- | --- | --- | --- |
| F1 | "Why this skill matters" paragraph for each skill | `src/data/skills.ts` | |
| F2 | Achievement sentence for each skill, shown when it is marked Pass | `passSummary` in `src/data/skills.ts` | |
| F3 | Three video cue lists per skill (these become shot lists) | `src/data/skills.ts` | |
| F4 | Supervision reminder under the videos | `src/pages/parent/SkillDetail.tsx` | |
| F5 | "Not an official stage assessment" statement | `src/components/skills/HowCalculated.tsx` | |
| F6 | Example instructor feedback for the fictional swimmer | `src/data/seed.ts` | |

## Sign-off

| | Name | Date |
| --- | --- | --- |
| Reviewed and decided by | | |
| App text updated to match | | |
