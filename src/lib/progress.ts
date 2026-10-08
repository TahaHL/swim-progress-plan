/**
 * Assessment logic. Pure functions only: no React, no storage, no dates read from the clock.
 *
 * The rules, in plain English:
 *
 * 1. A swimmer's plan lists its development targets (skills). Progress is measured against
 *    those targets and nothing else. It is never a prediction about an official lesson stage.
 * 2. A skill's current status is its most recent assessment. A skill with no assessment is
 *    "not yet assessed": it is counted and shown separately and is left out of percentages, so
 *    an unassessed or newly added target can neither inflate nor deflate the figures.
 * 3. A target counts as ACHIEVED when its status is Consistent or Mastered.
 *       Targets achieved % = achieved targets / assessed targets x 100
 *       Skills mastered %  = mastered targets / assessed targets x 100
 *    Both are rounded to the nearest whole number. With no assessed targets there is no
 *    percentage at all (null), and the UI says so instead of showing 0%.
 */
import type { SkillAssessment, SkillCategoryId, SkillStatus, SwimmingSkill } from '@/types';

export const STATUS_ORDER: readonly SkillStatus[] = ['not_yet', 'developing', 'consistent', 'mastered'];

/** 0 for Not Yet Achieved up to 3 for Mastered. */
export const statusLevel = (status: SkillStatus): number => STATUS_ORDER.indexOf(status);

export const isAchieved = (status: SkillStatus | null | undefined): boolean =>
  status === 'consistent' || status === 'mastered';

/** All assessments for one skill, oldest first. Order within a week is the order they were recorded. */
export function skillHistory(
  assessments: readonly SkillAssessment[],
  childId: string,
  skillId: string,
): SkillAssessment[] {
  return assessments
    .map((a, index) => ({ a, index }))
    .filter(({ a }) => a.childId === childId && a.skillId === skillId)
    .sort((x, y) => x.a.week - y.a.week || x.index - y.index)
    .map(({ a }) => a);
}

/** The latest assessment for a skill, optionally as it stood at the end of a given week. */
export function latestAssessment(
  assessments: readonly SkillAssessment[],
  childId: string,
  skillId: string,
  upToWeek = Number.POSITIVE_INFINITY,
): SkillAssessment | undefined {
  let latest: SkillAssessment | undefined;
  for (const a of assessments) {
    if (a.childId !== childId || a.skillId !== skillId || a.week > upToWeek) continue;
    if (!latest || a.week >= latest.week) latest = a;
  }
  return latest;
}

export function currentStatus(
  assessments: readonly SkillAssessment[],
  childId: string,
  skillId: string,
  upToWeek?: number,
): SkillStatus | null {
  return latestAssessment(assessments, childId, skillId, upToWeek)?.status ?? null;
}

export interface ProgressSummary {
  /** Targets in the plan. */
  totalTargets: number;
  assessed: number;
  unassessed: number;
  counts: Record<SkillStatus, number>;
  /** Consistent + Mastered. */
  achieved: number;
  mastered: number;
  /** null when nothing has been assessed. */
  achievedPct: number | null;
  masteredPct: number | null;
}

const pct = (part: number, whole: number): number | null =>
  whole === 0 ? null : Math.round((part / whole) * 100);

export function summariseProgress(
  skillIds: readonly string[],
  assessments: readonly SkillAssessment[],
  childId: string,
  upToWeek?: number,
): ProgressSummary {
  const counts: Record<SkillStatus, number> = { not_yet: 0, developing: 0, consistent: 0, mastered: 0 };
  let assessed = 0;
  for (const skillId of skillIds) {
    const status = currentStatus(assessments, childId, skillId, upToWeek);
    if (status) {
      counts[status] += 1;
      assessed += 1;
    }
  }
  const achieved = counts.consistent + counts.mastered;
  return {
    totalTargets: skillIds.length,
    assessed,
    unassessed: skillIds.length - assessed,
    counts,
    achieved,
    mastered: counts.mastered,
    achievedPct: pct(achieved, assessed),
    masteredPct: pct(counts.mastered, assessed),
  };
}

export interface CategoryProgress extends ProgressSummary {
  categoryId: SkillCategoryId;
  /** Current status of each skill in the category, in library order. null = not yet assessed. */
  statuses: { skillId: string; status: SkillStatus | null }[];
}

export function summariseByCategory(
  skills: readonly SwimmingSkill[],
  categoryIds: readonly SkillCategoryId[],
  assessments: readonly SkillAssessment[],
  childId: string,
  upToWeek?: number,
): CategoryProgress[] {
  return categoryIds.map((categoryId) => {
    const inCategory = skills.filter((s) => s.categoryId === categoryId);
    const ids = inCategory.map((s) => s.id);
    return {
      categoryId,
      ...summariseProgress(ids, assessments, childId, upToWeek),
      statuses: ids.map((skillId) => ({
        skillId,
        status: currentStatus(assessments, childId, skillId, upToWeek),
      })),
    };
  });
}

export interface WeekAssessment {
  skillId: string;
  /** Status before this week. null = this was the first assessment. */
  from: SkillStatus | null;
  to: SkillStatus;
  changed: boolean;
  improved: boolean;
  assessment: SkillAssessment;
}

/** One entry per skill assessed in the given week, comparing with where the skill stood before. */
export function weekAssessments(
  assessments: readonly SkillAssessment[],
  childId: string,
  week: number,
  skillOrder: readonly string[],
): WeekAssessment[] {
  const result: WeekAssessment[] = [];
  for (const skillId of skillOrder) {
    const inWeek = assessments.filter(
      (a) => a.childId === childId && a.skillId === skillId && a.week === week,
    );
    const last = inWeek[inWeek.length - 1];
    if (!last) continue;
    const from = currentStatus(assessments, childId, skillId, week - 1);
    result.push({
      skillId,
      from,
      to: last.status,
      changed: from !== last.status,
      improved: from !== null && statusLevel(last.status) > statusLevel(from),
      assessment: last,
    });
  }
  return result;
}

/** Progress summary at the end of each completed week, for trend charts. */
export function weeklyTrend(
  skillIds: readonly string[],
  assessments: readonly SkillAssessment[],
  childId: string,
  completedWeeks: number,
): { week: number; summary: ProgressSummary }[] {
  return Array.from({ length: completedWeeks }, (_, i) => ({
    week: i + 1,
    summary: summariseProgress(skillIds, assessments, childId, i + 1),
  }));
}
