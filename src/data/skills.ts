/**
 * The skill library: reference content shared by every swimmer.
 *
 * Front crawl is implemented in depth for the prototype. To add another stroke, add its skills
 * here and reference their ids from a DevelopmentPlan.
 *
 * VIDEOS: every skill has three video slots (correct technique, common mistakes, what parents
 * should notice). They render as
 * clearly labelled placeholders until footage exists. To use real footage, put the file in
 * /public/videos and set `src` (and optionally `poster`) in VIDEO_SOURCES at the bottom of this
 * file. No other change is needed.
 */
import type { SkillCategory, SkillCategoryId, SkillVideo, SwimmingSkill } from '@/types';

export const CATEGORIES: SkillCategory[] = [
  { id: 'body_position', name: 'Body position', summary: 'Lying flat, long and balanced at the surface.' },
  { id: 'kicking', name: 'Kicking', summary: 'A steady flutter kick that keeps the legs afloat.' },
  { id: 'arms', name: 'Arms', summary: 'A relaxed recovery and a clean, well-placed entry.' },
  { id: 'breathing', name: 'Breathing', summary: 'Breathing to the side without losing position.' },
  { id: 'coordination', name: 'Coordination', summary: 'Putting the whole stroke together and keeping it together.' },
];

export const CATEGORY_IDS: SkillCategoryId[] = CATEGORIES.map((c) => c.id);

interface SkillSeed extends Omit<SwimmingSkill, 'stroke' | 'videos'> {
  /** Points for the "correct technique" video. */
  correct: string[];
  /** Points for the "common mistakes" video. */
  mistakes: string[];
}

/** Plain-language cues for the "what parents should notice" video: visible from the poolside. */
const POOLSIDE_CUES: Record<string, string[]> = {
  'bp-alignment': [
    'Heels making a small splash at the surface',
    'The back and hips visible at the surface, not sinking'
  ],
  'bp-head': [
    'The back of the head showing, not the face',
    'A head that stays still while the arms move'
  ],
  'bp-streamline': [
    'A long, quiet glide off the wall before any kicking',
    'Arms covering the ears'
  ],
  'kick-alternating': [
    'A steady patter of small splashes',
    'Legs that stay close together'
  ],
  'kick-hips': [
    'Legs that look long and mostly straight',
    'Knees staying under the water'
  ],
  'kick-ankles': [
    'Pointed toes',
    'Feet that look loose, not stiff'
  ],
  'kick-rhythm': [
    'Splashing that does not stop, even during a breath',
    'The same kick speed at the end of the swim as at the start'
  ],
  'arm-recovery': [
    'Arms lifting clear of the water',
    'Elbows pointing up as each arm comes over'
  ],
  'arm-entry': [
    'Hands going in quietly, without a slap',
    'Hands entering in front of the shoulders, not across the head'
  ],
  'arm-alternating': [
    'One arm always on the move',
    'Hands passing the thighs at the end of each pull'
  ],
  'br-exhale': [
    'Bubbles around the face',
    'No gasping when the head turns'
  ],
  'br-side': [
    'One ear staying in the water during the breath',
    'The head turning to the side, not lifting to look forwards'
  ],
  'br-alignment': [
    'The front arm staying stretched out during the breath',
    'Legs staying up at the surface while breathing'
  ],
  'br-return': [
    'The face going back in promptly after the breath',
    'Eyes returning to the pool floor'
  ],
  'co-armleg': [
    'Legs still kicking while the arms pull',
    'A smooth swim without stops and starts'
  ],
  'co-rhythm': [
    'Breaths taken at regular intervals',
    'Arms that keep moving during each breath'
  ],
  'co-distance': [
    'The end of the swim looking as tidy as the start',
    'No stopping to stand part-way'
  ]
};

