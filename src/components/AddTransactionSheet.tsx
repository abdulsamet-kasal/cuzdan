import { useEffect, useMemo, useState } from 'react'
import { Sheet } from './Sheet'
import { SegmentedControl } from './SegmentedControl'
import { NumericKeypad } from './NumericKeypad'
import { CategoryGrid } from './CategoryGrid'
import { Calendar } from '../utils/icons'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useSettings } from '../hooks/useSettings'
import { CURRENCY_SYMBOLS } from '../data/defaults'
import {
  amountFromRaw,
  formatAmountInput,
  parseISODate,
  formatFullDate,
  todayISO,
} from '../utils/format'
import type { Transaction, TransactionType } from '../types'
import { cn } from '../utils/cn'

interface AddTransactionSheetProps {
  open: boolean
  initial: Transaction | null
  onClose: () => void
}

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Gider' },
  { value: 'income', label: 'Gelir' },
]

export function AddTransactionSheet({ open, initial, onClose }: AddTransactionSheetProps) {
  const { addTransaction, updateTransaction } = useTransactions()
  const { categories } = useCategories()
  const { settings } = useSettings()

  const [type, setType] = useState<TransactionType>('expense')
  const [raw, setRaw] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    setType(initial?.type ?? 'expense')
    setRaw(initial ? initial.amount.toFixed(2) : '')
    setCategoryId(initial?.categoryId ?? null)
    setDate(initial ? initial.date.slice(0, 10) : todayISO())
    setNote(initial?.note ?? '')
  }, [open, initial])

  const availableCategories = useMemo(
    () => categories.filter((c) => c.type === type || c.type === 'both'),
    [categories, type],
  )

  const handleTypeChange = (next: TransactionType) => {
    setType(next)
    if (categoryId) {
      const current = categories.find((c) => c.id === categoryId)
      if (current && !(current.type === next || current.type === 'both')) {
        setCategoryId(null)
      }
    }
  }

  const handleKey = (key: string) => {
    setRaw((previous) => {
      if (key === 'backspace') return previous.slice(0, -1)
      if (key === ',') return previous.includes('.') ? previous : `${previous === '' ? '0' : previous}.`
      if (previous.includes('.')) {
        const [, decimals] = previous.split('.')
        if (decimals.length >= 2) return previous
        return previous + key
      }
      if (previous === '' || previous === '0') return key === '0' ? '0' : key
      if (previous.length >= 9) return previous
      return previous + key
    })
  }

  const amount = amountFromRaw(raw)
  const canSave = amount > 0 && categoryId !== null

  const handleSave = () => {
    if (!canSave || categoryId === null) return
    if (initial) {
      updateTransaction(initial.id, { type, amount, categoryId, note: note.trim(), date })
    } else {
      addTransaction({ type, amount, categoryId, note: note.trim(), date })
    }
    onClose()
  }

  const symbol = CURRENCY_SYMBOLS[settings.currency]

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? 'İşlemi düzenle' : 'İşlem ekle'}
      footer={
        <button
          type="button"
          className={cn('btn', 'btn-save', type === 'income' ? 'is-income' : 'is-expense')}
          disabled={!canSave}
          onClick={handleSave}
        >
          Kaydet
        </button>
      }
    >
      <SegmentedControl
        value={type}
        options={TYPE_OPTIONS}
        onChange={handleTypeChange}
        ariaLabel="İşlem türü"
      />

      <div
        className={`amount-display ${type === 'income' ? 'is-income' : 'is-expense'}`}
        aria-live="polite"
      >
        <span>{formatAmountInput(raw)}</span>
        <span className="amount-symbol">{symbol}</span>
      </div>

      <NumericKeypad onKey={handleKey} />

      <div className="section-label mt-24 mb-8">Kategori</div>
      <CategoryGrid
        categories={availableCategories}
        value={categoryId}
        onChange={setCategoryId}
        ariaLabel="Kategori seçimi"
      />

      <div className="section-label mt-24 mb-8">Tarih</div>
      <div className="date-row">
        <span className="icon-tile" aria-hidden="true">
          <Calendar size={20} strokeWidth={1.75} />
        </span>
        <span className="row-title">{formatFullDate(parseISODate(date))}</span>
        <input
          type="date"
          className="date-input"
          value={date}
          aria-label="İşlem tarihi"
          onChange={(event) => setDate(event.target.value || todayISO())}
        />
      </div>

      <div className="section-label mt-24 mb-8">Not</div>
      <input
        type="text"
        className="input"
        value={note}
        maxLength={120}
        placeholder="Not ekle (isteğe bağlı)"
        onChange={(event) => setNote(event.target.value)}
      />
    </Sheet>
  )
}
