/**
 * Fictional demonstration data. Every person here is invented.
 *
 * Dates are generated relative to the day the demo is opened, so the programme always reads as
 * "week 3 of 6, last session a few days ago" whenever it is shown.
 */
import { DEMO_INSTRUCTOR_ID, DEMO_PARENT_ID, PARTNER, PROGRAMME } from '@/config/demo';
import { SKILL_IDS, getSkill } from '@/data/skills';
import { achievementNotification, buildAchievement } from '@/lib/assessmentService';
import { addDays, lastSaturdayBefore, today } from '@/lib/dates';
import type {
  Achievement,
  AppData,
  Child,
  CoachingSession,
  DevelopmentPlan,
  ISODate,
  Notification,
  Parent,
  ProgrammeFormat,
  ProgressUpdate,
  SkillAssessment,
  SkillPlanNote,
  SkillStatus,
} from '@/types';

/** Bump whenever the stored shape changes, so data saved by an older version is discarded and reseeded. */
export const SCHEMA_VERSION = 2; // 2: five assessment labels (Not Assessed, Needs Practice, Fair, Good, Pass)

const CODE: Record<string, SkillStatus> = { N: 'needs_practice', F: 'fair', G: 'good', P: 'pass' };

/**
 * Assessment history in compact form: one string per completed week, one character per skill in
 * library order. N = Needs Practice, F = Fair, G = Good, P = Pass; "-" means not assessed that week.
 */
const HISTORY: Record<string, string[]> = {
  'child-oliver': ['FFGGFNFFNGFNNFFN-', 'G-PPFFG---GN-----', '-G--GFPFFG-FNFF--'],
  'child-isla': ['FNFFNNNNNFNNNNN--', 'F-GF-FN---F------', 'GF-GFFFFN-F-NN---'],
  'child-noah': ['GGPGGFGFFGGFFFFFN', 'P--PG-P--G-G-F-F-', '-P--PG-GG-PGFGGFF'],
  'child-amelia': ['NNFFNNN-N-NN-----', 'FNGF-NF---F------', 'FFGGFF-NNFFN-----'],
  'child-leo': [],
};

const ASSESSMENT_NOTES: Record<string, string> = {
  'child-oliver|br-side|1': 'Lifts his head forwards to breathe. New skill for Oliver.',
  'child-oliver|br-side|2': 'Practised turning the head with a float. Still lifting forwards.',
  'child-oliver|br-side|3': 'Turning to the side on most attempts with a float. Hips drop when he lifts.',
  'child-oliver|kick-rhythm|2': 'Even kick over 5 metres with a float.',
  'child-oliver|kick-rhythm|3': 'Steady kick held for 10 metres, including with full arm action.',
  'child-oliver|bp-streamline|2': 'Tight push and glide past 3 metres on every attempt.',
  'child-oliver|kick-alternating|2': 'Continuous alternating kick with no prompting.',
  'child-oliver|br-alignment|3': 'Presses down with the leading arm when breathing.',
};

