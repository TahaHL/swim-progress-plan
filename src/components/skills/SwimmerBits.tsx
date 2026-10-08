import { cx } from '@/components/ui/primitives';
import type { ProgressSummary } from '@/lib/progress';
import type { DevelopmentPlan } from '@/types';

/** Programme completion: weeks done out of the total, as a labelled bar. */
export function WeekBar({ plan, className }: { plan: DevelopmentPlan; className?: string }) {
  return (
    <span className={cx('block', className)}>
      <span className="tabular block text-[0.95rem]">
        {plan.currentWeek === 0 ? 'Not started' : `Week ${plan.currentWeek} of ${plan.totalWeeks}`}
      </span>
      <span
        role="img"
        aria-label={`${plan.currentWeek} of ${plan.totalWeeks} weeks completed`}
        className="mt-1.5 flex max-w-32 gap-1"
      >
        {Array.from({ length: plan.totalWeeks }, (_, i) => (
          <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < plan.currentWeek ? 'bg-deep' : 'bg-line')} />
        ))}
      </span>
    </span>
  );
}

/** "Pass: 3 of 16 assessed skills", or a plain statement that nothing has been assessed. */
export function passText(summary: ProgressSummary): string {
  return summary.assessed === 0 ? 'No assessments yet' : `Pass: ${summary.passed} of ${summary.assessed} assessed skills`;
}
