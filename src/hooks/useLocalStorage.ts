import { useCallback, useSyncExternalStore } from 'react'

/**
 * Generic, typed localStorage hook.
 *
 * - Every read and write is wrapped in try/catch; when storage is empty or
 *   corrupted the provided fallback is returned instead.
 * - All hook instances that share the same key stay in sync through a
 *   module-level registry, so the app has a single source of truth even
 *   though several components read the same record.
 * - Changes made in other tabs (storage event) are picked up as well.
 */

interface Entry<T> {
  value: T
  fallback: T
  listeners: Set<() => void>
}

const entries = new Map<string, Entry<unknown>>()

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || parsed === undefined) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Storage full or unavailable: keep the in-memory value. */
  }
}

function getEntry<T>(key: string, fallback: T): Entry<T> {
  const existing = entries.get(key) as Entry<T> | undefined
  if (existing) return existing
  const entry: Entry<T> = {
    value: readStored(key, fallback),
    fallback,
    listeners: new Set(),
  }
  entries.set(key, entry as Entry<unknown>)
  return entry
}

function notify(entry: Entry<unknown>): void {
  entry.listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      // localStorage.clear() from another tab.
      entries.forEach((entry, key) => {
        entry.value = readStored(key, entry.fallback)
        notify(entry)
      })
      return
    }
    const entry = entries.get(event.key)
    if (!entry) return
    entry.value = event.newValue === null ? entry.fallback : safeParse(event.newValue, entry.fallback)
    notify(entry)
  })
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(raw)
    return (parsed === null || parsed === undefined ? fallback : parsed) as T
  } catch {
    return fallback
  }
}

export type Setter<T> = (update: T | ((previous: T) => T)) => void

export function useLocalStorage<T>(key: string, fallback: T): [T, Setter<T>] {
  const subscribe = useCallback(
    (listener: () => void) => {
      const entry = getEntry(key, fallback)
      entry.listeners.add(listener)
      return () => {
        entry.listeners.delete(listener)
      }
    },
    [key, fallback],
  )

  const getSnapshot = useCallback(() => getEntry(key, fallback).value, [key, fallback])

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const setValue = useCallback<Setter<T>>(
    (update) => {
      const entry = getEntry(key, fallback)
      const previous = entry.value
      const next =
        typeof update === 'function' ? (update as (p: T) => T)(previous) : update
      if (Object.is(next, previous)) return
      entry.value = next
      writeStored(key, next)
      notify(entry as Entry<unknown>)
    },
    [key, fallback],
  )

  return [value, setValue]
}
