import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import type { AvatarTone } from '@/types';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ Buttons */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onDeep' | 'danger';
type ButtonSize = 'md' | 'sm';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-deep text-white hover:bg-deep-2',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-canvas',
  ghost: 'text-ink-2 hover:bg-sunken hover:text-ink',
  onDeep: 'bg-white text-deep hover:bg-foam',
  danger: 'bg-danger text-white hover:opacity-90',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 text-base',
  sm: 'min-h-9 px-3 text-sm',
};

/** Class string for anything that should look like a button (also used on links). */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra?: string) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
    'disabled:opacity-45 disabled:pointer-events-none',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    extra,
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

/* ------------------------------------------------------------------ Avatar */

const AVATAR_TONES: Record<AvatarTone, string> = {
  aqua: 'bg-aqua-soft text-aqua-dark',
  ocean: 'bg-foam text-ocean-dark',
  buoy: 'bg-buoy-soft text-buoy-ink',
  deep: 'bg-deep text-white',
  slate: 'bg-sunken text-ink-2',
};

export function Avatar({
  firstName,
  lastName,
  tone = 'aqua',
  size = 'md',
  onDeep = false,
}: {
  firstName: string;
  lastName: string;
  tone?: AvatarTone;
  size?: 'sm' | 'md' | 'lg';
  onDeep?: boolean;
}) {
  const sizes = { sm: 'size-9 text-sm', md: 'size-11 text-base', lg: 'size-16 text-xl' };
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full font-display font-semibold',
        sizes[size],
        onDeep ? 'bg-aqua text-deep' : AVATAR_TONES[tone],
      )}
    >
      {firstName.charAt(0)}
      {lastName.charAt(0)}
    </span>
  );
}

/* ------------------------------------------------------------------ Page structure */

export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: { to: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 sm:mb-8">
      {back && (
        <Link
          to={back.to}
          className="-ml-1 mb-3 inline-flex min-h-9 items-center gap-1 rounded-lg pr-2 text-sm font-semibold text-ink-2 hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-[1.7rem] leading-tight font-semibold sm:text-[2rem]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-2xl text-lg text-ink-2">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 id={id} className="text-xl font-semibold">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-sunken text-ink-2">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {children && <p className="mt-1 max-w-md text-ink-2">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Small factual note, used for scope statements such as "not an official stage assessment". */
export function Note({ icon: Icon, children, tone = 'plain' }: { icon: LucideIcon; children: ReactNode; tone?: 'plain' | 'foam' }) {
  return (
    <p
      className={cx(
        'flex gap-2.5 rounded-xl px-3.5 py-3 text-[0.95rem] leading-snug text-ink-2',
        tone === 'foam' ? 'bg-foam' : 'bg-sunken',
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ Loading */

export function PageSkeleton() {
  return (
    <div className="min-h-dvh bg-canvas" role="status" aria-live="polite">
      <span className="sr-only">Loading Swim Progress Plan</span>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton mt-3 h-5 w-72" />
        <div className="skeleton mt-8 h-56 w-full !rounded-3xl" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="skeleton h-40" />
          <div className="skeleton h-40" />
        </div>
        <div className="skeleton mt-6 h-64 w-full" />
      </div>
    </div>
  );
}

/** Shown inside the app shell while a page is being loaded. */
export function ContentSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="skeleton h-8 w-56" />
      <div className="skeleton mt-3 h-5 w-80 max-w-full" />
      <div className="skeleton mt-8 h-40 w-full !rounded-3xl" />
      <div className="skeleton mt-6 h-64 w-full" />
    </div>
  );
}
