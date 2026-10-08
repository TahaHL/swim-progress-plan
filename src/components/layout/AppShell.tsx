import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { LogOut, RotateCcw, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Button, cx } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useApp } from '@/store/AppStore';
import type { Role } from '@/types';
import { Logo } from './Logo';

export interface NavItem {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Parent / Instructor switch. Present on every screen so the two views can be compared quickly. */
export function RoleSwitch({ className }: { className?: string }) {
  const { role, enterAs } = useApp();
  const navigate = useNavigate();
  const options: { role: Role; label: string }[] = [
    { role: 'parent', label: 'Parent' },
    { role: 'instructor', label: 'Instructor' },
  ];
  return (
    <div role="group" aria-label="Demo view" className={cx('inline-flex rounded-full bg-white/10 p-0.5', className)}>
      {options.map((option) => (
        <button
          key={option.role}
          type="button"
          aria-pressed={role === option.role}
          onClick={() => {
            enterAs(option.role);
            navigate(`/${option.role}`);
          }}
          className={cx(
            'min-h-8 rounded-full px-3 text-sm font-semibold transition-colors',
            role === option.role ? 'bg-white text-deep' : 'text-white/85 hover:text-white',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function DemoBar() {
  const { persistent, saveError } = useApp();
  return (
    <div className="bg-deep text-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex min-h-11 items-center justify-between gap-3 px-4 py-1.5 lg:px-6">
        <p className="min-w-0 text-sm leading-tight text-white/85">
          <span className="font-semibold text-white">Demonstration</span>
          <span className="hidden sm:inline">. Fictional swimmers, simulated sign-in, no real accounts.</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-sm text-white/70 md:inline">Viewing as</span>
          <RoleSwitch />
        </div>
      </div>
      {(!persistent || saveError) && (
        <p className="flex items-center gap-2 bg-buoy px-4 py-1.5 text-sm font-medium text-deep lg:px-6">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {saveError ?? 'This browser is blocking storage, so changes will last only until the page is closed.'}
        </p>
      )}
    </div>
  );
}

/** Button plus confirmation dialog that restores the original fictional data. */
export function ResetDemoButton({ variant = 'secondary' }: { variant?: 'secondary' | 'ghost' }) {
  const { resetDemo } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await resetDemo();
      toast({ title: 'Demo data reset', description: 'All assessments, notes and notifications are back to the original examples.' });
      setOpen(false);
    } catch {
      toast({ tone: 'error', title: 'The demo data could not be reset', description: 'Check that this browser allows site storage, then try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Reset demo data
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title="Reset demo data?"
        description="Every assessment, note and notification added during this demo will be removed, and the original fictional examples restored."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} data-autofocus>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirm} disabled={busy}>
              {busy ? 'Resetting' : 'Reset demo data'}
            </Button>
          </>
        }
      />
    </>
  );
}

export function AppShell({
  nav,
  user,
  headerExtras,
  navLabel,
}: {
  nav: NavItem[];
  user: { name: string; detail: string };
  /** Rendered at the right of the header (for example the notification bell). */
  headerExtras?: ReactNode;
  navLabel: string;
}) {
  const { exitDemo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // On navigation: back to the top, and move focus to the new page for keyboard and screen reader users.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  const leave = () => {
    exitDemo();
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:shadow-raised"
      >
        Skip to content
      </a>
      <DemoBar />

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
          <Logo className="px-2" />
          <nav aria-label={navLabel} className="mt-8 flex flex-col gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold transition-colors',
                    isActive ? 'bg-deep text-white' : 'text-ink-2 hover:bg-canvas hover:text-ink',
                  )
                }
              >
                <item.icon className="size-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-line pt-4">
            <p className="px-2 font-semibold">{user.name}</p>
            <p className="px-2 text-sm text-ink-2">{user.detail}</p>
            <button
              type="button"
              onClick={leave}
              className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-[0.95rem] font-semibold text-ink-2 hover:bg-canvas hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Exit demo
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <div
            className="sticky z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-canvas/95 px-4 backdrop-blur lg:hidden"
            style={{ top: 'env(safe-area-inset-top, 0px)' }}
          >
            <Logo size={32} />
            {headerExtras}
          </div>
          {/* Desktop header */}
          {headerExtras && (
            <div className="hidden h-20 items-center justify-end px-10 lg:flex">{headerExtras}</div>
          )}

          <main
            id="main"
            ref={mainRef}
            tabIndex={-1}
            className={cx(
              'mx-auto w-full max-w-6xl px-4 pt-6 pb-32 focus-visible:outline-none sm:px-6 lg:px-10 lg:pb-16',
              headerExtras ? 'lg:pt-0' : 'lg:pt-10',
            )}
          >
            <motion.div
              key={location.pathname}
              initial={reduced ? false : { opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label={navLabel}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/97 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <ul className="mx-auto flex max-w-xl">
          {nav.map((item) => (
            <li key={item.to} className="min-w-0 flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cx(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[0.72rem] leading-none font-semibold',
                    isActive ? 'text-deep' : 'text-ink-3',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-aqua-soft')}>
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="max-w-full truncate px-0.5">{item.shortLabel ?? item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
