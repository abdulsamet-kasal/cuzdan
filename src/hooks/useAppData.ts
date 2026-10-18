import type { AppData, CategoryType } from '../types'
import { STORAGE_KEY, createDefaultData } from '../data/defaults'
import { useLocalStorage } from './useLocalStorage'

/**
 * The whole application state lives under a single localStorage key.
 * The default value is created once and reused, so every consumer of the
 * hook receives the same snapshot reference.
 */
const DEFAULT_APP_DATA: AppData = createDefaultData()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asCategoryType(value: unknown): CategoryType {
  return value === 'income' || value === 'expense' || value === 'both' ? value : 'both'
}

function sanitizeData(raw: unknown): AppData {
  const defaults = DEFAULT_APP_DATA
  if (!isRecord(raw)) return defaults

  const rawTransactions = Array.isArray(raw.transactions) ? raw.transactions : []
  const transactions = rawTransactions
    .filter(isRecord)
    .filter(
      (t) =>
        (t.type === 'income' || t.type === 'expense') &&
        typeof t.amount === 'number' &&
        Number.isFinite(t.amount) &&
        typeof t.categoryId === 'string' &&
        typeof t.date === 'string',
    )
    .map((t) => ({
      id: typeof t.id === 'string' ? t.id : `t-${Math.random().toString(36).slice(2)}`,
      type: t.type as 'income' | 'expense',
      amount: Math.round(Number(t.amount) * 100) / 100,
      categoryId: t.categoryId as string,
      note: typeof t.note === 'string' ? t.note : '',
      date: t.date as string,
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : (t.date as string),
    }))

  const rawCategories = Array.isArray(raw.categories) ? raw.categories : []
  const categories = rawCategories
    .filter(isRecord)
    .filter((c) => typeof c.name === 'string' && c.name.trim().length > 0)
    .map((c) => ({
      id: typeof c.id === 'string' ? c.id : `c-${Math.random().toString(36).slice(2)}`,
      name: c.name as string,
      icon: typeof c.icon === 'string' ? c.icon : 'tag',
      color: typeof c.color === 'string' ? c.color : '#6B7280',
      type: asCategoryType(c.type),
    }))

  const rawSettings = isRecord(raw.settings) ? raw.settings : {}
  const currency =
    rawSettings.currency === 'USD' || rawSettings.currency === 'EUR' || rawSettings.currency === 'TRY'
      ? rawSettings.currency
      : defaults.settings.currency
  const theme =
    rawSettings.theme === 'light' || rawSettings.theme === 'dark' || rawSettings.theme === 'system'
      ? rawSettings.theme
      : defaults.settings.theme
  const accentColor =
    typeof rawSettings.accentColor === 'string' ? rawSettings.accentColor : defaults.settings.accentColor

  return {
    version: 1,
    transactions,
    // Seed default categories on first launch or when the list was wiped.
    categories: categories.length > 0 ? categories : defaults.categories.map((c) => ({ ...c })),
    settings: { currency, theme, accentColor },
  }
}

/** Reads the persisted state, falling back to defaults when it is unusable. */
export function sanitizeAppData(raw: unknown): AppData {
  return sanitizeData(raw)
}

/**
 * Single entry point for reading and writing the persisted state.
 * Values are always returned after sanitization, so a corrupted record
 * can never break the UI.
 */
export function useAppData(): {
  data: AppData
  setData: (update: (previous: AppData) => AppData) => void
} {
  const [raw, setRaw] = useLocalStorage<unknown>(STORAGE_KEY, DEFAULT_APP_DATA)
  const setData = (update: (previous: AppData) => AppData) => {
    setRaw((previous: unknown) => sanitizeData(update(sanitizeData(previous))))
  }
  return { data: sanitizeData(raw), setData }
}
