/**
 * Unsaved assessment work, kept per swimmer for the length of the visit.
 *
 * Holding drafts here (not inside the assessment sheet) means an instructor can move between
 * swimmers, tabs and pages without losing what they have entered but not yet saved.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SkillStatus } from '@/types';

export interface SkillDraft {
  status?: SkillStatus;
  feedback?: string;
  nextTarget?: string;
}

export interface SwimmerDraft {
  skills: Record<string, SkillDraft>;
  /** Short note for the parent about this session. */
  note: string;
  /** Edited next coaching priority. undefined = not edited. */
  priority?: string;
}

export const EMPTY_DRAFT: SwimmerDraft = { skills: {}, note: '' };

interface DraftsContextValue {
  drafts: Record<string, SwimmerDraft>;
  update(childId: string, change: (draft: SwimmerDraft) => SwimmerDraft): void;
  clear(childId: string): void;
  clearAll(): void;
}

const DraftsContext = createContext<DraftsContextValue | null>(null);

export function AssessmentDraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, SwimmerDraft>>({});

  const update = useCallback(
    (childId: string, change: (draft: SwimmerDraft) => SwimmerDraft) =>
      setDrafts((all) => ({ ...all, [childId]: change(all[childId] ?? EMPTY_DRAFT) })),
    [],
  );
  const clear = useCallback(
    (childId: string) =>
      setDrafts((all) => {
        const { [childId]: _removed, ...rest } = all;
        return rest;
      }),
    [],
  );
  const clearAll = useCallback(() => setDrafts({}), []);

  const value = useMemo(() => ({ drafts, update, clear, clearAll }), [drafts, update, clear, clearAll]);
  return <DraftsContext.Provider value={value}>{children}</DraftsContext.Provider>;
}

export function useAssessmentDrafts(): DraftsContextValue {
  const value = useContext(DraftsContext);
  if (!value) throw new Error('useAssessmentDrafts must be used inside AssessmentDraftsProvider.');
  return value;
}

/** True when a draft holds anything at all. The sheet itself works out what truly differs. */
export function draftHasContent(draft: SwimmerDraft | undefined): boolean {
  if (!draft) return false;
  return (
    draft.note.trim() !== '' ||
    draft.priority !== undefined ||
    Object.values(draft.skills).some((s) => s.status !== undefined || s.feedback !== undefined || s.nextTarget !== undefined)
  );
}
