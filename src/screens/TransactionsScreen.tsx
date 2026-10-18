import { useMemo, useState } from 'react'
import { SegmentedControl } from '../components/SegmentedControl'
import { TransactionList } from '../components/TransactionList'
import { EmptyState } from '../components/EmptyState'
import { Search } from '../utils/icons'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useSettings } from '../hooks/useSettings'
import { filterBySearch } from '../utils/calc'
import type { Transaction, TransactionType } from '../types'

type Filter = 'all' | TransactionType

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'income', label: 'Gelir' },
  { value: 'expense', label: 'Gider' },
]

interface TransactionsScreenProps {
  onAdd: () => void
  onOpenTransaction: (transaction: Transaction) => void
  onRequestDelete: (transaction: Transaction) => void
}

export function TransactionsScreen({
  onAdd,
  onOpenTransaction,
  onRequestDelete,
}: TransactionsScreenProps) {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const { settings } = useSettings()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const visible = useMemo(() => {
    const searched = filterBySearch(transactions, query, categories)
    if (filter === 'all') return searched
    return searched.filter((t) => t.type === filter)
  }, [transactions, query, filter, categories])

  return (
    <>
      <header className="screen-header">
        <h1 className="screen-title">İşlemler</h1>

        <div className="search-wrap mt-16">
          <Search size={20} strokeWidth={1.75} />
          <input
            type="search"
            className="input"
            value={query}
            placeholder="Not ve kategorilerde ara"
            aria-label="İşlem ara"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="mt-8">
          <SegmentedControl
            value={filter}
            options={FILTER_OPTIONS}
            onChange={setFilter}
            ariaLabel="İşlem filtresi"
          />
        </div>
      </header>

      <div className="screen-scroll with-fab">
        <TransactionList
          transactions={visible}
          categories={categories}
          currency={settings.currency}
          variant="days"
          onOpen={onOpenTransaction}
          onDelete={onRequestDelete}
          emptyState={
            transactions.length === 0 ? (
              <EmptyState
                message="Henüz kayıtlı bir işlem yok."
                actionLabel="İşlem ekle"
                onAction={onAdd}
              />
            ) : (
              <EmptyState
                message="Aramanızla eşleşen işlem bulunamadı."
                actionLabel="İşlem ekle"
                onAction={onAdd}
              />
            )
          }
        />
      </div>
    </>
  )
}
