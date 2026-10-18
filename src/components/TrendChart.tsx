import { useEffect, useState } from 'react'
import type { TrendPoint } from '../utils/calc'
import { shortMonthLabel } from '../utils/format'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const VIEW_W = 320
const VIEW_H = 152
const PAD_X = 10
const PAD_TOP = 12
const AXIS_H = 24

const BAR_W = 7
const BAR_GAP = 3

interface TrendChartProps {
  points: TrendPoint[]
}

/**
 * 6-month income vs expense bars. Thin bars, one light gridline,
 * accent for income and neutral gray for expense. Draws once on mount in 500ms.
 */
export function TrendChart({ points }: TrendChartProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [mounted, setMounted] = useState(reducedMotion)

  useEffect(() => {
    if (reducedMotion) {
      setMounted(true)
      return
    }
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [reducedMotion])

  const chartH = VIEW_H - PAD_TOP - AXIS_H
  const maxValue = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]))
  const hasData = points.some((p) => p.income > 0 || p.expense > 0)
  const groupW = (VIEW_W - PAD_X * 2) / points.length
  const baselineY = PAD_TOP + chartH
  const gridY = PAD_TOP + chartH / 2

  const barHeight = (value: number) => (value / maxValue) * chartH
  const pairW = BAR_W * 2 + BAR_GAP

  return (
    <div>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Son altı ayın gelir ve gider grafiği"
        preserveAspectRatio="xMidYMid meet"
      >
        <line x1={PAD_X} y1={gridY} x2={VIEW_W - PAD_X} y2={gridY} stroke="var(--border)" strokeWidth="1" />
        <line x1={PAD_X} y1={baselineY} x2={VIEW_W - PAD_X} y2={baselineY} stroke="var(--border)" strokeWidth="1" />

        {points.map((point, index) => {
          const groupX = PAD_X + index * groupW
          const pairX = groupX + (groupW - pairW) / 2
          const incomeH = barHeight(point.income)
          const expenseH = barHeight(point.expense)

          return (
            <g key={point.key}>
              <rect
                x={pairX}
                y={baselineY - incomeH}
                width={BAR_W}
                height={Math.max(incomeH, point.income > 0 ? 1 : 0)}
                fill="var(--accent)"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'bottom',
                  transform: mounted ? 'scaleY(1)' : 'scaleY(0)',
                  transition: reducedMotion ? undefined : 'transform 500ms ease-out',
                }}
              />
              <rect
                x={pairX + BAR_W + BAR_GAP}
                y={baselineY - expenseH}
                width={BAR_W}
                height={Math.max(expenseH, point.expense > 0 ? 1 : 0)}
                fill="#9CA3AF"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'bottom',
                  transform: mounted ? 'scaleY(1)' : 'scaleY(0)',
                  transition: reducedMotion ? undefined : 'transform 500ms ease-out',
                }}
              />
              <text
                x={groupX + groupW / 2}
                y={VIEW_H - 7}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-2)"
              >
                {shortMonthLabel(point.date)}
              </text>
            </g>
          )
        })}
      </svg>

      {!hasData ? <p className="secondary" style={{ textAlign: 'center' }}>Bu dönemde kayıt yok</p> : null}
    </div>
  )
}
