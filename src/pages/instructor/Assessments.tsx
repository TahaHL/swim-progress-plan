import { useSearchParams } from 'react-router';
import { AssessmentPanel } from '@/components/skills/AssessmentPanel';
import { Avatar, PageHeader, cx } from '@/components/ui/primitives';
import { DEMO_INSTRUCTOR_ID } from '@/config/demo';
import { useApp } from '@/store/AppStore';
import { fullName, selectInstructorSwimmers } from '@/store/selectors';

export default function Assessments() {
  const { data } = useApp();
  const [params, setParams] = useSearchParams();
  const swimmers = selectInstructorSwimmers(data, DEMO_INSTRUCTOR_ID);
  const selected = swimmers.find((s) => s.child.id === params.get('swimmer')) ?? swimmers[0];

  return (
    <>
      <PageHeader
        title="Assessments"
        subtitle="Choose a swimmer, set a state for each skill you observed, then save. The parent's dashboard updates straight away."
      />

      <div role="radiogroup" aria-label="Swimmer" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {swimmers.map(({ child, plan, summary }) => {
          const active = child.id === selected?.child.id;
          return (
            <button
              key={child.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setParams({ swimmer: child.id }, { replace: true })}
              className={cx(
                'flex shrink-0 items-center gap-3 rounded-2xl border py-2 pr-4 pl-2 text-left transition-colors',
                active ? 'border-deep bg-deep text-white' : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <Avatar firstName={child.firstName} lastName={child.lastName} tone={child.avatarTone} size="sm" onDeep={active} />
              <span>
                <span className="block font-display leading-tight font-medium">{fullName(child)}</span>
                <span className={cx('tabular block text-sm', active ? 'text-white/75' : 'text-ink-2')}>
                  {plan.currentWeek === 0
                    ? 'Not started'
                    : `Week ${plan.currentWeek}, ${summary.achievedPct === null ? 'no assessments' : `${summary.achievedPct}% achieved`}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <section aria-label={`Assessment for ${fullName(selected.child)}`}>
          <h2 className="mb-1 text-xl font-semibold">{fullName(selected.child)}</h2>
          <AssessmentPanel key={selected.child.id} childId={selected.child.id} />
        </section>
      )}
    </>
  );
}
