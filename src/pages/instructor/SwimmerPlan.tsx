import { useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowRight, History, Send, UserRoundX } from 'lucide-react';
import { AssessmentPanel } from '@/components/skills/AssessmentPanel';
import { SkillSegments, StatusBadge } from '@/components/ui/Status';
import { useToast } from '@/components/ui/Toast';
import { Avatar, Button, EmptyState, PageHeader, buttonClass, cx } from '@/components/ui/primitives';
import { PROGRAMME_PHASES } from '@/config/demo';
import { CATEGORY_IDS, getCategory, getSkill } from '@/data/skills';
import { formatMedium } from '@/lib/dates';
import { formatDetail } from '@/lib/format';
import { currentStatus, summariseByCategory } from '@/lib/progress';
import { useApp } from '@/store/AppStore';
import { fullName, planSkills, selectSwimmer, type SwimmerOverview } from '@/store/selectors';

type Tab = 'assess' | 'history' | 'notes';
const TABS: { id: Tab; label: string }[] = [
  { id: 'assess', label: 'Assess' },
  { id: 'history', label: 'History' },
  { id: 'notes', label: 'Notes and objectives' },
];

function HistoryTab({ swimmer }: { swimmer: SwimmerOverview }) {
  const { data } = useApp();
  const { child, plan } = swimmer;
  const entries = data.assessments
    .map((a, index) => ({ a, index }))
    .filter(({ a }) => a.childId === child.id)
    .map(({ a, index }) => ({ a, index, from: currentStatus(data.assessments.slice(0, index), child.id, a.skillId) }));

  if (entries.length === 0) {
    return (
      <EmptyState icon={History} title="No assessment history yet">
        Each assessment you save for {child.firstName} is added here, with the date and the week it belongs to.
      </EmptyState>
    );
  }

  const weeks = [...new Set(entries.map((e) => e.a.week))].sort((a, b) => b - a);
  return (
    <div className="flex flex-col gap-6">
      {weeks.map((week) => {
        const inWeek = entries.filter((e) => e.a.week === week).reverse();
        const phase = PROGRAMME_PHASES.find((p) => p.week === week);
        return (
          <section key={week} aria-labelledby={`history-week-${week}`}>
            <h3 id={`history-week-${week}`} className="mb-2 text-lg font-semibold">
              Week {week}
              {phase && <span className="font-sans text-base font-normal text-ink-2">, {phase.title.toLowerCase()}</span>}
              {week === plan.currentWeek && <span className="font-sans text-base font-normal text-ink-2"> (current)</span>}
            </h3>
            <ul className="panel divide-y divide-line" data-testid={`history-week-${week}`}>
              {inWeek.map(({ a, from }) => (
                <li key={a.id} className="grid gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                  <div className="min-w-0">
                    <p className="font-medium">{getSkill(a.skillId)?.name}</p>
                    <p className="text-[0.95rem] text-ink-2">
                      {formatMedium(a.date)}
                      {a.note && `. ${a.note}`}
                    </p>
                  </div>
                  <p className="flex flex-wrap items-center gap-1.5">
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
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function NotesTab({ swimmer }: { swimmer: SwimmerOverview }) {
  const { data, addProgressUpdate, setNextPriority } = useApp();
  const toast = useToast();
  const { child, parent, plan } = swimmer;
  const [priority, setPriority] = useState(plan.nextPriority);
  const [text, setText] = useState('');
  const [objectives, setObjectives] = useState('');
  const updates = data.updates.filter((u) => u.childId === child.id);
  const priorityChanged = priority.trim() !== plan.nextPriority && priority.trim() !== '';

  const savePriority = (event: FormEvent) => {
    event.preventDefault();
    try {
      setNextPriority(child.id, priority);
      toast({ title: 'Priority saved', description: `${parent.firstName}'s dashboard now shows the new coaching priority.` });
    } catch (error) {
      toast({ tone: 'error', title: 'The priority was not saved', description: error instanceof Error ? error.message : undefined });
    }
  };

  const sendUpdate = (event: FormEvent) => {
    event.preventDefault();
    try {
      addProgressUpdate(child.id, text, objectives.split('\n'));
      setText('');
      setObjectives('');
      toast({ title: 'Update sent', description: `${parent.firstName} has been notified and can read it on the dashboard.` });
    } catch (error) {
      toast({ tone: 'error', title: 'The update was not sent', description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-6">
        <form onSubmit={savePriority} className="panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Next coaching priority</h3>
          <p className="mt-0.5 text-ink-2">One sentence. Shown on {parent.firstName}'s dashboard.</p>
          <label htmlFor="priority" className="sr-only">
            Next coaching priority
          </label>
          <textarea id="priority" rows={2} className="field mt-3" value={priority} onChange={(e) => setPriority(e.target.value)} />
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={!priorityChanged}>
              Save priority
            </Button>
          </div>
        </form>

        <form onSubmit={sendUpdate} className="panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Update for {parent.firstName}</h3>
          <p className="mt-0.5 text-ink-2">
            Recorded against week {Math.max(plan.currentWeek, 1)}. It becomes the latest instructor update on the parent
            dashboard.
          </p>
          <label htmlFor="update-text" className="mt-4 mb-1 block text-sm font-semibold">
            How the session went
          </label>
          <textarea
            id="update-text"
            rows={4}
            className="field"
            placeholder={`What ${child.firstName} did well and what you are working on.`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <label htmlFor="update-objectives" className="mt-4 mb-1 block text-sm font-semibold">
            Objectives for the next session <span className="font-normal text-ink-2">(optional, one per line)</span>
          </label>
          <textarea id="update-objectives" rows={3} className="field" value={objectives} onChange={(e) => setObjectives(e.target.value)} />
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={text.trim() === ''}>
              <Send className="size-4" aria-hidden="true" />
              Send update
            </Button>
          </div>
        </form>
      </div>

      <section aria-labelledby="updates-title">
        <h3 id="updates-title" className="mb-3 text-lg font-semibold">
          Updates sent
        </h3>
        {updates.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong px-5 py-8 text-center text-ink-2">
            No updates have been sent to {parent.firstName} yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {[...updates].reverse().sort((a, b) => b.week - a.week).map((u) => (
              <li key={u.id} className="panel p-4 sm:p-5">
                <p className="text-sm text-ink-2">
                  Week {u.week}, {formatMedium(u.date)}
                </p>
                <p className="mt-1.5 leading-relaxed">{u.text}</p>
                {u.nextObjectives.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[0.95rem] text-ink-2 marker:text-line-strong">
                    {u.nextObjectives.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export default function SwimmerPlan() {
  const { childId = '' } = useParams();
  const { data } = useApp();
  const [params, setParams] = useSearchParams();
  const swimmer = selectSwimmer(data, childId);
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'assess') as Tab;

  if (!swimmer) {
    return (
      <EmptyState
        icon={UserRoundX}
        title="Swimmer not found"
        action={
          <Link to="/instructor/swimmers" className={buttonClass('primary')}>
            View all swimmers
          </Link>
        }
      >
        This swimmer is not on your programmes. They may have been removed, or the link may be out of date.
      </EmptyState>
    );
  }

  const { child, parent, plan, summary, nextSession, achievements } = swimmer;
  const selectTab = (id: Tab) => setParams(id === 'assess' ? {} : { tab: id }, { replace: true });
  const categories = summariseByCategory(planSkills(plan), CATEGORY_IDS, data.assessments, child.id);

  return (
    <>
      <PageHeader back={{ to: '/instructor/swimmers', label: 'Swimmers' }} title={fullName(child)} subtitle={plan.programmeName} />

      <section aria-label="Development plan summary" className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-4">
            <Avatar firstName={child.firstName} lastName={child.lastName} tone={child.avatarTone} size="lg" />
            <dl className="text-[0.95rem] leading-snug">
              <dt className="sr-only">Swimmer</dt>
              <dd className="font-medium">
                Age {child.age}, {child.lessonStage} in regular lessons
              </dd>
              <dt className="sr-only">Format</dt>
              <dd className="text-ink-2">{formatDetail(plan)}</dd>
              <dt className="sr-only">Parent</dt>
              <dd className="text-ink-2">Parent: {fullName(parent)}</dd>
            </dl>
          </div>
          <dl className="tabular grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-ink-2">Targets achieved</dt>
              <dd className="font-display text-2xl font-semibold" data-testid="plan-achieved">
                {summary.achievedPct === null ? 'None yet' : `${summary.achievedPct}%`}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">Mastered</dt>
              <dd className="font-display text-2xl font-semibold">{summary.mastered}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">Assessed</dt>
              <dd className="font-display text-2xl font-semibold">
                {summary.assessed}
                <span className="text-base font-medium text-ink-2"> of {summary.totalTargets}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">Programme</dt>
              <dd className="font-display text-2xl font-semibold">
                {plan.currentWeek === 0 ? 'Not started' : `Week ${plan.currentWeek}`}
                {plan.currentWeek > 0 && <span className="text-base font-medium text-ink-2"> of {plan.totalWeeks}</span>}
              </dd>
            </div>
          </dl>
        </div>
        <ul className="mt-6 grid gap-x-6 gap-y-3 border-t border-line pt-5 sm:grid-cols-3 xl:grid-cols-5">
          {categories.map((c) => (
            <li key={c.categoryId}>
              <p className="flex items-baseline justify-between gap-2 text-[0.95rem]">
                <span className="font-medium">{getCategory(c.categoryId).name}</span>
                <span className="tabular text-ink-2">
                  {c.achieved}/{c.totalTargets}
                </span>
              </p>
              <div className="mt-1.5">
                <SkillSegments statuses={c.statuses.map((s) => s.status)} label={`${c.achieved} of ${c.totalTargets} targets achieved`} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[0.95rem] text-ink-2">
          {nextSession ? `Next session: ${formatMedium(nextSession.date)}, ${nextSession.startTime}.` : 'No further sessions scheduled.'}{' '}
          {achievements.length > 0 && `Achievements sent to ${parent.firstName}: ${achievements.length}.`}
        </p>
      </section>

      <div role="tablist" aria-label="Development plan" className="mt-8 mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => selectTab(t.id)}
            onKeyDown={(event) => {
              const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
              if (step === 0) return;
              event.preventDefault();
              const index = TABS.findIndex((x) => x.id === t.id);
              const target = TABS[(index + step + TABS.length) % TABS.length].id;
              selectTab(target);
              document.getElementById(`tab-${target}`)?.focus();
            }}
            className={cx(
              '-mb-px min-h-11 border-b-2 px-3 font-display font-medium whitespace-nowrap transition-colors',
              tab === t.id ? 'border-deep text-ink' : 'border-transparent text-ink-2 hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="focus-visible:outline-none">
        {tab === 'assess' && <AssessmentPanel key={child.id} childId={child.id} />}
        {tab === 'history' && <HistoryTab swimmer={swimmer} />}
        {tab === 'notes' && <NotesTab key={child.id} swimmer={swimmer} />}
      </div>
    </>
  );
}
