import { describe, expect, it } from 'vitest';
import { buildSeed } from '@/data/seed';
import { rebase } from '@/data/repository';
import { SKILL_IDS } from '@/data/skills';
import { AssessmentError, addProgressUpdate, saveAssessment } from '@/lib/assessmentService';
import { currentStatus, summariseProgress, weekAssessments, weeklyTrend } from '@/lib/progress';
import { selectParentScope } from '@/store/selectors';
import type { SkillAssessment } from '@/types';

const TODAY = '2026-10-08';
const OLIVER = 'child-oliver';
let n = 0;
const ids = (prefix: string) => `${prefix}_test${++n}`;
const save = (data: ReturnType<typeof buildSeed>, changes: Parameters<typeof saveAssessment>[1]['changes'], childId = OLIVER) =>
  saveAssessment(data, { childId, instructorId: 'inst-hannah', changes, date: TODAY, timestamp: `${TODAY}T12:00:00` }, ids);

describe('progress calculations', () => {
  it('returns no percentage when nothing is assessed', () => {
    const s = summariseProgress(['a', 'b'], [], 'x');
    expect(s).toMatchObject({ totalTargets: 2, assessed: 0, unassessed: 2, achievedPct: null, masteredPct: null });
  });

  it('counts Consistent and Mastered as achieved, and leaves unassessed skills out of the percentage', () => {
    const mk = (skillId: string, status: SkillAssessment['status'], week = 1): SkillAssessment => ({
      id: `${skillId}${week}`, childId: 'x', skillId, status, week, date: TODAY, instructorId: 'i',
    });
    const s = summariseProgress(['a', 'b', 'c', 'd', 'e'], [mk('a', 'mastered'), mk('b', 'consistent'), mk('c', 'developing'), mk('d', 'not_yet')], 'x');
    expect(s.assessed).toBe(4);
    expect(s.unassessed).toBe(1);
    expect(s.achieved).toBe(2);
    expect(s.achievedPct).toBe(50);
    expect(s.masteredPct).toBe(25);
  });

  it('uses the most recent assessment as the current status', () => {
    const list: SkillAssessment[] = [
      { id: '1', childId: 'x', skillId: 'a', status: 'developing', week: 1, date: TODAY, instructorId: 'i' },
      { id: '2', childId: 'x', skillId: 'a', status: 'consistent', week: 2, date: TODAY, instructorId: 'i' },
      { id: '3', childId: 'x', skillId: 'a', status: 'mastered', week: 2, date: TODAY, instructorId: 'i' },
    ];
    expect(currentStatus(list, 'x', 'a')).toBe('mastered');
    expect(currentStatus(list, 'x', 'a', 1)).toBe('developing');
    expect(currentStatus(list, 'x', 'b')).toBeNull();
  });
});

describe('demo data', () => {
  const data = buildSeed(TODAY);
  const plan = data.plans.find((p) => p.childId === OLIVER)!;

  it('is dated relative to today: week 3 was last Saturday, week 4 is next Saturday', () => {
    expect(data.anchorDate).toBe('2026-10-03');
    const sessions = data.sessions.filter((s) => s.childIds.includes(OLIVER));
    expect(sessions.map((s) => s.date)).toEqual(['2026-09-19', '2026-09-26', '2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24']);
    expect(sessions.filter((s) => s.status === 'completed')).toHaveLength(3);
  });

  it("gives Oliver 8 of 16 assessed targets achieved and 3 mastered", () => {
    const s = summariseProgress(plan.skillIds, data.assessments, OLIVER);
    expect(s).toMatchObject({ totalTargets: 17, assessed: 16, unassessed: 1, achieved: 8, mastered: 3, achievedPct: 50, masteredPct: 19 });
    expect(s.counts).toEqual({ not_yet: 2, developing: 6, consistent: 5, mastered: 3 });
  });

  it('shows a consistent trend across the three completed weeks', () => {
    const trend = weeklyTrend(plan.skillIds, data.assessments, OLIVER, 3).map((t) => t.summary.achievedPct);
    expect(trend).toEqual([19, 38, 50]);
  });

  it('has exactly one achievement per mastered skill, and the latest is the flutter kick', () => {
    const achievements = data.achievements.filter((a) => a.childId === OLIVER);
    expect(achievements.map((a) => a.skillId).sort()).toEqual(['bp-streamline', 'kick-alternating', 'kick-rhythm']);
    const scope = selectParentScope(data, 'parent-sarah')!;
    expect(scope.latestAchievement?.title).toBe('Oliver has mastered consistent flutter kicking!');
    expect(scope.unreadCount).toBe(2);
  });

  it('records side breathing as Not Yet Achieved in week 1 and Developing in week 3', () => {
    expect(currentStatus(data.assessments, OLIVER, 'br-side', 1)).toBe('not_yet');
    expect(currentStatus(data.assessments, OLIVER, 'br-side', 3)).toBe('developing');
    const week3 = weekAssessments(data.assessments, OLIVER, 3, SKILL_IDS).find((w) => w.skillId === 'br-side')!;
    expect(week3).toMatchObject({ from: 'not_yet', to: 'developing', changed: true, improved: true });
  });

  it('never exposes other swimmers or rosters through the parent scope', () => {
    const scope = selectParentScope(data, 'parent-sarah')!;
    expect(JSON.stringify(scope)).not.toMatch(/Isla|Noah|Amelia|Leo|childIds":\["child-oliver","/);
    expect(scope.sessions.every((s) => !('childIds' in s))).toBe(true);
    expect(scope.assessments.every((a) => a.childId === OLIVER)).toBe(true);
  });

  it('moves every date forward when the demo is reopened in a later week', () => {
    const later = rebase(data, '2026-10-22');
    expect(later.anchorDate).toBe('2026-10-17');
    expect(later.sessions.find((s) => s.childIds.includes(OLIVER) && s.week === 4)!.date).toBe('2026-10-24');
    expect(rebase(data, '2026-10-09')).toBe(data);
  });
});

