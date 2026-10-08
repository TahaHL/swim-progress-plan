/**
 * Write-side rules for the instructor experience. Pure functions: each takes the current data
 * and returns new data plus a description of what changed. A production backend would run the
 * same rules server-side behind an authenticated, role-checked endpoint.
 */
import { getSkill } from '@/data/skills';
import { summariseProgress, currentStatus, type ProgressSummary } from '@/lib/progress';
import { STATUS_META } from '@/lib/status';
import type {
  Achievement,
  AppData,
  Child,
  ISODate,
  ISODateTime,
  Notification,
  ProgressUpdate,
  SkillAssessment,
  SkillStatus,
  SwimmingSkill,
} from '@/types';

export type IdFactory = (prefix: string) => string;

export const randomId: IdFactory = (prefix) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export class AssessmentError extends Error {}

export function buildAchievement(
  child: Child,
  skill: SwimmingSkill,
  week: number,
  date: ISODate,
  id: string,
): Achievement {
  return {
    id,
    childId: child.id,
    skillId: skill.id,
    title: `${child.firstName} has mastered ${skill.achievementLabel}!`,
    message: `${skill.masteredSummary.replace('{name}', child.firstName)} Here's what we've achieved and what we're working on next.`,
    week,
    date,
  };
}

export function achievementNotification(
  achievement: Achievement,
  parentId: string,
  createdAt: ISODateTime,
  id: string,
  options: { read: boolean; celebrate: boolean },
): Notification {
  return {
    id,
    parentId,
    childId: achievement.childId,
    kind: 'achievement',
    title: `Great news! ${achievement.title}`,
    body: achievement.message,
    createdAt,
    read: options.read,
    celebrate: options.celebrate,
    link: `/parent/skills/${achievement.skillId}`,
    achievementId: achievement.id,
  };
}

export interface SkillChange {
  skillId: string;
  /** New status. Omit to leave the status as it is. */
  status?: SkillStatus;
  /** New parent-facing feedback. Omit to leave unchanged. */
  feedback?: string;
  /** New development target. Omit to leave unchanged. */
  nextTarget?: string;
}

export interface SaveAssessmentInput {
  childId: string;
  instructorId: string;
  changes: SkillChange[];
  date: ISODate;
  timestamp: ISODateTime;
}

export interface SaveAssessmentResult {
  data: AppData;
  statusChanges: { skillId: string; from: SkillStatus | null; to: SkillStatus }[];
  notesUpdated: number;
  newAchievements: Achievement[];
  removedAchievements: number;
  before: ProgressSummary;
  after: ProgressSummary;
}

/**
 * Records an assessment for one swimmer.
 *
 * 1. Each status that actually changed gets a new entry in the assessment history, against the
 *    swimmer's current programme week.
 * 2. Progress figures are derived from the history, so they update automatically.
 * 3. A skill that newly reaches Mastered creates an achievement and a parent notification.
 * 4. A skill moved back down from Mastered (a correction) withdraws its achievement, so the
 *    parent is never left with an achievement that no longer matches the assessment.
 * 5. Any other change produces one summary notification for the parent.
 */
