# Swimming skills review: front crawl

**Status: draft content, not yet reviewed by a qualified swimming teacher.**

Everything below was written to make the prototype work. It is consistent with general front crawl
teaching, but it is not an authoritative standard and has not been checked against any venue's
programme, Swim England guidance or your own criteria. Nothing here should be presented to anyone as
agreed teaching content until you have signed it off.

The skill text lives in one file, `src/data/skills.ts`. To regenerate the criteria listing in
section 3 after editing that file, run `node scripts/skills-review.mjs`.

## 1. Decisions that affect every skill

- [ ] **A1. Distances.** The criteria use 3, 5 and 10 metres as placeholders. Set the distance for
  each criterion, ideally per lesson stage, and decide whether the swimmer may use a float.
- [ ] **A2. Who the criteria are for.** The demo swimmers are aged 6 to 8 at Stage 2 to 4 of their
  regular lessons. Some criteria (high-elbow recovery, fingertip-first entry, toes turned in, one
  goggle in the water) may be above that level. Decide whether one set of criteria serves all
  stages or whether criteria should vary by stage.
- [ ] **A3. "Stage" wording.** The app shows "Stage 3 in regular lessons" as plain text supplied by
  the lesson provider. Confirm which stage names to show, since
  these belong to the child's lesson provider.
- [ ] **A4. Whether Good counts.** The app counts only Pass in "Skills marked Pass". Decide
  whether Good should also count towards a target being achieved. Until you decide, Good is never
  treated as Pass.
- [ ] **A5. Seventeen skills, equal weight.** Every skill counts the same in the Pass count.
  Confirm that is acceptable, given the overlaps in section 4.
- [ ] **A6. Demo feedback text.** The instructor notes and targets for the fictional swimmers
  (in `src/data/seed.ts`) are invented examples. Read the ones for Oliver, since they are what
  anyone trying the demo will see.

## 2. The five assessment labels

The labels and their order are confirmed. **The descriptions are provisional suggestions and are
not verified definitions.** The app marks them as provisional wherever they appear.

| Level | Label | Provisional description in the app |
| --- | --- | --- |
| 1 | Not Assessed | This skill has not yet been evaluated. |
| 2 | Needs Practice | The swimmer needs further development of this skill. |
| 3 | Fair | The swimmer can demonstrate parts of the skill but is not yet fully proficient. |
| 4 | Good | The swimmer demonstrates the skill well, with some room for improvement. |
| 5 | Pass | The swimmer has satisfied the agreed assessment requirements for this skill. |

**For your sign-off:**

- [ ] What specifically distinguishes **Fair**, **Good** and **Pass** in observable technique,
  consistency and independence? In particular, what does Pass require that Good does not?
- [ ] Does **Good** count as achieved for any programme target, or is **Pass** the only achieved
  state? (The app counts Pass only.)
- [ ] Is a skill marked **Pass** after one successful assessment, or only after repeated
  demonstration? (The app does not enforce either; an instructor can select any level.)
- [ ] Do the rules change with the swimmer's age, stage or the specific skill?
- [ ] How should parents see a move from one level to another without reading it as guaranteed
  stage advancement? (The app shows the move, and states next to every figure and achievement
  that a Pass in a skill is not a stage award.)
- [ ] May a float or other aid be used at Good or at Pass?
- [ ] Marking a skill Pass sends the parent an achievement. Confirm Pass is the right trigger.

How the success criteria listed under each skill below relate to the five labels is itself
undefined: the criteria describe the skill done well, but nothing yet says how many must be met,
or how reliably, for Fair, Good or Pass.

## 3. The seventeen skills

### Body position

#### 1. Horizontal alignment

*Parent-facing summary:* Lying flat and long at the surface.

*Objective:* Hold a flat, horizontal body position at the surface so the hips and heels stay close to the top of the water.

*Success criteria:*

1. Hips stay close to the surface throughout the swim.
2. Heels sit at or just under the surface while kicking.
3. Body stays in one long line from head to toes.
4. Position holds for at least 5 metres without the legs sinking.

**For your review:**

- [ ] Criterion 2 says heels sit "at or just under the surface". Confirm this is the cue you teach, or whether you prefer "small splash from the heels".
- [ ] Criterion 4 uses 5 metres. See decision A1 on distances.

#### 2. Head position

*Parent-facing summary:* Eyes down, head still.

