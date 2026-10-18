import { useCallback, useMemo } from 'react'
import type { Category } from '../types'
import { DEFAULT_CATEGORIES } from '../data/defaults'
import { useAppData } from './useAppData'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function useCategories(): {
  categories: Category[]
  addCategory: (input: Omit<Category, 'id'>) => Category
  updateCategory: (id: string, patch: Partial<Category>) => void
  removeCategory: (id: string) => void
  moveCategory: (id: string, direction: -1 | 1) => void
} {
  const { data, setData } = useAppData()

  const categories = useMemo<Category[]>(
    () => (data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES),
    [data.categories],
  )

  const addCategory = useCallback(
    (input: Omit<Category, 'id'>) => {
      const category: Category = { ...input, id: createId() }
      setData((previous) => ({ ...previous, categories: [...previous.categories, category] }))
      return category
    },
    [setData],
  )

  const updateCategory = useCallback(
    (id: string, patch: Partial<Category>) => {
      setData((previous) => ({
        ...previous,
        categories: previous.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }))
    },
    [setData],
  )

  const removeCategory = useCallback(
    (id: string) => {
      setData((previous) => ({
        ...previous,
        categories: previous.categories.filter((c) => c.id !== id),
      }))
    },
    [setData],
  )

  const moveCategory = useCallback(
    (id: string, direction: -1 | 1) => {
      setData((previous) => {
        const index = previous.categories.findIndex((c) => c.id === id)
        const target = index + direction
        if (index < 0 || target < 0 || target >= previous.categories.length) return previous
        const next = [...previous.categories]
        const [moved] = next.splice(index, 1)
        next.splice(target, 0, moved)
        return { ...previous, categories: next }
      })
    },
    [setData],
  )

  return { categories, addCategory, updateCategory, removeCategory, moveCategory }
}
