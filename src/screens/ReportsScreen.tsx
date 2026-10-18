import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { MonthSelector } from '../components/MonthSelector'
import { DonutChart, type DonutSegment } from '../components/DonutChart'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useSettings } from '../hooks/useSettings'
import {
  formatCurrency,
  formatPercent,
  yearMonthOf,
  type YearMonth,
} from '../utils/format'
import {
  averageDailySpending,
  computeTotals,
  expensesByCategory,
  filterByMonth,
} from '../utils/calc'

/** Calm neutral palette; the largest segment receives the accent color. */
const NEUTRAL_TONES = ['#9CA3AF', '#6B7280', '#4B5563', '#D1D5DB', '#7C8492', '#B6BCC6', '#59606C', '#8A9099']

export function ReportsScreen() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const { settings } = useSettings()
  const [month, setMonth] = useState<YearMonth>(() => yearMonthOf(new Date()))
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedId(null)
  }, [month])

  const monthTransactions = useMemo(
    () => filterByMonth(transactions, month),
    [transactions, month],
  )
  const totals = useMemo(() => computeTotals(monthTransactions), [monthTransactions])
  const breakdown = useMemo(
    () => expensesByCategory(monthTransactions, categories),
    [monthTransactions, categories],
  )
  const dailyAverage = useMemo(
    () => averageDailySpending(monthTransactions, month),
    [monthTransactions, month],
  )

  const segments = useMemo<DonutSegment[]>(
    () =>
      breakdown.map((entry, index) => ({
        id: entry.categoryId,
        label: entry.category?.name ?? 'Diğer',
        value: entry.total,
        share: entry.share,
        color: index === 0 ? settings.accentColor : NEUTRAL_TONES[(index - 1) % NEUTRAL_TONES.length],
      })),
    [breakdown, settings.accentColor],
  )

  const topFive = useMemo(() => breakdown.slice(0, 5), [breakdown])
  const hasExpense = totals.expense > 0

  return (
    <>
      <header className="screen-header">
        <h1 className="screen-title">Raporlar</h1>
        <div className="mt-8">
          <MonthSelector value={month} onChange={setMonth} />
        </div>
      </header>

      <div className="screen-scroll">
        <section className="card card-pad" aria-label="Kategori dağılımı">
          {hasExpense ? (
            <>
              <DonutChart
                segments={segments}
                selectedId={selectedId}
                onSelect={setSelectedId}
                centerValue={formatCurrency(totals.expense, settings.currency)}
                centerLabel="Toplam gider"
              />
              <div className="group mt-16">
                {segments.map((segment) => (
                  <button
                    key={segment.id}
                    type="button"
                    className="legend-row"
                    aria-pressed={selectedId === segment.id}
                    onClick={() => setSelectedId(selectedId === segment.id ? null : segment.id)}
                  >
                    <span className="legend-dot" style={{ background: segment.color }} />
                    <span className="row-title" style={{ flex: 1 }}>
                      {segment.label}
                    </span>
                    <span className="secondary num">{formatCurrency(segment.value, settings.currency)}</span>
                    <span className="secondary num" style={{ minWidth: 44, textAlign: 'right' }}>
                      {formatPercent(segment.share, true)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="secondary" style={{ textAlign: 'center', padding: '32px 0' }}>
              Bu ay için gider kaydı yok.
            </p>
          )}
        </section>

        <div className="section-label mt-24 mb-8">Özet</div>
        <div className="metric-grid">
          <div className="metric">
            <div className="metric-label">Toplam gelir</div>
            <div className="metric-value income-text">
              <AnimatedNumber
                value={totals.income}
                format={(value) => formatCurrency(value, settings.currency)}
              />
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Toplam gider</div>
            <div className="metric-value expense-text">
              <AnimatedNumber
                value={totals.expense}
                format={(value) => formatCurrency(value, settings.currency)}
              />
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Birikim oranı</div>
            <div className="metric-value">
              <AnimatedNumber value={totals.savingsRate} format={formatPercent} />
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Günlük ortalama</div>
            <div className="metric-value">
              <AnimatedNumber
                value={dailyAverage}
                format={(value) => formatCurrency(value, settings.currency)}
              />
            </div>
          </div>
        </div>

        <div className="section-label mt-24 mb-8">En çok harcama yapılan 5 kategori</div>
        <div className="card card-pad">
          {topFive.length === 0 ? (
            <p className="secondary">Bu ay için gider kaydı yok.</p>
          ) : (
            topFive.map((entry) => (
              <div className="bar-row" key={entry.categoryId}>
                <div className="bar-row-head">
                  <span className="row-title">{entry.category?.name ?? 'Diğer'}</span>
                  <span className="secondary num">
                    {formatCurrency(entry.total, settings.currency)} · {formatPercent(entry.share, true)}
                  </span>
                </div>
                <div className="track">
                  <div
                    className="track-fill"
                    style={{ '--p': String(Math.max(entry.share, 0.02)) } as CSSProperties}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <p className="secondary mt-16" style={{ textAlign: 'center' }}>
          Aylık değişimlerin tamamı bu cihazda hesaplanır.
        </p>
      </div>
    </>
  )
}