*Objective:* Keep the head still and in line with the spine, with the eyes looking at the pool floor.

*Success criteria:*

1. Eyes look down at the pool floor.
2. The waterline sits around the crown of the head.
3. Head stays still between breaths.
4. Neck stays relaxed, with no lifting to look forward.

**For your review:**

- [ ] Criterion 2 places the waterline "around the crown of the head". Teaching practice varies (crown, hairline or forehead). Confirm which you want parents to read.
- [ ] Criterion 1 says eyes look straight down. Some teachers prefer "down and slightly forward". Your call.

#### 3. Streamlined posture

*Parent-facing summary:* Push and glide in a tight arrow shape.

*Objective:* Push off the wall and glide in a tight streamlined shape, with the arms extended and squeezed behind the ears.

*Success criteria:*

1. Arms fully extended, one hand on top of the other.
2. Upper arms squeezed against the ears.
3. Legs together with toes pointed.
4. Glides at least 3 metres from the wall before kicking.

**For your review:**

- [ ] Criterion 1 specifies one hand on top of the other, and criterion 2 arms squeezed against the ears. Confirm this is expected at Stage 2 to 3, or whether arms extended and together is enough.
- [ ] Criterion 4 uses a 3 metre glide. See decision A1.


### Kicking

#### 4. Alternating flutter kick

*Parent-facing summary:* Legs taking turns, close together.

*Objective:* Kick with continuous, alternating up-and-down leg movements, keeping the legs close together.

*Success criteria:*

1. Legs move alternately, never together.
2. Legs stay close, passing near each other.
3. Kick stays continuous, with no pauses.
4. Kicks stay small, with no deep or wide leg movements.

**For your review:**

- [ ] Criterion 4 ("kicks stay small, with no deep or wide leg movements") is not measurable as written. Consider replacing with something observable, for example feet staying within the width of the body.

#### 5. Kick generated from the hips

*Parent-facing summary:* Power from the hips, with long legs.

*Objective:* Drive the kick from the hips with long legs and only a slight, relaxed bend at the knee.

*Success criteria:*

1. Movement starts at the hip, with the thigh moving up and down.
2. Knees bend slightly and stay under the surface.
3. Legs stay long through the whole kick.
4. No cycling or pedalling action.

**For your review:**

- [ ] Criterion 2 says knees "bend slightly and stay under the surface". Confirm this wording, since a small knee break at the surface is normal in some children.

#### 6. Relaxed ankles

*Parent-facing summary:* Loose ankles and pointed toes.

*Objective:* Kick with loose, relaxed ankles and softly pointed toes so the feet work like flippers.

*Success criteria:*

1. Toes point away from the body.
2. Ankles stay loose and flick at the end of each kick.
3. Feet turn slightly inward, with the big toes almost brushing.
4. No flexed, hooked feet during the kick.

**For your review:**

- [ ] Criterion 3 ("feet turn slightly inward, with the big toes almost brushing") is a fine technical detail that is hard to see from poolside and may be above the level of this programme. Consider removing it.
- [ ] The video cue for mistakes says "lots of effort with very little forward movement", which describes a result, not a technique fault. Confirm you are happy with it.

#### 7. Consistent kicking rhythm

*Parent-facing summary:* A steady kick that never stops.

*Objective:* Maintain a steady, even flutter kick for the whole swim, including while breathing and using the arms.

*Success criteria:*

1. Kick stays even from push-off to finish.
2. Rhythm holds while the arms are moving.
3. Kick continues during the breath.
4. Maintained over at least 10 metres.

**For your review:**

- [ ] Criterion 3 ("kick continues during the breath") is also assessed under Side breathing (criterion 4) and Arm-and-leg coordination. See section 4 on overlaps.
- [ ] Criterion 4 uses 10 metres. See decision A1.


### Arms

#### 8. Controlled arm recovery

*Parent-facing summary:* Arm travels over the water, elbow leading.

*Objective:* Bring each arm forward over the water in a relaxed, controlled movement, with the elbow leaving the water first.

*Success criteria:*

1. Elbow exits the water before the hand.
2. Arm travels forward over the water, not through it.
3. Hand and forearm stay relaxed.
4. Arm recovers in line with the shoulder, without swinging wide.

**For your review:**

