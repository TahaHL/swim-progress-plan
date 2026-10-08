import type { DevelopmentPlan, ProgrammeFormat } from '@/types';

export const formatName = (format: ProgrammeFormat): string =>
  format === 'one_to_one' ? 'One-to-one' : 'Small group';

export const formatDetail = (plan: Pick<DevelopmentPlan, 'format' | 'maxGroupSize'>): string =>
  plan.format === 'one_to_one' ? 'One-to-one coaching' : `Small group, up to ${plan.maxGroupSize} swimmers`;

export const plural = (count: number, singular: string, pluralForm = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;

/** "Oliver's", "James'" */
export const possessive = (name: string): string => (name.endsWith('s') ? `${name}'` : `${name}'s`);
