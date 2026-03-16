import QRCode from 'qrcode'
import JSZip from 'jszip'

export interface QRItem {
  name: string
  url: string
}

export interface QRSettings {
  size: number
  color: string
  background: string
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  logo?: string // base64
}

export const DEFAULT_SETTINGS: QRSettings = {
  size: 300,
  color: '#000000',
  background: '#ffffff',
  errorCorrection: 'M',
}

export async function generateQRDataURL(
  url: string,
  settings: QRSettings
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: settings.size,
    color: {
      dark: settings.color,
      light: settings.background,
    },
    errorCorrectionLevel: settings.errorCorrection,
    margin: 2,
  })
}

export async function generateQRWithLogo(
  url: string,
  settings: QRSettings
): Promise<string> {
  const qrDataURL = await generateQRDataURL(url, settings)
  if (!settings.logo) return qrDataURL

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = settings.size
    canvas.height = settings.size
    const ctx = canvas.getContext('2d')!

    const qrImg = new Image()
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, settings.size, settings.size)

      const logoImg = new Image()
      logoImg.onload = () => {
        const logoSize = settings.size * 0.22
        const logoX = (settings.size - logoSize) / 2
        const logoY = (settings.size - logoSize) / 2

        // 白背景パッド
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8)
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        resolve(canvas.toDataURL('image/png'))
      }
      logoImg.src = settings.logo!
    }
    qrImg.src = qrDataURL
  })
}

export async function bulkGenerateZip(
  items: QRItem[],
  settings: QRSettings,
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const dataURL = await generateQRWithLogo(item.url, settings)
    const base64 = dataURL.split(',')[1]
    const filename = `${String(i + 1).padStart(3, '0')}_${item.name.replace(/[/\\?%*:|"<>]/g, '_')}.png`
    zip.file(filename, base64, { base64: true })
    onProgress?.(i + 1, items.length)
  }

  return zip.generateAsync({ type: 'blob' })
}
