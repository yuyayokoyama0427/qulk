import Papa from 'papaparse'
import Encoding from 'encoding-japanese'
import type { QRItem } from './generator'

export interface ParseResult {
  items: QRItem[]
  errors: string[]
}

function processRows(rows: Record<string, string>[]): { items: QRItem[]; errors: string[] } {
  const errors: string[] = []
  const items: QRItem[] = []

  const nameKeys = ['name', '名前', '名称', 'title', 'タイトル', '商品名']
  const urlKeys = ['url', 'URL', 'link', 'リンク', 'アドレス']

  if (rows.length === 0) {
    errors.push('CSVにデータがありません')
    return { items, errors }
  }

  const firstRow = rows[0]
  const headers = Object.keys(firstRow)

  const nameKey = headers.find(h => nameKeys.includes(h.trim())) ?? headers[0]
  const urlKey = headers.find(h => urlKeys.includes(h.trim())) ?? headers[1]

  if (!nameKey || !urlKey) {
    errors.push('CSVに「name」と「url」列が必要です')
    return { items, errors }
  }

  rows.forEach((row, i) => {
    const name = row[nameKey]?.trim()
    const url = row[urlKey]?.trim()

    if (!name) {
      errors.push(`${i + 2}行目：名前が空です`)
      return
    }
    if (!url || !url.startsWith('http')) {
      errors.push(`${i + 2}行目「${name}」：URLが無効です`)
      return
    }
    items.push({ name, url })
  })

  return { items, errors }
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      const uint8 = new Uint8Array(buffer)
      const detected = Encoding.detect(uint8)
      const encoding = detected === 'SJIS' ? 'Shift_JIS' : 'UTF-8'
      const text = new TextDecoder(encoding).decode(uint8)
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      })
      resolve(processRows(result.data))
    }
    reader.onerror = () => resolve({ items: [], errors: ['ファイルの読み込みに失敗しました'] })
    reader.readAsArrayBuffer(file)
  })
}

export function downloadSampleCSV() {
  const csv = `name,url
商品A,https://example.com/product-a
商品B,https://example.com/product-b
店舗メニュー,https://example.com/menu
Instagram,https://instagram.com/example
`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'qulk_sample.csv'
  a.click()
}
