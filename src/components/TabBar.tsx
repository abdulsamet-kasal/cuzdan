import { ArrowLeftRight, BarChart3, LayoutDashboard, Settings } from '../utils/icons'

export type TabId = 'summary' | 'transactions' | 'reports' | 'settings'

export const TABS: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'summary', label: 'Özet', Icon: LayoutDashboard },
  { id: 'transactions', label: 'İşlemler', Icon: ArrowLeftRight },
  { id: 'reports', label: 'Raporlar', Icon: BarChart3 },
  { id: 'settings', label: 'Ayarlar', Icon: Settings },
]

interface TabBarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="Ana gezinme">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className="tab-item"
          role="tab"
          aria-selected={active === id}
          aria-label={label}
          onClick={() => onChange(id)}
        >
          <Icon size={20} strokeWidth={1.75} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
