import { Link } from 'react-router';
import { cx } from '@/components/ui/primitives';
import { CATEGORIES } from '@/data/skills';
import { STATUS_ORDER, currentStatus, statusLevel } from '@/lib/progress';
import { STATUS_META, statusLabel } from '@/lib/status';
import type { SkillAssessment, SkillStatus, SwimmingSkill } from '@/types';

export interface ComparisonRow {
  skill: SwimmingSkill;
  from: SkillStatus | null;
  to: SkillStatus | null;
}

export function buildComparison(
  skills: SwimmingSkill[],
  assessments: SkillAssessment[],
  childId: string,
  fromWeek: number,
  toWeek: number,
): ComparisonRow[] {
  return skills.map((skill) => ({
    skill,
    from: currentStatus(assessments, childId, skill.id, fromWeek),
    to: currentStatus(assessments, childId, skill.id, toWeek),
  }));
}

export function describeChange(row: ComparisonRow): string {
  if (row.to === null) return 'Not Assessed';
  if (row.from === null) return 'First assessed';
  // Direction only. The levels are ordered labels, so no "distance" between them is reported.
  const direction = statusLevel(row.to) - statusLevel(row.from);
  if (direction === 0) return 'No change';
  return direction > 0 ? 'Moved up' : 'Moved down';
}

const position = (status: SkillStatus) => ((statusLevel(status) + 0.5) / STATUS_ORDER.length) * 100;

/** A four-step track with a hollow marker for the earlier week and a filled marker for the later one. */
function Track({ row }: { row: ComparisonRow }) {
  const { from, to } = row;
  const start = from ? position(from) : null;
  const end = to ? position(to) : null;
  return (
    <span aria-hidden="true" className="relative block h-7">
      <span className="absolute inset-x-0 top-1/2 grid -translate-y-1/2 grid-cols-4">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="mx-auto size-1.5 rounded-full bg-line-strong" />
        ))}
      </span>
      {start !== null && end !== null && start !== end && (
        <span
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-st-fair"
          style={{ left: `${Math.min(start, end)}%`, width: `${Math.abs(end - start)}%` }}
        />
      )}
      {start !== null && start !== end && (
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-3 bg-surface"
          style={{ left: `${start}%` }}
        />
      )}
      {end !== null && to && (
        <span
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
          style={{ left: `${end}%`, background: STATUS_META[to].color }}
        />
      )}
    </span>
  );
}

/** Per-skill comparison between two weeks. Doubles as the table view of the trend chart. */
export function BaselineComparison({
  rows,
  fromWeek,
  toWeek,
  skillLink,
}: {
  rows: ComparisonRow[];
  fromWeek: number;
  toWeek: number;
  skillLink: (skillId: string) => string;
}) {
  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_5.75rem] items-end gap-4 border-b border-line pb-2 text-[0.8rem] text-ink-2 sm:grid">
        <span>Skill</span>
        <span className="grid grid-cols-4 text-center">
          {STATUS_ORDER.map((s) => (
            <span key={s} className="leading-tight">{STATUS_META[s].label}</span>
          ))}
        </span>
        <span className="text-right">Change</span>
      </div>
      {CATEGORIES.map((category) => {
        const inCategory = rows.filter((r) => r.skill.categoryId === category.id);
        if (inCategory.length === 0) return null;
        return (
          <div key={category.id} className="border-b border-line py-3 last:border-b-0">
            <h4 className="font-display text-[0.95rem] font-semibold">{category.name}</h4>
            <ul>
              {inCategory.map((row) => {
                const change = describeChange(row);
                const steps = row.from && row.to ? statusLevel(row.to) - statusLevel(row.from) : 0;
                return (
                  <li
                    key={row.skill.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_5.75rem]"
                  >
                    <Link
                      to={skillLink(row.skill.id)}
                      className="min-w-0 font-medium underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-ink"
                    >
                      {row.skill.name}
                      <span className="sr-only">
                        : {statusLabel(row.from)} in week {fromWeek}, {statusLabel(row.to)} in week {toWeek}.
                      </span>
                    </Link>
                    <span className="order-3 col-span-2 sm:order-none sm:col-span-1">
                      <Track row={row} />
                      <span aria-hidden="true" className="grid grid-cols-4 text-center text-[0.7rem] text-ink-3 sm:hidden">
                        {STATUS_ORDER.map((s) => (
                          <span key={s} className="leading-tight">{STATUS_META[s].label}</span>
                        ))}
                      </span>
                    </span>
                    <span
                      className={cx(
                        'text-right text-sm whitespace-nowrap',
                        steps > 0 ? 'font-semibold text-st-good-ink' : 'text-ink-2',
                      )}
                    >
                      {change}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-2">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-3.5 rounded-full border-2 border-ink-3 bg-surface" />
          Week {fromWeek}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-4 rounded-full bg-st-good" />
          Week {toWeek}
        </span>
      </p>
    </div>
  );
}
