import type { ISODate } from '@/types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parses the date part of an ISO date or date-time as a local calendar date. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(from: ISODate, to: ISODate): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function today(): ISODate {
  return toISODate(new Date());
}

/** The most recent Saturday strictly before the given date. */
export function lastSaturdayBefore(iso: ISODate): ISODate {
  const d = parseISODate(iso);
  const back = ((d.getDay() + 1) % 7) || 7;
  d.setDate(d.getDate() - back);
  return toISODate(d);
}

const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', options);
const LONG = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
const MEDIUM = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
const SHORT = fmt({ day: 'numeric', month: 'short' });
const FULL = fmt({ day: 'numeric', month: 'long', year: 'numeric' });

/** "Saturday 10 October" */
export const formatLong = (iso: string) => LONG.format(parseISODate(iso));
/** "Sat 10 Oct" */
export const formatMedium = (iso: string) => MEDIUM.format(parseISODate(iso)).replace(',', '');
/** "10 Oct" */
export const formatShort = (iso: string) => SHORT.format(parseISODate(iso));
/** "10 October 2026" */
export const formatFull = (iso: string) => FULL.format(parseISODate(iso));

/** "Today", "Yesterday", "3 days ago", otherwise a short date. */
export function formatRelative(iso: string, now: ISODate = today()): string {
  const diff = daysBetween(iso.slice(0, 10), now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  if (diff === -1) return 'Tomorrow';
  if (diff < -1 && diff > -7) return `In ${-diff} days`;
  return formatShort(iso);
}
