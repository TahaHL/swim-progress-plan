import { useState } from 'react';
import { CircleHelp, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, Note, cx } from '@/components/ui/primitives';
import { StatusLegend } from '@/components/ui/Status';
import { PARTNER } from '@/config/demo';
import type { ProgressSummary } from '@/lib/progress';

/** The scope statement used wherever a progress figure appears. */
export function ScopeNote({ childName }: { childName: string }) {
  return (
    <Note icon={Info} tone="foam">
      These figures measure progress against {childName}'s Swim Progress Plan development targets. They are not an
      official stage assessment and do not predict when {childName} will move up a stage. Stage decisions stay with the
      teacher of {childName}'s {PARTNER.lessonsLabel}.
    </Note>
  );
}

function Formula({ label, part, whole, result, partLabel }: { label: string; part: number; whole: number; result: number | null; partLabel: string }) {
  return (
    <div className="rounded-xl border border-line px-4 py-3">
      <p className="font-semibold">{label}</p>
      <p className="tabular mt-1 text-ink-2">
        {whole === 0 ? (
          'No skills have been assessed yet, so there is no percentage to show.'
        ) : (
          <>
            {part} {partLabel} ÷ {whole} assessed × 100 = <strong className="text-ink">{result}%</strong>
          </>
        )}
      </p>
    </div>
  );
}

/** Button that opens a plain-English explanation of the progress figures, using the live numbers. */
export function HowCalculated({
  summary,
  childName,
  onDeep = false,
}: {
  summary: ProgressSummary;
  childName: string;
  onDeep?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cx(
          'inline-flex min-h-9 items-center gap-1.5 rounded-lg text-[0.95rem] font-semibold underline decoration-1 underline-offset-4',
          onDeep ? 'text-white/90 hover:text-white' : 'text-ocean-dark hover:text-deep',
        )}
      >
        <CircleHelp className="size-4" aria-hidden="true" />
        How this is calculated
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="How progress is calculated"
        description={`Every figure comes directly from the instructor's assessments of the ${summary.totalTargets} skills in ${childName}'s plan.`}
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Formula
              label="Development targets achieved"
              part={summary.achieved}
              partLabel="achieved"
              whole={summary.assessed}
              result={summary.achievedPct}
            />
            <Formula
              label="Skills mastered"
              part={summary.mastered}
              partLabel="mastered"
              whole={summary.assessed}
              result={summary.masteredPct}
            />
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-ink-2 marker:text-line-strong">
            <li>
              A target counts as <strong className="text-ink">achieved</strong> when the skill is assessed as Consistent
              or Mastered.
            </li>
            <li>
              Skills that have not been assessed yet are left out of the percentages and listed separately
              {summary.unassessed > 0 ? ` (${summary.unassessed} at the moment)` : ''}, so they cannot make progress look
              better or worse than it is.
            </li>
            <li>A skill's current state is always its most recent assessment. Earlier assessments stay in its history.</li>
          </ul>
          <div>
            <h3 className="mb-3 text-lg font-semibold">The four assessment states</h3>
            <StatusLegend />
          </div>
          <ScopeNote childName={childName} />
        </div>
      </Modal>
    </>
  );
}
