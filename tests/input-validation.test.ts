import { describe, expect, it } from 'vitest'
import { validateAndNormalizeInputs } from '../src/input-validation'

describe('validateAndNormalizeInputs', () => {
  it('normalizes names and descriptions via trim', () => {
    const result = validateAndNormalizeInputs([
      { name: ' LP ', description: ' Light punch ', color: '#ffffff' },
    ])

    expect(result.valid).toBe(true)
    expect(result.inputs).toEqual([{ name: 'LP', description: 'Light punch', color: '#ffffff' }])
  })

  it('rejects invalid characters', () => {
    const result = validateAndNormalizeInputs([{ name: 'LP+', description: '', color: '#ffffff' }])

    expect(result.valid).toBe(false)
    expect(result.message).toContain('letters, numbers, underscores, and hyphens')
  })

  it('rejects duplicates case-insensitively', () => {
    const result = validateAndNormalizeInputs([
      { name: 'lp', description: '', color: '#ffffff' },
      { name: 'LP', description: '', color: '#000000' },
    ])

    expect(result.valid).toBe(false)
    expect(result.message).toBe('Duplicate input name: LP')
  })
})
