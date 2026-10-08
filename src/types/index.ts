/**
 * Domain model for Swim Progress Plan.
 *
 * These interfaces describe the shape a production API would return. The prototype fills them
 * from a local mock repository (see src/data/repository.ts); nothing in the UI depends on where
 * the data comes from.
 */

export type Role = 'parent' | 'instructor';

/**
 * The four assessed levels, in ascending order. Together with "Not Assessed" they make the
 * programme's five assessment labels. "Not Assessed" is not a level a swimmer is given: it is the
 * absence of any assessment record, so it has no value here and is represented by null.
 */
export type SkillStatus = 'needs_practice' | 'fair' | 'good' | 'pass';

export type ProgrammeFormat = 'one_to_one' | 'small_group';

export type SkillCategoryId = 'body_position' | 'kicking' | 'arms' | 'breathing' | 'coordination';

export type AvatarTone = 'aqua' | 'ocean' | 'buoy' | 'deep' | 'slate';

/** ISO calendar date, e.g. "2026-10-03". */
export type ISODate = string;
/** ISO date-time, e.g. "2026-10-03T11:05:00". */
export type ISODateTime = string;

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** A parent account can be linked to several children. The demo parent has one. */
  childIds: string[];
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  /** Stage in the child's regular lessons. Set by the lesson provider, never by this platform. */
  lessonStage: string;
  parentId: string;
  instructorId: string;
  planId: string;
  avatarTone: AvatarTone;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  qualification: string;
  email: string;
  childIds: string[];
}

export interface SkillCategory {
  id: SkillCategoryId;
  name: string;
  summary: string;
}

export interface SkillVideo {
  id: string;
  kind: 'correct' | 'mistakes' | 'notice';
  title: string;
  caption: string;
  /** Planned running time, shown on the placeholder. */
  plannedDuration: string;
  /** What the viewer should look for in the footage. */
  lookFor: string[];
  /** Set these two fields to replace the placeholder with real footage. */
  src?: string;
  poster?: string;
}

/** Reference content for one skill. Shared by every swimmer; holds no personal data. */
export interface SwimmingSkill {
  id: string;
  stroke: 'front_crawl';
  categoryId: SkillCategoryId;
  name: string;
  /** One-line plain-English description. */
  summary: string;
  objective: string;
  whyItMatters: string;
  successCriteria: string[];
  /** Sentence used when the skill is marked Pass. "{name}" is replaced with the swimmer's first name. */
  passSummary: string;
  videos: SkillVideo[];
}

/** One recorded assessment. The list of these is the assessment history; the latest one is current. */
export interface SkillAssessment {
  id: string;
  childId: string;
  skillId: string;
  /**
   * The level recorded. null records that the instructor set the skill back to Not Assessed:
   * the earlier assessments stay in the history, but the skill no longer has a current level.
   */
  status: SkillStatus | null;
  /** Programme week the assessment belongs to (1-based). */
  week: number;
  date: ISODate;
  instructorId: string;
  note?: string;
}

/** Instructor commentary for one skill in one swimmer's plan. */
export interface SkillPlanNote {
  feedback?: string;
  nextTarget?: string;
}

export interface DevelopmentPlan {
  id: string;
  childId: string;
  programmeName: string;
  strokeName: string;
  format: ProgrammeFormat;
  maxGroupSize: number;
  totalWeeks: number;
  /** Last completed programme week. 0 means the programme has not started. */
  currentWeek: number;
  startDate: ISODate;
  /** The development targets in this plan. Progress is only ever measured against these. */
  skillIds: string[];
  focusSkillIds: string[];
  nextPriority: string;
  skillNotes: Record<string, SkillPlanNote>;
}

export interface CoachingSession {
  id: string;
  /** Swimmers attending. Never exposed in the parent experience. */
  childIds: string[];
  instructorId: string;
  week: number;
  date: ISODate;
  startTime: string;
  endTime: string;
  venue: string;
  format: ProgrammeFormat;
  status: 'completed' | 'upcoming';
}

/** A written update from the instructor to the parent, recorded against a programme week. */
export interface ProgressUpdate {
  id: string;
  childId: string;
  instructorId: string;
  week: number;
  date: ISODate;
  text: string;
  nextObjectives: string[];
}

export interface Achievement {
  id: string;
  childId: string;
  skillId: string;
  title: string;
  message: string;
  week: number;
  date: ISODate;
}

export interface Notification {
  id: string;
  parentId: string;
  childId: string;
  kind: 'achievement' | 'update' | 'assessment';
  title: string;
  body: string;
  createdAt: ISODateTime;
  read: boolean;
  /** In-app route to open when the notification is selected. */
  link: string;
  achievementId?: string;
  /** True for achievements earned during this demo that have not been celebrated on screen yet. */
  celebrate?: boolean;
}

/** Everything the mock repository stores. A production backend would serve these per request. */
export interface AppData {
  schemaVersion: number;
  /** Date of the most recent completed session. Demo dates are kept relative to this. */
  anchorDate: ISODate;
  parents: Parent[];
  children: Child[];
  instructors: Instructor[];
  plans: DevelopmentPlan[];
  sessions: CoachingSession[];
  assessments: SkillAssessment[];
  updates: ProgressUpdate[];
  achievements: Achievement[];
  notifications: Notification[];
}
