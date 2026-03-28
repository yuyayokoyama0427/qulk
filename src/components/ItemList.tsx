import type { QRItem } from '../lib/generator'
import { getFreeLimit } from '../lib/license'

interface Props {
  items: QRItem[]
  isPro: boolean
  onClear: () => void
  onProClick: () => void
}

export function ItemList({ items, isPro, onClear, onProClick }: Props) {
  const limit = getFreeLimit()
  const visibleItems = isPro ? items : items.slice(0, limit)
  const hiddenCount = items.length - visibleItems.length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          読み込んだデータ
          <span className="ml-2 text-gray-400 font-normal">
            {isPro ? `${items.length}件` : `${visibleItems.length} / ${items.length}件`}
          </span>
        </h3>
        <button className="text-xs text-gray-400 hover:text-gray-600" onClick={onClear}>
          クリア
        </button>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {visibleItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400 w-6 text-right shrink-0">{i + 1}</span>
            <span className="font-medium text-gray-800 truncate w-36 shrink-0">{item.name}</span>
            <span className="text-xs text-gray-400 truncate">{item.url}</span>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 space-y-2">
          <p className="text-sm text-amber-700">🔒 残り{hiddenCount}件はPro版で生成できます</p>
          <button
            onClick={onProClick}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-1.5 rounded-lg transition-colors"
          >
            Pro版を購入する（1,980円）
          </button>
        </div>
      )}
    </div>
  )
}
