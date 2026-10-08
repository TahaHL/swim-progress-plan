import { Check } from 'lucide-react';
import { cx } from '@/components/ui/primitives';

/**
 * The six weeks drawn as floats on a lane rope. Completed weeks are filled, the next session is
 * ringed, later weeks are hollow.
 */
export function JourneyLane({ totalWeeks, currentWeek }: { totalWeeks: number; currentWeek: number }) {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  return (
    <ol
      aria-label={`Programme progress: ${currentWeek} of ${totalWeeks} weeks completed`}
      className="relative flex items-start justify-between"
    >
      <span aria-hidden="true" className="absolute top-[1.125rem] right-[1.125rem] left-[1.125rem] h-0.5 bg-line" />
      <span
        aria-hidden="true"
        className="absolute top-[1.125rem] left-[1.125rem] h-0.5 bg-deep"
        style={{
          width: `calc((100% - 2.25rem) * ${Math.max(0, Math.min(currentWeek, totalWeeks) - 1) / Math.max(1, totalWeeks - 1)})`,
        }}
      />
      {weeks.map((week) => {
        const done = week <= currentWeek;
        const next = week === currentWeek + 1;
        return (
          <li key={week} className="relative flex flex-col items-center gap-1.5">
            <span
              className={cx(
                'tabular grid size-9 place-items-center rounded-full font-display text-sm font-semibold',
                done && 'bg-deep text-white',
                next && 'border-2 border-deep bg-surface text-deep',
                !done && !next && 'border-2 border-line-strong bg-surface text-ink-3',
              )}
            >
              {done ? <Check className="size-4" aria-hidden="true" /> : week}
            </span>
            <span className={cx('text-sm', done || next ? 'font-semibold text-ink' : 'text-ink-3')}>
              <span className="sr-only">Week </span>
              <span aria-hidden="true">Wk </span>
              {week}
              <span className="sr-only">{done ? ', completed' : next ? ', next session' : ', upcoming'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
