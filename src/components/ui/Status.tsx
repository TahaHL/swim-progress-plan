import { useId } from 'react';
import { STATUS_ORDER } from '@/lib/progress';
import { DEFINITIONS_CONFIRMED, NOT_ASSESSED, PROVISIONAL_NOTE, STATUS_META, statusDescription, statusLabel } from '@/lib/status';
import type { SkillStatus } from '@/types';
import { cx } from './primitives';

/** How full the gauge is for each level. Shape carries the meaning, so colour is never the only cue. */
const FILL_LEVEL: Record<SkillStatus, number> = { needs_practice: 0, fair: 0.42, good: 0.74, pass: 1 };

/**
 * Depth gauge: a circle that fills with water as a skill becomes more secure.
 * Dashed ring = Not Assessed, empty ring = Needs Practice, part-filled = Fair,
 * mostly filled = Good, full with a tick = Pass.
 */
export function StatusIcon({
  status,
  size = 20,
  inverse = false,
  className,
}: {
  status: SkillStatus | null;
  size?: number;
  /** For use on a dark background. */
  inverse?: boolean;
  className?: string;
}) {
  const clipId = useId();
  const ring = inverse
    ? '#ffffff'
    : status === null || status === 'needs_practice'
      ? 'var(--color-control)'
      : status === 'pass'
        ? 'var(--color-st-pass)'
        : 'var(--color-st-good)';
  const fill = inverse ? '#ffffff' : status ? STATUS_META[status].color : 'none';
  const level = status ? FILL_LEVEL[status] : 0;
  const waterTop = 2 + 20 * (1 - level);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cx('shrink-0', className)}
    >
      <clipPath id={clipId}>
        <circle cx="12" cy="12" r="9.2" />
      </clipPath>
      {level > 0 && <rect x="2" y={waterTop} width="20" height={22 - waterTop} fill={fill} clipPath={`url(#${clipId})`} />}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={ring}
        strokeWidth="2"
        strokeDasharray={status === null ? '3.2 3.1' : undefined}
      />
      {status === 'pass' && (
        <path
          d="M7.6 12.4l3 3 5.8-6.2"
          fill="none"
          stroke={inverse ? 'var(--color-st-pass)' : '#ffffff'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function StatusBadge({ status, size = 'md' }: { status: SkillStatus | null; size?: 'sm' | 'md' }) {
  const pad = size === 'sm' ? 'py-0.5 pl-1 pr-2 text-[0.8125rem]' : 'py-1 pl-1.5 pr-2.5 text-sm';
  if (!status) {
    return (
      <span
        className={cx(
          'inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong font-semibold whitespace-nowrap text-ink-2',
          pad,
        )}
      >
        <StatusIcon status={null} size={size === 'sm' ? 14 : 16} />
        {NOT_ASSESSED.label}
      </span>
    );
  }
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        pad,
        STATUS_META[status].chip,
      )}
    >
      <StatusIcon status={status} size={size === 'sm' ? 14 : 16} inverse={status === 'pass'} />
      {STATUS_META[status].label}
    </span>
  );
}

/** One segment per skill, coloured by its current level. Summarises a group of skills at a glance. */
export function SkillSegments({
  statuses,
  label,
  onDeep = false,
}: {
  statuses: (SkillStatus | null)[];
  label: string;
  onDeep?: boolean;
}) {
  return (
    <span role="img" aria-label={label} className="flex gap-[3px]">
      {statuses.map((status, i) => (
        <span
          key={i}
          className={cx(
            'h-2 min-w-3 flex-1 rounded-full',
            status === null
              ? cx('border border-dashed', onDeep ? 'border-white/40' : 'border-line-strong')
              : status === 'pass' && onDeep
                ? 'bg-white'
                : STATUS_META[status].swatch,
          )}
        />
      ))}
    </span>
  );
}

/** The five labels in their confirmed order. Not Assessed comes first and is not a grade. */
const FIVE_LEVELS: (SkillStatus | null)[] = [null, ...STATUS_ORDER];

/** Says plainly that the descriptions are not yet approved teaching definitions. */
export function ProvisionalNote({ className, onDeep = false }: { className?: string; onDeep?: boolean }) {
  if (DEFINITIONS_CONFIRMED) return null;
  return (
    <p data-testid="provisional-note" className={cx('text-sm leading-snug', onDeep ? 'text-white/75' : 'text-ink-2', className)}>
      {PROVISIONAL_NOTE}
    </p>
  );
}

/** The five labels with their provisional parent-friendly descriptions. */
export function StatusLegend({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-2">
        {FIVE_LEVELS.map((status) => (
          <li key={status ?? 'none'} className="inline-flex items-center gap-1.5">
            <StatusIcon status={status} size={16} />
            {statusLabel(status)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div>
      <ol className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {FIVE_LEVELS.map((status) => (
          <li key={status ?? 'none'} className="flex gap-3">
            <StatusIcon status={status} size={22} className="mt-0.5" />
            <p>
              <strong className="block font-semibold">{statusLabel(status)}</strong>
              <span className="block text-[0.95rem] leading-snug text-ink-2">{statusDescription(status)}</span>
            </p>
          </li>
        ))}
      </ol>
      <ProvisionalNote className="mt-4" />
    </div>
  );
}

export { statusLabel };
