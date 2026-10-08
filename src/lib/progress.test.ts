import { describe, expect, it } from 'vitest';
import { buildSeed } from '@/data/seed';
import { rebase } from '@/data/repository';
import { SKILL_IDS } from '@/data/skills';
import { AssessmentError, addProgressUpdate, saveAssessment } from '@/lib/assessmentService';
import { STATUS_ORDER, currentStatus, isPass, summariseProgress, weekAssessments, weeklyTrend } from '@/lib/progress';
import { DEFINITIONS_CONFIRMED, NOT_ASSESSED, STATUS_META, statusLabel } from '@/lib/status';
import { selectParentScope } from '@/store/selectors';
import type { SkillAssessment, SkillStatus } from '@/types';

const TODAY = '2026-10-08';
const OLIVER = 'child-oliver';
let n = 0;
const ids = (prefix: string) => `${prefix}_test${++n}`;
const save = (data: ReturnType<typeof buildSeed>, changes: Parameters<typeof saveAssessment>[1]['changes'], childId = OLIVER) =>
  saveAssessment(data, { childId, instructorId: 'inst-hannah', changes, date: TODAY, timestamp: `${TODAY}T12:00:00` }, ids);
const mk = (skillId: string, status: SkillStatus, week = 1): SkillAssessment => ({
  id: `${skillId}${week}`, childId: 'x', skillId, status, week, date: TODAY, instructorId: 'i',
});

describe('the five assessment labels', () => {
  it('uses the confirmed labels in the confirmed order, with Not Assessed first', () => {
    expect([statusLabel(null), ...STATUS_ORDER.map((s) => STATUS_META[s].label)]).toEqual([
      'Not Assessed',
      'Needs Practice',
      'Fair',
      'Good',
      'Pass',
    ]);
  });

  it('treats Not Assessed as having no current level, not as a level', () => {
    expect(STATUS_ORDER as readonly string[]).not.toContain('not_assessed');
    expect(currentStatus([], 'x', 'a')).toBeNull();
    expect(statusLabel(currentStatus([], 'x', 'a'))).toBe(NOT_ASSESSED.label);
  });

  it('keeps the level descriptions flagged as unconfirmed', () => {
    expect(DEFINITIONS_CONFIRMED).toBe(false);
  });
});

