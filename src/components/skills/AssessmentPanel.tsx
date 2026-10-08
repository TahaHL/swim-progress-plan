import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarClock, CircleCheck, Eye, NotebookPen, RotateCcw } from 'lucide-react';
import { StatusBadge, StatusIcon } from '@/components/ui/Status';
import { useToast } from '@/components/ui/Toast';
import { Button, EmptyState, cx } from '@/components/ui/primitives';
import { DEMO_PARENT_ID } from '@/config/demo';
import { CATEGORIES } from '@/data/skills';
import type { SaveAssessmentResult, SkillChange } from '@/lib/assessmentService';
import { formatLong, formatMedium } from '@/lib/dates';
import { plural } from '@/lib/format';
import { STATUS_ORDER, currentStatus } from '@/lib/progress';
import { STATUS_META } from '@/lib/status';
import { useApp } from '@/store/AppStore';
import { fullName, planSkills, selectSwimmer } from '@/store/selectors';
import type { SkillStatus, SwimmingSkill } from '@/types';

interface Draft {
  status?: SkillStatus;
  feedback?: string;
  nextTarget?: string;
}

/** Four-way choice for one skill. Behaves as a radio group: arrow keys move and select. */
function StatusRadio({
  value,
  onChange,
  label,
}: {
  value: SkillStatus | null;
  onChange: (status: SkillStatus) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = value ? STATUS_ORDER.indexOf(value) : -1;

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + STATUS_ORDER.length) % STATUS_ORDER.length;
    onChange(STATUS_ORDER[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-4 gap-1.5">
      {STATUS_ORDER.map((status, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={status}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex === -1 && index === 0) ? 0 : -1}
            onClick={() => onChange(status)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border px-1 text-[0.78rem] leading-none font-semibold transition-colors sm:min-h-11 sm:flex-row sm:gap-1.5 sm:px-2.5 sm:text-sm',
              selected
                ? cx(STATUS_META[status].chip, 'border-transparent ring-2 ring-deep ring-inset')
                : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink',
            )}
          >
            <StatusIcon status={status} size={16} inverse={selected && status === 'mastered'} className={selected ? undefined : 'opacity-55'} />
            {STATUS_META[status].short}
          </button>
        );
      })}
    </div>
  );
}

