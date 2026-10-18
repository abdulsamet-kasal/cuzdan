import { AnimatedNumber } from './AnimatedNumber'
import { formatCurrency } from '../utils/format'
import type { CurrencyCode } from '../types'
import type { Totals } from '../utils/calc'

interface BalanceCardProps {
  totals: Totals
  currency: CurrencyCode
}

/** Plain surface card: net balance, then monthly income and expense. */
export function BalanceCard({ totals, currency }: BalanceCardProps) {
  return (
    <section className="card card-pad" aria-label="Bakiye özeti">
      <div className="stat-label">Net bakiye</div>
      <div className={`balance-value ${totals.net < 0 ? 'expense-text' : ''}`}>
        <AnimatedNumber
          value={totals.net}
          format={(value) => formatCurrency(value, currency)}
        />
      </div>

      <div className="hairline hairline-gap" />

      <div className="stat-line">
        <span className="stat-label">Aylık gelir</span>
        <span className="stat-value income-text">
          <AnimatedNumber
            value={totals.income}
            format={(value) => formatCurrency(value, currency)}
          />
        </span>
      </div>
      <div className="stat-line">
        <span className="stat-label">Aylık gider</span>
        <span className="stat-value expense-text">
          <AnimatedNumber
            value={totals.expense}
            format={(value) => formatCurrency(value, currency)}
          />
        </span>
      </div>
    </section>
  )
}
