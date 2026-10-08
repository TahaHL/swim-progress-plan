/**
 * Mock data layer.
 *
 * The app only ever talks to the `DataRepository` interface. This implementation keeps the demo
 * data in localStorage; a production version would implement the same interface with API calls
 * and nothing else in the app would need to change. Every method is already asynchronous for
 * that reason.
 *
 * This is demonstration storage. It is not secure and must never hold real children's data.
 */
import { SCHEMA_VERSION, buildSeed } from '@/data/seed';
import { addDays, daysBetween, lastSaturdayBefore, today } from '@/lib/dates';
import type { AppData } from '@/types';

export interface DataRepository {
  /** False when the browser blocks storage; changes then last only until the page is closed. */
  readonly persistent: boolean;
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
  reset(): Promise<AppData>;
  /** Fires when the data is changed from another tab or window showing the demo. */
  subscribe(listener: (data: AppData) => void): () => void;
}

export const STORAGE_KEY = 'swim-progress-plan.demo.v1';

/** Simulated network delay, so loading states can be seen and designed for. */
const LOAD_DELAY_MS = 450;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function storageAvailable(): boolean {
  try {
    const probe = '__spp_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<AppData>;
  return (
    v.schemaVersion === SCHEMA_VERSION &&
    typeof v.anchorDate === 'string' &&
    [v.parents, v.children, v.instructors, v.plans, v.sessions, v.assessments, v.updates, v.achievements, v.notifications].every(
      Array.isArray,
    )
  );
}

/**
 * Keeps the demo current: if it is reopened in a later week, every stored date moves forward by
 * the same whole number of weeks, so "next session" is never in the past.
 */
export function rebase(data: AppData, todayIso = today()): AppData {
  const anchorNow = lastSaturdayBefore(todayIso);
  const shift = daysBetween(data.anchorDate, anchorNow);
  if (shift === 0) return data;
  const shifted = JSON.stringify(data).replace(/\d{4}-\d{2}-\d{2}/g, (date) => addDays(date, shift));
  return JSON.parse(shifted) as AppData;
}

function parse(raw: string | null): AppData | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isAppData(value) ? rebase(value) : null;
  } catch {
    return null;
  }
}

export function createLocalRepository(): DataRepository {
  const persistent = typeof window !== 'undefined' && storageAvailable();
  let memory: AppData | null = null;

  const write = (data: AppData) => {
    memory = data;
    if (!persistent) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  return {
    persistent,

    async load() {
      await wait(LOAD_DELAY_MS);
      const stored = persistent ? parse(window.localStorage.getItem(STORAGE_KEY)) : memory;
      if (stored) {
        memory = stored;
        return stored;
      }
      const seed = buildSeed();
      try {
        write(seed);
      } catch {
        memory = seed;
      }
      return seed;
    },

    async save(data) {
      write(data);
    },

    async reset() {
      const seed = buildSeed();
      write(seed);
      return seed;
    },

    subscribe(listener) {
      if (!persistent) return () => {};
      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        const next = parse(event.newValue);
        if (next) {
          memory = next;
          listener(next);
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    },
  };
}

export const repository: DataRepository = createLocalRepository();
