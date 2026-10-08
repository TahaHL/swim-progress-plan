import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CalendarClock, CircleCheck, Eye, ListFilter, NotebookPen, RotateCcw } from 'lucide-react';
import { ProvisionalNote, StatusBadge, StatusIcon } from '@/components/ui/Status';
import { useToast } from '@/components/ui/Toast';
import { Button, EmptyState, cx } from '@/components/ui/primitives';
import { DEMO_PARENT_ID } from '@/config/demo';
import { CATEGORIES } from '@/data/skills';
import type { SkillChange } from '@/lib/assessmentService';
import { formatLong, formatMedium } from '@/lib/dates';
import { plural } from '@/lib/format';
import { STATUS_ORDER, currentStatus, isPass } from '@/lib/progress';
import { STATUS_META, statusLabel } from '@/lib/status';
import { useApp, type SessionResult } from '@/store/AppStore';
import { EMPTY_DRAFT, useAssessmentDrafts, type SkillDraft } from '@/store/AssessmentDrafts';
import { fullName, planSkills, selectSwimmer } from '@/store/selectors';
import type { SkillStatus, SwimmingSkill } from '@/types';

/** The five labels in order, as choices. null is Not Assessed. */
const CHOICES: (SkillStatus | null)[] = [null, ...STATUS_ORDER];

/**
 * The five labels for one skill. Behaves as a radio group: arrow keys move and select.
 * Not Assessed is first. Choosing it for a skill that has a level sets the skill back to Not
 * Assessed: the earlier assessments stay in its history, and it stops counting as assessed.
 */
