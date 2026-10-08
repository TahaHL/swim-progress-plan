import { Link } from 'react-router';
import { CalendarX } from 'lucide-react';
import { EmptyState, PageHeader, cx } from '@/components/ui/primitives';
import { DEMO_INSTRUCTOR_ID } from '@/config/demo';
import { formatLong } from '@/lib/dates';
import { formatName, plural } from '@/lib/format';
import { useApp } from '@/store/AppStore';
import type { CoachingSession } from '@/types';

export default function Sessions() {
  const { data } = useApp();
  const sessions = data.sessions.filter((s) => s.instructorId === DEMO_INSTRUCTOR_ID);
  const childById = new Map(data.children.map((c) => [c.id, c]));
  const nextDate = sessions.find((s) => s.status === 'upcoming')?.date;

  const groupByDate = (list: CoachingSession[]) => {
    const map = new Map<string, CoachingSession[]>();
    for (const s of list) map.set(s.date, [...(map.get(s.date) ?? []), s]);
    return [...map.entries()];
  };
  const upcoming = groupByDate(sessions.filter((s) => s.status === 'upcoming'));
  const completed = groupByDate(sessions.filter((s) => s.status === 'completed')).reverse();

  /** The objectives most recently set for a swimmer, shown against their next session. */
  const objectivesFor = (childId: string) =>
    [...data.updates].reverse().find((u) => u.childId === childId && u.nextObjectives.length > 0)?.nextObjectives ?? [];

  const renderDay = ([date, list]: [string, CoachingSession[]], showObjectives: boolean) => (
    <section key={date} aria-labelledby={`day-${date}`}>
      <h3 id={`day-${date}`} className="mb-2 flex flex-wrap items-baseline gap-x-3 font-display text-lg font-semibold">
        {formatLong(date)}
        {date === nextDate && (
          <span className="rounded-full bg-aqua-soft px-2.5 py-0.5 font-sans text-sm font-semibold text-aqua-dark">Next coaching day</span>
        )}
      </h3>
      <ul className="panel divide-y divide-line">
        {list.map((session) => (
          <li key={session.id} className="grid gap-x-6 gap-y-2 px-4 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:px-5">
            <p className="tabular font-display font-medium">
              {session.startTime} <span className="font-sans font-normal text-ink-2">to {session.endTime}</span>
            </p>
            <div className="min-w-0">
              <p className="font-medium">
                {formatName(session.format)}
                <span className="font-normal text-ink-2">
                  , programme week {session.week}, {plural(session.childIds.length, 'swimmer')}
                </span>
              </p>
              <p className="text-[0.95rem] text-ink-2">{session.venue}</p>
              <ul className={cx('mt-2 flex flex-col', showObjectives ? 'gap-3' : 'gap-0.5')}>
                {session.childIds.map((id) => {
                  const child = childById.get(id);
                  if (!child) return null;
                  const objectives = showObjectives ? objectivesFor(id) : [];
                  return (
                    <li key={id}>
                      <Link
                        to={`/instructor/swimmers/${id}`}
                        className="font-medium underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-ink"
                      >
                        {child.firstName} {child.lastName}
                      </Link>
                      {showObjectives &&
                        (objectives.length > 0 ? (
                          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[0.95rem] text-ink-2 marker:text-line-strong">
                            {objectives.map((o) => (
                              <li key={o}>{o}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[0.95rem] text-ink-3">No objectives set yet.</p>
                        ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      <PageHeader title="Sessions" subtitle="Your coaching sessions, with each swimmer's objectives for the next one." />

      <section aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="mb-4 text-xl font-semibold">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarX} title="No upcoming sessions">
            Every scheduled session has been completed.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-6">{upcoming.map((day) => renderDay(day, day[0] === nextDate))}</div>
        )}
      </section>

      <section aria-labelledby="completed-title" className="mt-10">
        <h2 id="completed-title" className="mb-4 text-xl font-semibold">
          Completed
        </h2>
        {completed.length === 0 ? (
          <p className="text-ink-2">Completed sessions will be listed here.</p>
        ) : (
          <div className="flex flex-col gap-6">{completed.map((day) => renderDay(day, false))}</div>
        )}
      </section>

      <p className="mt-8 text-sm text-ink-3">Session times are examples. Booking and payment are not part of this demonstration.</p>
    </>
  );
}
