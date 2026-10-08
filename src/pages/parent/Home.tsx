import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Award, CalendarDays, ChevronRight, Target, TrendingUp } from 'lucide-react';
import { Medal } from '@/components/skills/AchievementCelebration';
import { HowCalculated, ScopeNote } from '@/components/skills/HowCalculated';
import { JourneyLane } from '@/components/skills/JourneyLane';
import { ProgressRing, useCountUp } from '@/components/ui/ProgressRing';
import { SkillSegments, StatusBadge } from '@/components/ui/Status';
import { Avatar, cx } from '@/components/ui/primitives';
import { PROGRAMME_PHASES } from '@/config/demo';
import { getCategory, getSkill } from '@/data/skills';
import { daysBetween, formatMedium, today } from '@/lib/dates';
import { formatName, plural } from '@/lib/format';
import { STATUS_ORDER, currentStatus, isPass, statusLevel, weekAssessments, type CategoryProgress } from '@/lib/progress';
import { STATUS_META } from '@/lib/status';
import { useParentScope } from '@/store/AppStore';
import { fullName } from '@/store/selectors';
import type { SkillStatus, SwimmingSkill } from '@/types';

function Fact({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cx('min-w-0', wide && 'col-span-2')}>
      <dt className="text-sm text-white/65">{label}</dt>
      <dd className="mt-0.5 font-display leading-snug font-medium">{children}</dd>
    </div>
  );
}

function categoryState(category: CategoryProgress, focusIds: string[]): { label: string; className: string } {
  if (category.assessed === 0) return { label: 'Not Assessed', className: 'text-ink-3' };
  if (category.passed === category.totalTargets) return { label: 'All marked Pass', className: 'text-st-good-ink' };
  if (category.statuses.some((s) => focusIds.includes(s.skillId))) return { label: 'Current focus', className: 'text-aqua-dark' };
  return { label: 'In progress', className: 'text-ink-2' };
}

