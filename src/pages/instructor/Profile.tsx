import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { ResetDemoButton } from '@/components/layout/AppShell';
import { Avatar, Button, PageHeader } from '@/components/ui/primitives';
import { DEMO_INSTRUCTOR_ID } from '@/config/demo';
import { plural } from '@/lib/format';
import { useApp } from '@/store/AppStore';
import { fullName } from '@/store/selectors';

const STEPS = [
  { title: 'You save an assessment', text: 'Each changed skill is added to the swimmer\'s assessment history with the date and programme week.' },
  { title: 'Progress is recalculated', text: 'Targets achieved and skills mastered are worked out again from the history. Nothing is entered by hand.' },
  { title: 'The parent dashboard updates', text: 'The skill, its feedback and the overall figures change as soon as the parent opens or refreshes their view.' },
  { title: 'Mastered skills are celebrated', text: 'A skill that newly reaches Mastered creates an achievement and a notification for the parent.' },
];

export default function Profile() {
  const { data, exitDemo } = useApp();
  const navigate = useNavigate();
  const instructor = data.instructors.find((i) => i.id === DEMO_INSTRUCTOR_ID)!;

  return (
    <>
      <PageHeader title="Profile" subtitle="Your instructor account and the demo controls." />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="account-title" className="panel p-5 sm:p-6">
            <h2 id="account-title" className="text-xl font-semibold">
              Your account
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <Avatar firstName={instructor.firstName} lastName={instructor.lastName} tone="deep" size="lg" />
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold">{fullName(instructor)}</p>
                <p className="text-ink-2">{instructor.qualification}</p>
                <p className="truncate text-ink-2">{instructor.email}</p>
              </div>
            </div>
            <p className="mt-4 text-ink-2">
              {plural(instructor.childIds.length, 'swimmer')} on your programmes. Instructors can record assessments, feedback
              and updates. Parents can read them but cannot change them.
            </p>
            <p className="mt-4 rounded-xl bg-sunken px-3.5 py-3 text-[0.95rem] leading-snug text-ink-2">
              This is a simulated demo account with fictional swimmers. No password is used and nothing here is secure.
            </p>
          </section>

          <section aria-labelledby="demo-title" className="panel p-5 sm:p-6">
            <h2 id="demo-title" className="text-xl font-semibold">
              Demo controls
            </h2>
            <p className="mt-1 text-ink-2">
              Restore the original examples before a presentation, or return to the start screen.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ResetDemoButton />
              <Button
                variant="ghost"
                onClick={() => {
                  exitDemo();
                  navigate('/');
                }}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Exit demo
              </Button>
            </div>
          </section>
        </div>

        <section aria-labelledby="flow-title" className="rounded-[1.25rem] bg-foam p-5 sm:p-6">
          <h2 id="flow-title" className="text-xl font-semibold">
            How an assessment reaches a parent
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="tabular grid size-8 shrink-0 place-items-center rounded-full bg-deep font-display text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display font-medium">{step.title}</p>
                  <p className="text-ink-2">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
