import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEMO_INSTRUCTOR_ID, DEMO_PARENT_ID } from '@/config/demo';
import { repository } from '@/data/repository';
import {
  acknowledgeCelebration,
  addProgressUpdate,
  markNotificationsRead,
  saveAssessment,
  setNextPriority,
  type SaveAssessmentResult,
  type SkillChange,
} from '@/lib/assessmentService';
import { today } from '@/lib/dates';
import { selectParentScope, type ParentScope } from '@/store/selectors';
import type { AppData, Role } from '@/types';

const ROLE_KEY = 'swim-progress-plan.role';

function readRole(): Role | null {
  try {
    const value = window.localStorage.getItem(ROLE_KEY);
    return value === 'parent' || value === 'instructor' ? value : null;
  } catch {
    return null;
  }
}

function writeRole(role: Role | null) {
  try {
    if (role) window.localStorage.setItem(ROLE_KEY, role);
    else window.localStorage.removeItem(ROLE_KEY);
  } catch {
    /* Storage is blocked; the role simply lasts for this visit. */
  }
}

const timestamp = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${today()}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: AppData };

interface AppActions {
  enterAs(role: Role): void;
  exitDemo(): void;
  /** Throws AssessmentError with a readable message if the change is not allowed. */
  saveAssessment(childId: string, changes: SkillChange[]): SaveAssessmentResult;
  addProgressUpdate(childId: string, text: string, nextObjectives: string[]): void;
  setNextPriority(childId: string, text: string): void;
  markNotificationsRead(ids?: string[]): void;
  acknowledgeCelebration(notificationId: string): void;
  resetDemo(): Promise<void>;
}

interface AppContextValue extends AppActions {
  data: AppData;
  role: Role | null;
  /** False when changes cannot be saved to this browser. */
  persistent: boolean;
  /** Set when the last save to storage failed. */
  saveError: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  loadingFallback,
  renderError,
}: {
  children: ReactNode;
  loadingFallback: ReactNode;
  renderError: (message: string, retry: () => void) => ReactNode;
}) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [role, setRole] = useState<Role | null>(readRole);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dataRef = useRef<AppData | null>(null);

  const adopt = useCallback((data: AppData) => {
    dataRef.current = data;
    setState({ status: 'ready', data });
  }, []);

  const load = useCallback(() => {
    setState({ status: 'loading' });
    repository
      .load()
      .then(adopt)
      .catch(() => setState({ status: 'error', message: 'The demo data could not be loaded.' }));
  }, [adopt]);

  useEffect(() => {
    load();
    return repository.subscribe(adopt);
  }, [load, adopt]);

  const commit = useCallback(
    (next: AppData) => {
      adopt(next);
      repository
        .save(next)
        .then(() => setSaveError(null))
        .catch(() =>
          setSaveError('Changes could not be saved to this browser. They will be lost when the page is closed.'),
        );
    },
    [adopt],
  );

  const current = () => {
    if (!dataRef.current) throw new Error('Demo data is not loaded yet.');
    return dataRef.current;
  };

  const actions = useMemo<AppActions>(
    () => ({
      enterAs(next) {
        writeRole(next);
        setRole(next);
      },
      exitDemo() {
        writeRole(null);
        setRole(null);
      },
      saveAssessment(childId, changes) {
        const result = saveAssessment(current(), {
          childId,
          instructorId: DEMO_INSTRUCTOR_ID,
          changes,
          date: today(),
          timestamp: timestamp(),
        });
        commit(result.data);
        return result;
      },
      addProgressUpdate(childId, text, nextObjectives) {
        commit(
          addProgressUpdate(current(), {
            childId,
            instructorId: DEMO_INSTRUCTOR_ID,
            text,
            nextObjectives,
            date: today(),
            timestamp: timestamp(),
          }),
        );
      },
      setNextPriority(childId, text) {
        commit(setNextPriority(current(), childId, text));
      },
      markNotificationsRead(ids) {
        commit(markNotificationsRead(current(), DEMO_PARENT_ID, ids));
      },
      acknowledgeCelebration(notificationId) {
        commit(acknowledgeCelebration(current(), notificationId));
      },
      async resetDemo() {
        const seed = await repository.reset();
        setSaveError(null);
        adopt(seed);
      },
    }),
    [adopt, commit],
  );

  const value = useMemo<AppContextValue | null>(
    () =>
      state.status === 'ready'
        ? { data: state.data, role, persistent: repository.persistent, saveError, ...actions }
        : null,
    [state, role, saveError, actions],
  );

  if (state.status === 'loading') return <>{loadingFallback}</>;
  if (state.status === 'error' || !value) {
    return <>{renderError(state.status === 'error' ? state.message : 'Something went wrong.', load)}</>;
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider.');
  return value;
}

/** Everything the signed-in demo parent is allowed to see. */
export function useParentScope(): ParentScope {
  const { data } = useApp();
  const scope = useMemo(() => selectParentScope(data, DEMO_PARENT_ID), [data]);
  if (!scope) throw new Error('The demo parent account is not linked to a swimmer.');
  return scope;
}
