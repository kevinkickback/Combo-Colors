const PROFILE_ID_REGEX = /^[A-Za-z0-9_-]{1,32}$/

const RESERVED_PROFILE_IDS = new Set(['__proto__', 'prototype', 'constructor'])

export interface ProfileIdValidationResult {
  valid: boolean
  normalized: string
  message?: string
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

  if (RESERVED_PROFILE_IDS.has(normalized.toLowerCase())) {
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
