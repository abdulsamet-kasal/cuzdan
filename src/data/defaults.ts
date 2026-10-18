import type { AppData, Category, Settings, Transaction } from '../types'

/** LocalStorage key used for the whole application state. */
export const STORAGE_KEY = 'cuzdan-v1'

export const ACCENT_OPTIONS: { id: string; label: string; value: string }[] = [
  { id: 'accent', label: 'Vurgu', value: '#1F6FEB' },
  { id: 'graphite', label: 'Grafit', value: '#374151' },
  { id: 'teal', label: 'Turkuaz', value: '#0F766E' },
  { id: 'indigo', label: 'İndigo', value: '#4F46E5' },
  { id: 'slate', label: 'Arduvaz', value: '#475569' },
]

export const CURRENCY_SYMBOLS: Record<Settings['currency'], string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'TRY',
  theme: 'system',
  accentColor: '#1F6FEB',
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'market', name: 'Market', icon: 'shopping-basket', color: '#6B7280', type: 'expense' },
  { id: 'yemek', name: 'Yemek', icon: 'utensils', color: '#6B7280', type: 'expense' },
  { id: 'ulasim', name: 'Ulaşım', icon: 'bus', color: '#6B7280', type: 'expense' },
  { id: 'fatura', name: 'Fatura', icon: 'receipt', color: '#6B7280', type: 'expense' },
  { id: 'kira', name: 'Kira', icon: 'home', color: '#6B7280', type: 'expense' },
  { id: 'eglence', name: 'Eğlence', icon: 'film', color: '#6B7280', type: 'expense' },
  { id: 'saglik', name: 'Sağlık', icon: 'heart-pulse', color: '#6B7280', type: 'expense' },
  { id: 'giyim', name: 'Giyim', icon: 'shirt', color: '#6B7280', type: 'expense' },
  { id: 'maas', name: 'Maaş', icon: 'landmark', color: '#6B7280', type: 'income' },
  { id: 'serbest', name: 'Serbest Çalışma', icon: 'briefcase', color: '#6B7280', type: 'income' },
  { id: 'yatirim', name: 'Yatırım', icon: 'trending-up', color: '#6B7280', type: 'income' },
  { id: 'diger', name: 'Diğer', icon: 'tag', color: '#6B7280', type: 'both' },
]

/** Icons available when creating or renaming a category. */
export const CATEGORY_ICON_OPTIONS: { key: string; label: string }[] = [
  { key: 'shopping-basket', label: 'Alışveriş' },
  { key: 'utensils', label: 'Yemek' },
  { key: 'bus', label: 'Ulaşım' },
  { key: 'receipt', label: 'Fatura' },
  { key: 'home', label: 'Ev' },
  { key: 'film', label: 'Eğlence' },
  { key: 'heart-pulse', label: 'Sağlık' },
  { key: 'shirt', label: 'Giyim' },
  { key: 'landmark', label: 'Banka' },
  { key: 'briefcase', label: 'İş' },
  { key: 'trending-up', label: 'Yatırım' },
  { key: 'tag', label: 'Diğer' },
  { key: 'car', label: 'Araba' },
  { key: 'plane', label: 'Seyahat' },
  { key: 'book-open', label: 'Kitap' },
  { key: 'gift', label: 'Hediye' },
  { key: 'smartphone', label: 'Telefon' },
  { key: 'dumbbell', label: 'Spor' },
  { key: 'graduation-cap', label: 'Eğitim' },
  { key: 'coffee', label: 'Kahve' },
]

export const APP_VERSION = '1.0.0'

export function createDefaultData(): AppData {
  return {
    version: 1,
    transactions: [],
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    settings: { ...DEFAULT_SETTINGS },
  }
}

/* ------------------------------------------------------------------ */
/* Sample data (only added when the user asks from Settings)           */
/* ------------------------------------------------------------------ */

interface SampleSeed {
  daysAgo: number
  type: Transaction['type']
  amount: number
  categoryId: string
  note: string
}

const SAMPLE_SEEDS: SampleSeed[] = [
  { daysAgo: 1, type: 'expense', amount: 284.5, categoryId: 'market', note: 'Haftalık alışveriş' },
  { daysAgo: 1, type: 'expense', amount: 96, categoryId: 'yemek', note: 'Öğle yemeği' },
  { daysAgo: 2, type: 'expense', amount: 42.5, categoryId: 'ulasim', note: 'Metro kart dolumu' },
  { daysAgo: 3, type: 'income', amount: 42000, categoryId: 'maas', note: 'Aylık maaş' },
  { daysAgo: 4, type: 'expense', amount: 1250, categoryId: 'kira', note: 'Ev kirası' },
  { daysAgo: 5, type: 'expense', amount: 318.75, categoryId: 'fatura', note: 'Elektrik ve su' },
  { daysAgo: 7, type: 'expense', amount: 149.9, categoryId: 'eglence', note: 'Sinema bileti' },
  { daysAgo: 9, type: 'expense', amount: 620, categoryId: 'giyim', note: 'Kot pantolon ve gömlek' },
  { daysAgo: 12, type: 'income', amount: 6500, categoryId: 'serbest', note: 'Freelance proje' },
  { daysAgo: 14, type: 'expense', amount: 74.2, categoryId: 'saglik', note: 'Eczane' },
  { daysAgo: 18, type: 'expense', amount: 210.4, categoryId: 'market', note: 'Markette alışveriş' },
  { daysAgo: 21, type: 'expense', amount: 380, categoryId: 'yatirim', note: 'Fon alımı' },
  { daysAgo: 27, type: 'expense', amount: 132.6, categoryId: 'yemek', note: 'Akşam yemeği' },
  { daysAgo: 34, type: 'income', amount: 42000, categoryId: 'maas', note: 'Aylık maaş' },
  { daysAgo: 35, type: 'expense', amount: 1250, categoryId: 'kira', note: 'Ev kirası' },
  { daysAgo: 38, type: 'expense', amount: 265.3, categoryId: 'market', note: 'Haftalık alışveriş' },
  { daysAgo: 42, type: 'expense', amount: 88, categoryId: 'ulasim', note: 'Benzin' },
  { daysAgo: 47, type: 'expense', amount: 402.15, categoryId: 'fatura', note: 'İnternet faturası' },
  { daysAgo: 55, type: 'income', amount: 42000, categoryId: 'maas', note: 'Aylık maaş' },
  { daysAgo: 56, type: 'expense', amount: 1250, categoryId: 'kira', note: 'Ev kirası' },
  { daysAgo: 61, type: 'expense', amount: 175.8, categoryId: 'saglik', note: 'Doktor muayenesi' },
  { daysAgo: 66, type: 'expense', amount: 296.4, categoryId: 'market', note: 'Markette alışveriş' },
]

let sampleCounter = 0

export function createSampleTransactions(): Transaction[] {
  const now = new Date()
  return SAMPLE_SEEDS.map((seed) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - seed.daysAgo, 10, 30, 0)
    sampleCounter += 1
    return {
      id: `sample-${d.getTime()}-${sampleCounter}`,
      type: seed.type,
      amount: seed.amount,
      categoryId: seed.categoryId,
      note: seed.note,
      date: toLocalISODate(d),
      createdAt: d.toISOString(),
    }
  })
}

export function toLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
