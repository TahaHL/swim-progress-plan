import { useNavigate } from 'react-router';
import { ChevronRight, ClipboardCheck, Info, UserRound } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { StatusIcon } from '@/components/ui/Status';
import { BRAND, DEMO_INSTRUCTOR_ID, DEMO_PARENT_ID } from '@/config/demo';
import { getSkill } from '@/data/skills';
import { currentStatus } from '@/lib/progress';
import { statusLabel } from '@/lib/status';
import { useApp } from '@/store/AppStore';
import { fullName, selectParentScope } from '@/store/selectors';
import type { Role } from '@/types';

/** A few of the demo swimmer's real skills, shown as a preview of what a parent sees. */
const PREVIEW_SKILLS = ['kick-rhythm', 'bp-head', 'br-side', 'br-alignment'];

export default function Login() {
  const { data, enterAs } = useApp();
  const navigate = useNavigate();
  const scope = selectParentScope(data, DEMO_PARENT_ID);
  const instructor = data.instructors.find((i) => i.id === DEMO_INSTRUCTOR_ID);

  const enter = (role: Role) => {
    enterAs(role);
    navigate(`/${role}`);
  };

  const options: { role: Role; title: string; who: string; detail: string; icon: typeof UserRound }[] = [
    {
      role: 'parent',
      title: 'Continue as Parent',
      who: scope ? fullName(scope.parent) : 'Demo parent',
      detail: scope ? `Parent of ${scope.child.firstName}, age ${scope.child.age}` : 'Linked to one swimmer',
      icon: UserRound,
    },
    {
      role: 'instructor',
      title: 'Continue as Instructor',
      who: instructor ? fullName(instructor) : 'Demo instructor',
      detail: instructor ? `${instructor.qualification}, ${instructor.childIds.length} swimmers` : 'Records assessments',
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Brand side */}
      <section
        className="deep-panel flex flex-col !rounded-none px-6 pt-8 pb-10 sm:px-10 lg:min-h-dvh lg:px-14 lg:py-12"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)' }}
      >
        <Logo onDeep />
        <div className="my-auto py-10 lg:py-0">
          <h1 className="font-display text-[2.35rem] leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Every Skill.
            <br />
            Every Milestone.
            <br />
            Every Step Forward.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
            Targeted coaching alongside regular swimming lessons, with every skill assessed and explained, so parents
            can see exactly how their child is progressing.
          </p>

          {scope && (
            <div className="mt-10 max-w-md">
              <p className="text-sm text-white/65">
                Front crawl, broken into {scope.plan.skillIds.length} skills a parent can follow
              </p>
              <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                {PREVIEW_SKILLS.map((id) => {
                  const skill = getSkill(id);
                  if (!skill) return null;
                  const status = currentStatus(scope.assessments, scope.child.id, id);
                  return (
                    <li key={id} className="flex items-center justify-between gap-3 py-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <StatusIcon status={status} inverse size={22} />
                        <span className="truncate font-medium">{skill.name}</span>
                      </span>
                      <span className="shrink-0 text-[0.95rem] text-white/75">
                        {statusLabel(status)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Entry side */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-2xl font-semibold">Choose a demo view</h2>
          <p className="mt-2 text-lg text-ink-2">
            Both views show the same fictional swimmers. Change an assessment as the instructor and the parent view
            updates.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {options.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => enter(option.role)}
                className="group flex items-center gap-4 rounded-2xl border border-line-strong bg-surface p-4 text-left transition-colors hover:border-deep hover:bg-foam"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-deep text-white">
                  <option.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-snug font-semibold">{option.title}</span>
                  <span className="block text-ink-2">
                    {option.who}. {option.detail}.
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            ))}
          </div>

          <p className="mt-8 flex gap-2.5 text-[0.95rem] leading-snug text-ink-2">
            <Info className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden="true" />
            <span>
              This is a demonstration of {BRAND.name}. Sign-in is simulated and is not secure, and every person shown
              is fictional. In the live product, each parent would have a secure account linked only to their own
              children.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
