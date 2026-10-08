import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Award, CalendarDays, ChevronRight, Target } from 'lucide-react';
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
import { currentStatus, type CategoryProgress } from '@/lib/progress';
import { useParentScope } from '@/store/AppStore';
import { fullName } from '@/store/selectors';

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-white/65">{label}</dt>
      <dd className="mt-0.5 font-display leading-snug font-medium">{children}</dd>
    </div>
  );
}

function categoryState(category: CategoryProgress, focusIds: string[]): { label: string; className: string } {
  if (category.assessed === 0) return { label: 'Not yet assessed', className: 'text-ink-3' };
  if (category.achieved === category.totalTargets) return { label: 'All achieved', className: 'text-st-con-ink' };
  if (category.statuses.some((s) => focusIds.includes(s.skillId))) return { label: 'Current focus', className: 'text-aqua-dark' };
  return { label: 'In progress', className: 'text-ink-2' };
}

export default function Home() {
  const scope = useParentScope();
  const { parent, child, plan, summary, categories, nextSession, latestUpdate, latestAchievement, instructor, assessments } = scope;
  const shownPct = useCountUp(summary.achievedPct ?? 0);
  const nextPhase = PROGRAMME_PHASES.find((p) => p.week === plan.currentWeek + 1);
  const currentPhase = PROGRAMME_PHASES.find((p) => p.week === plan.currentWeek);
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
              <div className="col-span-2">
                <Fact label="Development programme">{plan.programmeName}</Fact>
              </div>
              <Fact label="Programme week">
                Week {plan.currentWeek} of {plan.totalWeeks}
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
              value={summary.achievedPct}
              onDeep
              label={
                summary.achievedPct === null
                  ? 'No skills assessed yet'
                  : `${summary.achievedPct}% of assessed development targets achieved`
              }
            >
              {summary.achievedPct === null ? (
                <span className="px-6 text-[0.95rem] leading-tight text-white/80">No assessments yet</span>
              ) : (
                <span>
                  <span data-testid="achieved-pct" className="tabular block font-display text-[2.75rem] leading-none font-semibold">
                    {shownPct}%
                  </span>
                  <span className="mt-1 block text-sm text-white/75">achieved</span>
                </span>
              )}
            </ProgressRing>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold">Overall skill development</h3>
              <p className="tabular mt-1.5 max-w-64 leading-snug text-white/85" data-testid="achieved-count">
                {summary.assessed === 0
                  ? `${child.firstName}'s first assessment will appear here after the first session.`
                  : `${summary.achieved} of ${summary.assessed} assessed development targets achieved`}
              </p>
              {summary.assessed > 0 && (
                <p className="tabular mt-1 text-white/70" data-testid="mastered-count">
                  {plural(summary.mastered, 'skill')} mastered
                  {summary.unassessed > 0 && `, ${summary.unassessed} not yet assessed`}
                </p>
              )}
              <div className="mt-2">
                <HowCalculated summary={summary} childName={child.firstName} onDeep />
              </div>
            </div>
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
                            label={`${category.achieved} of ${category.totalTargets} targets achieved`}
                          />
                        </span>
                        <span className="tabular mt-1.5 block text-sm text-ink-2">
                          {category.achieved} of {category.totalTargets} targets achieved
                          {category.unassessed > 0 && `, ${category.unassessed} not yet assessed`}
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
                  When {child.firstName} masters a skill, it will be celebrated here.
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

            {plan.focusSkillIds.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-semibold text-ink-2">Skills we're concentrating on</h3>
                <ul className="mt-1 divide-y divide-line">
                  {plan.focusSkillIds.map((id) => {
                    const skill = getSkill(id);
                    if (!skill) return null;
                    return (
                      <li key={id}>
                        <Link
                          to={`/parent/skills/${id}`}
                          className="group -mx-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl px-2 py-3 hover:bg-canvas"
                        >
                          <span className="font-medium">{skill.name}</span>
                          <StatusBadge status={currentStatus(assessments, child.id, id)} size="sm" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
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
