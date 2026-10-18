import { Delete } from '../utils/icons'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'] as const

interface NumericKeypadProps {
  onKey: (key: string) => void
}

/** Flat keypad with hairline separators — no shadows, no scaling on press. */
export function NumericKeypad({ onKey }: NumericKeypadProps) {
  return (
    <div className="keypad" role="group" aria-label="Sayısal tuş takımı">
      {KEYS.map((key) =>
        key === 'backspace' ? (
          <button
            key="backspace"
            type="button"
            className="key"
            aria-label="Son basamağı sil"
            onClick={() => onKey('backspace')}
          >
            <Delete size={22} strokeWidth={1.75} />
          </button>
        ) : (
          <button
            key={key}
            type="button"
            className="key"
            aria-label={key === ',' ? 'Ondalık ayracı' : key}
            onClick={() => onKey(key)}
          >
            {key}
          </button>
        ),
      )}
    </div>
  )
}
