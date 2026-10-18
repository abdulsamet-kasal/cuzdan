import { ChevronLeft, ChevronRight } from '../utils/icons'
import { addMonths, dateFromKey, formatMonthLabel, keyOf, type YearMonth } from '../utils/format'

interface MonthSelectorProps {
  value: YearMonth
  onChange: (next: YearMonth) => void
  className?: string
}

export function MonthSelector({ value, onChange, className }: MonthSelectorProps) {
  const label = formatMonthLabel(dateFromKey(keyOf(value)))
  return (
    <div className={`month-selector ${className ?? ''}`}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Önceki ay"
        onClick={() => onChange(addMonths(value, -1))}
      >
        <ChevronLeft size={20} strokeWidth={1.75} />
      </button>
      <span className="month-label" aria-live="polite">
        {label}
      </span>
      <button
        type="button"
        className="icon-btn"
        aria-label="Sonraki ay"
        onClick={() => onChange(addMonths(value, 1))}
      >
        <ChevronRight size={20} strokeWidth={1.75} />
      </button>
    </div>
  )
}