describe('saving an assessment', () => {
  it('updates the history, the figures and the parent notification', () => {
    const data = buildSeed(TODAY);
    const result = save(data, [{ skillId: 'br-side', status: 'consistent' }]);
    expect(result.statusChanges).toEqual([{ skillId: 'br-side', from: 'developing', to: 'consistent' }]);
    expect(result.before.achievedPct).toBe(50);
    expect(result.after.achievedPct).toBe(56);
    expect(result.newAchievements).toHaveLength(0);
    expect(result.data.assessments).toHaveLength(data.assessments.length + 1);
    const scope = selectParentScope(result.data, 'parent-sarah')!;
    expect(scope.notifications[0]).toMatchObject({ kind: 'assessment', read: false, link: '/parent/skills/br-side' });
    expect(scope.notifications[0].body).toBe('Side breathing is now Consistent.');
    expect(data.assessments).toHaveLength(buildSeed(TODAY).assessments.length); // input not mutated
  });

  it('creates one achievement and one celebration when a skill newly reaches Mastered', () => {
    const result = save(buildSeed(TODAY), [{ skillId: 'br-side', status: 'mastered' }]);
    expect(result.newAchievements.map((a) => a.title)).toEqual(['Oliver has mastered side breathing!']);
    expect(result.after.mastered).toBe(4);
    const scope = selectParentScope(result.data, 'parent-sarah')!;
    expect(scope.notifications.filter((x) => x.celebrate)).toHaveLength(1);
    expect(scope.latestAchievement?.skillId).toBe('br-side');
    // Saving the same state again changes nothing.
    const again = save(result.data, [{ skillId: 'br-side', status: 'mastered' }]);
    expect(again.statusChanges).toHaveLength(0);
    expect(again.data.achievements).toHaveLength(result.data.achievements.length);
  });

  it('withdraws the achievement if a Mastered skill is corrected downwards', () => {
    const mastered = save(buildSeed(TODAY), [{ skillId: 'br-side', status: 'mastered' }]);
    const corrected = save(mastered.data, [{ skillId: 'br-side', status: 'consistent' }]);
    expect(corrected.removedAchievements).toBe(1);
    expect(corrected.data.achievements.some((a) => a.skillId === 'br-side')).toBe(false);
    expect(corrected.data.notifications.some((x) => x.kind === 'achievement' && x.link.endsWith('br-side'))).toBe(false);
  });

  it('includes a first assessment of a previously unassessed skill in the figures', () => {
    const result = save(buildSeed(TODAY), [{ skillId: 'co-distance', status: 'developing' }]);
    expect(result.statusChanges[0].from).toBeNull();
    expect(result.after).toMatchObject({ assessed: 17, unassessed: 0, achieved: 8, achievedPct: 47 });
  });

  it('saves feedback without a status change and tells the parent', () => {
    const result = save(buildSeed(TODAY), [{ skillId: 'br-side', feedback: 'Much smoother today.' }]);
    expect(result.statusChanges).toHaveLength(0);
    expect(result.notesUpdated).toBe(1);
    expect(result.data.plans.find((p) => p.childId === OLIVER)!.skillNotes['br-side'].feedback).toBe('Much smoother today.');
    expect(selectParentScope(result.data, 'parent-sarah')!.notifications[0].title).toBe('New instructor feedback for Oliver');
  });

  it('refuses assessments before the programme has started, and skills outside the plan', () => {
    expect(() => save(buildSeed(TODAY), [{ skillId: 'br-side', status: 'developing' }], 'child-leo')).toThrow(AssessmentError);
    expect(() => save(buildSeed(TODAY), [{ skillId: 'butterfly-kick', status: 'developing' }])).toThrow(AssessmentError);
  });

  it('adds a written update as the latest instructor update', () => {
    const data = addProgressUpdate(
      buildSeed(TODAY),
      { childId: OLIVER, instructorId: 'inst-hannah', text: '  Great focus today.  ', nextObjectives: ['Long front arm', ' '], date: TODAY, timestamp: `${TODAY}T12:00:00` },
      ids,
    );
    const scope = selectParentScope(data, 'parent-sarah')!;
    expect(scope.latestUpdate).toMatchObject({ text: 'Great focus today.', week: 3, nextObjectives: ['Long front arm'] });
    expect(scope.unreadCount).toBe(3);
  });
});
