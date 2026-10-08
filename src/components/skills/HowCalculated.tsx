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
      These figures count skills marked Pass among the skills chosen for {childName}'s Swim Progress Plan programme.
      They do not measure {childName}'s overall swimming ability. A Pass in a skill is not an official stage
      assessment, and passing skills here does not mean a stage has been passed or predict when one will be. Stage
      decisions stay with the teacher of {childName}'s {PARTNER.lessonsLabel}.
    </Note>
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
          <div className="rounded-xl border border-line px-4 py-3" data-testid="pass-formula">
            <p className="font-semibold">
              Skills marked Pass: {summary.passed} of {summary.assessed} assessed skills
            </p>
            <p className="tabular mt-1 text-ink-2">
              {summary.assessed === 0 ? (
                'No skills have been assessed yet, so there is no percentage to show.'
              ) : (
                <>
                  {summary.passed} marked Pass ÷ {summary.assessed} assessed × 100 ={' '}
                  <strong className="text-ink">{summary.passPct}%</strong>
                </>
              )}
            </p>
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-ink-2 marker:text-line-strong">
            <li>
              Only the {summary.totalTargets} skills in this programme are counted. The figure says nothing about
              skills outside the programme.
            </li>
            <li>
              Only <strong className="text-ink">Pass</strong> is counted. A skill marked Good is not counted as a
              Pass.
            </li>
            <li>
              Skills that are <strong className="text-ink">Not Assessed</strong> have no assessment recorded. They are
              left out of the calculation and shown separately
              {summary.notAssessed > 0 ? ` (${summary.notAssessed} at the moment)` : ''}. Not Assessed does not mean a
              skill was tried and not passed.
            </li>
            <li>
              The levels are labels in a fixed order. They are not marks out of five, and no average or overall score
              is calculated from them.
            </li>
            <li>A skill's current level is always its most recent assessment. Earlier assessments stay in its history.</li>
            <li>
              A Pass is for one skill. Passing skills here does not mean {childName} has passed a swimming stage.
            </li>
          </ul>
          <div>
            <h3 className="mb-3 text-lg font-semibold">The five assessment labels</h3>
            <StatusLegend />
          </div>
          <ScopeNote childName={childName} />
        </div>
      </Modal>
    </>
  );
}