function StatusRadio({
  value,
  onChange,
  label,
}: {
  value: SkillStatus | null;
  onChange: (status: SkillStatus | null) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = CHOICES.indexOf(value);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + CHOICES.length) % CHOICES.length;
    onChange(CHOICES[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-5 gap-1 sm:gap-1.5">
      {CHOICES.map((status, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={status ?? 'not-assessed'}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(status)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-0.5 text-center text-[0.72rem] leading-[1.1] font-semibold transition-colors sm:min-h-12 sm:px-1 sm:text-[0.8125rem]',
              selected
                ? cx(
                    status === null ? 'border-dashed border-ink-2 bg-sunken text-ink' : cx(STATUS_META[status].chip, 'border-transparent'),
                    'ring-2 ring-deep ring-inset',
                  )
                : 'border-control bg-surface text-ink-2 hover:border-ink-2 hover:text-ink',
            )}
          >
            <StatusIcon
              status={status}
              size={16}
              inverse={selected && status === 'pass'}
              className={selected ? undefined : 'opacity-60'}
            />
            {statusLabel(status)}
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
  draft: SkillDraft | undefined;
  savedFeedback: string;
  savedTarget: string;
  parentName: string;
  notesOpen: boolean;
  onToggleNotes: () => void;
  onChange: (patch: SkillDraft) => void;
  onUndo: () => void;
}) {
  const value = draft?.status !== undefined ? draft.status : saved;
  const statusChanged = draft?.status !== undefined && draft.status !== saved;
  const notesChanged =
    (draft?.feedback !== undefined && draft.feedback.trim() !== savedFeedback) ||
    (draft?.nextTarget !== undefined && draft.nextTarget.trim() !== savedTarget);
  const changed = statusChanged || notesChanged;

  return (
    <li data-testid={`assess-${skill.id}`} className={cx('px-4 py-4 transition-colors sm:px-5', changed && 'bg-foam')}>
      <div className="grid gap-x-5 gap-y-3 xl:grid-cols-[minmax(0,1fr)_31rem] xl:items-center">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display font-medium">{skill.name}</p>
            <p className="text-[0.95rem] text-ink-2">
              {statusChanged ? (
                <span className="font-semibold text-ocean-dark">
                  Was {saved ? STATUS_META[saved].label : 'Not Assessed'}
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
        <div
          id={`notes-${skill.id}`}
          className="mt-4 grid gap-4 border-t border-line pt-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]"
        >
          <div>
            <label htmlFor={`feedback-${skill.id}`} className="mb-1 block text-sm font-semibold">
              Coaching note for {parentName}
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

type Filter = 'all' | 'working';

/**
 * The instructor's assessment sheet for one swimmer: a state for each skill, an optional note
 * for the parent and the next coaching priority, all committed with one "Save assessment".
 * Unsaved work is held in the drafts store, so it survives moving to another swimmer or page.
 * Saving updates the history, the progress figures, the parent's dashboard and, for a newly
 * passed skill, the parent's achievements.
 */
export function AssessmentPanel({
  childId,
  next,
}: {
  childId: string;
  /** The next swimmer to assess, offered once this one is saved. */
  next?: { name: string; onSelect: () => void };
}) {
  const { data, saveSession, enterAs } = useApp();
  const { drafts, update, clear } = useAssessmentDrafts();
  const toast = useToast();
  const navigate = useNavigate();
  const swimmer = selectSwimmer(data, childId);
  const draft = drafts[childId] ?? EMPTY_DRAFT;
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  /** Skills saved in this sitting stay visible under the "Not yet Pass" filter. */
  const [justSaved, setJustSaved] = useState<string[]>([]);

  const skills = useMemo(() => (swimmer ? planSkills(swimmer.plan) : []), [swimmer]);

  const changes = useMemo<SkillChange[]>(() => {
    if (!swimmer) return [];
    const list: SkillChange[] = [];
    for (const skill of skills) {
      const d = draft.skills[skill.id];
      if (!d) continue;
      const saved = currentStatus(data.assessments, childId, skill.id);
      const note = swimmer.plan.skillNotes[skill.id] ?? {};
      const change: SkillChange = { skillId: skill.id };
      if (d.status !== undefined && d.status !== saved) change.status = d.status;
      if (d.feedback !== undefined && d.feedback.trim() !== (note.feedback ?? '')) change.feedback = d.feedback;
      if (d.nextTarget !== undefined && d.nextTarget.trim() !== (note.nextTarget ?? '')) change.nextTarget = d.nextTarget;
      if (change.status !== undefined || change.feedback !== undefined || change.nextTarget !== undefined) list.push(change);
    }
    return list;
  }, [draft.skills, skills, swimmer, data.assessments, childId]);

  if (!swimmer) return null;
  const { child, parent, plan } = swimmer;

  if (plan.currentWeek < 1) {
    return (
      <EmptyState icon={CalendarClock} title="Assessments open after the first session">
        {child.firstName}'s programme starts on{' '}
        {swimmer.nextSession ? formatLong(swimmer.nextSession.date) : 'a date to be confirmed'}. The baseline assessment
        is recorded in that session.
      </EmptyState>
    );
  }

  const lastSession = data.sessions.find((s) => s.childIds.includes(child.id) && s.week === plan.currentWeek);
  const isDemoChild = child.parentId === DEMO_PARENT_ID;
  const note = draft.note;
  const priority = draft.priority ?? plan.nextPriority;
  const priorityChanged = priority.trim() !== '' && priority.trim() !== plan.nextPriority;
  const unsaved = changes.length + (note.trim() ? 1 : 0) + (priorityChanged ? 1 : 0);

  const statusOf = (skill: SwimmingSkill) => currentStatus(data.assessments, child.id, skill.id);
  const workingCount = skills.filter((s) => !isPass(statusOf(s))).length;
  const visible =
    filter === 'all'
      ? skills
      : skills.filter((s) => !isPass(statusOf(s)) || draft.skills[s.id] !== undefined || justSaved.includes(s.id));

  const updateSkill = (skillId: string, patch: SkillDraft) => {
    setResult(null);
    update(child.id, (d) => ({ ...d, skills: { ...d.skills, [skillId]: { ...d.skills[skillId], ...patch } } }));
  };
  const undoSkill = (skillId: string) =>
    update(child.id, (d) => {
      const { [skillId]: _removed, ...rest } = d.skills;
      return { ...d, skills: rest };
    });

  const viewAsParent = () => {
    enterAs('parent');
    navigate('/parent');
  };

  const save = () => {
    try {
      const saved = saveSession(child.id, { changes, note, priority: priorityChanged ? priority : undefined });
      setJustSaved((ids) => [...new Set([...ids, ...changes.map((c) => c.skillId)])]);
      clear(child.id);
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

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All skills', count: skills.length },
    { id: 'working', label: 'Not yet Pass', count: workingCount },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="max-w-prose text-ink-2">
          Recording against week {plan.currentWeek}
          {lastSession && ` (session on ${formatMedium(lastSession.date)})`}. Set a state for each skill you observed,
          add a note if you want to, then save once.
        </p>
        <div role="group" aria-label="Skills shown" className="inline-flex shrink-0 rounded-xl bg-sunken p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cx(
                'tabular min-h-9 rounded-lg px-3 text-[0.95rem] font-semibold transition-colors',
                filter === f.id ? 'bg-surface text-ink shadow-raised' : 'text-ink-2 hover:text-ink',
              )}
            >
              {f.label} <span className="font-normal text-ink-3">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

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
                <p className="font-display font-semibold">Saved. {fullName(parent)}'s dashboard has been updated.</p>
                <ul className="tabular mt-1 text-[0.95rem] leading-snug text-ink-2">
                  {result.statusChanges.length > 0 && (
                    <li>{plural(result.statusChanges.length, 'skill')} reassessed and added to the history.</li>
                  )}
                  {result.notesUpdated > 0 && <li>Coaching notes updated on {plural(result.notesUpdated, 'skill')}.</li>}
                  {result.noteSent && <li>Session note sent to {parent.firstName}.</li>}
                  {result.priorityChanged && <li>Next coaching priority updated.</li>}
                  {result.after.assessed > 0 && (
                    <li>
                      Skills marked Pass:{' '}
                      {result.before.passed === result.after.passed && result.before.assessed === result.after.assessed
                        ? `unchanged at ${result.after.passed} of ${result.after.assessed} assessed`
                        : `${result.before.passed} of ${result.before.assessed} to ${result.after.passed} of ${result.after.assessed} assessed`}
                      .
                    </li>
                  )}
                  {result.newAchievements.map((a) => (
                    <li key={a.id} className="font-semibold text-ink">
                      Achievement sent to {parent.firstName}: {a.title}
                    </li>
                  ))}
                  {result.removedAchievements > 0 && (
                    <li>
                      {plural(result.removedAchievements, 'achievement')} withdrawn, because the skill is no longer
                      marked Pass.
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isDemoChild && (
                <Button variant={next ? 'secondary' : 'primary'} size="sm" onClick={viewAsParent}>
                  <Eye className="size-4" aria-hidden="true" />
                  View as parent
                </Button>
              )}
              {next && (
                <Button variant="primary" size="sm" onClick={next.onSelect}>
                  Next: {next.name}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {visible.length === 0 ? (
        <EmptyState
          icon={ListFilter}
          title="Every skill is marked Pass"
          action={
            <Button variant="secondary" onClick={() => setFilter('all')}>
              Show all skills
            </Button>
          }
        >
          Every skill in {child.firstName}'s plan is marked Pass. That is a result for these skills, not a stage award.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORIES.map((category) => {
            const inCategory = visible.filter((s) => s.categoryId === category.id);
            if (inCategory.length === 0) return null;
            return (
              <section key={category.id} aria-labelledby={`assess-${category.id}`}>
                <h3 id={`assess-${category.id}`} className="mb-2 text-lg font-semibold">
                  {category.name}
                </h3>
                <ul className="panel divide-y divide-line overflow-hidden">
                  {inCategory.map((skill) => {
                    const skillNote = plan.skillNotes[skill.id] ?? {};
                    return (
                      <SkillRow
                        key={skill.id}
                        skill={skill}
                        saved={statusOf(skill)}
                        draft={draft.skills[skill.id]}
                        savedFeedback={skillNote.feedback ?? ''}
                        savedTarget={skillNote.nextTarget ?? ''}
                        parentName={parent.firstName}
                        notesOpen={openNotes === skill.id}
                        onToggleNotes={() => setOpenNotes((id) => (id === skill.id ? null : skill.id))}
                        onChange={(patch) => updateSkill(skill.id, patch)}
                        onUndo={() => undoSkill(skill.id)}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <section aria-labelledby="session-summary" className="panel mt-6 p-4 sm:p-5">
        <h3 id="session-summary" className="text-lg font-semibold">
          For {parent.firstName}
        </h3>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="session-note" className="mb-1 block text-sm font-semibold">
              Session note <span className="font-normal text-ink-2">(optional)</span>
            </label>
            <textarea
              id="session-note"
              rows={3}
              className="field"
              placeholder={`A sentence or two on how ${child.firstName} got on today.`}
              value={note}
              onChange={(e) => {
                setResult(null);
                update(child.id, (d) => ({ ...d, note: e.target.value }));
              }}
            />
            <p className="mt-1 text-sm text-ink-3">Becomes the latest instructor update on the parent dashboard.</p>
          </div>
          <div>
            <label htmlFor="session-priority" className="mb-1 block text-sm font-semibold">
              Next coaching priority
            </label>
            <textarea
              id="session-priority"
              rows={3}
              className="field"
              value={priority}
              onChange={(e) => {
                setResult(null);
                update(child.id, (d) => ({ ...d, priority: e.target.value }));
              }}
            />
            <p className="mt-1 text-sm text-ink-3">One sentence. Shown on the parent dashboard.</p>
          </div>
        </div>
      </section>

      {/* Save bar: stays in view while there is something to save. */}
      <div className={cx('pointer-events-none z-20 mt-6', unsaved > 0 && 'sticky bottom-20 lg:bottom-5')}>
        <div
          className={cx(
            'pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 pl-5 transition-colors',
            unsaved > 0 ? 'bg-deep text-white shadow-overlay' : 'border border-line bg-surface text-ink-2',
          )}
        >
          <p className="tabular font-semibold" aria-live="polite" data-testid="unsaved-count">
            {unsaved > 0 ? `${plural(unsaved, 'unsaved change')} for ${child.firstName}` : 'No unsaved changes'}
          </p>
          <div className="flex gap-2">
            {unsaved > 0 && (
              <button
                type="button"
                onClick={() => clear(child.id)}
                className="min-h-11 rounded-xl px-3 font-semibold text-white/85 hover:bg-white/10 hover:text-white"
              >
                Discard
              </button>
            )}
            <Button variant={unsaved > 0 ? 'onDeep' : 'secondary'} disabled={unsaved === 0} onClick={save}>
              Save assessment
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-2">
        {CHOICES.map((status) => (
          <StatusBadge key={status ?? 'not-assessed'} status={status} size="sm" />
        ))}
        <span className="basis-full">
          Not Assessed means no current assessment, and those skills are not counted. Setting a skill back to Not
          Assessed keeps its earlier assessments in the history. Only Pass is counted in the parent's "skills
          marked Pass" figure; Good is not counted as Pass. Marking a skill Pass sends the parent an achievement
          for that skill.
        </span>
        <ProvisionalNote className="basis-full" />
      </div>
    </div>
  );
}
