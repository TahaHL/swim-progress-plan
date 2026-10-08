# Teacher sign-off checklist

**Status: nothing on this list is approved.** The assessment content in the demo is draft text
written to make the prototype work. It becomes a teaching standard only when the owner, as the
qualified teacher, signs each line. The full criteria for all 17 skills, with a note against each,
are in [`SWIMMING_SKILLS_REVIEW.md`](../SWIMMING_SKILLS_REVIEW.md).

How to use: decide each row, write the decision, initial it. Send the decisions back and the app
text is changed to match (one file: `src/data/skills.ts`, plus `src/lib/status.ts` for the states).

## A. Rules that apply to every skill

| # | Decision needed | Current demo behaviour | Decision | Initials |
| --- | --- | --- | --- | --- |
| A1 | What exactly separates **Developing** from **Consistent**? | "Most attempts, without support." No number. | | |
| A2 | What exactly separates **Consistent** from **Mastered**? | "Every time, without reminders, over distance and when tired." Not tied to more than one session. | | |
| A3 | May a float or other aid be used at Consistent? | Not allowed at Consistent, allowed at Developing. | | |
| A4 | Should Mastered need evidence from two sessions? | No. One assessment is enough. | | |
| A5 | Does a target count as achieved at Consistent, or only at Mastered? | Consistent or Mastered. This drives the percentage. | | |
| A6 | Is "Mastered" the right word for parents of 6 to 8 year olds? | Used throughout, and triggers the achievement message. | | |
| A7 | One set of criteria for all children, or different criteria by age or lesson stage? | One set. | | |
| A8 | Are 17 targets realistic for one six-week block, or should a plan pick a subset per child? | All 17 are in every plan; the instructor picks focus skills. | | |

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
| F2 | Achievement sentence for each skill | `masteredSummary` in `src/data/skills.ts` | |
| F3 | Three video cue lists per skill (these become shot lists) | `src/data/skills.ts` | |
| F4 | Supervision reminder under the videos | `src/pages/parent/SkillDetail.tsx` | |
| F5 | "Not an official stage assessment" statement | `src/components/skills/HowCalculated.tsx` | |
| F6 | Example instructor feedback for the fictional swimmer | `src/data/seed.ts` | |

## Sign-off

| | Name | Date |
| --- | --- | --- |
| Reviewed and decided by | | |
| App text updated to match | | |