export default function Home() {
  const scope = useParentScope();
  const { parent, child, plan, summary, categories, nextSession, latestUpdate, latestAchievement, instructor, assessments } = scope;
  const shownPct = useCountUp(summary.passPct ?? 0);
  const nextPhase = PROGRAMME_PHASES.find((p) => p.week === plan.currentWeek + 1);
  const currentPhase = PROGRAMME_PHASES.find((p) => p.week === plan.currentWeek);
  const improved = plan.currentWeek > 0 ? weekAssessments(assessments, child.id, plan.currentWeek, plan.skillIds).filter((w) => w.improved) : [];
  // Skills the instructor has chosen to concentrate on that are not yet marked Pass; failing that,
  // the assessed skills at the earliest levels. Ordering by level is a comparison, not a score.
  const focusIds =
    plan.focusSkillIds.length > 0
      ? plan.focusSkillIds
      : scope.skills
          .map((skill) => ({ id: skill.id, status: currentStatus(assessments, child.id, skill.id) }))
          .filter((x): x is { id: string; status: SkillStatus } => x.status !== null && !isPass(x.status))
          .sort((a, b) => statusLevel(a.status) - statusLevel(b.status))
          .slice(0, 3)
          .map((x) => x.id);
  const needsWork = focusIds
    .map((id) => ({
      skill: getSkill(id),
      status: currentStatus(assessments, child.id, id),
      feedback: plan.skillNotes[id]?.feedback,
      nextTarget: plan.skillNotes[id]?.nextTarget,
    }))
    .filter((x): x is { skill: SwimmingSkill; status: SkillStatus | null; feedback: string | undefined; nextTarget: string | undefined } => Boolean(x.skill) && !isPass(x.status));
  const achievementIsRecent = latestAchievement ? daysBetween(latestAchievement.date, today()) <= 7 : false;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[1.7rem] leading-tight font-semibold sm:text-[2rem]">Welcome back, {parent.firstName}!</h1>
        <p className="mt-1.5 text-lg text-ink-2">Here's how {child.firstName} is progressing.</p>
      </header>

      {/* Child profile and overall skill development */}
      <section aria-labelledby="child-name" className="deep-panel p-5 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4">
              <Avatar firstName={child.firstName} lastName={child.lastName} size="lg" onDeep />
              <div className="min-w-0">
                <h2 id="child-name" className="text-2xl leading-tight font-semibold">
                  {fullName(child)}
                </h2>
                <p className="mt-0.5 text-white/75">
                  Age {child.age}, {child.lessonStage} in regular lessons
                </p>
              </div>
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5">
              <Fact label="Development programme" wide>
                {plan.programmeName}
              </Fact>
              <Fact label="Programme week">
                {plan.currentWeek === 0 ? 'Not started yet' : `Week ${plan.currentWeek} of ${plan.totalWeeks}`}
                <span aria-hidden="true" className="mt-2 flex max-w-36 gap-1">
                  {Array.from({ length: plan.totalWeeks }, (_, i) => (
                    <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < plan.currentWeek ? 'bg-aqua' : 'bg-white/20')} />
                  ))}
                </span>
              </Fact>
              <Fact label="Next session">
                {nextSession ? (
                  <>
                    {formatMedium(nextSession.date)}, {nextSession.startTime}
                    <span className="block font-sans text-[0.95rem] font-normal text-white/75">{formatName(nextSession.format)}</span>
                  </>
                ) : (
                  'Programme complete'
                )}
              </Fact>
            </dl>
          </div>

          <div className="flex flex-col items-center gap-5 border-t border-white/10 pt-7 sm:flex-row sm:gap-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <ProgressRing
              value={summary.passPct}
              onDeep
              label={
                summary.passPct === null
                  ? 'No skills assessed yet'
                  : `Skills marked Pass: ${summary.passed} of ${summary.assessed} assessed skills, ${summary.passPct}%`
              }
            >
              {summary.passPct === null ? (
                <span className="px-6 text-[0.95rem] leading-tight text-white/80">No assessments yet</span>
              ) : (
                <span>
                  <span data-testid="pass-pct" className="tabular block font-display text-[2.75rem] leading-none font-semibold">
                    {shownPct}%
                  </span>
                  <span className="mt-1 block text-sm text-white/75">marked Pass</span>
                </span>
              )}
            </ProgressRing>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold">Skills marked Pass</h3>
              <p className="tabular mt-1.5 max-w-64 leading-snug text-white/85" data-testid="pass-count">
                {summary.assessed === 0
                  ? `${child.firstName}'s first assessment will appear here after the first session.`
                  : `${summary.passed} of ${summary.assessed} assessed skills`}
              </p>
              {summary.assessed > 0 && (
                <>
                  <p className="tabular mt-1 max-w-64 leading-snug text-white/85" data-testid="level-breakdown">
                    {[...STATUS_ORDER]
                      .reverse()
                      .filter((level) => level !== 'pass')
                      .map((level) => `${summary.counts[level]} ${STATUS_META[level].label}`)
                      .join(', ')}
                  </p>
                  {summary.notAssessed > 0 && (
                    <p className="tabular mt-1 text-white/75" data-testid="not-assessed-count">
                      {summary.notAssessed} Not Assessed, not counted
                    </p>
                  )}
                  <p className="mt-2 max-w-64 text-sm leading-snug text-white/75" data-testid="metric-explanation">
                    Counted among the {plan.strokeName.toLowerCase()} skills chosen for this programme, not{' '}
                    {child.firstName}'s overall swimming ability. Only Pass is counted. A Pass in a skill is not a
                    stage pass.
                  </p>
                </>
              )}
              <div className="mt-2">
                <HowCalculated summary={summary} childName={child.firstName} onDeep />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The two questions a parent arrives with: what is getting better, and what is holding them back. */}
      <section aria-labelledby="now-title" className="mt-8">
        <h2 id="now-title" className="text-xl font-semibold">
          What improved, what needs more work, and what comes next
        </h2>
        <div className="mt-3 grid gap-6 lg:grid-cols-2">
          <div className="panel p-5 sm:p-6" data-testid="improving">
            <h3 className="flex items-center gap-2 font-display font-semibold">
              <TrendingUp className="size-5 text-aqua-dark" aria-hidden="true" />
              Improved at the last session
            </h3>
            {plan.currentWeek === 0 ? (
              <p className="mt-2 text-ink-2">Nothing has been assessed yet. The first assessment is recorded in week 1.</p>
            ) : improved.length === 0 ? (
              <p className="mt-2 text-ink-2">
                No skills moved up a level in week {plan.currentWeek}. Progress within a level is described in the
                instructor's note on each skill.
              </p>
            ) : (
              <>
                <p className="mt-0.5 text-[0.95rem] text-ink-2">
                  {plural(improved.length, 'skill')} moved up in week {plan.currentWeek}
                </p>
                <ul className="mt-2 divide-y divide-line">
                  {improved.slice(0, 5).map((item) => (
                    <li key={item.skillId}>
                      <Link
                        to={`/parent/skills/${item.skillId}`}
                        className="-mx-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl px-2 py-2.5 hover:bg-canvas"
                      >
                        <span className="font-medium">{getSkill(item.skillId)?.name}</span>
                        <span className="flex items-center gap-1.5">
                          <StatusBadge status={item.from} size="sm" />
                          <ArrowRight className="size-4 text-ink-3" aria-hidden="true" />
                          <span className="sr-only">to</span>
                          <StatusBadge status={item.to} size="sm" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {improved.length > 5 && (
                  <Link to="/parent/journey" className="mt-2 inline-flex min-h-9 items-center font-semibold text-ocean-dark underline decoration-1 underline-offset-4 hover:text-deep">
                    and {improved.length - 5} more in the Progress Journey
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="panel p-5 sm:p-6" data-testid="needs-work">
            <h3 className="flex items-center gap-2 font-display font-semibold">
              <Target className="size-5 text-ocean" aria-hidden="true" />
              Needs more work, why, and what comes next
            </h3>
            {needsWork.length === 0 ? (
              <p className="mt-2 text-ink-2">
                {summary.assessed === 0
                  ? `${instructor.firstName} will set the first priorities after the baseline assessment.`
                  : `Every focus skill is marked Pass. ${instructor.firstName} will set new priorities at the next session.`}
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {needsWork.map(({ skill, status, feedback, nextTarget }) => (
                  <li key={skill.id}>
                    <Link to={`/parent/skills/${skill.id}`} className="-mx-2 block rounded-xl px-2 py-2.5 hover:bg-canvas">
                      <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                        <span className="font-medium">{skill.name}</span>
                        <StatusBadge status={status} size="sm" />
                      </span>
                      {feedback && <span className="mt-1 line-clamp-3 block text-[0.95rem] leading-snug text-ink-2">{feedback}</span>}
                      {nextTarget && (
                        <span className="mt-1.5 block text-[0.95rem] leading-snug">
                          <span className="font-semibold text-ocean-dark">Next target in coaching: </span>
                          {nextTarget}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start">
        {/* Left column on desktop */}
        <div className="contents lg:col-span-7 lg:flex lg:flex-col lg:gap-6">
          <section aria-labelledby="summary-title" className="panel order-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="summary-title" className="text-xl font-semibold">
                Skill summary
              </h2>
              <Link to="/parent/skills" className="font-semibold text-ocean-dark underline decoration-1 underline-offset-4 hover:text-deep">
                All {plan.skillIds.length} skills
              </Link>
            </div>
            <ul className="mt-2 divide-y divide-line">
              {categories.map((category) => {
                const meta = getCategory(category.categoryId);
                const state = categoryState(category, plan.focusSkillIds);
                return (
                  <li key={category.categoryId}>
                    <Link
                      to={`/parent/skills?area=${category.categoryId}`}
                      className="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-3.5 hover:bg-canvas"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span className="font-display font-medium">{meta.name}</span>
                          <span className={cx('text-sm font-semibold', state.className)}>{state.label}</span>
                        </span>
                        <span className="mt-2 block">
                          <SkillSegments
                            statuses={category.statuses.map((s) => s.status)}
                            label={`Pass: ${category.passed} of ${category.assessed} assessed skills`}
                          />
                        </span>
                        <span className="tabular mt-1.5 block text-sm text-ink-2">
                          Pass: {category.passed} of {category.assessed} assessed
                          {category.notAssessed > 0 && `, ${category.notAssessed} not assessed`}
                        </span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="journey-title" className="panel order-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="journey-title" className="text-xl font-semibold">
                Six-week journey
              </h2>
              <Link to="/parent/journey" className="font-semibold text-ocean-dark underline decoration-1 underline-offset-4 hover:text-deep">
                Week by week
              </Link>
            </div>
            <div className="mt-5">
              <JourneyLane totalWeeks={plan.totalWeeks} currentWeek={plan.currentWeek} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {currentPhase && (
                <div>
                  <dt className="text-sm text-ink-2">Completed, week {currentPhase.week}</dt>
                  <dd className="font-display font-medium">{currentPhase.title}</dd>
                </div>
              )}
              {nextPhase && (
                <div>
                  <dt className="text-sm text-ink-2">
                    Next, week {nextPhase.week}
                    {nextSession && ` on ${formatMedium(nextSession.date)}`}
                  </dt>
                  <dd className="font-display font-medium">{nextPhase.title}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* Right column on desktop */}
        <div className="contents lg:col-span-5 lg:flex lg:flex-col lg:gap-6">
          <section aria-labelledby="achievement-title" className="order-1 overflow-hidden rounded-[1.25rem] bg-buoy-soft p-5 sm:p-6">
            <h2 id="achievement-title" className="text-sm font-semibold text-buoy-ink">
              Latest achievement
            </h2>
            {latestAchievement ? (
              <>
                <div className="mt-3 flex items-center gap-4">
                  <Medal ripple={achievementIsRecent} />
                  <div className="min-w-0">
                    <p className="font-display text-lg leading-snug font-semibold" data-testid="latest-achievement">
                      {latestAchievement.title}
                    </p>
                    <p className="mt-0.5 text-[0.95rem] text-ink-2">
                      {formatMedium(latestAchievement.date)}, week {latestAchievement.week}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/parent/skills/${latestAchievement.skillId}`}
                  className="mt-4 inline-flex min-h-9 items-center gap-1 font-semibold text-buoy-ink underline decoration-1 underline-offset-4 hover:text-ink"
                >
                  See what {child.firstName} is working on next
                </Link>
              </>
            ) : (
              <div className="mt-3 flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/70 text-buoy-ink">
                  <Award className="size-6" aria-hidden="true" />
                </span>
                <p className="text-ink-2">
                  When one of {child.firstName}'s skills is marked Pass, it appears here.
                </p>
              </div>
            )}
          </section>

          <section aria-labelledby="focus-title" className="panel order-2 p-5 sm:p-6">
            <h2 id="focus-title" className="text-sm font-semibold text-ink-2">
              Current development focus
            </h2>
            <p className="mt-1 font-display text-xl font-semibold">{plan.strokeName} Technique</p>

            <div className="mt-4 rounded-xl bg-foam p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ocean-dark">
                <Target className="size-4" aria-hidden="true" />
                Next coaching priority
              </p>
              <p className="mt-1.5 font-display leading-snug font-medium" data-testid="next-priority">
                {plan.nextPriority}
              </p>
            </div>

          </section>

          <section aria-labelledby="update-title" className="panel order-3 p-5 sm:p-6">
            <h2 id="update-title" className="text-sm font-semibold text-ink-2">
              Latest instructor update
            </h2>
            {latestUpdate ? (
              <>
                <blockquote className="mt-2 text-lg leading-relaxed" data-testid="latest-update">
                  {latestUpdate.text}
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar firstName={instructor.firstName} lastName={instructor.lastName} tone="ocean" size="sm" />
                  <p className="text-[0.95rem] leading-snug">
                    <span className="block font-semibold">{fullName(instructor)}</span>
                    <span className="text-ink-2">
                      {instructor.qualification}, {formatMedium(latestUpdate.date)}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-2 flex items-center gap-3 text-ink-2">
                <CalendarDays className="size-5 shrink-0 text-ink-3" aria-hidden="true" />
                {instructor.firstName} will post an update after the first session.
              </p>
            )}
          </section>
        </div>
      </div>

      <div className="mt-6">
        <ScopeNote childName={child.firstName} />
      </div>
    </>
  );
}
