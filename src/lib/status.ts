import type { SkillStatus } from '@/types';

/**
 * The five assessment labels and their order are confirmed by the programme owner.
 *
 * The descriptions are NOT confirmed. They are provisional, parent-friendly suggestions that are
 * awaiting teacher sign-off, in particular the distinction between Good and Pass. While this flag
 * is false, the app labels the descriptions as provisional wherever they are shown.
 */
export const DEFINITIONS_CONFIRMED = false;

export const PROVISIONAL_NOTE =
  'These descriptions are provisional and are awaiting confirmation by the teacher. The labels and their order are fixed.';

export interface StatusMeta {
  label: string;
  /** Provisional parent-friendly description. See DEFINITIONS_CONFIRMED. */
  description: string;
  /** Tailwind classes for a chip in this state. */
  chip: string;
  /** Tailwind class for a solid swatch or bar segment. */
  swatch: string;
  /** CSS colour for SVG fills. */
  color: string;
}

export const STATUS_META: Record<SkillStatus, StatusMeta> = {
  needs_practice: {
    label: 'Needs Practice',
    description: 'The swimmer needs further development of this skill.',
    chip: 'bg-st-np-bg text-st-np-ink',
    swatch: 'bg-st-np',
    color: 'var(--color-st-np)',
  },
  fair: {
    label: 'Fair',
    description: 'The swimmer can demonstrate parts of the skill but is not yet fully proficient.',
    chip: 'bg-st-fair-bg text-st-fair-ink',
    swatch: 'bg-st-fair',
    color: 'var(--color-st-fair)',
  },
  good: {
    label: 'Good',
    description: 'The swimmer demonstrates the skill well, with some room for improvement.',
    chip: 'bg-st-good-bg text-st-good-ink',
    swatch: 'bg-st-good',
    color: 'var(--color-st-good)',
  },
  pass: {
    label: 'Pass',
    description: 'The swimmer has satisfied the agreed assessment requirements for this skill.',
    chip: 'bg-st-pass text-white',
    swatch: 'bg-st-pass',
    color: 'var(--color-st-pass)',
  },
};

/** Level 1 of 5. Not a grade: it means no assessment has been recorded for the skill. */
export const NOT_ASSESSED = {
  label: 'Not Assessed',
  description: 'This skill has not yet been evaluated.',
} as const;

export const statusLabel = (status: SkillStatus | null): string =>
  status ? STATUS_META[status].label : NOT_ASSESSED.label;

export const statusDescription = (status: SkillStatus | null): string =>
  status ? STATUS_META[status].description : NOT_ASSESSED.description;