describe('progress calculations', () => {
  it('returns no percentage when nothing is assessed', () => {
    const s = summariseProgress(['a', 'b'], [], 'x');
    expect(s).toEqual({
      totalTargets: 2,
      assessed: 0,
      notAssessed: 2,
      counts: { needs_practice: 0, fair: 0, good: 0, pass: 0 },
      passed: 0,
      passPct: null,
    });
  });

  it('counts only Pass, and leaves Not Assessed skills out of the denominator', () => {
    const s = summariseProgress(
      ['a', 'b', 'c', 'd', 'e'],
      [mk('a', 'pass'), mk('b', 'good'), mk('c', 'fair'), mk('d', 'needs_practice')],
      'x',
    );
    expect(s.assessed).toBe(4);
    expect(s.notAssessed).toBe(1);
    expect(s.passed).toBe(1);
    expect(s.passPct).toBe(25);
  });

  it('never counts Good as Pass', () => {
    expect(isPass('good')).toBe(false);
    expect(isPass('pass')).toBe(true);
    expect(isPass(null)).toBe(false);
    const allGood = summariseProgress(['a', 'b', 'c'], [mk('a', 'good'), mk('b', 'good'), mk('c', 'good')], 'x');
    expect(allGood).toMatchObject({ assessed: 3, passed: 0, passPct: 0 });
  });

  it('reports counts only: no score, average or weighting derived from the labels', () => {
    const s = summariseProgress(['a', 'b'], [mk('a', 'pass'), mk('b', 'needs_practice')], 'x');
    expect(Object.keys(s).sort()).toEqual(['assessed', 'counts', 'notAssessed', 'passPct', 'passed', 'totalTargets']);
  });

  it('uses the most recent assessment as the current level', () => {
    const list = [mk('a', 'fair', 1), { ...mk('a', 'good', 2), id: 'a2a' }, { ...mk('a', 'pass', 2), id: 'a2b' }];
    expect(currentStatus(list, 'x', 'a')).toBe('pass');
    expect(currentStatus(list, 'x', 'a', 1)).toBe('fair');
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

  it('gives Oliver 3 skills marked Pass of 16 assessed, with 1 Not Assessed', () => {
    const s = summariseProgress(plan.skillIds, data.assessments, OLIVER);
    expect(s).toMatchObject({ totalTargets: 17, assessed: 16, notAssessed: 1, passed: 3, passPct: 19 });
    expect(s.counts).toEqual({ needs_practice: 2, fair: 6, good: 5, pass: 3 });
  });

  it('shows a consistent trend across the three completed weeks', () => {
    const trend = weeklyTrend(plan.skillIds, data.assessments, OLIVER, 3).map((t) => [t.summary.passed, t.summary.assessed]);
    expect(trend).toEqual([[0, 16], [2, 16], [3, 16]]);
  });

  it('has exactly one achievement per skill marked Pass, each saying it is not a stage award', () => {
    const achievements = data.achievements.filter((a) => a.childId === OLIVER);
    expect(achievements.map((a) => a.skillId).sort()).toEqual(['bp-streamline', 'kick-alternating', 'kick-rhythm']);
    expect(achievements.every((a) => a.message.includes('not a swimming stage award'))).toBe(true);
    const scope = selectParentScope(data, 'parent-sarah')!;
    expect(scope.latestAchievement?.title).toBe('Oliver has reached Pass in Consistent kicking rhythm');
    expect(scope.unreadCount).toBe(2);
  });

  it('records side breathing as Needs Practice in week 1 and Fair in week 3', () => {
    expect(currentStatus(data.assessments, OLIVER, 'br-side', 1)).toBe('needs_practice');
    expect(currentStatus(data.assessments, OLIVER, 'br-side', 3)).toBe('fair');
    const week3 = weekAssessments(data.assessments, OLIVER, 3, SKILL_IDS).find((w) => w.skillId === 'br-side')!;
    expect(week3).toMatchObject({ from: 'needs_practice', to: 'fair', changed: true, improved: true });
  });

  it('contains no leftover labels from the old four-level model', () => {
    expect(JSON.stringify(data)).not.toMatch(/not_yet|developing"|"consistent"|mastered|Mastered|Not Yet Achieved/);
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
  it('moving a skill to Good updates the history and the parent, but not the Pass count', () => {
    const data = buildSeed(TODAY);
    const result = save(data, [{ skillId: 'br-side', status: 'good' }]);
    expect(result.statusChanges).toEqual([{ skillId: 'br-side', from: 'fair', to: 'good' }]);
    expect(result.before).toMatchObject({ passed: 3, passPct: 19 });
    expect(result.after).toMatchObject({ passed: 3, passPct: 19 });
    expect(result.after.counts.good).toBe(6);
    expect(result.newAchievements).toHaveLength(0);
    expect(result.data.assessments).toHaveLength(data.assessments.length + 1);
    const scope = selectParentScope(result.data, 'parent-sarah')!;
    expect(scope.notifications[0]).toMatchObject({ kind: 'assessment', read: false, link: '/parent/skills/br-side' });
    expect(scope.notifications[0].body).toBe('Side breathing is now Good.');
    expect(data.assessments).toHaveLength(buildSeed(TODAY).assessments.length); // input not mutated
  });

  it('creates one achievement and one celebration when a skill newly reaches Pass', () => {
    const result = save(buildSeed(TODAY), [{ skillId: 'br-side', status: 'pass' }]);
    expect(result.newAchievements.map((a) => a.title)).toEqual(['Oliver has reached Pass in Side breathing']);
    expect(result.after).toMatchObject({ passed: 4, passPct: 25 });
    const scope = selectParentScope(result.data, 'parent-sarah')!;
    expect(scope.notifications.filter((x) => x.celebrate)).toHaveLength(1);
    expect(scope.latestAchievement?.skillId).toBe('br-side');
    // Saving the same level again changes nothing: no duplicate achievement or notification.
    const again = save(result.data, [{ skillId: 'br-side', status: 'pass' }]);
    expect(again.statusChanges).toHaveLength(0);
    expect(again.data.achievements).toHaveLength(result.data.achievements.length);
    expect(again.data.notifications).toHaveLength(result.data.notifications.length);
  });

  it('withdraws the achievement if a Pass is corrected downwards', () => {
    const passed = save(buildSeed(TODAY), [{ skillId: 'br-side', status: 'pass' }]);
    const corrected = save(passed.data, [{ skillId: 'br-side', status: 'good' }]);
    expect(corrected.removedAchievements).toBe(1);
    expect(corrected.data.achievements.some((a) => a.skillId === 'br-side')).toBe(false);
    expect(corrected.data.notifications.some((x) => x.kind === 'achievement' && x.link.endsWith('br-side'))).toBe(false);
  });

  it('a first assessment moves a skill out of Not Assessed and into the denominator', () => {
    const result = save(buildSeed(TODAY), [{ skillId: 'co-distance', status: 'fair' }]);
    expect(result.statusChanges[0].from).toBeNull();
    expect(result.before).toMatchObject({ assessed: 16, notAssessed: 1 });
    expect(result.after).toMatchObject({ assessed: 17, notAssessed: 0, passed: 3, passPct: 18 });
  });

  it('setting a skill back to Not Assessed keeps its history and removes it from the denominator', () => {
    const data = buildSeed(TODAY);
    const result = save(data, [{ skillId: 'arm-alternating', status: null }]);
    expect(result.statusChanges).toEqual([{ skillId: 'arm-alternating', from: 'good', to: null }]);
    expect(result.before).toMatchObject({ assessed: 16, notAssessed: 1, passed: 3, passPct: 19 });
    expect(result.after).toMatchObject({ assessed: 15, notAssessed: 2, passed: 3, passPct: 20 });
    expect(result.after.counts.good).toBe(4);
    expect(currentStatus(result.data.assessments, OLIVER, 'arm-alternating')).toBeNull();
    // The earlier assessments are still there, followed by the Not Assessed record.
    const history = result.data.assessments.filter((a) => a.childId === OLIVER && a.skillId === 'arm-alternating');
    expect(history.map((a) => a.status)).toEqual(['good', 'good', null]);
    expect(selectParentScope(result.data, 'parent-sarah')!.notifications[0].body).toBe('Alternating arm action is now Not Assessed.');
    // It can be assessed again afterwards.
    const again = save(result.data, [{ skillId: 'arm-alternating', status: 'fair' }]);
    expect(again.after).toMatchObject({ assessed: 16, notAssessed: 1 });
  });

  it('setting a Not Assessed skill to Not Assessed changes nothing', () => {
    const data = buildSeed(TODAY);
    const result = save(data, [{ skillId: 'co-distance', status: null }]);
    expect(result.statusChanges).toHaveLength(0);
    expect(result.data.assessments).toHaveLength(data.assessments.length);
    expect(result.data.notifications).toHaveLength(data.notifications.length);
  });

  it('setting a Pass back to Not Assessed withdraws its achievement', () => {
    const result = save(buildSeed(TODAY), [{ skillId: 'bp-streamline', status: null }]);
    expect(result.removedAchievements).toBe(1);
    expect(result.after).toMatchObject({ assessed: 15, passed: 2 });
    expect(result.data.achievements.some((a) => a.childId === OLIVER && a.skillId === 'bp-streamline')).toBe(false);
  });

  it('saves feedback without a level change and tells the parent', () => {
    const result = save(buildSeed(TODAY), [{ skillId: 'br-side', feedback: 'Much smoother today.' }]);
    expect(result.statusChanges).toHaveLength(0);
    expect(result.notesUpdated).toBe(1);
    expect(result.data.plans.find((p) => p.childId === OLIVER)!.skillNotes['br-side'].feedback).toBe('Much smoother today.');
    expect(selectParentScope(result.data, 'parent-sarah')!.notifications[0].title).toBe('New instructor feedback for Oliver');
  });

  it('refuses assessments before the programme has started, and skills outside the plan', () => {
    expect(() => save(buildSeed(TODAY), [{ skillId: 'br-side', status: 'fair' }], 'child-leo')).toThrow(AssessmentError);
    expect(() => save(buildSeed(TODAY), [{ skillId: 'butterfly-kick', status: 'fair' }])).toThrow(AssessmentError);
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
