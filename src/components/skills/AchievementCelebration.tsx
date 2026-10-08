import { useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Award } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, cx } from '@/components/ui/primitives';
import { useApp, useParentScope } from '@/store/AppStore';

/** Rings spreading outward like a ripple on water. Plays once; absent under reduced motion. */
export function Ripple({ className, rings = 3 }: { className?: string; rings?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <span aria-hidden="true" className={cx('pointer-events-none absolute inset-0', className)}>
      {Array.from({ length: rings }, (_, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-buoy"
          initial={{ scale: 0.9, opacity: 0.55 }}
          animate={{ scale: 2.3, opacity: 0 }}
          transition={{ duration: 1.8, delay: 0.15 + i * 0.4, ease: 'easeOut' }}
        />
      ))}
    </span>
  );
}

export function Medal({ size = 'md', ripple = false }: { size?: 'md' | 'lg'; ripple?: boolean }) {
  return (
    <span className={cx('relative inline-grid shrink-0 place-items-center', size === 'lg' ? 'size-20' : 'size-12')}>
      {ripple && <Ripple />}
      <span className="relative grid size-full place-items-center rounded-full bg-buoy text-deep">
        <Award className={size === 'lg' ? 'size-9' : 'size-6'} aria-hidden="true" />
      </span>
    </span>
  );
}

/**
 * Shown once, the first time the parent view opens after a skill has newly been marked Mastered.
 * The notification stays in the list afterwards; only the on-screen moment is one-off.
 */
export function AchievementCelebration() {
  const { notifications } = useParentScope();
  const { acknowledgeCelebration, markNotificationsRead } = useApp();
  const navigate = useNavigate();
  const pending = notifications.filter((n) => n.celebrate);
  const current = pending[pending.length - 1];

  if (!current) return null;

  return (
    <Modal
      open
      onClose={() => acknowledgeCelebration(current.id)}
      title={current.title}
      hideTitle
      size="sm"
    >
      <div className="flex flex-col items-center pt-6 pb-2 text-center">
        <Medal size="lg" ripple />
        <p className="mt-6 font-display text-2xl leading-tight font-semibold text-balance">{current.title}</p>
        <p className="mt-3 text-lg text-ink-2">{current.body}</p>
        <div className="mt-7 flex w-full flex-col gap-2">
          <Button
            data-autofocus
            onClick={() => {
              markNotificationsRead([current.id]);
              navigate(current.link);
            }}
          >
            See what we're working on next
          </Button>
          <Button variant="ghost" onClick={() => acknowledgeCelebration(current.id)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
