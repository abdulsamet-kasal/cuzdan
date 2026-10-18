import { useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TABS, TabBar, type TabId } from './TabBar'
import { Plus } from '../utils/icons'

interface AppShellProps {
  tab: TabId
  onTabChange: (tab: TabId) => void
  showFab?: boolean
  onFabClick?: () => void
  children: ReactNode
}

/**
 * Application frame: a fixed-height shell with a single scrolling stage and a
 * solid bottom tab bar. Screen changes slide horizontally for 200ms.
 */
export function AppShell({ tab, onTabChange, showFab = false, onFabClick, children }: AppShellProps) {
  const index = TABS.findIndex((entry) => entry.id === tab)
  const previousIndex = useRef(index)
  const direction = useRef(1)

  if (index !== previousIndex.current) {
    direction.current = index > previousIndex.current ? 1 : -1
    previousIndex.current = index
  }

  const slide = 24

  return (
    <div className="app-shell">
      <div className="app-stage">
        <AnimatePresence initial={false}>
          <motion.section
            key={tab}
            className="screen"
            initial={{ opacity: 0, x: direction.current * slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction.current * -slide }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.section>
        </AnimatePresence>
      </div>

      {showFab && onFabClick ? (
        <button
          type="button"
          className="fab"
          aria-label="İşlem ekle"
          onClick={onFabClick}
        >
          <Plus size={24} strokeWidth={1.75} />
        </button>
      ) : null}

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  )
}
