import { useId } from 'react';
import { STATUS_ORDER } from '@/lib/progress';
import { STATUS_META, UNASSESSED_LABEL, statusLabel } from '@/lib/status';
import type { SkillStatus } from '@/types';
import { cx } from './primitives';

/** How full the gauge is for each state. Shape carries the meaning, so colour is never the only cue. */
const FILL_LEVEL: Record<SkillStatus, number> = { not_yet: 0, developing: 0.42, consistent: 0.74, mastered: 1 };

/**
 * Depth gauge: a circle that fills with water as a skill becomes more secure.
 * Empty ring = Not Yet Achieved, part-filled = Developing, mostly filled = Consistent,
 * full with a tick = Mastered, dashed ring = not yet assessed.
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
    : status === null || status === 'not_yet'
      ? 'var(--color-control)'
      : status === 'mastered'
        ? 'var(--color-st-mas)'
        : 'var(--color-st-con)';
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
      {status === 'mastered' && (
        <path
          d="M7.6 12.4l3 3 5.8-6.2"
          fill="none"
          stroke={inverse ? 'var(--color-st-mas)' : '#ffffff'}
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
        {UNASSESSED_LABEL}
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
      <StatusIcon status={status} size={size === 'sm' ? 14 : 16} inverse={status === 'mastered'} />
      {STATUS_META[status].label}
    </span>
  );
}

/** One segment per skill, coloured by its current state. Summarises a group of skills at a glance. */
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
              : status === 'mastered' && onDeep
                ? 'bg-white'
                : STATUS_META[status].swatch,
          )}
        />
      ))}
    </span>
  );
}

/** The four states with their plain-English meaning. */
export function StatusLegend({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-2">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <StatusIcon status={status} size={16} />
            {STATUS_META[status].label}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {STATUS_ORDER.map((status) => (
        <div key={status} className="flex gap-3">
          <StatusIcon status={status} size={22} className="mt-0.5" />
          <div>
            <dt className="font-semibold">{STATUS_META[status].label}</dt>
            <dd className="text-[0.95rem] leading-snug text-ink-2">{STATUS_META[status].description}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export { statusLabel };
