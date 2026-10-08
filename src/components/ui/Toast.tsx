import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { cx } from './primitives';

interface ToastInput {
  title: string;
  description?: string;
  tone?: 'success' | 'error';
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), toast.action ? 9000 : 5000);
    },
    [dismiss],
  );

  const region = useMemo(
    () => (
      <div
        role="region"
        aria-label="Status messages"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-24 lg:items-end lg:px-8 lg:pb-8"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              role="status"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl bg-deep p-4 text-white shadow-overlay"
            >
              {t.tone === 'error' ? (
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-buoy" aria-hidden="true" />
              ) : (
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-aqua" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[0.95rem] leading-snug text-white/80">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                    className={cx(
                      'mt-2.5 inline-flex min-h-9 items-center rounded-lg bg-white px-3 text-sm font-semibold text-deep hover:bg-foam',
                    )}
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="-m-1 grid size-8 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ),
    [items, dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {region}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider.');
  return show;
}
