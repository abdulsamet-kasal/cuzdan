import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface AnimatedNumberProps {
  value: number
  format: (value: number) => string
  duration?: number
  className?: string
}

/**
 * Animates between values in 400ms. The first render is static — there is no
 * count-up on load — and animation is skipped when the user prefers reduced motion.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 400,
  className,
}: AnimatedNumberProps) {
  const reducedMotion = usePrefersReducedMotion()
  const displayRef = useRef(value)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const from = displayRef.current
    if (from === value || reducedMotion) {
      displayRef.current = value
      setDisplay(value)
      return
    }

    let frame = 0
    const startedAt = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = from + (value - from) * eased
      displayRef.current = next
      setDisplay(next)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        displayRef.current = value
        setDisplay(value)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reducedMotion])

  return <span className={className}>{format(display)}</span>
}
