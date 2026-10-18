import { useMemo, useState } from 'react'
import { BalanceCard } from '../components/BalanceCard'
import { MonthSelector } from '../components/MonthSelector'
import { TrendChart } from '../components/TrendChart'
import { TransactionList } from '../components/TransactionList'
import { EmptyState } from '../components/EmptyState'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useSettings } from '../hooks/useSettings'
import { useHorizontalSwipe } from '../hooks/useHorizontalSwipe'
import {
  addMonths,
  dateFromKey,
  formatMonthLabel,
  keyOf,
  yearMonthOf,
  type YearMonth,
} from '../utils/format'
import { computeTotals, filterByMonth, trendSeries } from '../utils/calc'
import type { Transaction } from '../types'

interface SummaryScreenProps {
  onAdd: () => void
  onSeeAll: () => void
  onOpenTransaction: (transaction: Transaction) => void
  onRequestDelete: (transaction: Transaction) => void
}

export function SummaryScreen({
  onAdd,
  onSeeAll,
  onOpenTransaction,
  onRequestDelete,
}: SummaryScreenProps) {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const { settings } = useSettings()
  const [month, setMonth] = useState<YearMonth>(() => yearMonthOf(new Date()))

  const monthTransactions = useMemo(
    () => filterByMonth(transactions, month),
    [transactions, month],
  )
  const totals = useMemo(() => computeTotals(monthTransactions), [monthTransactions])
  const trend = useMemo(
    () => trendSeries(transactions, dateFromKey(keyOf(month)), 6),
    [transactions, month],
  )
  const recent = useMemo(() => transactions.slice(0, 5), [transactions])

  const swipe = useHorizontalSwipe(
    () => setMonth((current) => addMonths(current, 1)),
    () => setMonth((current) => addMonths(current, -1)),
  )

  return (
    <>
      <header className="screen-header">
        <h1 className="screen-title">Özet</h1>
        <p className="screen-sub">{formatMonthLabel(dateFromKey(keyOf(month)))}</p>
      </header>

      <div className="screen-scroll with-fab" {...swipe}>
        <BalanceCard totals={totals} currency={settings.currency} />

        <div className="mt-16">
          <MonthSelector value={month} onChange={setMonth} />
        </div>

        <div className="section-label mt-16 mb-8">Son 6 Ay</div>
        <div className="card card-pad">
          <TrendChart points={trend} />
        </div>

        <div className="section-head mt-24">
          <span className="section-label">Son İşlemler</span>
          <button type="button" className="btn-text" onClick={onSeeAll}>
            Tümünü gör
          </button>
        </div>

        <TransactionList
          transactions={recent}
          categories={categories}
          currency={settings.currency}
          variant="compact"
          onOpen={onOpenTransaction}
          onDelete={onRequestDelete}
          emptyState={
            <EmptyState
              message="Henüz işlem eklenmedi."
              actionLabel="İşlem ekle"
              onAction={onAdd}
            />
          }
        />
      </div>
    </>
  )
}
