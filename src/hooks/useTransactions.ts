import { useCallback, useMemo } from 'react'
import type { Transaction, TransactionType } from '../types'
import { useAppData } from './useAppData'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>

export function useTransactions(): {
  transactions: Transaction[]
  addTransaction: (input: NewTransaction) => Transaction
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  removeTransaction: (id: string) => void
  removeMany: (ids: string[]) => void
  clearTransactions: () => void
} {
  const { data, setData } = useAppData()

  const transactions = useMemo(
    () => [...data.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [data.transactions],
  )

  const addTransaction = useCallback(
    (input: NewTransaction) => {
      const created: Transaction = {
        ...input,
        amount: round2(Math.abs(input.amount)),
        id: createId(),
        createdAt: new Date().toISOString(),
      }
      setData((previous) => ({
        ...previous,
        transactions: [created, ...previous.transactions],
      }))
      return created
    },
    [setData],
  )

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      setData((previous) => ({
        ...previous,
        transactions: previous.transactions.map((t) =>
          t.id === id
            ? {
                ...t,
                ...patch,
                amount: patch.amount === undefined ? t.amount : round2(Math.abs(patch.amount)),
              }
            : t,
        ),
      }))
    },
    [setData],
  )

  const removeTransaction = useCallback(
    (id: string) => {
      setData((previous) => ({
        ...previous,
        transactions: previous.transactions.filter((t) => t.id !== id),
      }))
    },
    [setData],
  )

  const removeMany = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      setData((previous) => ({
        ...previous,
        transactions: previous.transactions.filter((t) => !idSet.has(t.id)),
      }))
    },
    [setData],
  )

  const clearTransactions = useCallback(() => {
    setData((previous) => ({ ...previous, transactions: [] }))
  }, [setData])

  return { transactions, addTransaction, updateTransaction, removeTransaction, removeMany, clearTransactions }
}

export type { TransactionType }
