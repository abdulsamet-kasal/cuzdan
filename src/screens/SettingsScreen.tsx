import { useRef, useState, type ChangeEvent } from 'react'
import { SettingsList, type SettingsSection } from '../components/SettingsList'
import { Sheet } from '../components/Sheet'
import { ConfirmDialog, InfoDialog } from '../components/ConfirmDialog'
import {
  ACCENT_OPTIONS,
  APP_VERSION,
  CATEGORY_ICON_OPTIONS,
  createDefaultData,
  createSampleTransactions,
} from '../data/defaults'
import { useSettings } from '../hooks/useSettings'
import { useCategories } from '../hooks/useCategories'
import { useAppData, sanitizeAppData } from '../hooks/useAppData'
import { Check, Download, Plus, Trash2, Upload, ArrowDown, ArrowUp, getCategoryIcon } from '../utils/icons'
import type { ThemeMode, CurrencyCode } from '../types'

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Açık' },
  { value: 'dark', label: 'Koyu' },
]

const CURRENCY_OPTIONS: { value: CurrencyCode; label: string; description: string }[] = [
  { value: 'TRY', label: 'TRY', description: 'Türk lirası — varsayılan' },
  { value: 'USD', label: 'USD', description: 'ABD doları' },
  { value: 'EUR', label: 'EUR', description: 'Euro' },
]