- [ ] Criterion 1 ("elbow exits the water before the hand") describes a high-elbow recovery. Many learn-to-swim frameworks accept a straight-arm over-water recovery at early stages. Decide whether a high elbow is required for Good, or only for Pass.
- [ ] The mistakes video lists "swinging a straight arm wide to the side". If a straight-arm recovery is acceptable at this level, reword this to target only the low, wide swing.

#### 9. Effective hand entry

*Parent-facing summary:* Fingertips first, in line with the shoulder.

*Objective:* Enter the water fingertips first, in line with the shoulder, then reach forward under the surface.

*Success criteria:*

1. Fingertips enter before the wrist and elbow.
2. Hand enters in line with the shoulder.
3. Hand does not cross the centre line of the body.
4. Arm extends forward under the water after entry.

**For your review:**

- [ ] Criterion 2 says the hand enters "in line with the shoulder". Confirm this against your own cue (some teach entry between the head and shoulder line).
- [ ] Criterion 1 (fingertips before wrist and elbow) may be more than you expect at Stage 2 to 3.

#### 10. Alternating arm action

*Parent-facing summary:* Arms taking turns, without pausing.

*Objective:* Use a continuous alternating arm action, with one arm pulling as the other recovers.

*Success criteria:*

1. One arm begins to pull as the other recovers.
2. Arms keep moving, with no long pause at the front or by the hips.
3. Each pull travels back past the hip.
4. Both arms pull with similar length and effort.

**For your review:**

- [ ] Criteria 1 and 2 describe continuous, opposing arms with "no long pause at the front". Catch-up timing is commonly taught to beginners and involves a deliberate pause at the front. Decide whether catch-up timing should count as meeting this skill.
- [ ] Criterion 3 (pull travels back past the hip) and criterion 4 (both arms similar) are sound in principle but may be demanding for the youngest swimmers.


### Breathing

#### 11. Exhaling underwater

*Parent-facing summary:* Blowing bubbles with the face in.

*Objective:* Breathe out steadily through the nose or mouth while the face is in the water.

*Success criteria:*

1. A steady stream of bubbles while the face is in the water.
2. Most of the air is out before turning to breathe.
3. No breath holding between breaths.
4. Face stays relaxed in the water.

**For your review:**

- [ ] The objective says "through the nose or mouth". Confirm whether you want to specify one.
- [ ] Criterion 2 ("most of the air is out before turning to breathe") cannot be observed directly. Consider "bubbles continue until the head turns".

#### 12. Side breathing

*Parent-facing summary:* Rotating the head sideways to breathe.

*Objective:* Develop controlled side breathing while maintaining horizontal body alignment and a consistent kicking rhythm.

*Success criteria:*

1. Rotates the head sideways rather than lifting it forwards.
2. Maintains body position while breathing.
3. Exhales underwater between breaths.
4. Continues kicking during the breathing movement.
5. Returns the head smoothly to the water.

**For your review:**

- [ ] These five criteria are taken word for word from your brief.
- [ ] The correct-technique cue "one goggle staying in the water" is a common coaching cue but stricter than some programmes expect of young learners. Confirm it.
- [ ] The mistakes list includes "rolling the whole body onto the back". Some programmes teach rolling to the back to breathe as a deliberate intermediate step. If you use that progression, remove this from the mistakes list.
- [ ] Criterion 2 overlaps with the separate skill Body alignment while breathing. See section 4.

#### 13. Body alignment while breathing

*Parent-facing summary:* Staying flat and long during the breath.

*Objective:* Keep the body flat and long through every breath, with the leading arm extended for support.

*Success criteria:*

1. Hips stay near the surface during the breath.
2. Leading arm stays extended in front while the head turns.
3. Body rotates as one unit, without bending at the waist.
4. No pressing down with the leading hand to lift the head.

**For your review:**

- [ ] This whole skill overlaps with Side breathing criterion 2. Decide whether it stays as a separate target. See section 4.
- [ ] Criterion 3 ("body rotates as one unit") assumes body rotation is being taught at this level. Confirm.

#### 14. Returning the face to the water

*Parent-facing summary:* Head back to centre, eyes down.

*Objective:* Return the face smoothly to the water after each breath and settle straight back into a neutral head position.

*Success criteria:*

1. Face returns before the recovering arm enters the water.
2. Head finishes still, with the eyes looking down.
3. Breathing out restarts as soon as the face is in.
4. No pause with the head turned to the side.

**For your review:**

- [ ] Criterion 1 ("face returns before the recovering arm enters the water") is a timing detail. Confirm it matches how you teach the breath timing.


