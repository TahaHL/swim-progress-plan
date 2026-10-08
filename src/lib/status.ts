import type { SkillStatus } from '@/types';

export interface StatusMeta {
  label: string;
  short: string;
  /** What the state means, in parent-friendly language. */
  description: string;
  /** Tailwind classes for a chip in this state. */
  chip: string;
  /** Tailwind class for a solid swatch or bar segment. */
  swatch: string;
  /** CSS colour for SVG fills. */
  color: string;
}

export const STATUS_META: Record<SkillStatus, StatusMeta> = {
  not_yet: {
    label: 'Not Yet Achieved',
    short: 'Not yet',
    description: 'The skill has been introduced, but the success criteria are not being met yet.',
    chip: 'bg-st-not-bg text-st-not-ink',
    swatch: 'bg-st-not',
    color: 'var(--color-st-not)',
  },
  developing: {
    label: 'Developing',
    short: 'Developing',
    description: 'Some of the success criteria are met, or they are met with support or on some attempts.',
    chip: 'bg-st-dev-bg text-st-dev-ink',
    swatch: 'bg-st-dev',
    color: 'var(--color-st-dev)',
  },
  consistent: {
    label: 'Consistent',
    short: 'Consistent',
    description: 'The success criteria are met on most attempts. The development target is achieved.',
    chip: 'bg-st-con-bg text-st-con-ink',
    swatch: 'bg-st-con',
    color: 'var(--color-st-con)',
  },
  mastered: {
    label: 'Mastered',
    short: 'Mastered',
    description: 'All success criteria are met reliably and without prompting, including when tired.',
    chip: 'bg-st-mas text-white',
    swatch: 'bg-st-mas',
    color: 'var(--color-st-mas)',
  },
};

export const UNASSESSED_LABEL = 'Not yet assessed';

export const statusLabel = (status: SkillStatus | null): string =>
  status ? STATUS_META[status].label : UNASSESSED_LABEL;
