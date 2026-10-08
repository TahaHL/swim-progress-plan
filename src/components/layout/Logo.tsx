import { BRAND } from '@/config/demo';
import { cx } from '@/components/ui/primitives';

/** The mark: two lane-rope waves, the lower one in aqua, rising left to right. */
export function LogoMark({ size = 36, onDeep = false }: { size?: number; onDeep?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" className="shrink-0">
      <rect width="36" height="36" rx="10" fill={onDeep ? '#ffffff' : 'var(--color-deep)'} />
      <path
        d="M8 23.5c2.5 0 2.5-2.4 5-2.4s2.5 2.4 5 2.4 2.5-2.4 5-2.4 2.5 2.4 5 2.4"
        fill="none"
        stroke="var(--color-aqua)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M8 16c2.5 0 2.5-2.4 5-2.4s2.5 2.4 5 2.4 2.5-2.4 5-2.4 2.5 2.4 5 2.4"
        fill="none"
        stroke={onDeep ? 'var(--color-deep)' : '#ffffff'}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ onDeep = false, size = 36, className }: { onDeep?: boolean; size?: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} onDeep={onDeep} />
      <span
        className={cx(
          'font-display text-[1.05rem] leading-none font-semibold tracking-tight whitespace-nowrap',
          onDeep ? 'text-white' : 'text-ink',
        )}
      >
        {BRAND.name}
      </span>
    </span>
  );
}
