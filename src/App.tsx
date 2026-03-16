import { useState } from 'react'
import './index.css'
import { CSVUploader } from './components/CSVUploader'
import { QRSettingsPanel } from './components/QRSettings'
import { ItemList } from './components/ItemList'
import { bulkGenerateZip, DEFAULT_SETTINGS, type QRItem, type QRSettings } from './lib/generator'
import { isProFromStorage, validateLicense, getFreeLimit } from './lib/license'

export default function App() {
  const [items, setItems] = useState<QRItem[]>([])
  const [settings, setSettings] = useState<QRSettings>(DEFAULT_SETTINGS)
  const [isPro, setIsPro] = useState(isProFromStorage)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [showLicenseInput, setShowLicenseInput] = useState(false)
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseError, setLicenseError] = useState<string | null>(null)
  const [licenseLoading, setLicenseLoading] = useState(false)

  const targetItems = isPro ? items : items.slice(0, getFreeLimit())

  async function handleGenerate() {
    if (targetItems.length === 0) return
    setProgress({ done: 0, total: targetItems.length })
    const blob = await bulkGenerateZip(targetItems, settings, (done, total) => {
      setProgress({ done, total })
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `qulk_${Date.now()}.zip`
    a.click()
    setProgress(null)
  }

  async function handleActivate() {
    setLicenseLoading(true)
    setLicenseError(null)
    const ok = await validateLicense(licenseKey)
    if (ok) {
      setIsPro(true)
      setShowLicenseInput(false)
    } else {
      setLicenseError('ライセンスキーが無効です')
    }
    setLicenseLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">Qulk</span>
            <span className="text-xs text-gray-400">QRコード一括生成</span>
          </div>
          <div className="flex items-center gap-2">
            {isPro ? (
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                ✨ Pro
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="https://yomiyasu.lemonsqueezy.com/checkout/buy/9249d747-f788-4aaf-b672-3f157b96021c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-full transition"
                >
                  Pro版を購入（1,980円）
                </a>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setShowLicenseInput(v => !v)}
                >
                  キー認証
                </button>
              </div>
            )}
          </div>
        </div>
        {showLicenseInput && (
          <div className="bg-blue-50 border-t border-blue-100 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="ライセンスキーを入力"
                value={licenseKey}
                onChange={e => setLicenseKey(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg disabled:opacity-50"
                onClick={handleActivate}
                disabled={licenseLoading || licenseKey.trim().length === 0}
              >
                {licenseLoading ? '確認中...' : '有効化'}
              </button>
            </div>
            {licenseError && <p className="text-xs text-red-500 mt-1 max-w-4xl mx-auto">{licenseError}</p>}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {items.length === 0 && (
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">CSVからQRコードを一括生成</h1>
            <p className="text-sm text-gray-500">URLリストをCSVでアップロード → ZIPでまとめてダウンロード</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">① CSVをアップロード</h3>
          <CSVUploader onParsed={setItems} />
        </div>

        {items.length > 0 && (
          <>
            <ItemList items={items} isPro={isPro} onClear={() => setItems([])} />
            <QRSettingsPanel settings={settings} onChange={setSettings} isPro={isPro} />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">③ 一括生成</h3>
                <span className="text-xs text-gray-400">{targetItems.length}個のQRコードを生成</span>
              </div>
              {progress ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>生成中...</span>
                    <span>{progress.done} / {progress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition text-sm"
                  onClick={handleGenerate}
                >
                  ZIPで一括ダウンロード
                </button>
              )}
            </div>
          </>
        )}

        {items.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '📋', title: 'CSVで一括入力', desc: 'name・urlの2列だけでOK' },
              { icon: '🎨', title: 'カラー・サイズ自由', desc: 'ロゴ挿入もPro版で対応' },
              { icon: '📦', title: 'ZIPでまとめてDL', desc: '100件でも一発ダウンロード' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{f.title}</div>
                <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        © 2026 Qulk · 無料：最大{getFreeLimit()}件 / Pro版：無制限
      </footer>
    </div>
  )
}
