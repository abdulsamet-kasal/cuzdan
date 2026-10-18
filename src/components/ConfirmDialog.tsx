import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Sil',
  cancelLabel = 'İptal',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const showCancel = cancelLabel !== ''
  return (
    <AnimatePresence>
      {open && (
        <div className="dialog-wrap" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button
            type="button"
            className="backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onCancel}
          />
          <motion.div
            className="dialog"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <h2 className="dialog-title">{title}</h2>
            <p className="dialog-body">{description}</p>
            <div className="dialog-actions">
              {showCancel ? (
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                  {cancelLabel}
                </button>
              ) : null}
              <button
                type="button"
                className={destructive ? 'btn btn-danger-outline' : 'btn btn-primary'}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function InfoDialog({
  open,
  title,
  description,
  confirmLabel = 'Tamam',
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog
      open={open}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel=""
      destructive={false}
      onConfirm={onConfirm}
      onCancel={onConfirm}
    />
  )
}


