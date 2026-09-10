const RESERVED_RECORD_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

export function isReservedRecordKey(key: string): boolean {
  return RESERVED_RECORD_KEYS.has(key.toLowerCase())
}
