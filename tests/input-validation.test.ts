import { describe, expect, it } from 'vitest'
import { validateAndNormalizeInputs } from '../src/validation'

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

  it.each(['__proto__', 'prototype', 'constructor'])('rejects reserved record key %s', (name) => {
    const result = validateAndNormalizeInputs([{ name, description: '', color: '#ffffff' }])

    expect(result.valid).toBe(false)
    expect(result.message).toBe(`Reserved input name: ${name}`)
  })

  it('rejects input names longer than 32 characters', () => {
    const result = validateAndNormalizeInputs([
      { name: 'A'.repeat(33), description: '', color: '#ffffff' },
    ])

    expect(result.valid).toBe(false)
    expect(result.message).toContain('32 characters')
  })
})