const SEEDS: SkillSeed[] = [
  // ---------------------------------------------------------------- Body position
  {
    id: 'bp-alignment',
    categoryId: 'body_position',
    name: 'Horizontal alignment',
    summary: 'Lying flat and long at the surface.',
    objective:
      'Hold a flat, horizontal body position at the surface so the hips and heels stay close to the top of the water.',
    whyItMatters:
      'A flat body slips through the water with far less resistance. When the hips and legs sink, every stroke has to work harder and children tire quickly.',
    successCriteria: [
      'Hips stay close to the surface throughout the swim.',
      'Heels sit at or just under the surface while kicking.',
      'Body stays in one long line from head to toes.',
      'Position holds for at least 5 metres without the legs sinking.',
    ],
    achievementLabel: 'a flat, horizontal body position',
    masteredSummary: '{name} holds a flat, horizontal body position at the surface without the legs sinking.',
    correct: [
      'Back of the head, hips and heels in one line near the surface',
      'A small, steady splash from the heels',
      'No bend at the waist',
    ],
    mistakes: [
      'Hips and legs dropping so the body angles downward',
      'Looking forward, which pushes the hips down',
      'Bending at the waist, as if sitting in the water',
    ],
  },
  {
    id: 'bp-head',
    categoryId: 'body_position',
    name: 'Head position',
    summary: 'Eyes down, head still.',
    objective: 'Keep the head still and in line with the spine, with the eyes looking at the pool floor.',
    whyItMatters:
      'The head steers the body. Looking forward lifts the head, and the hips drop in response. A still, neutral head keeps the whole body balanced.',
    successCriteria: [
      'Eyes look down at the pool floor.',
      'The waterline sits around the crown of the head.',
      'Head stays still between breaths.',
      'Neck stays relaxed, with no lifting to look forward.',
    ],
    achievementLabel: 'a still, neutral head position',
    masteredSummary: '{name} keeps a still head with eyes down, which keeps the whole body balanced.',
    correct: ['Eyes on the pool floor', 'Water meeting the top of the head', 'Head still while the arms and legs move'],
    mistakes: [
      'Lifting the chin to look forward',
      'Head swinging from side to side with each arm pull',
      'Tucking the chin too far onto the chest',
    ],
  },
  {
    id: 'bp-streamline',
    categoryId: 'body_position',
    name: 'Streamlined posture',
    summary: 'Push and glide in a tight arrow shape.',
    objective:
      'Push off the wall and glide in a tight streamlined shape, with the arms extended and squeezed behind the ears.',
    whyItMatters:
      'Streamlining is the most efficient position in swimming. A good push and glide sets up every swim and teaches the long body shape used in all four strokes.',
    successCriteria: [
      'Arms fully extended, one hand on top of the other.',
      'Upper arms squeezed against the ears.',
      'Legs together with toes pointed.',
      'Glides at least 3 metres from the wall before kicking.',
    ],
    achievementLabel: 'a streamlined push and glide',
    masteredSummary: '{name} pushes off and glides in a tight streamlined shape every time.',
    correct: ['Hands stacked, arms straight', 'Head tucked between the arms', 'A long, quiet glide before the first kick'],
    mistakes: [
      'Arms apart, like a letter Y',
      'Head lifted above the arms',
      'Starting to kick or pull before the glide has finished',
    ],
  },

  // ---------------------------------------------------------------- Kicking
  {
    id: 'kick-alternating',
    categoryId: 'kicking',
    name: 'Alternating flutter kick',
    summary: 'Legs taking turns, close together.',
    objective: 'Kick with continuous, alternating up-and-down leg movements, keeping the legs close together.',
    whyItMatters:
      'The flutter kick keeps the legs afloat and the body balanced. Every other part of front crawl is built on it.',
    successCriteria: [
      'Legs move alternately, never together.',
      'Legs stay close, passing near each other.',
      'Kick stays continuous, with no pauses.',
      'Kicks stay small, with no deep or wide leg movements.',
    ],
    achievementLabel: 'the alternating flutter kick',
    masteredSummary: '{name} kicks with a continuous alternating flutter kick, keeping the legs close together.',
    correct: ['One leg up as the other goes down', 'Small, fast movements', 'Legs staying close together'],
    mistakes: [
      'Both legs kicking together',
      'Wide scissor or breaststroke-style kicks',
      'Stopping the kick while the arms move',
    ],
  },
  {
    id: 'kick-hips',
    categoryId: 'kicking',
    name: 'Kick generated from the hips',
    summary: 'Power from the hips, with long legs.',
    objective: 'Drive the kick from the hips with long legs and only a slight, relaxed bend at the knee.',
    whyItMatters:
      'Kicking from the knee pushes water the wrong way and creates drag, a little like cycling. Kicking from the hip uses the large leg muscles to push water backwards.',
    successCriteria: [
      'Movement starts at the hip, with the thigh moving up and down.',
      'Knees bend slightly and stay under the surface.',
      'Legs stay long through the whole kick.',
      'No cycling or pedalling action.',
    ],
    achievementLabel: 'kicking from the hips',
    masteredSummary: '{name} drives the kick from the hips with long, relaxed legs.',
    correct: ['Thighs moving up and down', 'Knees soft but mostly straight', 'Only the heels disturbing the surface'],
    mistakes: [
      'Bending the knees sharply so the lower legs lift out of the water',
      'A cycling action',
      'Stiff, locked legs with no knee movement at all',
    ],
  },
  {
    id: 'kick-ankles',
    categoryId: 'kicking',
    name: 'Relaxed ankles',
    summary: 'Loose ankles and pointed toes.',
    objective: 'Kick with loose, relaxed ankles and softly pointed toes so the feet work like flippers.',
    whyItMatters:
      'Most of the push in a flutter kick comes from the top of the foot. Stiff or flexed ankles act like brakes. Loose ankles turn the foot into a flipper.',
    successCriteria: [
      'Toes point away from the body.',
      'Ankles stay loose and flick at the end of each kick.',
      'Feet turn slightly inward, with the big toes almost brushing.',
      'No flexed, hooked feet during the kick.',
    ],
    achievementLabel: 'kicking with relaxed ankles',
    masteredSummary: '{name} kicks with loose ankles and pointed toes, so each kick moves more water.',
    correct: ['Toes pointed', 'A small flick at the end of each kick', 'Feet making a gentle boil at the surface'],
    mistakes: [
      'Feet flexed at a right angle',
      'Rigid ankles that do not flick',
      'Lots of effort with very little forward movement',
    ],
  },
  {
    id: 'kick-rhythm',
    categoryId: 'kicking',
    name: 'Consistent kicking rhythm',
    summary: 'A steady kick that never stops.',
    objective:
      'Maintain a steady, even flutter kick for the whole swim, including while breathing and using the arms.',
    whyItMatters:
      'A kick that stops and starts lets the legs sink each time. A steady rhythm keeps the body balanced and makes breathing and arm movements much easier to learn.',
    successCriteria: [
      'Kick stays even from push-off to finish.',
      'Rhythm holds while the arms are moving.',
      'Kick continues during the breath.',
      'Maintained over at least 10 metres.',
    ],
    achievementLabel: 'consistent flutter kicking',
    masteredSummary: '{name} has demonstrated a consistent flutter kick while maintaining good body alignment.',
    correct: [
      'An even, continuous splash from the heels',
      'No pause when the swimmer breathes',
      'The same tempo at the end as at the start',
    ],
    mistakes: [
      'Kick pausing during each breath',
      'Bursts of fast kicking followed by gliding',
      'Kick fading in the second half of the swim',
    ],
  },

  // ---------------------------------------------------------------- Arms
  {
    id: 'arm-recovery',
    categoryId: 'arms',
    name: 'Controlled arm recovery',
    summary: 'Arm travels over the water, elbow leading.',
    objective:
      'Bring each arm forward over the water in a relaxed, controlled movement, with the elbow leaving the water first.',
    whyItMatters:
      "The recovery is the arm's rest phase. A relaxed, controlled recovery saves energy and places the hand in the right spot for the next pull.",
    successCriteria: [
      'Elbow exits the water before the hand.',
      'Arm travels forward over the water, not through it.',
      'Hand and forearm stay relaxed.',
      'Arm recovers in line with the shoulder, without swinging wide.',
    ],
    achievementLabel: 'a controlled arm recovery',
    masteredSummary: '{name} recovers each arm over the water with a relaxed, elbow-led movement.',
    correct: ['Elbow higher than the hand', 'A relaxed hand passing close to the body', 'A smooth, unhurried movement'],
    mistakes: [
      'Dragging the arm forward through the water',
      'Swinging a straight arm wide to the side',
      'Rushing the recovery and slapping the water',
    ],
  },
  {
    id: 'arm-entry',
    categoryId: 'arms',
    name: 'Effective hand entry',
    summary: 'Fingertips first, in line with the shoulder.',
    objective: 'Enter the water fingertips first, in line with the shoulder, then reach forward under the surface.',
    whyItMatters:
      'Where the hand enters decides where the pull begins. A clean entry in line with the shoulder keeps the body straight and gives the longest possible pull.',
    successCriteria: [
      'Fingertips enter before the wrist and elbow.',
      'Hand enters in line with the shoulder.',
      'Hand does not cross the centre line of the body.',
      'Arm extends forward under the water after entry.',
    ],
    achievementLabel: 'a clean hand entry',
    masteredSummary: '{name} enters the water fingertips first, in line with the shoulder, on both sides.',
    correct: ['Fingers slicing in first', 'Entry in line with the shoulder', 'A forward reach once the hand is in'],
    mistakes: [
      'Hand crossing over in front of the head',
      'Slapping the water with a flat hand or the elbow',
      'Entering too close to the head and cutting the reach short',
    ],
  },
  {
    id: 'arm-alternating',
    categoryId: 'arms',
    name: 'Alternating arm action',
    summary: 'Arms taking turns, without pausing.',
    objective: 'Use a continuous alternating arm action, with one arm pulling as the other recovers.',
    whyItMatters:
      'Continuous alternating arms give front crawl its steady forward movement. Long pauses slow the swimmer down and let the legs sink between strokes.',
    successCriteria: [
      'One arm begins to pull as the other recovers.',
      'Arms keep moving, with no long pause at the front or by the hips.',
      'Each pull travels back past the hip.',
      'Both arms pull with similar length and effort.',
    ],
    achievementLabel: 'a continuous alternating arm action',
    masteredSummary: '{name} swims with a continuous alternating arm action and full-length pulls.',
    correct: ['One arm pulling as the other recovers', 'Each hand finishing by the thigh', 'A steady, even tempo'],
    mistakes: ['Both arms pausing together at the front', 'Short pulls that finish at the waist', 'One arm doing most of the work'],
  },

  // ---------------------------------------------------------------- Breathing
  {
    id: 'br-exhale',
    categoryId: 'breathing',
    name: 'Exhaling underwater',
    summary: 'Blowing bubbles with the face in.',
    objective: 'Breathe out steadily through the nose or mouth while the face is in the water.',
    whyItMatters:
      'A swimmer who holds their breath has to breathe out and in during the short moment their mouth is clear. That leads to rushed breaths, lifted heads and tension. Steady bubbles keep breathing calm.',
    successCriteria: [
      'A steady stream of bubbles while the face is in the water.',
      'Most of the air is out before turning to breathe.',
      'No breath holding between breaths.',
      'Face stays relaxed in the water.',
    ],
    achievementLabel: 'exhaling underwater',
    masteredSummary: '{name} breathes out steadily underwater, which keeps each breath calm and unhurried.',
    correct: ['A constant trickle of bubbles', 'A quick, calm breath in', 'A relaxed face'],
    mistakes: [
      'Holding the breath, then gasping',
      'Blowing all the air out in one burst',
      'Breathing out after the mouth has left the water',
    ],
  },
  {
    id: 'br-side',
    categoryId: 'breathing',
    name: 'Side breathing',
    summary: 'Rotating the head sideways to breathe.',
    objective:
      'Develop controlled side breathing while maintaining horizontal body alignment and a consistent kicking rhythm.',
    whyItMatters:
      'Breathing is the part of front crawl children find hardest. Turning the head to the side, instead of lifting it forwards, lets a swimmer breathe without their hips dropping, so they can keep swimming for longer.',
    successCriteria: [
      'Rotates the head sideways rather than lifting it forwards.',
      'Maintains body position while breathing.',
      'Exhales underwater between breaths.',
      'Continues kicking during the breathing movement.',
      'Returns the head smoothly to the water.',
    ],
    achievementLabel: 'side breathing',
    masteredSummary: '{name} breathes to the side with the head turning, not lifting, and the kick continuing throughout.',
    correct: [
      'One goggle staying in the water',
      'The head turning with the body, not lifting',
      'The kick continuing throughout the breath',
    ],
    mistakes: ['Lifting the head forwards to breathe', 'Rolling the whole body onto the back', 'Stopping the kick while breathing'],
  },
  {
    id: 'br-alignment',
    categoryId: 'breathing',
    name: 'Body alignment while breathing',
    summary: 'Staying flat and long during the breath.',
    objective: 'Keep the body flat and long through every breath, with the leading arm extended for support.',
    whyItMatters:
      'The breath is where front crawl most often falls apart. If the body stays aligned while breathing, the swimmer keeps their speed and does not have to fight their way back to the surface.',
    successCriteria: [
      'Hips stay near the surface during the breath.',
      'Leading arm stays extended in front while the head turns.',
      'Body rotates as one unit, without bending at the waist.',
      'No pressing down with the leading hand to lift the head.',
    ],
    achievementLabel: 'staying aligned while breathing',
    masteredSummary: '{name} stays flat and long through every breath, with the leading arm extended.',
    correct: [
      'A long front arm during the breath',
      'Hips at the same height before, during and after',
      'Shoulders and hips rotating together',
    ],
    mistakes: [
      'Pushing down on the water with the front arm',
      'Hips dropping as the head turns',
      'Legs splaying apart for balance',
    ],
  },
  {
    id: 'br-return',
    categoryId: 'breathing',
    name: 'Returning the face to the water',
    summary: 'Head back to centre, eyes down.',
    objective:
      'Return the face smoothly to the water after each breath and settle straight back into a neutral head position.',
    whyItMatters:
      'A quick, smooth return keeps the stroke flowing. Lingering with the head turned unbalances the body and delays the next arm pull.',
    successCriteria: [
      'Face returns before the recovering arm enters the water.',
      'Head finishes still, with the eyes looking down.',
      'Breathing out restarts as soon as the face is in.',
      'No pause with the head turned to the side.',
    ],
    achievementLabel: 'a smooth return after each breath',
    masteredSummary: '{name} returns the face smoothly to the water after every breath and settles straight away.',
    correct: ['The head leading the arm back in', 'Eyes straight back to the pool floor', 'Bubbles starting again immediately'],
    mistakes: [
      'Staying on the side for too long',
      'Head rotating past centre towards the other side',
      'Lifting the head forwards before putting the face back in',
    ],
  },

  // ---------------------------------------------------------------- Coordination
  {
    id: 'co-armleg',
    categoryId: 'coordination',
    name: 'Arm-and-leg coordination',
    summary: 'Arms and legs working together.',
    objective: 'Combine a continuous flutter kick with the alternating arm action so that neither interrupts the other.',
    whyItMatters:
      'Children often learn the kick and the arms separately. Front crawl only becomes efficient when both run together, without one stopping for the other.',
    successCriteria: [
      'Kick continues throughout the full arm cycle.',
      'Arm tempo stays steady while kicking.',
      'Body stays balanced, with no stop-start movement.',
      'Coordination holds for at least 10 metres.',
    ],
    achievementLabel: 'arm-and-leg coordination',
    masteredSummary: '{name} keeps a continuous kick running under a steady arm action.',
    correct: ['Legs kicking constantly under a steady arm stroke', 'Smooth forward travel', 'No visible pause between strokes'],
    mistakes: ['Legs stopping when the arms pull', 'Arms rushing to keep up with the kick', 'A stop-start, jerky swim'],
  },
  {
    id: 'co-rhythm',
    categoryId: 'coordination',
    name: 'Breathing rhythm',
    summary: 'Breathing in a regular pattern.',
    objective: 'Breathe in a regular pattern, such as every two or three arm pulls, without breaking the stroke.',
    whyItMatters:
      'A regular breathing pattern lets a swimmer settle into a pace they can maintain. Irregular breathing leads to breath holding, tiredness and stopping part-way.',
    successCriteria: [
      'Breathes at regular intervals, for example every three arm pulls.',
      'Arm action continues through each breath.',
      'Pattern holds for at least 10 metres.',
      'No extra strokes taken with the head up.',
    ],
    achievementLabel: 'a regular breathing rhythm',
    masteredSummary: '{name} breathes in a regular pattern without breaking the stroke.',
    correct: ['A predictable pattern of breaths', 'Arms continuing while the head turns', 'A calm, unhurried swim'],
    mistakes: [
      'Swimming as far as possible on one breath, then stopping',
      'Breathing on every single arm pull',
      'Pausing the arms to take a breath',
    ],
  },
  {
    id: 'co-distance',
    categoryId: 'coordination',
    name: 'Maintaining technique over distance',
    summary: 'Holding good technique as the swim gets longer.',
    objective: 'Hold body position, kick, arm action and breathing together over a longer continuous swim.',
    whyItMatters:
      'Skills that work for a few metres need to survive tiredness. Holding technique over distance is what turns separate skills into confident, independent swimming.',
    successCriteria: [
      'Body position stays flat for the full distance.',
      'Kick and arm tempo stay steady from start to finish.',
      'Breathing pattern is maintained without stopping.',
      'Technique at the end of the swim matches the start.',
    ],
    achievementLabel: 'holding technique over distance',
    masteredSummary: '{name} holds body position, kick, arms and breathing together over a longer swim.',
    correct: ['The last few metres looking like the first', 'A steady, even pace', 'Regular breathing throughout'],
    mistakes: ['Head lifting as tiredness sets in', 'Kick fading in the second half', 'Stopping or standing part-way'],
  },
];

