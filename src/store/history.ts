import type { HistoryEntry } from '../logic/types';

// История разборов хранится локально в браузере.
// В production-версии должна храниться в БД на территории РФ.

const KEY = 'smartplate.history.v1';
const MAX_ENTRIES = 30;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry): void {
  try {
    const existing = getHistory().filter((e) => e.id !== entry.id);
    const next = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* нет квоты — молча игнорируем */
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

const LEAD_KEY = 'smartplate.lead.v1';

export interface StoredLead {
  name: string;
  contact: string;
  email?: string;
  consentData: boolean;
  consentInfo: boolean;
  createdAt: number;
}

export function saveLeadLocal(lead: StoredLead): void {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
  } catch {
    /* noop */
  }
}

export function getLeadLocal(): StoredLead | null {
  try {
    const raw = localStorage.getItem(LEAD_KEY);
    return raw ? (JSON.parse(raw) as StoredLead) : null;
  } catch {
    return null;
  }
}

export function clearAllUserData(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEAD_KEY);
  } catch {
    /* noop */
  }
}
