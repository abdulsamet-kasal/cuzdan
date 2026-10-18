/** Core data model for Cüzdan. */

export type TransactionType = 'income' | 'expense'

export type CategoryType = 'income' | 'expense' | 'both'

export type CurrencyCode = 'TRY' | 'USD' | 'EUR'

export type ThemeMode = 'system' | 'light' | 'dark'

export interface Transaction {
  id: string
  type: TransactionType
  /** Amount in major units, rounded to 2 decimals. Always positive. */
  amount: number
  categoryId: string
  note: string
  /** ISO date string (YYYY-MM-DD or full ISO). */
  date: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  /** Key of a lucide-react icon in the icon registry. */
  icon: string
  color: string
  type: CategoryType
}

export interface Settings {
  currency: CurrencyCode
  theme: ThemeMode
  accentColor: string
}

export interface AppData {
  version: 1
  transactions: Transaction[]
  categories: Category[]
  settings: Settings
}
