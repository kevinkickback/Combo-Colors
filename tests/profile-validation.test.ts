import { describe, expect, it } from 'vitest'
import { normalizeProfileId, validateProfileId } from '../src/profile-validation'

describe('profile validation', () => {
  it('normalizes profile ids by trimming', () => {
    expect(normalizeProfileId('  cstm  ')).toBe('cstm')
  })

  it('rejects reserved profile ids', () => {
    const result = validateProfileId('__proto__')

    expect(result.valid).toBe(false)
    expect(result.message).toContain('reserved')
  })

  it('rejects invalid profile id characters', () => {
    const result = validateProfileId('bad id!')

    expect(result.valid).toBe(false)
    expect(result.message).toContain('letters, numbers, underscores, and hyphens')
  })

  it('accepts valid profile ids', () => {
    const result = validateProfileId('custom_1')

    expect(result.valid).toBe(true)
    expect(result.normalized).toBe('custom_1')
  })
})