const OLIVER_NOTES: Record<string, SkillPlanNote> = {
  'bp-alignment': {
    feedback:
      'Oliver now holds a flat position for most of a width. His hips dip slightly when he breathes, which we are working on through the breathing skills.',
    nextTarget: 'Hold a flat position for a full 10 metres with the face in the water.',
  },
  'bp-head': {
    feedback: 'Oliver has stopped looking forward and keeps his eyes on the pool floor between breaths.',
    nextTarget: 'Keep the head still for a full width, including straight after each breath.',
  },
  'bp-streamline': {
    feedback: "Oliver's push and glide is tight and confident every time. He now uses it to start each swim.",
    nextTarget: 'Carry the streamlined shape into the first three kicks of every swim.',
  },
  'kick-alternating': {
    feedback: "A reliable, continuous alternating kick. This is one of Oliver's real strengths.",
    nextTarget: 'Keep it going automatically while concentrating on breathing.',
  },
  'kick-hips': {
    feedback:
      'Oliver now kicks from the hips with long legs on most attempts. A small knee bend returns when he is tired.',
    nextTarget: 'Keep long legs for a full 10 metres at the end of the session.',
  },
  'kick-ankles': {
    feedback: "Oliver's toes are pointing more often, but his ankles tighten when he concentrates on his arms.",
    nextTarget: 'Kick 5 metres on his front with loose ankles and pointed toes, three times in a row.',
  },
  'kick-rhythm': {
    feedback: 'Oliver keeps a steady, even kick for a full 10 metres, including while his arms are moving.',
    nextTarget: 'Hold the same rhythm through three side breaths in a row.',
  },
  'arm-recovery': {
    feedback: 'Oliver lifts his elbow well on his right arm. His left arm still swings wide and low.',
    nextTarget: 'Recover both arms with the elbow leading for six strokes in a row.',
  },
  'arm-entry': {
    feedback: "Oliver's hands now enter fingertips first, but his left hand crosses in front of his head.",
    nextTarget: 'Enter in line with the shoulder on both sides for six strokes in a row.',
  },
  'arm-alternating': {
    feedback: 'A steady alternating arm action with no long pauses. His pulls are becoming longer.',
    nextTarget: 'Finish each pull past the hip for a full width.',
  },
  'br-exhale': {
    feedback: 'Oliver blows steady bubbles with his face in the water and no longer holds his breath.',
    nextTarget: 'Keep breathing out steadily during full-stroke swimming.',
  },
  'br-side': {
    feedback:
      'Oliver is becoming more comfortable turning his head to breathe but occasionally lifts his head, causing his hips to drop.',
    nextTarget: 'Maintain consistent flutter kicking during three consecutive side-breathing attempts.',
  },
  'br-alignment': {
    feedback:
      'When Oliver breathes he presses down with his leading arm, which lifts his head and drops his hips. This is our main priority.',
    nextTarget: 'Keep the leading arm extended at the surface for two breaths in a row, using a float for support.',
  },
  'br-return': {
    feedback: 'Oliver sometimes pauses with his head turned before returning his face to the water.',
    nextTarget: 'Return the face before the recovering arm enters, three times in a row.',
  },
  'co-armleg': {
    feedback:
      "Oliver's kick and arms work together for the first few strokes, then his kick slows as he thinks about his arms.",
    nextTarget: 'Keep the kick going through eight full arm strokes.',
  },
  'co-rhythm': {
    feedback:
      'Oliver currently breathes when he needs to, not in a pattern. We will introduce a regular pattern once side breathing is more secure.',
    nextTarget: 'Breathe every three arm pulls for 5 metres.',
  },
  'co-distance': {
    nextTarget: 'To be assessed from week 5, over a continuous 10 metre swim.',
  },
};

interface SwimmerSeed {
  child: Omit<Child, 'instructorId' | 'planId'>;
  parent: Omit<Parent, 'childIds'>;
  format: ProgrammeFormat;
  /** Weeks after the main cohort that this swimmer's programme starts. */
  startOffsetWeeks: number;
  slot: { start: string; end: string };
  focusSkillIds: string[];
  nextPriority: string;
  skillNotes: Record<string, SkillPlanNote>;
  updates: { week: number; text: string; nextObjectives: string[] }[];
}

