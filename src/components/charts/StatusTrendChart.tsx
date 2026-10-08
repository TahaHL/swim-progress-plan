import { useReducedMotion } from 'motion/react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STATUS_ORDER, type ProgressSummary } from '@/lib/progress';
import { STATUS_META } from '@/lib/status';
import type { SkillStatus } from '@/types';

interface Row extends Record<SkillStatus, number> {
  label: string;
  achievedPct: number | null;
  assessed: number;
}

/** Bottom of the stack first, so the achieved share grows up from the baseline. */
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
      </ul>
      {row.achievedPct !== null && (
        <p className="tabular mt-2 border-t border-line pt-2 text-ink-2">
          {row.achievedPct}% of {row.assessed} assessed targets achieved
        </p>
      )}
    </div>
  );
}

/**
 * Stacked bars: how many skills sat in each assessment state at the end of each completed week.
 * One axis, one unit (skills). Text colours come from ink tokens; the bars carry the state colours.
 */
export function StatusTrendChart({ trend }: { trend: { week: number; summary: ProgressSummary }[] }) {
  const reduced = useReducedMotion();
  const rows: Row[] = trend.map(({ week, summary }) => ({
    label: `Week ${week}`,
    ...summary.counts,
    achievedPct: summary.achievedPct,
    assessed: summary.assessed,
  }));
  const max = Math.max(1, ...trend.map((t) => t.summary.assessed));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barCategoryGap="30%">
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
              isAnimationActive={!reduced}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
