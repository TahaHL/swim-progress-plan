import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Search, SearchX } from 'lucide-react';
import { WeekBar } from '@/components/skills/SwimmerBits';
import { Avatar, Button, EmptyState, PageHeader } from '@/components/ui/primitives';
import { DEMO_INSTRUCTOR_ID } from '@/config/demo';
import { formatName, plural } from '@/lib/format';
import { useApp } from '@/store/AppStore';
import { fullName, selectInstructorSwimmers } from '@/store/selectors';

export default function Swimmers() {
  const { data } = useApp();
  const [query, setQuery] = useState('');
  const swimmers = selectInstructorSwimmers(data, DEMO_INSTRUCTOR_ID);
  const term = query.trim().toLowerCase();
  const visible = term
    ? swimmers.filter((s) => `${fullName(s.child)} ${s.child.lessonStage}`.toLowerCase().includes(term))
    : swimmers;

  return (
    <>
      <PageHeader title="Swimmers" subtitle="Everyone on your programmes. Open a swimmer to see their plan and record assessments." />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <label htmlFor="swimmer-search" className="sr-only">
            Search swimmers by name or stage
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            id="swimmer-search"
            type="search"
            className="field !pl-10"
            placeholder="Search by name or stage"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <p className="tabular text-ink-2" aria-live="polite">
          {term ? `${visible.length} of ${plural(swimmers.length, 'swimmer')}` : plural(swimmers.length, 'swimmer')}
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No swimmers match "${query.trim()}"`}
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        >
          Check the spelling, or search by stage, for example "Stage 3".
        </EmptyState>
      ) : (
        <ul className="panel divide-y divide-line overflow-hidden">
          {visible.map(({ child, parent, plan, summary }) => (
            <li key={child.id}>
              <Link
                to={`/instructor/swimmers/${child.id}`}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-4 hover:bg-canvas md:grid-cols-[auto_minmax(0,1.3fr)_minmax(0,0.8fr)_9rem_minmax(0,1fr)_auto] sm:px-5"
              >
                <Avatar firstName={child.firstName} lastName={child.lastName} tone={child.avatarTone} />
                <span className="min-w-0">
                  <span className="block truncate font-display text-lg leading-snug font-medium">{fullName(child)}</span>
                  <span className="block text-[0.95rem] text-ink-2">
                    Age {child.age}, {child.lessonStage}. Parent: {fullName(parent)}
                  </span>
                </span>
                <ChevronRight className="size-5 text-ink-3 transition-transform group-hover:translate-x-0.5 md:order-last" aria-hidden="true" />
                <span className="col-start-2 text-[0.95rem] text-ink-2 md:col-start-auto">{formatName(plan.format)}</span>
                <WeekBar plan={plan} className="col-start-2 md:col-start-auto" />
                <span className="tabular col-start-2 text-[0.95rem] md:col-start-auto">
                  {summary.achievedPct === null ? (
                    <span className="text-ink-3">No assessments yet</span>
                  ) : (
                    <>
                      <span className="font-semibold">{summary.achievedPct}%</span>
                      <span className="text-ink-2">
                        {' '}
                        achieved ({summary.achieved} of {summary.assessed}), {summary.mastered} mastered
                      </span>
                    </>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
