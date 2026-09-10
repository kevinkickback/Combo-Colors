const HEX_COLOR_REGEX = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
const INPUT_NAME_REGEX = /^[A-Za-z0-9_-]+$/
const MAX_INPUT_NAME_LENGTH = 32
const PROFILE_ID_REGEX = /^[A-Za-z0-9_-]{1,32}$/
const RESERVED_RECORD_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

export interface InputConfig {
  name: string
  description: string
  color: string
}

export interface InputValidationResult {
  valid: boolean
  message?: string
  inputs: InputConfig[]
}

export interface ProfileIdValidationResult {
  valid: boolean
  normalized: string
  message?: string
}

export function isReservedRecordKey(key: string): boolean {
  return RESERVED_RECORD_KEYS.has(key.toLowerCase())
}

export function isSafeCssColor(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const normalized = value.trim()
  if (!normalized) return false

  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    return CSS.supports('color', normalized)
  }

  return HEX_COLOR_REGEX.test(normalized)
}

export function normalizeInputName(name: string): string {
  return name.trim()
}

export function validateAndNormalizeInputs(inputs: InputConfig[]): InputValidationResult {
  const seenNames = new Set<string>()
  const normalizedInputs: InputConfig[] = []

  for (const input of inputs) {
    const normalizedName = normalizeInputName(input.name)
    const normalizedDescription = input.description.trim()

    if (!normalizedName) {
      return {
        valid: false,
        message: 'Input names cannot be empty.',
        inputs: normalizedInputs,
      }
    }

    if (!INPUT_NAME_REGEX.test(normalizedName)) {
      return {
        valid: false,
        message: 'Input names can only use letters, numbers, underscores, and hyphens.',
        inputs: normalizedInputs,
      }
    }

    if (normalizedName.length > MAX_INPUT_NAME_LENGTH) {
      return {
        valid: false,
        message: `Input names cannot exceed ${MAX_INPUT_NAME_LENGTH} characters.`,
        inputs: normalizedInputs,
      }
    }

    if (isReservedRecordKey(normalizedName)) {
      return {
        valid: false,
        message: `Reserved input name: ${normalizedName}`,
        inputs: normalizedInputs,
      }
    }

    const duplicateKey = normalizedName.toLowerCase()
    if (seenNames.has(duplicateKey)) {
      return {
        valid: false,
        message: `Duplicate input name: ${normalizedName}`,
        inputs: normalizedInputs,
      }
    }
    seenNames.add(duplicateKey)

    normalizedInputs.push({
      name: normalizedName,
      description: normalizedDescription,
      color: input.color,
    })
  }

  return {
    valid: true,
    inputs: normalizedInputs,
  }
}

export function normalizeProfileId(profileId: string): string {
  return profileId.trim()
}

export function validateProfileId(profileId: string): ProfileIdValidationResult {
  const normalized = normalizeProfileId(profileId)

  if (!normalized) {
    return {
      valid: false,
      normalized,
      message: 'Profile ID cannot be empty.',
    }
  }

  if (!PROFILE_ID_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      message: 'Profile ID can only use letters, numbers, underscores, and hyphens (max 32 chars).',
    }
  }

  if (isReservedRecordKey(normalized)) {
    return {
      valid: false,
      normalized,
      message: 'This Profile ID is reserved and cannot be used.',
    }
  }

  return {
    valid: true,
    normalized,
  }
}
