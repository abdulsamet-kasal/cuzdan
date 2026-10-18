import type { ReactNode } from 'react'
import { ChevronRight } from '../utils/icons'
import { cn } from '../utils/cn'

export interface SettingsRow {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  /** Trailing content such as a checkmark or value text. */
  trailing?: ReactNode
  /** Interactive trailing controls (e.g. reorder buttons). */
  controls?: ReactNode
  onClick?: () => void
  /** Show a chevron — use for rows that navigate somewhere. */
  showChevron?: boolean
  danger?: boolean
}

export interface SettingsSection {
  id: string
  title: string
  rows?: SettingsRow[]
  /** Extra content rendered inside the section surface (e.g. color swatches). */
  custom?: ReactNode
}

interface SettingsListProps {
  sections: SettingsSection[]
}

/**
 * Grouped settings list: small uppercase section headers, hairline dividers,
 * chevrons on navigational rows and no card-per-item.
 */
export function SettingsList({ sections }: SettingsListProps) {
  return (
    <div>
      {sections.map((section) => (
        <section key={section.id} className="mt-16" aria-label={section.title}>
          <div className="section-label mb-8">{section.title}</div>
          <div className="group">
            {section.rows?.map((row) => {
              const text = (
                <>
                  {row.icon ? <span className="icon-tile">{row.icon}</span> : null}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="row-title" style={{ display: 'block' }}>
                      {row.label}
                    </span>
                    {row.description ? <span className="row-sub">{row.description}</span> : null}
                  </span>
                </>
              )

              if (row.controls) {
                return (
                  <div className="row" key={row.id}>
                    <button
                      type="button"
                      className="row-main"
                      onClick={row.onClick}
                      aria-label={row.label}
                    >
                      {text}
                      {row.showChevron ? (
                        <ChevronRight size={20} strokeWidth={1.75} className="row-chevron" />
                      ) : null}
                    </button>
                    {row.controls}
                  </div>
                )
              }

              return (
                <button
                  key={row.id}
                  type="button"
                  className={cn('row', row.danger && 'expense-text')}
                  onClick={row.onClick}
                  aria-label={row.label}
                >
                  {text}
                  {row.trailing !== undefined ? (
                    <span className="row-chevron">{row.trailing}</span>
                  ) : null}
                  {row.showChevron ? (
                    <ChevronRight size={20} strokeWidth={1.75} className="row-chevron" />
                  ) : null}
                </button>
              )
            })}
            {section.custom}
          </div>
        </section>
      ))}
    </div>
  )
}
