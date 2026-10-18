import { CURRENCY_SYMBOLS } from '../data/defaults'
import type { CurrencyCode, Transaction } from '../types'

/* ------------------------------------------------------------------ */
/* Number / currency formatting (tr-TR)                                */
/* ------------------------------------------------------------------ */

const number2 = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const number0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 })

const numberMax4 = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
})

const percent1 = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

/** Percentage of a ratio or a value already in percent: 0.3755 → "%37,6" */
export function formatPercent(value: number, ofTotal = false): string {
  const pct = ofTotal ? value * 100 : value
  return `%${percent1.format(Number.isFinite(pct) ? pct : 0)}`
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function formatNumber(value: number, mode: '2' | '0' | 'trim' = '2'): string {
  if (!Number.isFinite(value)) return number2.format(0)
  if (mode === '0') return number0.format(value)
  if (mode === 'trim') return numberMax4.format(value)
  return number2.format(value)
}

/** "1.250,50 ₺" — symbol separated from the number, per spec. */
export function formatCurrency(value: number, currency: CurrencyCode = 'TRY'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '₺'
  return `${number2.format(value)} ${symbol}`
}

/** Signed variant used in transaction lists: "+1.250,00 ₺" / "-120,00 ₺" */
export function formatSignedCurrency(
  value: number,
  type: 'income' | 'expense',
  currency: CurrencyCode = 'TRY',
): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '₺'
  const sign = type === 'income' ? '+' : '-'
  return `${sign}${number2.format(Math.abs(value))} ${symbol}`
}

/**
 * Formats the raw keypad string ("1234.5") as the user types:
 * thousands separators with a comma decimal part, e.g. "1.234,5".
 */
export function formatAmountInput(raw: string): string {
  if (raw === '') return '0'
  const [intPart, decPart] = raw.split('.')
  const intDigits = intPart.replace(/^0+(?=\d)/, '') || '0'
  const grouped = number0.format(Number(intDigits === '' ? '0' : intDigits))
  if (decPart === undefined) return grouped
  return `${grouped},${decPart}`
}

export function amountFromRaw(raw: string): number {
  if (raw === '' || raw === '.') return 0
  return round2(Number(raw))
}

/* ------------------------------------------------------------------ */
/* Date formatting (tr-TR)                                             */
/* ------------------------------------------------------------------ */

const fullDateFmt = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dayMonthFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })

const monthYearFmt = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' })

const timeFmt = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' })

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1)
}

/** Parses "YYYY-MM-DD" as a local date (avoids UTC shift). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return new Date(iso)
  return new Date(y, m - 1, d)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** "12 Ekim 2026" */
export function formatFullDate(date: Date): string {
  return capitalize(fullDateFmt.format(date))
}

/** "12 Eki" */
export function formatDayMonth(date: Date): string {
  return dayMonthFmt.format(date)
}

/** "Ekim 2026" */
export function formatMonthLabel(date: Date): string {
  return capitalize(monthYearFmt.format(date))
}

/** "Ekim" */
export function formatMonthName(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(date),
  )
}

export function formatTime(date: Date): string {
  return timeFmt.format(date)
}

/** Sticky group heading: "Bugün", "Dün" or a full date. */
export function formatDayHeading(isoDate: string): string {
  const date = parseISODate(isoDate)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday.getTime() - target.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Dün'
  return formatFullDate(date)
}

export function shortMonthLabel(date: Date): string {
  return capitalize(new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date).replace('.', ''))
}

/* ------------------------------------------------------------------ */
/* Month helpers                                                       */
/* ------------------------------------------------------------------ */

export type YearMonth = { year: number; month: number }

export function yearMonthOf(date: Date): YearMonth {
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function keyOf(date: YearMonth): string {
  return `${date.year}-${String(date.month + 1).padStart(2, '0')}`
}

export function dateFromKey(key: string): Date {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, (m || 1) - 1, 1)
}

export function addMonths(target: YearMonth, delta: number): YearMonth {
  const d = new Date(target.year, target.month + delta, 1)
  return yearMonthOf(d)
}

export function isSameMonth(target: YearMonth, date: Date): boolean {
  return target.year === date.getFullYear() && target.month === date.getMonth()
}

export function transactionInMonth(transaction: Transaction, target: YearMonth): boolean {
  const date = parseISODate(transaction.date)
  return isSameMonth(target, date)
}

export function monthStartEnd(target: YearMonth): { start: Date; end: Date } {
  const start = new Date(target.year, target.month, 1)
  const end = new Date(target.year, target.month + 1, 1)
  return { start, end }
}