export function saveAssessment(
  data: AppData,
  input: SaveAssessmentInput,
  makeId: IdFactory = randomId,
): SaveAssessmentResult {
  const child = data.children.find((c) => c.id === input.childId);
  const plan = data.plans.find((p) => p.childId === input.childId);
  if (!child || !plan) throw new AssessmentError('This swimmer does not have a development plan.');
  if (plan.currentWeek < 1) {
    throw new AssessmentError('Assessments open after the first session of the programme.');
  }

  const before = summariseProgress(plan.skillIds, data.assessments, child.id);
  const assessments: SkillAssessment[] = [...data.assessments];
  const skillNotes = { ...plan.skillNotes };
  let achievements = [...data.achievements];
  let notifications = [...data.notifications];
  const statusChanges: SaveAssessmentResult['statusChanges'] = [];
  const newAchievements: Achievement[] = [];
  const notedSkills: SwimmingSkill[] = [];
  let removedAchievements = 0;

  for (const change of input.changes) {
    const skill = getSkill(change.skillId);
    if (!skill || !plan.skillIds.includes(change.skillId)) {
      throw new AssessmentError('That skill is not part of this development plan.');
    }

    const from = currentStatus(assessments, child.id, skill.id);
    const feedback = change.feedback?.trim();
    const nextTarget = change.nextTarget?.trim();
    const existing = skillNotes[skill.id] ?? {};
    const feedbackChanged = feedback !== undefined && feedback !== (existing.feedback ?? '');
    const targetChanged = nextTarget !== undefined && nextTarget !== (existing.nextTarget ?? '');

    if (feedbackChanged || targetChanged) {
      skillNotes[skill.id] = {
        feedback: feedbackChanged ? feedback || undefined : existing.feedback,
        nextTarget: targetChanged ? nextTarget || undefined : existing.nextTarget,
      };
      notedSkills.push(skill);
    }

    if (change.status && change.status !== from) {
      assessments.push({
        id: makeId('as'),
        childId: child.id,
        skillId: skill.id,
        status: change.status,
        week: plan.currentWeek,
        date: input.date,
        instructorId: input.instructorId,
        note: feedbackChanged && feedback ? feedback : undefined,
      });
      statusChanges.push({ skillId: skill.id, from, to: change.status });

      if (change.status === 'mastered') {
        const achievement = buildAchievement(child, skill, plan.currentWeek, input.date, makeId('ach'));
        achievements.push(achievement);
        newAchievements.push(achievement);
        notifications.push(
          achievementNotification(achievement, child.parentId, input.timestamp, makeId('nt'), {
            read: false,
            celebrate: true,
          }),
        );
      } else if (from === 'mastered') {
        const withdrawn = new Set(
          achievements.filter((a) => a.childId === child.id && a.skillId === skill.id).map((a) => a.id),
        );
        removedAchievements += withdrawn.size;
        achievements = achievements.filter((a) => !withdrawn.has(a.id));
        notifications = notifications.filter((n) => !n.achievementId || !withdrawn.has(n.achievementId));
      }
    }
  }

  // One summary notification covering everything that is not already announced as an achievement.
  const otherChanges = statusChanges.filter((c) => c.to !== 'mastered');
  const notesOnly = notedSkills.filter((s) => !statusChanges.some((c) => c.skillId === s.id));
  if (otherChanges.length > 0 || notesOnly.length > 0) {
    const touched = [...otherChanges.map((c) => c.skillId), ...notesOnly.map((s) => s.id)];
    const lines = [
      ...otherChanges.map((c) => `${getSkill(c.skillId)!.name} is now ${STATUS_META[c.to].label}`),
      ...notesOnly.map((s) => `New feedback on ${s.name}`),
    ];
    const shown = lines.slice(0, 2).join('. ');
    const more = lines.length > 2 ? `, and ${lines.length - 2} more` : '';
    notifications.push({
      id: makeId('nt'),
      parentId: child.parentId,
      childId: child.id,
      kind: 'assessment',
      title:
        otherChanges.length > 0
          ? `${child.firstName}'s assessment has been updated`
          : `New instructor feedback for ${child.firstName}`,
      body: `${shown}${more}.`,
      createdAt: input.timestamp,
      read: false,
      link: touched.length === 1 ? `/parent/skills/${touched[0]}` : '/parent/skills',
    });
  }

  const next: AppData = {
    ...data,
    assessments,
    achievements,
    notifications,
    plans: data.plans.map((p) => (p.id === plan.id ? { ...p, skillNotes } : p)),
  };

  return {
    data: next,
    statusChanges,
    notesUpdated: notedSkills.length,
    newAchievements,
    removedAchievements,
    before,
    after: summariseProgress(plan.skillIds, assessments, child.id),
  };
}

export interface AddUpdateInput {
  childId: string;
  instructorId: string;
  text: string;
  nextObjectives: string[];
  date: ISODate;
  timestamp: ISODateTime;
}

/** Adds a written update for the parent, recorded against the swimmer's current week. */
export function addProgressUpdate(data: AppData, input: AddUpdateInput, makeId: IdFactory = randomId): AppData {
  const child = data.children.find((c) => c.id === input.childId);
  const plan = data.plans.find((p) => p.childId === input.childId);
  const instructor = data.instructors.find((i) => i.id === input.instructorId);
  const text = input.text.trim();
  if (!child || !plan || !instructor) throw new AssessmentError('This swimmer does not have a development plan.');
  if (!text) throw new AssessmentError('Write an update before sending it.');

  const update: ProgressUpdate = {
    id: makeId('up'),
    childId: child.id,
    instructorId: instructor.id,
    week: Math.max(plan.currentWeek, 1),
    date: input.date,
    text,
    nextObjectives: input.nextObjectives.map((o) => o.trim()).filter(Boolean),
  };
  const notification: Notification = {
    id: makeId('nt'),
    parentId: child.parentId,
    childId: child.id,
    kind: 'update',
    title: `New update from ${instructor.firstName}`,
    body: text.length > 140 ? `${text.slice(0, 137).trimEnd()}...` : text,
    createdAt: input.timestamp,
    read: false,
    link: '/parent/journey',
  };
  return { ...data, updates: [...data.updates, update], notifications: [...data.notifications, notification] };
}

export function setNextPriority(data: AppData, childId: string, nextPriority: string): AppData {
  const text = nextPriority.trim();
  if (!text) throw new AssessmentError('Describe the next coaching priority before saving.');
  return {
    ...data,
    plans: data.plans.map((p) => (p.childId === childId ? { ...p, nextPriority: text } : p)),
  };
}

export function markNotificationsRead(data: AppData, parentId: string, ids?: string[]): AppData {
  return {
    ...data,
    notifications: data.notifications.map((n) =>
      n.parentId === parentId && (!ids || ids.includes(n.id)) && (!n.read || n.celebrate)
        ? { ...n, read: true, celebrate: false }
        : n,
    ),
  };
}

/** The on-screen celebration has been shown; the notification itself stays unread. */
export function acknowledgeCelebration(data: AppData, notificationId: string): AppData {
  return {
    ...data,
    notifications: data.notifications.map((n) => (n.id === notificationId ? { ...n, celebrate: false } : n)),
  };
}