export function SettingsScreen() {
  const { settings, updateSettings } = useSettings()
  const { categories, addCategory, updateCategory, moveCategory } = useCategories()
  const { data, setData } = useAppData()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftIcon, setDraftIcon] = useState('tag')

  const [confirm, setConfirm] = useState<null | 'clear' | 'sample' | 'category'>(null)
  const [info, setInfo] = useState<{ title: string; description: string } | null>(null)

  /* ------------------------------ categories ------------------------------ */

  const openNewCategory = () => {
    setEditingCategoryId(null)
    setDraftName('')
    setDraftIcon('tag')
    setCategorySheetOpen(true)
  }

  const openEditCategory = (id: string) => {
    const category = categories.find((c) => c.id === id)
    if (!category) return
    setEditingCategoryId(id)
    setDraftName(category.name)
    setDraftIcon(category.icon)
    setCategorySheetOpen(true)
  }

  const saveCategory = () => {
    const name = draftName.trim()
    if (!name) return
    if (editingCategoryId) {
      updateCategory(editingCategoryId, { name, icon: draftIcon })
    } else {
      addCategory({ name, icon: draftIcon, color: '#6B7280', type: 'both' })
    }
    setCategorySheetOpen(false)
  }

  const performCategoryDelete = () => {
    if (!editingCategoryId) return
    const fallback = categories.find((c) => c.id !== editingCategoryId && c.type !== 'income')?.id
    setData((previous) => ({
      ...previous,
      categories: previous.categories.filter((c) => c.id !== editingCategoryId),
      transactions: previous.transactions.map((t) =>
        t.categoryId === editingCategoryId && fallback ? { ...t, categoryId: fallback } : t,
      ),
    }))
    setConfirm(null)
    setCategorySheetOpen(false)
  }

  /* --------------------------------- data --------------------------------- */

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `cuzdan-yedek-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch {
      setInfo({
        title: 'Dışa aktarma başarısız',
        description: 'Dosya oluşturulamadı. Cihazınızın depolama izinlerini kontrol edin.',
      })
    }
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      const record = parsed as Record<string, unknown> | null
      if (!record || typeof record !== 'object' || !Array.isArray(record.transactions) || !Array.isArray(record.categories)) {
        throw new Error('invalid')
      }
      const imported = sanitizeAppData(parsed)
      setData(() => imported)
      setInfo({
        title: 'Veriler içe aktarıldı',
        description: `${imported.transactions.length} işlem ve ${imported.categories.length} kategori yüklendi.`,
      })
    } catch {
      setInfo({
        title: 'Dosya okunamadı',
        description: 'Geçerli bir Cüzdan yedeği (JSON) dosyası seçtiğinizden emin olun.',
      })
    } finally {
      input.value = ''
    }
  }

  const performClearAll = () => {
    setData(() => createDefaultData())
    setConfirm(null)
  }

  const performAddSamples = () => {
    const samples = createSampleTransactions()
    setData((previous) => ({ ...previous, transactions: [...previous.transactions, ...samples] }))
    setConfirm(null)
  }

  /* -------------------------------- sections ------------------------------- */

  const categoryRows = categories.map((category, index) => {
    const Icon = getCategoryIcon(category.icon)
    return {
      id: category.id,
      label: category.name,
      icon: <Icon size={20} strokeWidth={1.75} />,
      showChevron: true,
      onClick: () => openEditCategory(category.id),
      controls: (
        <>
          <button
            type="button"
            className="icon-btn"
            aria-label={`${category.name} yukarı taşı`}
            disabled={index === 0}
            onClick={() => moveCategory(category.id, -1)}
          >
            <ArrowUp size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`${category.name} aşağı taşı`}
            disabled={index === categories.length - 1}
            onClick={() => moveCategory(category.id, 1)}
          >
            <ArrowDown size={18} strokeWidth={1.75} />
          </button>
        </>
      ),
    }
  })

  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      title: 'Görünüm',
      rows: THEME_OPTIONS.map((option) => ({
        id: option.value,
        label: option.label,
        trailing:
          settings.theme === option.value ? <Check size={20} strokeWidth={1.75} /> : undefined,
        onClick: () => updateSettings({ theme: option.value }),
      })),
      custom: (
        <div className="swatch-row" role="group" aria-label="Vurgu rengi">
          {ACCENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="swatch"
              aria-pressed={settings.accentColor === option.value}
              aria-label={option.label}
              onClick={() => updateSettings({ accentColor: option.value })}
            >
              <span className="swatch-dot" style={{ background: option.value }} />
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'currency',
      title: 'Para Birimi',
      rows: CURRENCY_OPTIONS.map((option) => ({
        id: option.value,
        label: option.label,
        description: option.description,
        trailing:
          settings.currency === option.value ? <Check size={20} strokeWidth={1.75} /> : undefined,
        onClick: () => updateSettings({ currency: option.value }),
      })),
    },
    {
      id: 'categories',
      title: 'Kategoriler',
      rows: [
        ...categoryRows,
        {
          id: 'add-category',
          label: 'Kategori ekle',
          icon: <Plus size={20} strokeWidth={1.75} />,
          onClick: openNewCategory,
        },
      ],
    },
    {
      id: 'data',
      title: 'Veri',
      rows: [
        {
          id: 'export',
          label: 'Verileri dışa aktar',
          description: 'JSON dosyası olarak indir',
          icon: <Download size={20} strokeWidth={1.75} />,
          onClick: handleExport,
        },
        {
          id: 'import',
          label: 'Verileri içe aktar',
          description: 'JSON yedeği seç',
          icon: <Upload size={20} strokeWidth={1.75} />,
          onClick: () => fileInputRef.current?.click(),
        },
        {
          id: 'samples',
          label: 'Örnek verileri ekle',
          description: 'Hazır örnek işlemler eklenir',
          icon: <Plus size={20} strokeWidth={1.75} />,
          onClick: () => setConfirm('sample'),
        },
        {
          id: 'clear',
          label: 'Tüm verileri sil',
          description: 'Geri alınamaz',
          icon: <Trash2 size={20} strokeWidth={1.75} />,
          danger: true,
          onClick: () => setConfirm('clear'),
        },
      ],
    },
    {
      id: 'about',
      title: 'Hakkında',
      rows: [
        {
          id: 'version',
          label: 'Sürüm',
          trailing: <span className="secondary num">{APP_VERSION}</span>,
        },
      ],
      custom: (
        <p className="about-text">
          Cüzdan; gelir ve giderlerinizi yalnızca bu cihazda saklayan, hesaplamaları yerel olarak
          yapan bir kişisel finans uygulamasıdır.
        </p>
      ),
    },
  ]

  return (
    <>
      <header className="screen-header">
        <h1 className="screen-title">Ayarlar</h1>
      </header>

      <div className="screen-scroll">
        <SettingsList sections={sections} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleImportFile}
      />

      <Sheet
        open={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        title={editingCategoryId ? 'Kategoriyi düzenle' : 'Yeni kategori'}
        footer={
          <button
            type="button"
            className="btn btn-primary"
            disabled={draftName.trim().length === 0}
            onClick={saveCategory}
          >
            Kaydet
          </button>
        }
      >
        <label className="section-label mb-8" htmlFor="category-name">
          Kategori adı
        </label>
        <input
          id="category-name"
          type="text"
          className="input"
          value={draftName}
          maxLength={40}
          placeholder="Kategori adı"
          onChange={(event) => setDraftName(event.target.value)}
        />

        <div className="section-label mt-24 mb-8">Simge</div>
        <div className="cat-grid" role="group" aria-label="Simge seçimi">
          {CATEGORY_ICON_OPTIONS.map((option) => {
            const Icon = getCategoryIcon(option.key)
            return (
              <button
                key={option.key}
                type="button"
                className="cat-tile"
                aria-pressed={draftIcon === option.key}
                aria-label={option.label}
                onClick={() => setDraftIcon(option.key)}
              >
                <Icon size={20} strokeWidth={1.75} />
                <span className="cat-tile-label">{option.label}</span>
              </button>
            )
          })}
        </div>

        {editingCategoryId ? (
          <button
            type="button"
            className="btn btn-danger-outline mt-24"
            onClick={() => setConfirm('category')}
          >
            Kategoriyi sil
          </button>
        ) : null}
      </Sheet>

      <ConfirmDialog
        open={confirm === 'clear'}
        title="Tüm verileri sil"
        description="Tüm işlemler, kategoriler ve ayarlarınız bu cihazdan kalıcı olarak silinecek. Bu işlem geri alınamaz."
        confirmLabel="Sil"
        onConfirm={performClearAll}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === 'sample'}
        title="Örnek verileri ekle"
        description="Mevcut kayıtlarınızın altına örnek işlemler eklenebilir."
        confirmLabel="Ekle"
        destructive={false}
        onConfirm={performAddSamples}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === 'category'}
        title="Kategoriyi sil"
        description="Bu kategori silinecek. Kategoriye bağlı işlemler 'Diğer' kategorisine taşınır."
        confirmLabel="Sil"
        onConfirm={performCategoryDelete}
        onCancel={() => setConfirm(null)}
      />

      <InfoDialog
        open={info !== null}
        title={info?.title ?? ''}
        description={info?.description ?? ''}
        onConfirm={() => setInfo(null)}
      />
    </>
  )
}
