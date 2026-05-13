import { describe, expect, it } from 'vitest'
import { colorPatterns, generateButtonMap, imageMap } from '../src/patterns'

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

  it('merges motion and button inputs for image conversion', () => {
    const map = imageMap(testProfile)

    const hasQcf = Array.from(map.keys()).some((regex) => regex.test('236'))
    const hasButtonA = Array.from(map.values()).some((config) => config.alt === 'A')

    expect(hasQcf).toBe(true)
    expect(hasButtonA).toBe(true)
  })

  it('creates color patterns that match notation tokens', () => {
    const map = colorPatterns(testProfile)
    const entries = Array.from(map.entries())

    const lpPattern = entries.find(([, input]) => input === 'LP')?.[0]
    expect(lpPattern).toBeTruthy()

    const sample = '2LP > 236K, A'
    lpPattern!.lastIndex = 0
    expect(lpPattern!.test(sample)).toBe(true)
  })

  it('matches bracketed inputs in color patterns', () => {
    const map = colorPatterns(testProfile)
    const aPattern = Array.from(map.entries()).find(([, input]) => input === 'A')?.[0]

    expect(aPattern).toBeTruthy()

    aPattern!.lastIndex = 0
    expect(aPattern!.test('[A]')).toBe(true)
  })

  it('matches a token even when followed by colon', () => {
    const map = colorPatterns(testProfile)
    const lpPattern = Array.from(map.entries()).find(([, input]) => input === 'LP')?.[0]

    expect(lpPattern).toBeTruthy()

    lpPattern!.lastIndex = 0
    expect(lpPattern!.test('LP:')).toBe(true)
  })
})
