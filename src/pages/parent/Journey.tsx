import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Award, CalendarClock, Check } from 'lucide-react';
import { BaselineComparison, buildComparison } from '@/components/charts/BaselineComparison';
import { StatusTrendChart } from '@/components/charts/StatusTrendChart';
import { ScopeNote } from '@/components/skills/HowCalculated';
import { StatusBadge, StatusLegend } from '@/components/ui/Status';
import { PageHeader, cx } from '@/components/ui/primitives';
import { PROGRAMME_PHASES } from '@/config/demo';
import { getSkill } from '@/data/skills';
import { formatLong, formatMedium } from '@/lib/dates';
import { plural } from '@/lib/format';
import { statusLevel, summariseProgress, weekAssessments, weeklyTrend, type WeekAssessment } from '@/lib/progress';
import { useParentScope } from '@/store/AppStore';
import type { ParentScope } from '@/store/selectors';

function SkillList({ items, showFrom = false }: { items: WeekAssessment[]; showFrom?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => {
        const skill = getSkill(item.skillId);
        if (!skill) return null;
        return (
          <li key={item.skillId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-2.5">
            <Link
              to={`/parent/skills/${skill.id}`}
              className="font-medium underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-ink"
            >
              {skill.name}
            </Link>
            <span className="flex flex-wrap items-center gap-1.5">
              {showFrom && item.from && (
                <>
                  <StatusBadge status={item.from} size="sm" />
                  <ArrowRight className="size-4 text-ink-3" aria-hidden="true" />
                  <span className="sr-only">to</span>
                </>
              )}
              <StatusBadge status={item.to} size="sm" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Disclosure({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-line">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 font-semibold hover:bg-canvas [&::-webkit-details-marker]:hidden">
        {summary}
        <span className="text-sm font-semibold text-ocean-dark group-open:hidden">Show</span>
        <span className="hidden text-sm font-semibold text-ocean-dark group-open:inline">Hide</span>
      </summary>
      <div className="px-4 pb-2">{children}</div>
    </details>
  );
}

function WeekBlock({ week, scope, isLast }: { week: number; scope: ParentScope; isLast: boolean }) {
  const { child, plan, assessments, sessions, updates, achievements, instructor, skills } = scope;
  const phase = PROGRAMME_PHASES.find((p) => p.week === week);
  const session = sessions.find((s) => s.week === week);
  const done = week <= plan.currentWeek;
  const isNext = week === plan.currentWeek + 1;

  const assessed = done ? weekAssessments(assessments, child.id, week, skills.map((s) => s.id)) : [];
  const changed = assessed.filter((a) => a.from !== null && a.changed);
  const first = assessed.filter((a) => a.from === null);
  const unchanged = assessed.filter((a) => a.from !== null && !a.changed);
  const weekUpdates = updates.filter((u) => u.week === week);
  const weekAchievements = achievements.filter((a) => a.week === week);
  const objectives = [...weekUpdates].reverse().find((u) => u.nextObjectives.length > 0)?.nextObjectives ?? [];
  const plannedFocus = isNext
    ? ([...updates].reverse().find((u) => u.week === plan.currentWeek && u.nextObjectives.length > 0)?.nextObjectives ?? [])
    : [];

  return (
    <li className="relative flex gap-4 pb-10 last:pb-0 sm:gap-6" data-testid={`week-${week}`}>
      {!isLast && <span aria-hidden="true" className="absolute top-10 bottom-0 left-[1.1875rem] w-0.5 bg-line" />}
      <span
        aria-hidden="true"
        className={cx(
          'tabular relative grid size-10 shrink-0 place-items-center rounded-full font-display font-semibold',
          done && 'bg-deep text-white',
          isNext && 'border-2 border-deep bg-surface text-deep',
          !done && !isNext && 'border-2 border-line-strong bg-canvas text-ink-3',
        )}
      >
        {done ? <Check className="size-5" /> : week}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-lg font-semibold">
            Week {week}: {phase?.title}
          </h3>
          <span
            className={cx(
              'rounded-full px-2.5 py-0.5 text-sm font-semibold',
              done && 'bg-sunken text-ink-2',
              isNext && 'bg-aqua-soft text-aqua-dark',
              !done && !isNext && 'text-ink-3',
            )}
          >
            {done ? 'Completed' : isNext ? 'Next session' : 'Upcoming'}
          </span>
        </div>
        <p className="text-ink-2">
          {session ? `${formatLong(session.date)}, ${session.startTime} to ${session.endTime}` : 'Date to be confirmed'}
        </p>

        {!done && (
          <div className="mt-3 max-w-prose">
            <p className="text-ink-2">{phase?.summary}</p>
            {plannedFocus.length > 0 ? (
              <div className="mt-3 rounded-xl bg-foam p-4">
                <p className="text-sm font-semibold text-ocean-dark">Objectives set for this session</p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 marker:text-ocean">
                  {plannedFocus.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-[0.95rem] text-ink-3">
                <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
                Assessments and notes appear here after the session.
              </p>
            )}
          </div>
        )}

        {done && (
          <div className="mt-4 flex flex-col gap-4">
            {weekAchievements.length > 0 && (
              <ul className="flex flex-col gap-2">
                {weekAchievements.map((a) => (
                  <li key={a.id}>
                    <Link
                      to={`/parent/skills/${a.skillId}`}
                      className="flex items-center gap-3 rounded-xl bg-buoy-soft px-4 py-3 font-display font-medium hover:bg-buoy/25"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-buoy text-deep">
                        <Award className="size-4" aria-hidden="true" />
                      </span>
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {assessed.length === 0 ? (
              <p className="text-ink-2">No skills were assessed in this session.</p>
            ) : (
              <p className="tabular text-ink-2">
                {plural(assessed.length, 'skill')} assessed
                {changed.length > 0 && `, ${changed.length} moved to a new level`}.
              </p>
            )}

            {changed.length > 0 && (
              <div className="panel px-4 py-2 sm:px-5">
                <h4 className="pt-2 font-display font-semibold">Progress this week</h4>
                <SkillList items={changed} showFrom />
              </div>
            )}
            {first.length > 0 && (
              <Disclosure summary={`${plural(first.length, 'skill')} assessed for the first time`}>
                <SkillList items={first} />
              </Disclosure>
            )}
            {unchanged.length > 0 && (
              <Disclosure summary={`${plural(unchanged.length, 'skill')} assessed with no change`}>
                <SkillList items={unchanged} />
              </Disclosure>
            )}

            {weekUpdates.length > 0 && (
              <div>
                <h4 className="font-display font-semibold">Instructor notes</h4>
                <div className="mt-2 flex flex-col gap-3">
                  {[...weekUpdates].reverse().map((u) => (
                    <figure key={u.id} className="max-w-prose">
                      <blockquote className="leading-relaxed">{u.text}</blockquote>
                      <figcaption className="mt-1 text-sm text-ink-2">
                        {instructor.firstName} {instructor.lastName}, {formatMedium(u.date)}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {objectives.length > 0 && (
              <div>
                <h4 className="font-display font-semibold">Objectives for the next session</h4>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-ink-2 marker:text-line-strong">
                  {objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export default function Journey() {
  const scope = useParentScope();
  const { child, plan, assessments, skills } = scope;
  const completed = plan.currentWeek;
  const [fromWeek, setFromWeek] = useState(1);
  const [toWeek, setToWeek] = useState(completed);
  const from = Math.min(fromWeek, Math.max(1, completed - 1));
  const to = Math.max(Math.min(toWeek, completed), from + 1);

  const trend = useMemo(
    () => weeklyTrend(plan.skillIds, assessments, child.id, completed),
    [plan.skillIds, assessments, child.id, completed],
  );
  const rows = useMemo(() => buildComparison(skills, assessments, child.id, from, to), [skills, assessments, child.id, from, to]);

  const start = summariseProgress(plan.skillIds, assessments, child.id, from);
  const end = summariseProgress(plan.skillIds, assessments, child.id, to);
  const improved = rows.filter((r) => r.from && r.to && statusLevel(r.to) > statusLevel(r.from));
  const lower = rows.filter((r) => r.from && r.to && statusLevel(r.to) < statusLevel(r.from));
  const newlyAssessed = rows.filter((r) => !r.from && r.to);
  const weeks = Array.from({ length: completed }, (_, i) => i + 1);

  return (
    <>
      <PageHeader
        title="Progress Journey"
        subtitle={`${child.firstName}'s six weeks, from the first assessment to the final review. Only recorded assessments are shown.`}
      />

      <section aria-labelledby="compare-title" className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h2 id="compare-title" className="text-xl font-semibold">
              Then and now
            </h2>
            <p className="text-ink-2">How {child.firstName}'s assessments have moved since the programme began.</p>
          </div>
          {completed >= 2 && (
            <div className="flex flex-wrap items-center gap-2 text-[0.95rem]">
              <label htmlFor="compare-from" className="text-ink-2">
                Compare
              </label>
              <select
                id="compare-from"
                className="field !w-auto !py-2"
                value={from}
                onChange={(e) => setFromWeek(Number(e.target.value))}
              >
                {weeks.slice(0, -1).map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                    {w === 1 ? ' (baseline)' : ''}
                  </option>
                ))}
              </select>
              <label htmlFor="compare-to" className="text-ink-2">
                with
              </label>
              <select
                id="compare-to"
                className="field !w-auto !py-2"
                value={to}
                onChange={(e) => setToWeek(Number(e.target.value))}
              >
                {weeks
                  .filter((w) => w > from)
                  .map((w) => (
                    <option key={w} value={w}>
                      Week {w}
                      {w === completed ? ' (latest)' : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {completed < 2 ? (
          <p className="mt-5 rounded-xl bg-sunken px-4 py-3 text-ink-2">
            A comparison becomes available after the second session, once there are two sets of assessments to compare.
          </p>
        ) : (
          <>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
              <div>
                <dt className="text-sm text-ink-2">Skills marked Pass, week {from}</dt>
                <dd className="tabular font-display text-3xl font-semibold">
                  {start.passed}
                  <span className="text-lg font-medium text-ink-2"> of {start.assessed}</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">Skills marked Pass, week {to}</dt>
                <dd className="tabular font-display text-3xl font-semibold" data-testid="journey-latest-pass">
                  {end.passed}
                  <span className="text-lg font-medium text-ink-2"> of {end.assessed}</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">Skills that moved up a level</dt>
                <dd className="tabular font-display text-3xl font-semibold">
                  {improved.length}
                  <span className="text-lg font-medium text-ink-2"> of {end.assessed}</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">Not Assessed</dt>
                <dd className="tabular font-display text-3xl font-semibold">{end.notAssessed}</dd>
              </div>
            </dl>

            <p className="mt-5 max-w-prose text-lg leading-relaxed">
              Between week {from} and week {to}, {improved.length === 0 ? 'no skills have' : plural(improved.length, 'skill has', 'skills have')}{' '}
              moved up at least one level
              {lower.length > 0
                ? `, and ${plural(lower.length, 'skill has', 'skills have')} been reassessed at a lower level`
                : ', and none has moved down'}
              {newlyAssessed.length > 0 && `. ${plural(newlyAssessed.length, 'skill was', 'skills were')} assessed for the first time`}.
            </p>

            <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
              <figure className="min-w-0">
                <figcaption className="mb-2 font-display font-semibold">Skills at each level, by week</figcaption>
                <StatusTrendChart trend={trend} />
                <div className="mt-3">
                  <StatusLegend compact />
                </div>
              </figure>
              <div className="min-w-0">
                <h3 className="mb-2 font-display font-semibold">Skill by skill</h3>
                <BaselineComparison rows={rows} fromWeek={from} toWeek={to} skillLink={(id) => `/parent/skills/${id}`} />
              </div>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="timeline-title" className="mt-10">
        <h2 id="timeline-title" className="text-xl font-semibold">
          Week by week
        </h2>
        <p className="mb-6 max-w-prose text-ink-2">
          The six phases describe how the programme is planned. They are a guide to what each session concentrates on,
          not a promise of what will be achieved by a given week.
        </p>
        <ol>
          {PROGRAMME_PHASES.slice(0, plan.totalWeeks).map((phase) => (
            <WeekBlock key={phase.week} week={phase.week} scope={scope} isLast={phase.week === plan.totalWeeks} />
          ))}
        </ol>
      </section>

      <div className="mt-10">
        <ScopeNote childName={child.firstName} />
      </div>
    </>
  );
}
