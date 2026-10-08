import { useSearchParams } from 'react-router';
import { Check } from 'lucide-react';
import { AssessmentPanel } from '@/components/skills/AssessmentPanel';
import { Avatar, PageHeader, cx } from '@/components/ui/primitives';
import { DEMO_INSTRUCTOR_ID } from '@/config/demo';
import { formatMedium, today } from '@/lib/dates';
import { formatName } from '@/lib/format';
import { useApp } from '@/store/AppStore';
import { draftHasContent, useAssessmentDrafts } from '@/store/AssessmentDrafts';
import { fullName, selectInstructorSwimmers, type SwimmerOverview } from '@/store/selectors';

interface SessionGroup {
  key: string;
  label: string;
  swimmers: SwimmerOverview[];
}

export default function Assessments() {
  const { data } = useApp();
  const { drafts } = useAssessmentDrafts();
  const [params, setParams] = useSearchParams();
  const swimmers = selectInstructorSwimmers(data, DEMO_INSTRUCTOR_ID);
  const now = today();

  // Swimmers grouped by the session they were last taught in, so a whole class can be worked
  // through in order straight after the lesson.
  const groups: SessionGroup[] = [];
  for (const swimmer of swimmers) {
    const { child, plan } = swimmer;
    const session =
      data.sessions.find((s) => s.childIds.includes(child.id) && s.week === plan.currentWeek) ??
      data.sessions.find((s) => s.childIds.includes(child.id));
    const key = session ? `${session.date}|${session.startTime}` : 'none';
    const label = session
      ? `${formatMedium(session.date)}, ${session.startTime}, ${formatName(session.format).toLowerCase()}${plan.currentWeek === 0 ? ' (starts)' : ''}`
      : 'No session';
    const group = groups.find((g) => g.key === key);
    if (group) group.swimmers.push(swimmer);
    else groups.push({ key, label, swimmers: [swimmer] });
  }

  const ordered = groups.flatMap((g) => g.swimmers);
  const selected = ordered.find((s) => s.child.id === params.get('swimmer')) ?? ordered[0];
  const select = (childId: string) => {
    setParams({ swimmer: childId }, { replace: true });
    window.scrollTo(0, 0);
  };

  // "Next" stays within swimmers who can be assessed, in on-screen order.
  const assessable = ordered.filter((s) => s.plan.currentWeek > 0);
  const position = assessable.findIndex((s) => s.child.id === selected?.child.id);
  const nextSwimmer = position >= 0 ? assessable[position + 1] : undefined;

  const updatedToday = (childId: string) =>
    data.assessments.some((a) => a.childId === childId && a.date === now) ||
    data.updates.some((u) => u.childId === childId && u.date === now);

  return (
    <>
      <PageHeader
        title="Assessments"
        subtitle="Work through a class one swimmer at a time. Each save updates that parent's dashboard straight away."
      />

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:gap-x-8">
        {groups.map((group) => (
          <div key={group.key} role="group" aria-label={`Session: ${group.label}`}>
            <p className="tabular mb-1.5 text-sm text-ink-2">
              {group.label}
              {group.swimmers.some((s) => s.plan.currentWeek > 0) && (
                <span className="font-semibold text-ink" data-testid={`class-progress-${group.key}`}>
                  {' '}
                  ({group.swimmers.filter((s) => updatedToday(s.child.id)).length} of {group.swimmers.length} updated today)
                </span>
              )}
            </p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {group.swimmers.map(({ child, plan, summary }) => {
                const active = child.id === selected?.child.id;
                const unsaved = draftHasContent(drafts[child.id]);
                const done = updatedToday(child.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(child.id)}
                    data-testid={`pick-${child.id}`}
                    className={cx(
                      'flex shrink-0 items-center gap-3 rounded-2xl border py-2 pr-4 pl-2 text-left transition-colors',
                      active ? 'border-deep bg-deep text-white' : 'border-control bg-surface hover:border-ink-2',
                    )}
                  >
                    <Avatar firstName={child.firstName} lastName={child.lastName} tone={child.avatarTone} size="sm" onDeep={active} />
                    <span>
                      <span className="block font-display leading-tight font-medium">{fullName(child)}</span>
                      <span className={cx('tabular flex items-center gap-1 text-sm', active ? 'text-white/80' : 'text-ink-2')}>
                        {unsaved ? (
                          <span className={cx('font-semibold', active ? 'text-white' : 'text-ocean-dark')}>Unsaved changes</span>
                        ) : done ? (
                          <>
                            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                            Updated today
                          </>
                        ) : plan.currentWeek === 0 ? (
                          'Not started'
                        ) : (
                          `Week ${plan.currentWeek}, ${summary.assessed === 0 ? 'no assessments' : `Pass ${summary.passed} of ${summary.assessed}`}`
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <section aria-labelledby="assessing-title">
          <h2 id="assessing-title" className="mb-2 text-xl font-semibold">
            {fullName(selected.child)}
          </h2>
          <AssessmentPanel
            key={selected.child.id}
            childId={selected.child.id}
            next={
              nextSwimmer
                ? { name: nextSwimmer.child.firstName, onSelect: () => select(nextSwimmer.child.id) }
                : undefined
            }
          />
        </section>
      )}
    </>
  );
}
