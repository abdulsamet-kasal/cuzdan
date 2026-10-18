import { useCallback, useRef, type TouchEvent as ReactTouchEvent } from 'react'

/**
 * Horizontal swipe detection for touch devices.
 * Vertical scrolling is left entirely to the browser; a gesture only counts
 * as a swipe when horizontal movement clearly dominates.
 */
export function useHorizontalSwipe(
  onSwipeNext: () => void,
  onSwipePrevious: () => void,
  enabled = true,
): {
  onTouchStart: (event: ReactTouchEvent) => void
  onTouchMove: (event: ReactTouchEvent) => void
  onTouchEnd: () => void
} {
  const start = useRef<{ x: number; y: number } | null>(null)
  const handled = useRef(false)

  const onTouchStart = useCallback(
    (event: ReactTouchEvent) => {
      if (!enabled) return
      const touch = event.touches[0]
      start.current = { x: touch.clientX, y: touch.clientY }
      handled.current = false
    },
    [enabled],
  )

  const onTouchMove = useCallback(
    (event: ReactTouchEvent) => {
      if (!enabled || !start.current || handled.current) return
      const touch = event.touches[0]
      const dx = touch.clientX - start.current.x
      const dy = touch.clientY - start.current.y
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        handled.current = true
        if (dx < 0) onSwipeNext()
        else onSwipePrevious()
      }
    },
    [enabled, onSwipeNext, onSwipePrevious],
  )

  const onTouchEnd = useCallback(() => {
    start.current = null
    handled.current = false
  }, [])

  return { onTouchStart, onTouchMove, onTouchEnd }
}
