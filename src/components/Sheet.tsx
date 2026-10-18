import type { ReactNode } from 'react'
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { X } from '../utils/icons'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

/** Bottom sheet: rises in 250ms, backdrop fades to 40% black, drag down to dismiss. */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const dragControls = useDragControls()

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button
            type="button"
            className="backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
          />
          <motion.div
            className="sheet"
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.5 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div
              className="sheet-grabber"
              onPointerDown={(event) => dragControls.start(event)}
              aria-hidden="true"
            >
              <span />
            </div>
            <div className="sheet-header">
              <span className="sheet-title">{title}</span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Kapat"
                onClick={onClose}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="sheet-body">{children}</div>
            {footer ? <div className="sheet-footer">{footer}</div> : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
