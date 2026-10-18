import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { AppShell } from './components/AppShell'
import type { TabId } from './components/TabBar'
import { AddTransactionSheet } from './components/AddTransactionSheet'
import { ConfirmDialog } from './components/ConfirmDialog'
import { SummaryScreen } from './screens/SummaryScreen'
import { TransactionsScreen } from './screens/TransactionsScreen'
import { ReportsScreen } from './screens/ReportsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useSettings } from './hooks/useSettings'
import { useTransactions } from './hooks/useTransactions'
import type { Transaction } from './types'

const LIGHT_BG = '#F7F7F8'
const DARK_BG = '#0B0B0C'

export default function App() {
  const { settings } = useSettings()
  const { removeTransaction } = useTransactions()

  const [tab, setTab] = useState<TabId>('summary')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)

  /* Theme + accent are applied as CSS custom properties on the root. */
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme)
    root.style.setProperty('--accent', settings.accentColor)
  }, [settings.theme, settings.accentColor])

  /* Keep the browser chrome color in sync with the effective theme. */
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const meta = document.querySelector('meta[name="theme-color"]')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
      meta?.setAttribute('content', dark ? DARK_BG : LIGHT_BG)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [settings.theme])

  const openAdd = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction)
    setSheetOpen(true)
  }

  const renderScreen = () => {
    switch (tab) {
      case 'transactions':
        return (
          <TransactionsScreen
            onAdd={openAdd}
            onOpenTransaction={openEdit}
            onRequestDelete={setPendingDelete}
          />
        )
      case 'reports':
        return <ReportsScreen />
      case 'settings':
        return <SettingsScreen />
      case 'summary':
      default:
        return (
          <SummaryScreen
            onAdd={openAdd}
            onSeeAll={() => setTab('transactions')}
            onOpenTransaction={openEdit}
            onRequestDelete={setPendingDelete}
          />
        )
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <AppShell
        tab={tab}
        onTabChange={setTab}
        showFab={tab === 'summary' || tab === 'transactions'}
        onFabClick={openAdd}
      >
        {renderScreen()}
      </AppShell>

      <AddTransactionSheet open={sheetOpen} initial={editing} onClose={() => setSheetOpen(false)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="İşlemi sil"
        description="Bu işlem kalıcı olarak silinecek. Bu işlem geri alınamaz."
        confirmLabel="Sil"
        onConfirm={() => {
          if (pendingDelete) removeTransaction(pendingDelete.id)
          setPendingDelete(null)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </MotionConfig>
  )
}
