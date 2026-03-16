import Papa from 'papaparse'
import type { QRItem } from './generator'

export interface ParseResult {
  items: QRItem[]
  errors: string[]
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = []
        const items: QRItem[] = []

        const rows = results.data as Record<string, string>[]

        // カラム名の自動検出（name/url or 名前/URL など）
        const nameKeys = ['name', '名前', '名称', 'title', 'タイトル', '商品名']
        const urlKeys = ['url', 'URL', 'link', 'リンク', 'アドレス']

        if (rows.length === 0) {
          errors.push('CSVにデータがありません')
          resolve({ items, errors })
          return
        }

        const firstRow = rows[0]
        const headers = Object.keys(firstRow)

        const nameKey = headers.find(h => nameKeys.includes(h.trim())) ?? headers[0]
        const urlKey = headers.find(h => urlKeys.includes(h.trim())) ?? headers[1]

        if (!nameKey || !urlKey) {
          errors.push('CSVに「name」と「url」列が必要です')
          resolve({ items, errors })
          return
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

        resolve({ items, errors })
      },
      error: (err) => {
        resolve({ items: [], errors: [err.message] })
      },
    })
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