const SWIMMERS: SwimmerSeed[] = [
  {
    child: { id: 'child-oliver', firstName: 'Oliver', lastName: 'Williams', age: 7, lessonStage: 'Stage 3', parentId: DEMO_PARENT_ID, avatarTone: 'aqua' },
    parent: { id: DEMO_PARENT_ID, firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com' },
    format: 'small_group',
    startOffsetWeeks: 0,
    slot: { start: '10:30', end: '11:00' },
    focusSkillIds: ['br-alignment', 'br-side', 'kick-ankles'],
    nextPriority: 'Maintaining body alignment while breathing to the side.',
    skillNotes: OLIVER_NOTES,
    updates: [
      {
        week: 1,
        text: 'Oliver settled in quickly and completed his baseline assessment. He has a strong push and glide and a reliable alternating kick. Breathing to the side is new to him, so it will be a main focus of the programme.',
        nextObjectives: ['A flat body position with the face in the water', 'A steady kick driven from the hips', 'Blowing bubbles with the face in'],
      },
      {
        week: 2,
        text: "A productive session. Oliver's push and glide and alternating kick are now secure, and he is breathing out steadily underwater. We introduced turning the head to breathe using a float. He lifts his head forwards at the moment, which is very common at this stage.",
        nextObjectives: ['Turn the head to the side with one goggle in the water', 'Keep a steady kick while the arms move', 'Fingertip-first hand entry'],
      },
      {
        week: 3,
        text: "Oliver is developing greater consistency in his kicking technique. We're now focusing on coordinating breathing without interrupting his rhythm.",
        nextObjectives: ['Keep the leading arm extended while breathing', 'Three side breaths in a row with a continuous kick', 'Loose ankles and pointed toes'],
      },
    ],
  },
  {
    child: { id: 'child-isla', firstName: 'Isla', lastName: 'Thompson', age: 7, lessonStage: 'Stage 3', parentId: 'parent-rachel', avatarTone: 'buoy' },
    parent: { id: 'parent-rachel', firstName: 'Rachel', lastName: 'Thompson', email: 'rachel.thompson@example.com' },
    format: 'small_group',
    startOffsetWeeks: 0,
    slot: { start: '10:30', end: '11:00' },
    focusSkillIds: ['kick-hips', 'br-exhale', 'bp-head'],
    nextPriority: 'Kicking from the hips with long legs, without bending the knees.',
    skillNotes: {
      'kick-hips': { feedback: 'Isla bends her knees sharply when she kicks hard. Slower kicking keeps her legs long.', nextTarget: 'Kick 5 metres with a float and long legs, twice in a row.' },
      'br-exhale': { feedback: 'Isla blows bubbles well when reminded, but holds her breath once her arms start moving.', nextTarget: 'Blow bubbles continuously for six arm pulls.' },
    },
    updates: [
      { week: 3, text: 'Isla is kicking with much more confidence and her body position has improved. We are building up her breathing out underwater before introducing side breathing.', nextObjectives: ['Long legs while kicking', 'Continuous bubbles with the arms moving'] },
    ],
  },
  {
    child: { id: 'child-noah', firstName: 'Noah', lastName: 'Okafor', age: 8, lessonStage: 'Stage 4', parentId: 'parent-chidi', avatarTone: 'ocean' },
    parent: { id: 'parent-chidi', firstName: 'Chidi', lastName: 'Okafor', email: 'chidi.okafor@example.com' },
    format: 'small_group',
    startOffsetWeeks: 0,
    slot: { start: '10:30', end: '11:00' },
    focusSkillIds: ['co-distance', 'co-rhythm', 'br-alignment'],
    nextPriority: 'Holding a regular breathing pattern over a full 10 metres.',
    skillNotes: {
      'co-rhythm': { feedback: 'Noah breathes every two pulls for a few strokes, then rushes. Slowing his arms helps.', nextTarget: 'Breathe every three pulls for 10 metres.' },
      'co-distance': { feedback: "Noah's technique is strong for the first half of a swim and loosens as he tires.", nextTarget: 'Swim 15 metres with the same kick tempo throughout.' },
    },
    updates: [
      { week: 3, text: 'Noah has reached Pass in several core skills and is now working on keeping them together over longer swims. His breathing pattern is the main thing to settle.', nextObjectives: ['Breathe every three pulls', 'Even pace over 15 metres'] },
    ],
  },
  {
    child: { id: 'child-amelia', firstName: 'Amelia', lastName: 'Chen', age: 6, lessonStage: 'Stage 2', parentId: 'parent-mei', avatarTone: 'deep' },
    parent: { id: 'parent-mei', firstName: 'Mei', lastName: 'Chen', email: 'mei.chen@example.com' },
    format: 'one_to_one',
    startOffsetWeeks: 0,
    slot: { start: '11:15', end: '11:45' },
    focusSkillIds: ['bp-alignment', 'kick-rhythm', 'br-exhale'],
    nextPriority: 'A flat body position with the face in the water for 5 metres.',
    skillNotes: {
      'bp-alignment': { feedback: 'Amelia is happier putting her face in. Her legs still sink after a few kicks.', nextTarget: 'Kick 5 metres with the face in and hips at the surface.' },
    },
    updates: [
      { week: 3, text: 'Amelia is growing in confidence every week. Her push and glide is now consistent, and she is starting to keep her face in the water while she kicks.', nextObjectives: ['Face in for 5 metres', 'Steady kick without stopping'] },
    ],
  },
  {
    child: { id: 'child-leo', firstName: 'Leo', lastName: 'Martins', age: 6, lessonStage: 'Stage 2', parentId: 'parent-sofia', avatarTone: 'slate' },
    parent: { id: 'parent-sofia', firstName: 'Sofia', lastName: 'Martins', email: 'sofia.martins@example.com' },
    format: 'one_to_one',
    startOffsetWeeks: 3,
    slot: { start: '11:45', end: '12:15' },
    focusSkillIds: [],
    nextPriority: 'Complete the baseline assessment in the first session.',
    skillNotes: {},
    updates: [],
  },
];

/** Builds a fresh copy of the demo data, dated relative to `todayIso`. */
export function buildSeed(todayIso: ISODate = today()): AppData {
  const anchor = lastSaturdayBefore(todayIso);
  /** Date of the main cohort's session in a given programme week. Week 3 is the anchor. */
  const cohortDate = (week: number) => addDays(anchor, (week - 3) * 7);

  const parents: Parent[] = [];
  const children: Child[] = [];
  const plans: DevelopmentPlan[] = [];
  const assessments: SkillAssessment[] = [];
  const updates: ProgressUpdate[] = [];
  const achievements: Achievement[] = [];
  const notifications: Notification[] = [];
  const sessionMap = new Map<string, CoachingSession>();

  for (const seed of SWIMMERS) {
    const child: Child = { ...seed.child, instructorId: DEMO_INSTRUCTOR_ID, planId: `plan-${seed.child.id}` };
    const short = child.id.replace('child-', '');
    const sessionDate = (week: number) => cohortDate(week + seed.startOffsetWeeks);
    const history = HISTORY[child.id] ?? [];
    const currentWeek = history.length;

    children.push(child);
    parents.push({ ...seed.parent, childIds: [child.id] });
    plans.push({
      id: child.planId,
      childId: child.id,
      programmeName: 'Six-Week Front Crawl Development',
      strokeName: 'Front Crawl',
      format: seed.format,
      maxGroupSize: PROGRAMME.maxGroupSize,
      totalWeeks: PROGRAMME.totalWeeks,
      currentWeek,
      startDate: sessionDate(1),
      skillIds: [...SKILL_IDS],
      focusSkillIds: seed.focusSkillIds,
      nextPriority: seed.nextPriority,
      skillNotes: structuredClone(seed.skillNotes),
    });

    // Sessions. Swimmers who share a slot share a session record.
    for (let week = 1; week <= PROGRAMME.totalWeeks; week += 1) {
      const date = sessionDate(week);
      const key = `${date}|${seed.slot.start}`;
      const existing = sessionMap.get(key);
      if (existing) {
        existing.childIds.push(child.id);
      } else {
        sessionMap.set(key, {
          id: `ses-${short}-w${week}`,
          childIds: [child.id],
          instructorId: DEMO_INSTRUCTOR_ID,
          week,
          date,
          startTime: seed.slot.start,
          endTime: seed.slot.end,
          venue: PARTNER.venue,
          format: seed.format,
          status: week <= currentWeek ? 'completed' : 'upcoming',
        });
      }
    }

    // Assessment history, plus the achievements it implies (same rule as live assessments).
    const lastStatus = new Map<string, SkillStatus>();
    history.forEach((row, weekIndex) => {
      const week = weekIndex + 1;
      const date = sessionDate(week);
      SKILL_IDS.forEach((skillId, i) => {
        const status = CODE[row[i]];
        if (!status) return;
        assessments.push({
          id: `as-${short}-${skillId}-w${week}`,
          childId: child.id,
          skillId,
          status,
          week,
          date,
          instructorId: DEMO_INSTRUCTOR_ID,
          note: ASSESSMENT_NOTES[`${child.id}|${skillId}|${week}`],
        });
        if (status === 'pass' && lastStatus.get(skillId) !== 'pass') {
          const achievement = buildAchievement(child, getSkill(skillId)!, week, date, `ach-${short}-${skillId}`);
          achievements.push(achievement);
          notifications.push(
            achievementNotification(achievement, child.parentId, `${date}T11:20:00`, `nt-${short}-${skillId}`, {
              read: week < currentWeek,
              celebrate: false,
            }),
          );
        }
        lastStatus.set(skillId, status);
      });
    });

    for (const u of seed.updates) {
      const date = sessionDate(u.week);
      updates.push({
        id: `up-${short}-w${u.week}`,
        childId: child.id,
        instructorId: DEMO_INSTRUCTOR_ID,
        week: u.week,
        date,
        text: u.text,
        nextObjectives: u.nextObjectives,
      });
      notifications.push({
        id: `nt-${short}-update-w${u.week}`,
        parentId: child.parentId,
        childId: child.id,
        kind: 'update',
        title: 'New update from Hannah',
        body: u.text.length > 140 ? `${u.text.slice(0, 137).trimEnd()}...` : u.text,
        createdAt: `${date}T11:35:00`,
        read: u.week < currentWeek,
        link: '/parent/journey',
      });
    }
  }

  const sessions = [...sessionMap.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  );
  notifications.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    schemaVersion: SCHEMA_VERSION,
    anchorDate: anchor,
    parents,
    children,
    instructors: [
      {
        id: DEMO_INSTRUCTOR_ID,
        firstName: 'Hannah',
        lastName: 'Clarke',
        qualification: 'Level 2 swimming teacher',
        email: 'hannah.clarke@example.com',
        childIds: children.map((c) => c.id),
      },
    ],
    plans,
    sessions,
    assessments,
    updates,
    achievements,
    notifications,
  };
}
