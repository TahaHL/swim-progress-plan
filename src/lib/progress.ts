/**
 * Assessment logic. Pure functions only: no React, no storage, no dates read from the clock.
 *
 * The rules, in plain English:
 *
 * 1. A swimmer's plan lists its development targets (skills). Progress is measured against
 *    those targets and nothing else. It is never a statement about an official swimming stage:
 *    passing individual skills here does not mean a stage has been passed.
 * 2. There are five labels. Four are assessed levels, in order: Needs Practice, Fair, Good, Pass.
 *    The fifth, Not Assessed, means no assessment has been recorded. It is not a failed attempt,
 *    it is not an attempted skill, and it never appears in a denominator.
 * 3. A skill's current level is its most recent assessment.
 * 4. The one figure the app reports is a count:
 *       Skills marked Pass: X of Y assessed skills   (and X / Y as a percentage)
 *    Not Assessed skills are left out of Y and their count is shown separately. With nothing
 *    assessed there is no percentage at all (null), and the UI says so instead of showing 0%.
 * 5. The levels are ordered but they are not numbers. Nothing here averages them, scores them
 *    or treats the gaps between them as equal. "Moved up" means only that the later label comes
 *    after the earlier one in the confirmed order.
 *
 * OPEN DECISION (programme owner): whether Good should also count towards a target being
 * achieved. Until that is decided, only Pass is counted, and Good is never treated as Pass.
 */
import type { SkillAssessment, SkillCategoryId, SkillStatus, SwimmingSkill } from '@/types';

export const STATUS_ORDER: readonly SkillStatus[] = ['needs_practice', 'fair', 'good', 'pass'];

/**
 * Position in the confirmed order, for comparing two levels (earlier or later). An ordinal, not a
 * score: do not add, average or subtract these to produce a grade.
 */
export const statusLevel = (status: SkillStatus): number => STATUS_ORDER.indexOf(status);

/** True only for Pass. Good is deliberately not included; see the open decision above. */
export const isPass = (status: SkillStatus | null | undefined): boolean => status === 'pass';

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
  /** Skills with at least one assessment. The denominator. */
  assessed: number;
  /** Skills with no assessment recorded. Reported separately, never counted as attempted. */
  notAssessed: number;
  /** How many assessed skills currently sit at each level. */
  counts: Record<SkillStatus, number>;
  /** Skills currently marked Pass. */
  passed: number;
  /** passed / assessed x 100, rounded. null when nothing has been assessed. */
  passPct: number | null;
}

const pct = (part: number, whole: number): number | null =>
  whole === 0 ? null : Math.round((part / whole) * 100);

export function summariseProgress(
  skillIds: readonly string[],
  assessments: readonly SkillAssessment[],
  childId: string,
  upToWeek?: number,
): ProgressSummary {
  const counts: Record<SkillStatus, number> = { needs_practice: 0, fair: 0, good: 0, pass: 0 };
  let assessed = 0;
  for (const skillId of skillIds) {
    const status = currentStatus(assessments, childId, skillId, upToWeek);
    if (status) {
      counts[status] += 1;
      assessed += 1;
    }
  }
  return {
    totalTargets: skillIds.length,
    assessed,
    notAssessed: skillIds.length - assessed,
    counts,
    passed: counts.pass,
    passPct: pct(counts.pass, assessed),
  };
}

export interface CategoryProgress extends ProgressSummary {
  categoryId: SkillCategoryId;
  /** Current level of each skill in the category, in library order. null = Not Assessed. */
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
