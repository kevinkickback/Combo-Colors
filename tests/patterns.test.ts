import { describe, expect, it } from 'vitest'
import {
  canonicalMotionMap,
  generateButtonMap,
  getMissingCanonicalMotionConfigs,
} from '../src/patterns'

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

    const lpEntry = map.get('LP')
    expect(lpEntry).toBeTruthy()
    expect(lpEntry?.alt).toBe('LP')
    expect(lpEntry?.class).toBe('buttonIcon')
  })

  it('creates canonical motion lookup for parser tokens', () => {
    const map = canonicalMotionMap()

    expect(map.get('qcf')?.alt).toBe('QCF')
    expect(map.get('qcb')?.alt).toBe('QCB')
    expect(map.get('dp')?.alt).toBe('DP')
    expect(map.get('neutral')?.alt).toBe('')
  })

  it('covers all canonical schema values with motion configs', () => {
    expect(getMissingCanonicalMotionConfigs()).toEqual([])
  })
})