/**
 * Drop real footage in here. Key format: "<skill id>:<correct|mistakes|notice>".
 * Example:
 *   'br-side:correct': { src: 'videos/side-breathing-correct.mp4', poster: 'videos/side-breathing-correct.jpg' },
 */
export const VIDEO_SOURCES: Record<string, Pick<SkillVideo, 'src' | 'poster'>> = {};

function buildVideos(seed: SkillSeed): SkillVideo[] {
  const lower = seed.name.charAt(0).toLowerCase() + seed.name.slice(1);
  return [
    {
      id: `${seed.id}:correct`,
      kind: 'correct',
      title: 'Correct technique',
      caption: `A qualified demonstrator shows ${lower} at teaching pace, from the side and from above.`,
      plannedDuration: '0:45',
      lookFor: seed.correct,
      ...VIDEO_SOURCES[`${seed.id}:correct`],
    },
    {
      id: `${seed.id}:mistakes`,
      kind: 'mistakes',
      title: 'Common mistakes',
      caption: 'The most common errors at this stage, each followed by the correction.',
      plannedDuration: '1:00',
      lookFor: seed.mistakes,
      ...VIDEO_SOURCES[`${seed.id}:mistakes`],
    },
    {
      id: `${seed.id}:notice`,
      kind: 'notice',
      title: 'What parents should notice',
      caption: 'What this skill looks like from the poolside, so you can spot progress yourself.',
      plannedDuration: '0:30',
      lookFor: POOLSIDE_CUES[seed.id] ?? [],
      ...VIDEO_SOURCES[`${seed.id}:notice`],
    },
  ];
}

export const SKILLS: SwimmingSkill[] = SEEDS.map((seed) => {
  const { correct: _correct, mistakes: _mistakes, ...rest } = seed;
  return { ...rest, stroke: 'front_crawl', videos: buildVideos(seed) };
});

export const SKILL_IDS: string[] = SKILLS.map((s) => s.id);

const SKILL_INDEX = new Map(SKILLS.map((s) => [s.id, s]));
const CATEGORY_INDEX = new Map(CATEGORIES.map((c) => [c.id, c]));

export const getSkill = (id: string): SwimmingSkill | undefined => SKILL_INDEX.get(id);
export const getCategory = (id: SkillCategoryId): SkillCategory => CATEGORY_INDEX.get(id)!;
export const skillsInCategory = (id: SkillCategoryId): SwimmingSkill[] => SKILLS.filter((s) => s.categoryId === id);
