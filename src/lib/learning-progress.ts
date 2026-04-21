/**
 * Learning mode progress — localStorage persistence.
 * Tracks which batches have been completed and stores custom sets.
 */

const STORAGE_KEY = 'mapqwest_learning_progress';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CustomSet {
  id: string;
  name: string;
  /** alpha-3 country codes */
  countries: string[];
  createdAt: string; // ISO date string
}

export interface LearningProgress {
  /** Set of batch IDs that have been completed */
  completedBatchIds: string[];
  /** Custom sets built by the user */
  customSets: CustomSet[];
}

// ---------------------------------------------------------------------------
// I/O
// ---------------------------------------------------------------------------

function empty(): LearningProgress {
  return { completedBatchIds: [], customSets: [] };
}

export function loadLearningProgress(): LearningProgress {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    return JSON.parse(raw) as LearningProgress;
  } catch {
    return empty();
  }
}

function save(state: LearningProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Batch progress
// ---------------------------------------------------------------------------

export function isBatchComplete(batchId: string): boolean {
  return loadLearningProgress().completedBatchIds.includes(batchId);
}

export function markBatchComplete(batchId: string): LearningProgress {
  const prev = loadLearningProgress();
  if (prev.completedBatchIds.includes(batchId)) return prev;
  const next: LearningProgress = {
    ...prev,
    completedBatchIds: [...prev.completedBatchIds, batchId],
  };
  save(next);
  return next;
}

export function getBatchesCompletedForContinent(
  continent: string,
  allBatchIds: string[],
): number {
  const { completedBatchIds } = loadLearningProgress();
  return allBatchIds.filter(id => completedBatchIds.includes(id)).length;
}

// ---------------------------------------------------------------------------
// Custom sets
// ---------------------------------------------------------------------------

export function saveCustomSet(name: string, countries: string[]): CustomSet {
  const prev = loadLearningProgress();
  const set: CustomSet = {
    id: `custom_${Date.now()}`,
    name,
    countries,
    createdAt: new Date().toISOString(),
  };
  const next: LearningProgress = {
    ...prev,
    customSets: [...prev.customSets, set],
  };
  save(next);
  return set;
}

export function deleteCustomSet(id: string): LearningProgress {
  const prev = loadLearningProgress();
  const next: LearningProgress = {
    ...prev,
    customSets: prev.customSets.filter(s => s.id !== id),
  };
  save(next);
  return next;
}
