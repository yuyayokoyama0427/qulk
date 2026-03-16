const STORAGE_KEY = 'qulk_license'
const FREE_LIMIT = 5

export function getFreeLimit(): number {
  return FREE_LIMIT
}

export function isProFromStorage(): boolean {
  return !!localStorage.getItem(STORAGE_KEY)
}

export async function validateLicense(key: string): Promise<boolean> {
  try {
    const res = await fetch('/api/validate-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key }),
    })
    const data = await res.json() as { valid: boolean }
    if (data.valid) {
      localStorage.setItem(STORAGE_KEY, key)
      return true
    }
    return false
  } catch {
    return false
  }
}

export function clearLicense(): void {
  localStorage.removeItem(STORAGE_KEY)
}
