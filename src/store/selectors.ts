/**
 * Read-side selectors.
 *
 * `selectParentScope` is the only way the parent experience reads data. It returns the linked
 * child's records and nothing else: no rosters, no other swimmers, and sessions with the
 * attendee list removed. In production this boundary must be enforced by the server; mirroring it
 * here keeps the UI honest about what a parent is allowed to see.
 */
import { CATEGORY_IDS, SKILLS } from '@/data/skills';
import { summariseByCategory, summariseProgress, type CategoryProgress, type ProgressSummary } from '@/lib/progress';
import type {
  Achievement,
  AppData,
  Child,
  CoachingSession,
  DevelopmentPlan,
  Instructor,
  Notification,
  Parent,
  ProgressUpdate,
  SkillAssessment,
  SwimmingSkill,
} from '@/types';

export type ParentSession = Omit<CoachingSession, 'childIds' | 'instructorId'>;

export interface ParentScope {
  parent: Parent;
  child: Child;
  plan: DevelopmentPlan;
  instructor: Pick<Instructor, 'firstName' | 'lastName' | 'qualification'>;
  skills: SwimmingSkill[];
  assessments: SkillAssessment[];
  sessions: ParentSession[];
  nextSession?: ParentSession;
  updates: ProgressUpdate[];
  latestUpdate?: ProgressUpdate;
  achievements: Achievement[];
  latestAchievement?: Achievement;
  notifications: Notification[];
  unreadCount: number;
  summary: ProgressSummary;
  categories: CategoryProgress[];
}

const byNewest = <T extends { week: number }>(a: T, b: T) => b.week - a.week;

export function planSkills(plan: DevelopmentPlan): SwimmingSkill[] {
  return SKILLS.filter((s) => plan.skillIds.includes(s.id));
}

export function selectParentScope(data: AppData, parentId: string, childId?: string): ParentScope | null {
  const parent = data.parents.find((p) => p.id === parentId);
  if (!parent) return null;
  const linkedId = childId && parent.childIds.includes(childId) ? childId : parent.childIds[0];
  const child = data.children.find((c) => c.id === linkedId);
  const plan = child && data.plans.find((p) => p.childId === child.id);
  const instructor = child && data.instructors.find((i) => i.id === child.instructorId);
  if (!child || !plan || !instructor) return null;

  const skills = planSkills(plan);
  const assessments = data.assessments.filter((a) => a.childId === child.id);
  const sessions: ParentSession[] = data.sessions
    .filter((s) => s.childIds.includes(child.id))
    .map(({ childIds: _childIds, instructorId: _instructorId, ...session }) => session);
  const updates = data.updates.filter((u) => u.childId === child.id);
  const achievements = data.achievements.filter((a) => a.childId === child.id);
  const notifications = data.notifications
    .filter((n) => n.parentId === parent.id && n.childId === child.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Later entries win ties, so the most recently written update or achievement is "latest".
  const latest = <T extends { week: number }>(items: T[]) => [...items].reverse().sort(byNewest)[0];

  return {
    parent,
    child,
    plan,
    instructor: {
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      qualification: instructor.qualification,
    },
    skills,
    assessments,
    sessions,
    nextSession: sessions.find((s) => s.status === 'upcoming'),
    updates,
    latestUpdate: latest(updates),
    achievements,
    latestAchievement: latest(achievements),
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    summary: summariseProgress(plan.skillIds, assessments, child.id),
    categories: summariseByCategory(skills, CATEGORY_IDS, assessments, child.id),
  };
}

export interface SwimmerOverview {
  child: Child;
  parent: Parent;
  plan: DevelopmentPlan;
  summary: ProgressSummary;
  nextSession?: CoachingSession;
  achievements: Achievement[];
}

export function selectSwimmer(data: AppData, childId: string): SwimmerOverview | null {
  const child = data.children.find((c) => c.id === childId);
  const plan = child && data.plans.find((p) => p.childId === child.id);
  const parent = child && data.parents.find((p) => p.id === child.parentId);
  if (!child || !plan || !parent) return null;
  return {
    child,
    parent,
    plan,
    summary: summariseProgress(plan.skillIds, data.assessments, child.id),
    nextSession: data.sessions.find((s) => s.status === 'upcoming' && s.childIds.includes(child.id)),
    achievements: data.achievements.filter((a) => a.childId === child.id),
  };
}

export function selectInstructorSwimmers(data: AppData, instructorId: string): SwimmerOverview[] {
  const instructor = data.instructors.find((i) => i.id === instructorId);
  if (!instructor) return [];
  return instructor.childIds
    .map((id) => selectSwimmer(data, id))
    .filter((s): s is SwimmerOverview => s !== null);
}

export const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`;
