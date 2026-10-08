import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, ShieldCheck } from 'lucide-react';
import { ResetDemoButton } from '@/components/layout/AppShell';
import { Avatar, Button, PageHeader, cx } from '@/components/ui/primitives';
import { BRAND, PARTNER } from '@/config/demo';
import { formatMedium } from '@/lib/dates';
import { formatDetail } from '@/lib/format';
import { useApp, useParentScope } from '@/store/AppStore';
import { fullName } from '@/store/selectors';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-6 gap-y-0.5 py-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <dt className="text-ink-2">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

export default function Profile() {
  const { parent, child, plan, sessions, instructor } = useParentScope();
  const { exitDemo } = useApp();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account, your swimmer and the programme they are on." />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="account-title" className="panel p-5 sm:p-6">
            <h2 id="account-title" className="text-xl font-semibold">
              Your account
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <Avatar firstName={parent.firstName} lastName={parent.lastName} tone="deep" size="lg" />
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold">{fullName(parent)}</p>
                <p className="truncate text-ink-2">{parent.email}</p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-sunken px-3.5 py-3 text-[0.95rem] leading-snug text-ink-2">
              This is a simulated demo account. No password is used and nothing here is secure.
            </p>
          </section>

          <section aria-labelledby="swimmers-title" className="panel p-5 sm:p-6">
            <h2 id="swimmers-title" className="text-xl font-semibold">
              Your swimmers
            </h2>
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-line p-4">
              <Avatar firstName={child.firstName} lastName={child.lastName} tone={child.avatarTone} />
              <div className="min-w-0">
                <p className="font-display font-semibold">{fullName(child)}</p>
                <p className="text-ink-2">
                  Age {child.age}, {child.lessonStage} in regular lessons
                </p>
              </div>
            </div>
            <p className="mt-3 text-[0.95rem] text-ink-2">
              An account can be linked to more than one child. You only ever see swimmers linked to your own account.
            </p>
          </section>

          <section aria-labelledby="privacy-title" className="panel p-5 sm:p-6">
            <h2 id="privacy-title" className="flex items-center gap-2 text-xl font-semibold">
              <ShieldCheck className="size-5 text-aqua-dark" aria-hidden="true" />
              Privacy in this demonstration
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-2 marker:text-line-strong">
              <li>Every person shown is fictional. No real child's information is collected or stored.</li>
              <li>Changes made during the demo are kept in this browser only and are never sent anywhere.</li>
              <li>Parents see their own child only. Group members and other swimmers are never shown.</li>
              <li>
                A live service would need secure sign-in, access controls, UK GDPR compliance, safeguarding procedures
                and agreed data responsibilities with any venue involved. This prototype provides none of them.
              </li>
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="programme-title" className="panel p-5 sm:p-6">
            <h2 id="programme-title" className="text-xl font-semibold">
              {child.firstName}'s programme
            </h2>
            <dl className="mt-2 divide-y divide-line">
              <Row label="Programme">{plan.programmeName}</Row>
              <Row label="Format">{formatDetail(plan)}</Row>
              <Row label="Length">
                {plan.totalWeeks} weekly sessions, week {plan.currentWeek} completed
              </Row>
              <Row label="Instructor">
                {fullName(instructor)}
                <span className="block font-normal text-ink-2">{instructor.qualification}</span>
              </Row>
              <Row label="Venue">{PARTNER.venue}</Row>
            </dl>

            <h3 className="mt-5 font-display font-semibold">Sessions</h3>
            <ol className="mt-2 divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id} className="tabular flex items-center justify-between gap-4 py-2.5">
                  <span>
                    <span className="font-medium">Week {s.week}</span>
                    <span className="text-ink-2">
                      , {formatMedium(s.date)}, {s.startTime} to {s.endTime}
                    </span>
                  </span>
                  <span className={cx('text-sm font-semibold', s.status === 'completed' ? 'text-ink-3' : 'text-aqua-dark')}>
                    {s.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-ink-3">
              Example details only. No venue, timetable or price has been agreed, and nothing can be booked or paid for
              in this demonstration.
            </p>
          </section>

          <section aria-labelledby="fit-title" className="rounded-[1.25rem] bg-foam p-5 sm:p-6">
            <h2 id="fit-title" className="text-xl font-semibold">
              How this fits with regular lessons
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-2 marker:text-ocean">
              <li>
                {BRAND.name} is extra, targeted coaching. It runs alongside {child.firstName}'s {PARTNER.lessonsLabel}{' '}
                and does not replace them.
              </li>
              <li>
                It is designed for children who are also having regular lessons with {PARTNER.providerLabel}.
              </li>
              <li>
                Assessments here measure our own development targets. Decisions about moving up a stage are made by{' '}
                {child.firstName}'s regular lesson teacher.
              </li>
            </ul>
          </section>

          <section aria-labelledby="demo-title" className="panel p-5 sm:p-6">
            <h2 id="demo-title" className="text-xl font-semibold">
              Demo controls
            </h2>
            <p className="mt-1 text-ink-2">Restore the original examples, or return to the start screen.</p>
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
      </div>
    </>
  );
}
