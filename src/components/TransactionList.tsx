import { useState, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Category, CurrencyCode, Transaction } from '../types'
import { TransactionRow } from './TransactionRow'
import { formatDayHeading } from '../utils/format'
import { groupByDay } from '../utils/calc'
import { cn } from '../utils/cn'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  currency: CurrencyCode
  variant?: 'compact' | 'days'
  onOpen: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  className?: string
  emptyState?: ReactNode
}

/**
 * Grouped transaction list. Rows share hairline dividers inside one surface,
 * swipe left reveals "Sil", and deleted rows collapse in 200ms.
 */
export function TransactionList({
  transactions,
  categories,
  currency,
  variant = 'compact',
  onOpen,
  onDelete,
  className,
  emptyState,
}: TransactionListProps) {
  const [revealedId, setRevealedId] = useState<string | null>(null)

  if (transactions.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  const groups =
    variant === 'days'
      ? groupByDay(transactions)
      : [{ date: '', items: transactions }]

  const handleOpen = (transaction: Transaction) => {
    setRevealedId(null)
    onOpen(transaction)
  }

  const renderRow = (transaction: Transaction) => (
    <TransactionRow
      key={transaction.id}
      transaction={transaction}
      category={categories.find((c) => c.id === transaction.categoryId)}
      currency={currency}
      revealed={revealedId === transaction.id}
      onRevealChange={(revealed) => setRevealedId(revealed ? transaction.id : null)}
      onOpen={handleOpen}
      onDelete={(target) => {
        setRevealedId(null)
        onDelete(target)
      }}
    />
  )

  if (variant === 'days') {
    return (
      <div className={cn('list-fade', className)}>
        {groups.map((group) => (
          <section key={group.date} aria-label={formatDayHeading(group.date)}>
            <div className="day-header">{formatDayHeading(group.date)}</div>
            <div className="group txn-list">
              <AnimatePresence initial={false}>{group.items.map(renderRow)}</AnimatePresence>
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('group txn-list list-fade', className)}>
      <AnimatePresence initial={false}>{transactions.map(renderRow)}</AnimatePresence>
    </div>
  )
}
