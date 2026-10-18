import type { Category, Transaction } from '../types'
import { monthKey, parseISODate, round2, type YearMonth } from './format'

export interface Totals {
  income: number
  expense: number
  net: number
  /** (income − expense) / income, 0 when income is zero. */
  savingsRate: number
}

export function computeTotals(transactions: Transaction[]): Totals {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  income = round2(income)
  expense = round2(expense)
  const savingsRate = income > 0 ? round2(((income - expense) / income) * 100) : 0
  return { income, expense, net: round2(income - expense), savingsRate }
}

export function filterByMonth(transactions: Transaction[], target: YearMonth): Transaction[] {
  const key = `${target.year}-${String(target.month + 1).padStart(2, '0')}`
  return transactions.filter((t) => monthKey(parseISODate(t.date)) === key)
}

export interface CategoryBreakdown {
  categoryId: string
  category: Category | undefined
  total: number
  count: number
  share: number
}

/** Expense totals grouped by category, largest first. */
export function expensesByCategory(
  transactions: Transaction[],
  categories: Category[],
): CategoryBreakdown[] {
  const map = new Map<string, { total: number; count: number }>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const entry = map.get(t.categoryId) ?? { total: 0, count: 0 }
    entry.total = round2(entry.total + t.amount)
    entry.count += 1
    map.set(t.categoryId, entry)
  }
  const sum = [...map.values()].reduce((acc, entry) => acc + entry.total, 0)
  const list: CategoryBreakdown[] = [...map.entries()].map(([categoryId, entry]) => ({
    categoryId,
    category: categories.find((c) => c.id === categoryId),
    total: entry.total,
    count: entry.count,
    share: sum > 0 ? entry.total / sum : 0,
  }))
  return list.sort((a, b) => b.total - a.total)
}

export interface TrendPoint {
  key: string
  date: Date
  income: number
  expense: number
}

/** Income/expense per month for the last `months` months (oldest first). */
export function trendSeries(transactions: Transaction[], end: Date, months = 6): TrendPoint[] {
  const points: TrendPoint[] = []
  const lookup = new Map<string, { income: number; expense: number }>()
  for (const t of transactions) {
    const key = monthKey(parseISODate(t.date))
    const entry = lookup.get(key) ?? { income: 0, expense: 0 }
    if (t.type === 'income') entry.income += t.amount
    else entry.expense += t.amount
    lookup.set(key, entry)
  }
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1)
    const key = monthKey(d)
    const entry = lookup.get(key) ?? { income: 0, expense: 0 }
    points.push({
      key,
      date: d,
      income: round2(entry.income),
      expense: round2(entry.expense),
    })
  }
  return points
}

export interface DayGroup {
  date: string
  items: Transaction[]
}

/** Groups transactions by calendar day, newest day first. */
export function groupByDay(transactions: Transaction[]): DayGroup[] {
  const map = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const key = t.date.slice(0, 10)
    const list = map.get(key)
    if (list) list.push(t)
    else map.set(key, [t])
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)),
    }))
}

/** Average daily spending for the selected month, based on days elapsed. */
export function averageDailySpending(transactions: Transaction[], target: YearMonth): number {
  const now = new Date()
  const isCurrentMonth = target.year === now.getFullYear() && target.month === now.getMonth()
  const daysInMonth = new Date(target.year, target.month + 1, 0).getDate()
  const elapsed = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth
  const expense = computeTotals(transactions).expense
  return round2(expense / elapsed)
}

export function filterBySearch(
  transactions: Transaction[],
  query: string,
  categories: Category[],
): Transaction[] {
  const normalized = query.trim().toLocaleLowerCase('tr-TR')
  if (normalized.length === 0) return transactions
  return transactions.filter((t) => {
    const category = categories.find((c) => c.id === t.categoryId)
    const haystack = `${t.note} ${category?.name ?? ''}`.toLocaleLowerCase('tr-TR')
    return haystack.includes(normalized)
  })
}