function SkillRow({
  skill,
  saved,
  draft,
  savedFeedback,
  savedTarget,
  parentName,
  notesOpen,
  onToggleNotes,
  onChange,
  onUndo,
}: {
  skill: SwimmingSkill;
  saved: SkillStatus | null;
  draft: Draft | undefined;
  savedFeedback: string;
  savedTarget: string;
  parentName: string;
  notesOpen: boolean;
  onToggleNotes: () => void;
  onChange: (patch: Draft) => void;
  onUndo: () => void;
}) {
  const value = draft?.status ?? saved;
  const statusChanged = draft?.status !== undefined && draft.status !== saved;
  const notesChanged =
    (draft?.feedback !== undefined && draft.feedback.trim() !== savedFeedback) ||
    (draft?.nextTarget !== undefined && draft.nextTarget.trim() !== savedTarget);
  const changed = statusChanged || notesChanged;

  return (
    <li
      data-testid={`assess-${skill.id}`}
      className={cx('px-4 py-4 transition-colors sm:px-5', changed && 'bg-foam')}
    >
      <div className="grid gap-x-5 gap-y-3 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-center">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display font-medium">{skill.name}</p>
            <p className="text-[0.95rem] text-ink-2">
              {statusChanged ? (
                <span className="font-semibold text-ocean-dark">
                  Was {saved ? STATUS_META[saved].label : 'not yet assessed'}
                </span>
              ) : notesChanged ? (
                <span className="font-semibold text-ocean-dark">Notes edited</span>
              ) : (
                skill.summary
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {changed && (
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ink-2 hover:bg-white hover:text-ink"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Undo<span className="sr-only"> changes to {skill.name}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleNotes}
              aria-expanded={notesOpen}
              aria-controls={`notes-${skill.id}`}
              className={cx(
                'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold hover:bg-sunken',
                notesOpen ? 'bg-sunken text-ink' : 'text-ink-2',
              )}
            >
              <NotebookPen className="size-3.5" aria-hidden="true" />
              Notes<span className="sr-only"> for {skill.name}</span>
            </button>
          </div>
        </div>
        <StatusRadio value={value} onChange={(status) => onChange({ status })} label={`Assessment for ${skill.name}`} />
      </div>

      {notesOpen && (
        <div id={`notes-${skill.id}`} className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <label htmlFor={`feedback-${skill.id}`} className="mb-1 block text-sm font-semibold">
              Feedback for {parentName}
            </label>
            <textarea
              id={`feedback-${skill.id}`}
              rows={4}
              className="field"
              placeholder="What you saw, in plain language."
              value={draft?.feedback ?? savedFeedback}
              onChange={(e) => onChange({ feedback: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor={`target-${skill.id}`} className="mb-1 block text-sm font-semibold">
              Next development target
            </label>
            <textarea
              id={`target-${skill.id}`}
              rows={4}
              className="field"
              placeholder="One specific, observable target."
              value={draft?.nextTarget ?? savedTarget}
              onChange={(e) => onChange({ nextTarget: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold">Success criteria</p>
            <ul className="list-disc space-y-1 pl-5 text-[0.95rem] leading-snug text-ink-2 marker:text-line-strong">
              {skill.successCriteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * The instructor's assessment sheet for one swimmer. Changes are staged, shown as unsaved, and
 * committed together with "Save assessment". Saving updates the history, the progress figures,
 * the parent's dashboard and, for a newly mastered skill, the parent's achievements.
 */
export function AssessmentPanel({ childId }: { childId: string }) {
  const { data, saveAssessment, enterAs } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const swimmer = selectSwimmer(data, childId);
  const [draft, setDraft] = useState<Record<string, Draft>>({});
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [result, setResult] = useState<SaveAssessmentResult | null>(null);

  const skills = useMemo(() => (swimmer ? planSkills(swimmer.plan) : []), [swimmer]);

  const changes = useMemo<SkillChange[]>(() => {
    if (!swimmer) return [];
    const list: SkillChange[] = [];
    for (const skill of skills) {
      const d = draft[skill.id];
      if (!d) continue;
      const saved = currentStatus(data.assessments, childId, skill.id);
      const note = swimmer.plan.skillNotes[skill.id] ?? {};
      const change: SkillChange = { skillId: skill.id };
      if (d.status && d.status !== saved) change.status = d.status;
      if (d.feedback !== undefined && d.feedback.trim() !== (note.feedback ?? '')) change.feedback = d.feedback;
      if (d.nextTarget !== undefined && d.nextTarget.trim() !== (note.nextTarget ?? '')) change.nextTarget = d.nextTarget;
      if (change.status || change.feedback !== undefined || change.nextTarget !== undefined) list.push(change);
    }
    return list;
  }, [draft, skills, swimmer, data.assessments, childId]);

  if (!swimmer) return null;
  const { child, parent, plan } = swimmer;

  if (plan.currentWeek < 1) {
    return (
      <EmptyState icon={CalendarClock} title="Assessments open after the first session">
        {child.firstName}'s programme starts on {swimmer.nextSession ? formatLong(swimmer.nextSession.date) : 'a date to be confirmed'}.
        The baseline assessment is recorded in that session.
      </EmptyState>
    );
  }

  const lastSession = data.sessions.find((s) => s.childIds.includes(child.id) && s.week === plan.currentWeek);
  const isDemoChild = child.parentId === DEMO_PARENT_ID;

  const update = (skillId: string, patch: Draft) => {
    setResult(null);
    setDraft((d) => ({ ...d, [skillId]: { ...d[skillId], ...patch } }));
  };
  const undo = (skillId: string) =>
    setDraft((d) => {
      const { [skillId]: _removed, ...rest } = d;
      return rest;
    });

  const viewAsParent = () => {
    enterAs('parent');
    navigate('/parent');
  };

  const save = () => {
    try {
      const saved = saveAssessment(child.id, changes);
      setDraft({});
      setOpenNotes(null);
      setResult(saved);
      toast({ title: 'Assessment saved', description: `${parent.firstName}'s dashboard now shows the update.` });
    } catch (error) {
      toast({
        tone: 'error',
        title: 'The assessment was not saved',
        description: error instanceof Error ? error.message : 'Try again.',
      });
    }
  };

  return (
    <div>
      <p className="mb-4 text-ink-2">
        Recording against week {plan.currentWeek}
        {lastSession && ` (session on ${formatMedium(lastSession.date)})`}. Select a state for each skill you observed,
        then save.
      </p>

      <AnimatePresence>
        {result && (
          <motion.div
            role="status"
            data-testid="save-result"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-aqua-soft p-4 sm:p-5"
          >
            <div className="flex min-w-0 gap-3">
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-aqua-dark" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-display font-semibold">
                  Saved. {fullName(parent)}'s dashboard has been updated.
                </p>
                <ul className="tabular mt-1 text-[0.95rem] leading-snug text-ink-2">
                  {result.statusChanges.length > 0 && (
                    <li>
                      {plural(result.statusChanges.length, 'skill')} reassessed and added to the history.
                    </li>
                  )}
                  {result.notesUpdated > 0 && <li>Notes updated on {plural(result.notesUpdated, 'skill')}.</li>}
                  {result.before.achievedPct !== null && result.after.achievedPct !== null && (
                    <li>
                      Targets achieved:{' '}
                      {result.before.achievedPct === result.after.achievedPct
                        ? `unchanged at ${result.after.achievedPct}%`
                        : `${result.before.achievedPct}% to ${result.after.achievedPct}%`}
                      . Skills mastered:{' '}
                      {result.before.mastered === result.after.mastered
                        ? `unchanged at ${result.after.mastered}`
                        : `${result.before.mastered} to ${result.after.mastered}`}
                      .
                    </li>
                  )}
                  {result.newAchievements.map((a) => (
                    <li key={a.id} className="font-semibold text-ink">
                      Achievement sent to {parent.firstName}: {a.title}
                    </li>
                  ))}
                  {result.removedAchievements > 0 && (
                    <li>{plural(result.removedAchievements, 'achievement')} withdrawn, because the skill is no longer marked Mastered.</li>
                  )}
                </ul>
              </div>
            </div>
            {isDemoChild ? (
              <Button variant="primary" size="sm" onClick={viewAsParent}>
                <Eye className="size-4" aria-hidden="true" />
                View as parent
              </Button>
            ) : (
              <p className="max-w-56 text-sm text-ink-2">The parent demo is linked to Oliver Williams, so open his plan to see the parent view change.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6">
        {CATEGORIES.map((category) => {
          const inCategory = skills.filter((s) => s.categoryId === category.id);
          if (inCategory.length === 0) return null;
          return (
            <section key={category.id} aria-labelledby={`assess-${category.id}`}>
              <h3 id={`assess-${category.id}`} className="mb-2 text-lg font-semibold">
                {category.name}
              </h3>
              <ul className="panel divide-y divide-line overflow-hidden">
                {inCategory.map((skill) => {
                  const note = plan.skillNotes[skill.id] ?? {};
                  return (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      saved={currentStatus(data.assessments, child.id, skill.id)}
                      draft={draft[skill.id]}
                      savedFeedback={note.feedback ?? ''}
                      savedTarget={note.nextTarget ?? ''}
                      parentName={parent.firstName}
                      notesOpen={openNotes === skill.id}
                      onToggleNotes={() => setOpenNotes((id) => (id === skill.id ? null : skill.id))}
                      onChange={(patch) => update(skill.id, patch)}
                      onUndo={() => undo(skill.id)}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Save bar: stays in view while there is something to save. */}
      <div className={cx('pointer-events-none z-20 mt-6', changes.length > 0 && 'sticky bottom-20 lg:bottom-5')}>
        <div
          className={cx(
            'pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 pl-5 transition-colors',
            changes.length > 0 ? 'bg-deep text-white shadow-overlay' : 'border border-line bg-surface text-ink-2',
          )}
        >
          <p className="tabular font-semibold" aria-live="polite" data-testid="unsaved-count">
            {changes.length > 0 ? `${plural(changes.length, 'unsaved change')}` : 'No unsaved changes'}
          </p>
          <div className="flex gap-2">
            {changes.length > 0 && (
              <button
                type="button"
                onClick={() => setDraft({})}
                className="min-h-11 rounded-xl px-3 font-semibold text-white/85 hover:bg-white/10 hover:text-white"
              >
                Discard
              </button>
            )}
            <Button variant={changes.length > 0 ? 'onDeep' : 'secondary'} disabled={changes.length === 0} onClick={save}>
              Save assessment
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
        {STATUS_ORDER.map((status) => (
          <span key={status} className="inline-flex max-w-xs items-start gap-2">
            <StatusBadge status={status} size="sm" />
          </span>
        ))}
        <span>Consistent and Mastered count as an achieved target. Marking a skill Mastered sends the parent an achievement.</span>
      </div>
    </div>
  );
}
