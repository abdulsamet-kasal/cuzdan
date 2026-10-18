import type { ReactNode } from 'react'
import { Inbox } from '../utils/icons'

interface EmptyStateProps {
  message: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export function EmptyState({ message, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">{icon ?? <Inbox size={24} strokeWidth={1.75} />}</span>
      <p className="empty-title">{message}</p>
      {actionLabel && onAction ? (
        <button type="button" className="btn-text" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
