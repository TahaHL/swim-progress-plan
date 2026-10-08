import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STATUS_ORDER, type ProgressSummary } from '@/lib/progress';
import { NOT_ASSESSED, STATUS_META } from '@/lib/status';
import type { SkillStatus } from '@/types';

interface Row extends Record<SkillStatus, number> {
  label: string;
  notAssessed: number;
  passed: number;
  assessed: number;
}

/** Bottom of the stack first, so skills marked Pass build up from the baseline. */
const STACK: SkillStatus[] = [...STATUS_ORDER].reverse();

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3 text-[0.95rem] shadow-raised">
      <p className="font-display font-semibold">{row.label}</p>
      <ul className="tabular mt-1.5 flex flex-col gap-1">
        {STACK.map((status) => (
          <li key={status} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-ink-2">
              <span className="size-2.5 rounded-sm" style={{ background: STATUS_META[status].color }} />
              {STATUS_META[status].label}
            </span>
            <span className="font-semibold">{row[status]}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-ink-2">
            <span className="size-2.5 rounded-sm border border-dashed border-control" />
            {NOT_ASSESSED.label}
          </span>
          <span className="font-semibold">{row.notAssessed}</span>
        </li>
      </ul>
      {row.assessed > 0 && (
        <p className="tabular mt-2 border-t border-line pt-2 text-ink-2">
          Pass: {row.passed} of {row.assessed} assessed skills
        </p>
      )}
    </div>
  );
}

/**
 * Stacked bars: how many skills sat at each assessment level at the end of each completed week,
 * with Not Assessed skills shown separately as an outlined segment on top.
 * One axis, one unit (skills). Text colours come from ink tokens; the bars carry the level colours.
 */
export function StatusTrendChart({ trend }: { trend: { week: number; summary: ProgressSummary }[] }) {
  const rows: Row[] = trend.map(({ week, summary }) => ({
    label: `Week ${week}`,
    ...summary.counts,
    notAssessed: summary.notAssessed,
    passed: summary.passed,
    assessed: summary.assessed,
  }));
  const max = Math.max(1, ...trend.map((t) => t.summary.totalTargets));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: 'var(--color-line-strong)' }}
            tick={{ fill: 'var(--color-ink-2)', fontSize: 14 }}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, max]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-ink-3)', fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-sunken)', opacity: 0.7 }}
            content={(props) => <TrendTooltip {...(props as unknown as Parameters<typeof TrendTooltip>[0])} />}
          />
          {STACK.map((status) => (
            <Bar
              key={status}
              dataKey={status}
              name={STATUS_META[status].label}
              stackId="skills"
              fill={STATUS_META[status].color}
              stroke="var(--color-surface)"
              strokeWidth={2}
              maxBarSize={84}
              isAnimationActive={false}
            />
          ))}
          {/* Not Assessed sits on top as an outline, so it reads as "no record", not as a level. */}
          <Bar
            dataKey="notAssessed"
            name={NOT_ASSESSED.label}
            stackId="skills"
            fill="var(--color-canvas)"
            stroke="var(--color-control)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            maxBarSize={84}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
