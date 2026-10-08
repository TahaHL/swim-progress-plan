import { Link, useParams } from 'react-router';
import { LifeBuoy, MessageSquareText, SearchX, Target } from 'lucide-react';
import { VideoSection } from '@/components/skills/VideoSection';
import { ProvisionalNote, StatusBadge, StatusIcon } from '@/components/ui/Status';
import { Avatar, EmptyState, PageHeader, buttonClass, cx } from '@/components/ui/primitives';
import { PARTNER } from '@/config/demo';
import { getCategory, getSkill } from '@/data/skills';
import { formatMedium } from '@/lib/dates';
import { STATUS_ORDER, skillHistory } from '@/lib/progress';
import { statusDescription, statusLabel } from '@/lib/status';
import type { SkillStatus } from '@/types';
import { useParentScope } from '@/store/AppStore';
import { fullName } from '@/store/selectors';

const FIVE_LEVELS: (SkillStatus | null)[] = [null, ...STATUS_ORDER];

export default function SkillDetail() {
  const { skillId = '' } = useParams();
  const { child, plan, assessments, instructor } = useParentScope();
  const skill = plan.skillIds.includes(skillId) ? getSkill(skillId) : undefined;

  if (!skill) {
    return (
      <EmptyState
        icon={SearchX}
        title="This skill is not in the plan"
        action={
          <Link to="/parent/skills" className={buttonClass('primary')}>
            View all skills
          </Link>
        }
      >
        The link may be out of date. Every skill in {child.firstName}'s development plan is listed on the skills page.
      </EmptyState>
    );
  }

  const category = getCategory(skill.categoryId);
  const history = skillHistory(assessments, child.id, skill.id);
  const latest = history[history.length - 1];
  const status = latest?.status ?? null;
  const note = plan.skillNotes[skill.id] ?? {};

  return (
    <>
      <PageHeader
        back={{ to: `/parent/skills?area=${category.id}`, label: `${plan.strokeName} skills` }}
        title={skill.name}
        subtitle={`${category.name}. ${skill.summary}`}
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-8">
        {/* Assessment column: first on phones, right-hand side on desktop */}
        <div className="flex flex-col gap-6 lg:order-2">
          <section aria-labelledby="assessment-title" className="deep-panel p-5 sm:p-6">
            <h2 id="assessment-title" className="text-sm font-semibold text-white/70">
              Current assessment
            </h2>
            <div className="mt-3 flex items-center gap-3.5">
              <StatusIcon status={status} size={44} inverse />
              <div>
                <p className="font-display text-2xl leading-tight font-semibold" data-testid="skill-status">
                  {statusLabel(status)}
                </p>
                <p className="text-white/75">
                  {!latest
                    ? 'No assessment recorded yet'
                    : latest.status === null
                      ? `Set back to Not Assessed ${formatMedium(latest.date)}, week ${latest.week}`
                      : `Assessed ${formatMedium(latest.date)}, week ${latest.week}`}
                </p>
              </div>
            </div>
            <p className="mt-4 leading-snug text-white/85">
              {statusDescription(status)}
              {status === null && ` ${instructor.firstName} will assess it ${latest ? 'again ' : ''}later in the programme.`}
            </p>
            <ol aria-label="The five assessment labels, in order" className="mt-5 grid grid-cols-5 gap-1">
              {FIVE_LEVELS.map((s) => (
                <li
                  key={s ?? 'none'}
                  aria-current={s === status ? 'step' : undefined}
                  className={cx(
                    'grid min-h-11 place-items-center rounded-lg px-0.5 py-1.5 text-center text-[0.72rem] leading-tight font-semibold',
                    s === status ? 'bg-white text-deep' : 'bg-white/10 text-white/75',
                  )}
                >
                  {statusLabel(s)}
                </li>
              ))}
            </ol>
            <ProvisionalNote onDeep className="mt-3" />
            <p className="mt-3 text-sm leading-snug text-white/75">
              Assessed against Swim Progress Plan requirements for this one skill. A Pass here is not a stage award in{' '}
              {child.firstName}'s {PARTNER.lessonsLabel}.
            </p>
          </section>

          <section aria-labelledby="feedback-title" className="panel p-5 sm:p-6">
            <h2 id="feedback-title" className="flex items-center gap-2 text-sm font-semibold text-ink-2">
              <MessageSquareText className="size-4" aria-hidden="true" />
              Instructor feedback
            </h2>
            {note.feedback ? (
              <>
                <p className="mt-2 text-lg leading-relaxed" data-testid="skill-feedback">
                  {note.feedback}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar firstName={instructor.firstName} lastName={instructor.lastName} tone="ocean" size="sm" />
                  <p className="text-[0.95rem] leading-snug">
                    <span className="block font-semibold">{fullName(instructor)}</span>
                    <span className="text-ink-2">{instructor.qualification}</span>
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-ink-2">
                No feedback has been written for this skill yet. {instructor.firstName} adds feedback as each skill is
                assessed.
              </p>
            )}
          </section>

          <section aria-labelledby="target-title" className="rounded-[1.25rem] bg-foam p-5 sm:p-6">
            <h2 id="target-title" className="flex items-center gap-2 text-sm font-semibold text-ocean-dark">
              <Target className="size-4" aria-hidden="true" />
              Next development target
            </h2>
            <p className="mt-2 font-display text-lg leading-snug font-medium" data-testid="skill-target">
              {note.nextTarget ?? 'The next target will be set after this skill is assessed.'}
            </p>
          </section>
        </div>

        {/* Learning column */}
        <div className="flex min-w-0 flex-col gap-8 lg:order-1">
          <section aria-labelledby="objective-title">
            <h2 id="objective-title" className="text-xl font-semibold">
              Skill objective
            </h2>
            <p className="mt-2 max-w-prose text-lg leading-relaxed">{skill.objective}</p>
          </section>

          <section aria-labelledby="why-title">
            <h2 id="why-title" className="text-xl font-semibold">
              Why this skill matters
            </h2>
            <p className="mt-2 max-w-prose text-lg leading-relaxed text-ink-2">{skill.whyItMatters}</p>
          </section>

          <section aria-labelledby="criteria-title">
            <h2 id="criteria-title" className="text-xl font-semibold">
              Success criteria
            </h2>
            <p className="mt-1 text-ink-2">What {instructor.firstName} looks for when assessing this skill.</p>
            <ul className="panel mt-3 divide-y divide-line">
              {skill.successCriteria.map((criterion) => (
                <li key={criterion} className="flex gap-3 px-4 py-3.5 leading-snug sm:px-5">
                  <span aria-hidden="true" className="mt-[0.5rem] size-2 shrink-0 rounded-full bg-aqua" />
                  {criterion}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="video-title">
            <h2 id="video-title" className="text-xl font-semibold">
              Video demonstration
            </h2>
            <p className="mt-1 text-ink-2">The skill done well, the mistakes that are common while learning it, and what to watch for from the poolside.</p>
            <div className="mt-4">
              <VideoSection videos={skill.videos} skillName={skill.name} />
            </div>
            <p className="mt-6 flex gap-2.5 rounded-xl bg-sunken px-3.5 py-3 text-[0.95rem] leading-snug text-ink-2">
              <LifeBuoy className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden="true" />
              <span>
                Swimming skills must always be practised under qualified supervision. These videos explain what to look
                for. They are not instructions for unsupervised practice.
              </span>
            </p>
          </section>

          <section aria-labelledby="history-title">
            <h2 id="history-title" className="text-xl font-semibold">
              Assessment history
            </h2>
            {history.length === 0 ? (
              <p className="mt-2 text-ink-2">This skill has not been assessed yet, so there is no history to show.</p>
            ) : (
              <ol className="mt-3 flex flex-col">
                {[...history].reverse().map((entry, i, list) => (
                  <li key={entry.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < list.length - 1 && (
                      <span aria-hidden="true" className="absolute top-7 bottom-0 left-[0.6875rem] w-0.5 bg-line" />
                    )}
                    <StatusIcon status={entry.status} size={24} className="relative mt-0.5 bg-canvas" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <StatusBadge status={entry.status} size="sm" />
                        <span className="text-[0.95rem] text-ink-2">
                          Week {entry.week}, {formatMedium(entry.date)}
                        </span>
                      </p>
                      {entry.note && <p className="mt-1.5 leading-snug text-ink-2">{entry.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
