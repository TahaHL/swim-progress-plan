import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Bell, BellOff, ClipboardCheck, MessageSquareText } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { formatRelative } from '@/lib/dates';
import { useApp, useParentScope } from '@/store/AppStore';
import type { Notification } from '@/types';

const KIND_STYLE: Record<Notification['kind'], { icon: typeof Bell; className: string }> = {
  achievement: { icon: Award, className: 'bg-buoy-soft text-buoy-ink' },
  update: { icon: MessageSquareText, className: 'bg-foam text-ocean-dark' },
  assessment: { icon: ClipboardCheck, className: 'bg-aqua-soft text-aqua-dark' },
};

export function NotificationItem({ notification, onSelect }: { notification: Notification; onSelect: () => void }) {
  const { icon: Icon, className } = KIND_STYLE[notification.kind];
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full gap-3 rounded-xl px-3 py-3 text-left hover:bg-canvas"
    >
      <span className={cx('mt-0.5 grid size-9 shrink-0 place-items-center rounded-full', className)}>
        <Icon className="size-[1.1rem]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cx('block leading-snug', notification.read ? 'font-medium text-ink-2' : 'font-semibold text-ink')}>
          {notification.title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[0.925rem] leading-snug text-ink-2">{notification.body}</span>
        <span className="mt-1 block text-sm text-ink-3">{formatRelative(notification.createdAt)}</span>
      </span>
      {!notification.read && (
        <span className="mt-2 size-2.5 shrink-0 rounded-full bg-ocean">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </button>
  );
}

/** Bell with unread count and a panel of the parent's notifications. */
export function NotificationCenter() {
  const { notifications, unreadCount } = useParentScope();
  const { markNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (notification: Notification) => {
    if (!notification.read) markNotificationsRead([notification.id]);
    setOpen(false);
    navigate(notification.link);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="relative grid size-11 place-items-center rounded-full border border-line bg-surface text-ink hover:bg-canvas"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-count"
            className="tabular absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-ocean px-1 text-xs font-bold text-white ring-2 ring-canvas"
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="absolute top-full right-0 z-40 mt-2 w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-overlay"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <button
                type="button"
                onClick={() => markNotificationsRead()}
                disabled={unreadCount === 0}
                className="min-h-9 rounded-lg px-2 text-sm font-semibold text-ocean-dark hover:bg-foam disabled:text-ink-3 disabled:hover:bg-transparent"
              >
                Mark all as read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <BellOff className="size-7 text-ink-3" aria-hidden="true" />
                <p className="mt-3 font-semibold">No notifications yet</p>
                <p className="mt-1 text-[0.95rem] text-ink-2">
                  Achievements and instructor updates appear here after each session.
                </p>
              </div>
            ) : (
              <ul className="max-h-[min(28rem,65dvh)] overflow-y-auto p-1.5">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <NotificationItem notification={n} onSelect={() => select(n)} />
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
