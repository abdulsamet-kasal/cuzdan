import type { Category } from '../types'
import { getCategoryIcon } from '../utils/icons'

interface CategoryGridProps {
  categories: Category[]
  value: string | null
  onChange: (categoryId: string) => void
  ariaLabel?: string
}

/** 4-column grid of square tiles. Selection is shown with an accent border, never with scaling. */
export function CategoryGrid({ categories, value, onChange, ariaLabel }: CategoryGridProps) {
  return (
    <div className="cat-grid" role="group" aria-label={ariaLabel ?? 'Kategori seçimi'}>
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon)
        const selected = value === category.id
        return (
          <button
            key={category.id}
            type="button"
            className="cat-tile"
            aria-pressed={selected}
            aria-label={category.name}
            onClick={() => onChange(category.id)}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="cat-tile-label">{category.name}</span>
          </button>
        )
      })}
    </div>
  )
}
