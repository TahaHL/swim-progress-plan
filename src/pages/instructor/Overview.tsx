import { Link } from 'react-router';
import { ArrowRight, ChevronRight, ClipboardCheck } from 'lucide-react';
import { WeekBar } from '@/components/skills/SwimmerBits';
import { StatusBadge } from '@/components/ui/Status';
import { Avatar, PageHeader, buttonClass } from '@/components/ui/primitives';
import { DEMO_INSTRUCTOR_ID } from '@/config/demo';
import { getSkill } from '@/data/skills';
import { formatLong, formatRelative } from '@/lib/dates';
import { formatName, plural } from '@/lib/format';
import { currentStatus } from '@/lib/progress';
import { useApp } from '@/store/AppStore';
import { fullName, selectInstructorSwimmers } from '@/store/selectors';

export default function Overview() {
  const { data } = useApp();
  const instructor = data.instructors.find((i) => i.id === DEMO_INSTRUCTOR_ID)!;
  const swimmers = selectInstructorSwimmers(data, instructor.id);
  const childById = new Map(data.children.map((c) => [c.id, c]));

  const upcoming = data.sessions.filter((s) => s.status === 'upcoming' && s.instructorId === instructor.id);
  const nextDate = upcoming[0]?.date;
  const nextSessions = upcoming.filter((s) => s.date === nextDate);
  const nextSwimmerCount = new Set(nextSessions.flatMap((s) => s.childIds)).size;

  const unassessed = swimmers.filter((s) => s.plan.currentWeek > 0).reduce((n, s) => n + s.summary.notAssessed, 0);
  const passed = swimmers.reduce((n, s) => n + s.summary.passed, 0);

  // Most recent assessment entries, newest first, with what each one changed from.
  const recent = data.assessments
    .map((a, index) => ({ a, index }))
    .sort((x, y) => y.a.date.localeCompare(x.a.date) || y.index - x.index)
    .slice(0, 6)
    .map(({ a, index }) => {
      const earlier = data.assessments.slice(0, index);
      return { a, from: currentStatus(earlier, a.childId, a.skillId) };
    });

  const stats = [
    { label: 'Swimmers on your programmes', value: swimmers.length },
    { label: 'Skills marked Pass across your swimmers', value: passed },
    { label: 'Skills still Not Assessed', value: unassessed },
  ];

  return (
    <>
      <PageHeader
        title={`Hello, ${instructor.firstName}`}
        subtitle={
          nextDate
            ? `Your next coaching day is ${formatLong(nextDate)}: ${plural(nextSessions.length, 'session')}, ${plural(nextSwimmerCount, 'swimmer')}.`
            : 'There are no upcoming sessions.'
        }
        actions={
          <Link to="/instructor/assessments" className={buttonClass('primary')}>
            <ClipboardCheck className="size-4" aria-hidden="true" />
            Record an assessment
          </Link>
        }
      />

      <dl className="grid gap-x-8 gap-y-4 border-y border-line py-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse">
            <dt className="text-ink-2">{stat.label}</dt>
            <dd className="tabular font-display text-3xl font-semibold">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:items-start">
        <section aria-labelledby="completion-title">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="completion-title" className="text-xl font-semibold">
              Programme completion
            </h2>
            <Link to="/instructor/swimmers" className="font-semibold text-ocean-dark underline decoration-1 underline-offset-4 hover:text-deep">
              All swimmers
            </Link>
          </div>
          <ul className="panel divide-y divide-line overflow-hidden">
            {swimmers.map(({ child, plan, summary }) => (
              <li key={child.id}>
                <Link
                  to={`/instructor/swimmers/${child.id}`}
                  className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 hover:bg-canvas sm:grid-cols-[auto_minmax(0,1.2fr)_8.5rem_minmax(0,1fr)_auto] sm:px-5"
                >
                  <Avatar firstName={child.firstName} lastName={child.lastName} tone={child.avatarTone} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate font-display font-medium">{fullName(child)}</span>
                    <span className="block text-[0.95rem] text-ink-2">{formatName(plan.format)}</span>
                  </span>
                  <ChevronRight className="size-5 text-ink-3 sm:order-last" aria-hidden="true" />
                  <WeekBar plan={plan} className="col-start-2 sm:col-start-auto" />
                  <span className="tabular col-start-2 text-[0.95rem] sm:col-start-auto">
                    {summary.assessed === 0 ? (
                      <span className="text-ink-3">No assessments yet</span>
                    ) : (
                      <>
                        <span className="font-semibold">Pass: {summary.passed}</span>
                        <span className="text-ink-2"> of {summary.assessed} assessed skills</span>
                      </>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-8">
          <section aria-labelledby="next-title">
            <h2 id="next-title" className="mb-3 text-xl font-semibold">
              {nextDate ? `Sessions on ${formatLong(nextDate)}` : 'Next sessions'}
            </h2>
            {nextSessions.length === 0 ? (
              <p className="text-ink-2">Nothing is scheduled.</p>
            ) : (
              <ul className="panel divide-y divide-line">
                {nextSessions.map((session) => (
                  <li key={session.id} className="flex gap-4 px-4 py-3.5 sm:px-5">
                    <span className="tabular w-24 shrink-0 font-display font-medium">
                      {session.startTime}
                      <span className="block font-sans text-[0.95rem] font-normal text-ink-2">to {session.endTime}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {formatName(session.format)}, week {session.week}
                      </span>
                      <span className="block text-[0.95rem] text-ink-2">
                        {session.childIds.map((id) => childById.get(id)?.firstName).filter(Boolean).join(', ')}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="recent-title">
            <h2 id="recent-title" className="mb-3 text-xl font-semibold">
              Recent assessments
            </h2>
            <ul className="divide-y divide-line">
              {recent.map(({ a, from }) => {
                const child = childById.get(a.childId);
                const skill = getSkill(a.skillId);
                if (!child || !skill) return null;
                return (
                  <li key={a.id} className="py-3">
                    <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <Link to={`/instructor/swimmers/${child.id}`} className="font-medium underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-ink">
                        {fullName(child)}
                      </Link>
                      <span className="text-sm text-ink-3">{formatRelative(a.date)}</span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.95rem] text-ink-2">
                      <span className="mr-1">{skill.name}</span>
                      {from && from !== a.status && (
                        <>
                          <StatusBadge status={from} size="sm" />
                          <ArrowRight className="size-4 text-ink-3" aria-hidden="true" />
                          <span className="sr-only">to</span>
                        </>
                      )}
                      <StatusBadge status={a.status} size="sm" />
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
