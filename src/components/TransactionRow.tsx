import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion'
import type { Category, CurrencyCode, Transaction } from '../types'
import { getCategoryIcon, Trash2 } from '../utils/icons'
import { formatSignedCurrency } from '../utils/format'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const REVEALED_X = -88

interface TransactionRowProps {
  transaction: Transaction
  category?: Category
  currency: CurrencyCode
  revealed: boolean
  onRevealChange: (revealed: boolean) => void
  onOpen: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionRow({
  transaction,
  category,
  currency,
  revealed,
  onRevealChange,
  onOpen,
  onDelete,
}: TransactionRowProps) {
  const x = useMotionValue(0)
  const dragged = useRef(false)
  const reducedMotion = usePrefersReducedMotion()
  const Icon = getCategoryIcon(category?.icon ?? 'tag')

  useEffect(() => {
    const controls = animate(x, revealed ? REVEALED_X : 0, {
      duration: reducedMotion ? 0 : 0.2,
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [revealed, x, reducedMotion])

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 8) dragged.current = true
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldReveal = info.offset.x < -44 || info.velocity.x < -400
    if (shouldReveal !== revealed) {
      onRevealChange(shouldReveal)
    } else {
      animate(x, shouldReveal ? REVEALED_X : 0, {
        duration: reducedMotion ? 0 : 0.2,
        ease: 'easeOut',
      })
    }
  }

  const handleClick = () => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    if (revealed) {
      onRevealChange(false)
      return
    }
    onOpen(transaction)
  }

  return (
    <motion.div
      className="txn-row-wrap"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <button
        type="button"
        className="txn-delete"
        onClick={() => onDelete(transaction)}
        aria-label="İşlemi sil"
      >
        <Trash2 size={18} strokeWidth={1.75} />
        Sil
      </button>

      <motion.div
        className="txn-row"
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: REVEALED_X, right: 0 }}
        dragElastic={0.04}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
          }
        }}
      >
        <span className="icon-tile" aria-hidden="true">
          <Icon size={20} strokeWidth={1.75} />
        </span>

        <span className="txn-main">
          <span className="txn-category">{category?.name ?? 'Kategori'}</span>
          {transaction.note ? <span className="txn-note">{transaction.note}</span> : null}
        </span>

        <span
          className={`txn-amount ${transaction.type === 'income' ? 'income-text' : ''}`}
        >
          {formatSignedCurrency(transaction.amount, transaction.type, currency)}
        </span>
      </motion.div>
    </motion.div>
  )
}