### Coordination

#### 15. Arm-and-leg coordination

*Parent-facing summary:* Arms and legs working together.

*Objective:* Combine a continuous flutter kick with the alternating arm action so that neither interrupts the other.

*Success criteria:*

1. Kick continues throughout the full arm cycle.
2. Arm tempo stays steady while kicking.
3. Body stays balanced, with no stop-start movement.
4. Coordination holds for at least 10 metres.

**For your review:**

- [ ] Criterion 1 overlaps with Consistent kicking rhythm criterion 2. See section 4.
- [ ] Criterion 4 uses 10 metres. See decision A1.

#### 16. Breathing rhythm

*Parent-facing summary:* Breathing in a regular pattern.

*Objective:* Breathe in a regular pattern, such as every two or three arm pulls, without breaking the stroke.

*Success criteria:*

1. Breathes at regular intervals, for example every three arm pulls.
2. Arm action continues through each breath.
3. Pattern holds for at least 10 metres.
4. No extra strokes taken with the head up.

**For your review:**

- [ ] The objective gives "every two or three arm pulls" and criterion 1 gives "every three" as the example. Decide your policy: one-sided breathing, both sides, or either.
- [ ] The mistakes video lists "breathing on every single arm pull". Check this wording, since breathing every two pulls (every stroke cycle to one side) is normal and should not be confused with it.
- [ ] Criterion 3 uses 10 metres. See decision A1.

#### 17. Maintaining technique over distance

*Parent-facing summary:* Holding good technique as the swim gets longer.

*Objective:* Hold body position, kick, arm action and breathing together over a longer continuous swim.

*Success criteria:*

1. Body position stays flat for the full distance.
2. Kick and arm tempo stay steady from start to finish.
3. Breathing pattern is maintained without stopping.
4. Technique at the end of the swim matches the start.

**For your review:**

- [ ] No distance is stated. This skill cannot be assessed consistently until one is set for each stage. See decision A1.
- [ ] This skill restates the other sixteen over a longer swim, so it will tend to be the last to reach Pass. Confirm that is the intention.


## 4. Overlaps that affect the progress figure

The same behaviour is assessed in more than one place. A swimmer who fixes one thing can move two
or three targets at once, and a swimmer who struggles with one thing is held back on several.

| Behaviour | Where it is assessed |
| --- | --- |
| Kicking continues during the breath | Consistent kicking rhythm (3), Side breathing (4), Arm-and-leg coordination (1) |
| Body stays flat while breathing | Side breathing (2), Body alignment while breathing (all), Horizontal alignment (1) |
| Exhaling between breaths | Exhaling underwater (all), Side breathing (3), Returning the face to the water (3) |
| Head returns smoothly after the breath | Side breathing (5), Returning the face to the water (all) |
| Whole stroke held together | Maintaining technique over distance (all) restates most other skills |

- [ ] Decide whether to keep the overlaps (they reflect how the stroke works), remove the
  duplicated criteria from Side breathing, or merge skills.

## 5. Other wording to check

- [ ] **Achievement messages.** One sentence per skill, shown when a skill is marked Pass, for example
  "Oliver has demonstrated a consistent flutter kick while maintaining good body alignment."
  They are in `src/data/skills.ts` as `passSummary`.
- [ ] **Video cue lists.** Each skill has three short lists: what to look for, mistakes to watch
  for, and what parents should notice from the poolside. These will become the shot lists for
  filming, so they need the same sign-off as the criteria.
- [ ] **"Why this skill matters" paragraphs.** Written for parents. Check the explanations are ones
  you would give yourself.
- [ ] **Supervision reminder.** "Swimming skills must always be practised under qualified
  supervision. These videos explain what to look for. They are not instructions for unsupervised
  practice." Confirm the wording, and whether any venue involved has a required form of words.
- [ ] **Stage decisions.** Every progress screen states that these figures are not an official stage
  assessment and that stage decisions stay with the regular lesson teacher. Confirm the wording
  before any live pilot.

## Sign-off

| Area | Reviewed by | Date | Changes needed |
| --- | --- | --- | --- |
| Decisions A1 to A6 | | | |
| Assessment states | | | |
| Body position (3 skills) | | | |
| Kicking (4 skills) | | | |
| Arms (3 skills) | | | |
| Breathing (4 skills) | | | |
| Coordination (3 skills) | | | |
| Overlaps | | | |
| Other wording | | | |
