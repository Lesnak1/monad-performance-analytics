// Safe number formatting utilities to prevent toLocaleString() errors

export function safeToLocaleString(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return value.toLocaleString()
}

export function safeToFixed(value: number | undefined | null, digits: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return value.toFixed(digits)
}

export function formatNumber(value: number | undefined | null, format: 'locale' | 'fixed' = 'locale', digits: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  
  if (format === 'fixed') {
    return value.toFixed(digits)
  }
  
  return value.toLocaleString()
}

export function formatTPS(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return Math.round(value).toLocaleString()
}

export function formatGasPrice(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0'
  }
  return value.toFixed(1)
}

export function formatBlockNumber(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return value.toLocaleString()
} 