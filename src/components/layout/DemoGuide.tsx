import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Map as MapIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, buttonClass, cx } from '@/components/ui/primitives';
import { useApp } from '@/store/AppStore';
import type { Role } from '@/types';

/**
 * The shortest route through the demo: see a child's progress as a parent, change one
 * assessment as the instructor, and see the change arrive in the parent view.
 */
export const DEMO_STEPS: { title: string; text: string; action: string; role: Role; to: string }[] = [
  {
    title: 'Open the parent view',
    text: "See what Oliver improved at his last session, what needs more work and why.",
    action: 'Open the parent dashboard',
    role: 'parent',
    to: '/parent',
  },
  {
    title: 'Open one skill',
    text: 'Side breathing shows the success criteria, the instructor\'s feedback and the next target.',
    action: 'Open Side breathing',
    role: 'parent',
    to: '/parent/skills/br-side',
  },
  {
    title: 'Switch to the instructor view',
    text: 'Change Side breathing from Fair to Good for Oliver, then save.',
    action: "Open Oliver's assessment",
    role: 'instructor',
    to: '/instructor/assessments?swimmer=child-oliver',
  },
  {
    title: 'Go back to the parent view',
    text: 'The skill, the dashboard and the notifications have all updated from that one save.',
    action: 'View as parent',
    role: 'parent',
    to: '/parent',
  },
];

/** The steps as plain text, for the start screen. */
export function DemoStepsList({ className }: { className?: string }) {
  return (
    <ol className={cx('flex flex-col gap-3', className)}>
      {DEMO_STEPS.map((step, i) => (
        <li key={step.title} className="flex gap-3">
          <span className="tabular grid size-7 shrink-0 place-items-center rounded-full bg-sunken font-display text-sm font-semibold text-ink-2">
            {i + 1}
          </span>
          <span className="leading-snug">
            <span className="font-semibold">{step.title}.</span> <span className="text-ink-2">{step.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Button in the demo bar that opens the same steps with a shortcut to each one. Optional: nothing depends on it. */
export function DemoGuideButton() {
  const { enterAs } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (role: Role, to: string) => {
    enterAs(role);
    navigate(to);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Demo guide"
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
      >
        <MapIcon className="size-4" aria-hidden="true" />
        <span aria-hidden="true" className="hidden sm:inline">
          Demo guide
        </span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="A two-minute route through the demo"
        description="Four steps show the whole idea. You can also explore freely and ignore this."
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)} data-autofocus>
            Close
          </Button>
        }
      >
        <ol className="flex flex-col gap-5">
          {DEMO_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3.5">
              <span className="tabular grid size-8 shrink-0 place-items-center rounded-full bg-deep font-display text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-display font-medium">{step.title}</p>
                <p className="text-ink-2">{step.text}</p>
                <button type="button" onClick={() => go(step.role, step.to)} className={buttonClass('secondary', 'sm', 'mt-2')}>
                  {step.action}
                </button>
              </div>
            </li>
          ))}
        </ol>
      </Modal>
    </>
  );
}
