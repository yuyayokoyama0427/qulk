import { useRef, useState } from 'react'
import { parseCSV, downloadSampleCSV } from '../lib/csv'
import type { QRItem } from '../lib/generator'

interface Props {
  onParsed: (items: QRItem[]) => void
}

export function CSVUploader({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  async function handleFile(file: File) {
    const result = await parseCSV(file)
    setErrors(result.errors)
    if (result.items.length > 0) onParsed(result.items)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="text-4xl mb-3">📄</div>
        <div className="text-sm font-medium text-gray-700">CSVファイルをドロップ または クリックして選択</div>
        <div className="text-xs text-gray-400 mt-1">UTF-8・Shift_JIS（Excel）自動対応</div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      <button
        className="text-xs text-blue-500 hover:underline"
        onClick={downloadSampleCSV}
      >
        サンプルCSVをダウンロード
      </button>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
          {errors.map((e, i) => (
            <div key={i} className="text-xs text-red-600">⚠️ {e}</div>
          ))}
        </div>
      )}
    </div>
  )
}
