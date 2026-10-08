import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronRight, ListFilter } from 'lucide-react';
import { ScopeNote } from '@/components/skills/HowCalculated';
import { StatusBadge, StatusIcon, StatusLegend } from '@/components/ui/Status';
import { EmptyState, PageHeader, cx } from '@/components/ui/primitives';
import { CATEGORIES } from '@/data/skills';
import { currentStatus, isPass } from '@/lib/progress';
import { useParentScope } from '@/store/AppStore';

type Filter = 'all' | 'working' | 'pass';

export default function Skills() {
  const { child, plan, skills, assessments, summary } = useParentScope();
  const [params] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const area = params.get('area');

  // Arriving from a skill area on the dashboard: bring that area into view.
  useEffect(() => {
    if (!area) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`area-${area}`)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [area]);

  const rows = useMemo(
    () => skills.map((skill) => ({ skill, status: currentStatus(assessments, child.id, skill.id) })),
    [skills, assessments, child.id],
  );
  const visible = rows.filter((r) =>
    filter === 'all' ? true : filter === 'pass' ? isPass(r.status) : !isPass(r.status),
  );

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All skills', count: rows.length },
    { id: 'working', label: 'Not yet Pass', count: rows.length - summary.passed },
    { id: 'pass', label: 'Pass', count: summary.passed },
  ];

  return (
    <>
      <PageHeader
        title={`${plan.strokeName} skills`}
        subtitle={`${plan.strokeName} broken into ${skills.length} skills. Select any skill to see what it involves and how ${child.firstName} is doing.`}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div role="group" aria-label="Filter skills" className="inline-flex rounded-xl bg-sunken p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cx(
                'tabular min-h-9 rounded-lg px-3 text-[0.95rem] font-semibold transition-colors',
                filter === f.id ? 'bg-surface text-ink shadow-raised' : 'text-ink-2 hover:text-ink',
              )}
            >
              {f.label} <span className="font-normal text-ink-3">{f.count}</span>
            </button>
          ))}
        </div>
        <StatusLegend compact />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={ListFilter} title={filter === 'pass' ? 'No skills marked Pass yet' : 'Every skill is marked Pass'}>
          {filter === 'pass'
            ? `Skills appear here once ${child.firstName} is assessed as Pass.`
            : `Every skill in ${child.firstName}'s plan is marked Pass. That is not the same as passing a swimming stage.`}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-8">
          {CATEGORIES.map((category) => {
            const inCategory = visible.filter((r) => r.skill.categoryId === category.id);
            if (inCategory.length === 0) return null;
            const all = rows.filter((r) => r.skill.categoryId === category.id);
            const passed = all.filter((r) => isPass(r.status)).length;
            const assessedCount = all.filter((r) => r.status !== null).length;
            return (
              <section key={category.id} id={`area-${category.id}`} aria-labelledby={`area-title-${category.id}`} className="scroll-mt-24">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div>
                    <h2 id={`area-title-${category.id}`} className="text-xl font-semibold">
                      {category.name}
                    </h2>
                    <p className="text-ink-2">{category.summary}</p>
                  </div>
                  <p className="tabular text-[0.95rem] text-ink-2">
                    Pass: {passed} of {assessedCount} assessed
                    {all.length - assessedCount > 0 && `, ${all.length - assessedCount} not assessed`}
                  </p>
                </div>
                <ul className="panel divide-y divide-line overflow-hidden">
                  {inCategory.map(({ skill, status }) => (
                    <li key={skill.id}>
                      <Link
                        to={`/parent/skills/${skill.id}`}
                        className="group flex items-center gap-3.5 px-4 py-4 hover:bg-canvas sm:px-5"
                      >
                        <StatusIcon status={status} size={26} />
                        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
                          <span className="block min-w-0">
                            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                              <span className="font-display font-medium">{skill.name}</span>
                              {plan.focusSkillIds.includes(skill.id) && (
                                <span className="rounded-full bg-aqua-soft px-2 py-0.5 text-xs font-semibold text-aqua-dark">
                                  Current focus
                                </span>
                              )}
                            </span>
                            <span className="block text-[0.95rem] text-ink-2">{skill.summary}</span>
                          </span>
                          <span className="mt-2 block shrink-0 sm:mt-0">
                            <StatusBadge status={status} size="sm" />
                          </span>
                        </span>
                        <ChevronRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <section aria-labelledby="states-title" className="mt-10 border-t border-line pt-8">
        <h2 id="states-title" className="mb-4 text-xl font-semibold">
          The five assessment labels
        </h2>
        <StatusLegend />
        <div className="mt-6">
          <ScopeNote childName={child.firstName} />
        </div>
      </section>
    </>
  );
}
