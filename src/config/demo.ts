/**
 * Product and demo configuration. Wording that refers to the partner organisation lives here
 * so it can be changed in one place once a partnership and its branding are agreed.
 */
export const BRAND = {
  name: 'Swim Progress Plan',
  tagline: 'Every Skill. Every Milestone. Every Step Forward.',
} as const;

export const PARTNER = {
  /** How the child's existing lesson provider is referred to. Neutral until branding is agreed. */
  lessonsLabel: 'regular swimming lessons',
  providerLabel: 'your leisure centre',
  venue: 'Demo Leisure Centre, teaching pool',
} as const;

export const PROGRAMME = {
  maxGroupSize: 4,
  totalWeeks: 6,
} as const;

/** The six illustrative phases of the programme. These describe the plan, not guaranteed outcomes. */
export const PROGRAMME_PHASES: { week: number; title: string; summary: string }[] = [
  { week: 1, title: 'Initial assessment and baseline', summary: 'Every skill in the plan is assessed to find the starting point.' },
  { week: 2, title: 'Technical development', summary: 'Focused teaching on the skills that will make the biggest difference.' },
  { week: 3, title: 'Improving consistency', summary: 'Repeating key skills until they hold up attempt after attempt.' },
  { week: 4, title: 'Applying skills', summary: 'Bringing individual skills together in full-stroke swimming.' },
  { week: 5, title: 'Developing independence and control', summary: 'Longer swims with less support and fewer prompts.' },
  { week: 6, title: 'Final assessment and development review', summary: 'Every skill is reassessed and compared with the baseline.' },
];

/** The two simulated accounts behind the demo entry buttons. */
export const DEMO_PARENT_ID = 'parent-sarah';
export const DEMO_INSTRUCTOR_ID = 'inst-hannah';
