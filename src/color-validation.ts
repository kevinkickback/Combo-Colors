const HEX_COLOR_REGEX = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

export function isSafeCssColor(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const normalized = value.trim()
  if (!normalized) return false

  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    return CSS.supports('color', normalized)
  }

  return HEX_COLOR_REGEX.test(normalized)
}
