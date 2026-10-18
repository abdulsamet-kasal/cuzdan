import { useCallback, useMemo } from 'react'
import type { Settings, ThemeMode, CurrencyCode } from '../types'
import { DEFAULT_SETTINGS } from '../data/defaults'
import { useAppData } from './useAppData'

export function useSettings(): {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
} {
  const { data, setData } = useAppData()

  const settings = useMemo<Settings>(
    () => ({ ...DEFAULT_SETTINGS, ...data.settings }),
    [data.settings],
  )

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setData((previous) => ({
        ...previous,
        settings: { ...DEFAULT_SETTINGS, ...previous.settings, ...patch },
      }))
    },
    [setData],
  )

  return { settings, updateSettings }
}

export type { ThemeMode, CurrencyCode }
