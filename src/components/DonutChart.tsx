import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export interface DonutSegment {
  id: string
  label: string
  value: number
  share: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  centerValue: string
  centerLabel: string
}

const SIZE = 220
const RADIUS = 78
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 2

/** Thin-stroke donut. Neutral tones with accent for the largest segment. */
export function DonutChart({
  segments,
  selectedId,
  onSelect,
  centerValue,
  centerLabel,
}: DonutChartProps) {
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

  let offset = 0
  const drawable = segments.map((segment) => {
    const length = Math.max(0, segment.share * CIRCUMFERENCE - GAP)
    const start = offset
    offset += segment.share * CIRCUMFERENCE
    return { segment, length, start }
  })

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Kategori bazında gider dağılımı"
      style={{ maxWidth: 240, margin: '0 auto' }}
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--tint)"
        strokeWidth={STROKE}
      />
      {drawable.map(({ segment, length, start }) => {
        const dimmed = selectedId !== null && selectedId !== segment.id
        return (
          <circle
            key={segment.id}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={segment.color}
            strokeWidth={STROKE}
            strokeDasharray={mounted ? `${length} ${CIRCUMFERENCE - length}` : `0 ${CIRCUMFERENCE}`}
            strokeDashoffset={-start}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            onClick={() => onSelect(selectedId === segment.id ? null : segment.id)}
            style={{
              opacity: dimmed ? 0.25 : 1,
              cursor: 'pointer',
              transition: reducedMotion
                ? undefined
                : 'stroke-dasharray 500ms ease-out, opacity 200ms ease-out',
            }}
          >
            <title>{segment.label}</title>
          </circle>
        )
      })}
      <text
        x={SIZE / 2}
        y={SIZE / 2 - 2}
        textAnchor="middle"
        fontSize="20"
        fontWeight="600"
        fill="var(--text)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {centerValue}
      </text>
      <text x={SIZE / 2} y={SIZE / 2 + 18} textAnchor="middle" fontSize="11" fill="var(--text-2)">
        {centerLabel}
      </text>
    </svg>
  )
}
