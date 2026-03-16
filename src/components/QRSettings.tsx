import { useRef } from 'react'
import type { QRSettings } from '../lib/generator'

interface Props {
  settings: QRSettings
  onChange: (s: QRSettings) => void
  isPro: boolean
}

export function QRSettingsPanel({ settings, onChange, isPro }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ ...settings, logo: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">QR設定</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">サイズ（px）</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={settings.size}
            onChange={e => onChange({ ...settings, size: Number(e.target.value) })}
          >
            <option value={200}>200px（小）</option>
            <option value={300}>300px（標準）</option>
            <option value={500}>500px（大）</option>
            <option value={1000}>1000px（印刷用）</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">誤り訂正レベル</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={settings.errorCorrection}
            onChange={e => onChange({ ...settings, errorCorrection: e.target.value as QRSettings['errorCorrection'] })}
          >
            <option value="L">L（低・小さめ）</option>
            <option value="M">M（標準）</option>
            <option value="Q">Q（高）</option>
            <option value="H">H（最高・ロゴ向き）</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">QRカラー</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.color}
              onChange={e => onChange({ ...settings, color: e.target.value })}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-mono">{settings.color}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">背景カラー</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.background}
              onChange={e => onChange({ ...settings, background: e.target.value })}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-mono">{settings.background}</span>
          </div>
        </div>
      </div>

      {/* ロゴアップロード */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs text-gray-500">ロゴ画像（中央に配置）</label>
          {!isPro && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Pro</span>
          )}
        </div>
        {isPro ? (
          <div className="flex items-center gap-3">
            <button
              className="text-xs border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg"
              onClick={() => logoRef.current?.click()}
            >
              {settings.logo ? '変更' : '画像を選択'}
            </button>
            {settings.logo && (
              <>
                <img src={settings.logo} className="w-8 h-8 object-contain border rounded" alt="logo" />
                <button
                  className="text-xs text-red-400 hover:text-red-600"
                  onClick={() => onChange({ ...settings, logo: undefined })}
                >
                  削除
                </button>
              </>
            )}
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
        ) : (
          <div className="text-xs text-gray-400">Pro版で利用できます</div>
        )}
      </div>
    </div>
  )
}
