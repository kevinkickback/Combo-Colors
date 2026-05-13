import { describe, expect, it } from 'vitest'
import { canonicalMotionMap, generateButtonMap } from '../src/patterns'

const testProfile = {
  name: 'Test Profile',
  desc: {
    A: 'Light attack',
    LP: 'Light punch',
    K: 'Kick',
  },
  colors: {
    A: '#ffffff',
    LP: '#eeeeee',
    K: '#dddddd',
  },
}

describe('patterns', () => {
  it('creates a button map for each configured input', () => {
    const map = generateButtonMap(testProfile)

    expect(map.size).toBe(Object.keys(testProfile.colors).length)

    const entries = Array.from(map.entries())
    const lpEntry = entries.find(([, config]) => config.alt === 'LP')
    expect(lpEntry).toBeTruthy()
    expect(lpEntry?.[0].test('LP')).toBe(true)
    expect(lpEntry?.[0].test('LP:')).toBe(false)
  })

  it('creates canonical motion lookup for parser tokens', () => {
    const map = canonicalMotionMap()

    expect(map.get('qcf')?.alt).toBe('QCF')
    expect(map.get('qcb')?.alt).toBe('QCB')
    expect(map.get('dp')?.alt).toBe('DP')
    expect(map.get('neutral')?.alt).toBe('')
  })
})
