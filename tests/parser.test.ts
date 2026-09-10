import { describe, expect, it } from 'vitest'
import { parseNotation } from '../src/parser'

describe('parseNotation', () => {
  it('parses basic numpad and alias directions', () => {
    const tokens = parseNotation('2, df > 6')

    // Spaces are now emitted as separators to preserve formatting
    expect(tokens.length).toBe(8)
    expect(tokens[0]).toEqual({ type: 'direction', value: 'down', rawValue: '2' })
    expect(tokens[1]).toEqual({ type: 'separator', value: ',', rawValue: ',' })
    // tokens[2] is space
    expect(tokens[3]).toEqual({ type: 'direction', value: 'down-forward', rawValue: 'df' })
    // tokens[4] is space
    expect(tokens[5]).toEqual({ type: 'separator', value: '>', rawValue: '>' })
    // tokens[6] is space
    expect(tokens[7]).toEqual({ type: 'direction', value: 'forward', rawValue: '6' })
  })

  it('parses common motions before single directions', () => {
    const tokens = parseNotation('236 > qcf, 623')

    // Spaces are now emitted as separators: 236, space, >, space, qcf, comma, space, 623
    expect(tokens.length).toBe(8)
    expect(tokens).toEqual([
      { type: 'motion', value: 'qcf', rawValue: '236' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'separator', value: '>', rawValue: '>' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'motion', value: 'qcf', rawValue: 'qcf' },
      { type: 'separator', value: ',', rawValue: ',' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'motion', value: 'dp', rawValue: '623' },
    ])
  })

  it('parses expanded numeric motions before directions and configured buttons', () => {
    const inputs = ['A']
    const cases = [
      ['360A', 'full-circle'],
      ['720A', 'double-circle'],
      ['1080A', 'triple-circle'],
      ['2369A', 'tiger-knee'],
      ['28A', 'down-up'],
      ['82A', 'up-down'],
      ['46A', 'back-forward'],
      ['64A', 'forward-back'],
      ['426A', 'back-down-forward'],
      ['624A', 'forward-down-back'],
      ['632A', 'forward-down-forward'],
    ] as const

    for (const [notation, canonical] of cases) {
      const tokens = parseNotation(notation, { buttonInputs: inputs })
      expect(tokens).toEqual([
        { type: 'motion', value: canonical, rawValue: notation.slice(0, -1) },
        { type: 'button', value: 'A', rawValue: 'A' },
      ])
    }
  })

  it('parses common shorthand motion aliases without an option', () => {
    const aliases = [
      ['spd', 'full-circle'],
      ['tk', 'tiger-knee'],
      ['srk', 'dp'],
      ['shoryuken', 'dp'],
      ['ff', 'dash-forward'],
      ['bb', 'dash-back'],
      ['backdash', 'dash-back'],
      ['qcfqcf', 'double-qcf'],
      ['qcbqcb', 'double-qcb'],
    ] as const

    for (const [alias, canonical] of aliases) {
      expect(parseNotation(alias)).toEqual([{ type: 'motion', value: canonical, rawValue: alias }])
    }
  })

  it('does not parse removed prose phrases or aliases inside ordinary words', () => {
    const tokens = parseNotation(
      'double quarter circle forward, tiger knee, full circle, staffing, scrapbook',
    )

    expect(tokens.some((token) => token.type === 'motion')).toBe(false)
  })

  it('parses buttons from custom profile inputs', () => {
    const tokens = parseNotation('2LP + [A] > K', {
      buttonInputs: ['LP', 'A', 'K'],
    })

    // Spaces are now emitted as separators
    expect(tokens.length).toBe(10)
    expect(tokens).toEqual([
      { type: 'direction', value: 'down', rawValue: '2' },
      { type: 'button', value: 'LP', rawValue: 'LP' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'joiner', value: '+', rawValue: '+' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'button', value: 'A', rawValue: '[A]', held: true },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'separator', value: '>', rawValue: '>' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'button', value: 'K', rawValue: 'K' },
    ])
  })

  it('parses single-letter down alias with bracketed button (d.[HP])', () => {
    const tokens = parseNotation('d.[HP]', {
      buttonInputs: ['HP'],
    })

    expect(tokens).toEqual([
      { type: 'direction', value: 'down', rawValue: 'd' },
      { type: 'joiner', value: '.', rawValue: '.' },
      { type: 'button', value: 'HP', rawValue: '[HP]', held: true },
    ])
  })

  it('parses bracketed directions as held inputs while preserving button priority', () => {
    const tokens = parseNotation('[2] [df] [B]', {
      buttonInputs: ['B'],
    })

    expect(tokens).toEqual([
      { type: 'direction', value: 'down', rawValue: '[2]', held: true },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'direction', value: 'down-forward', rawValue: '[df]', held: true },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'button', value: 'B', rawValue: '[B]', held: true },
    ])
  })

  it('parses numeric motion before joiner dot (236.LP)', () => {
    const tokens = parseNotation('236.LP', {
      buttonInputs: ['LP'],
    })

    expect(tokens).toEqual([
      { type: 'motion', value: 'qcf', rawValue: '236' },
      { type: 'joiner', value: '.', rawValue: '.' },
      { type: 'button', value: 'LP', rawValue: 'LP' },
    ])
  })

  it('does not match single-letter buttons inside words', () => {
    const tokens = parseNotation('word A', {
      buttonInputs: ['A'],
    })

    // Space is now a separator token
    expect(tokens.length).toBeGreaterThanOrEqual(5)
    expect(tokens[0]).toEqual({ type: 'unknown', value: 'w', rawValue: 'w' })
  })

  it('parses separators and falls back to unknown tokens', () => {
    const tokens = parseNotation('236@LP', {
      buttonInputs: ['LP'],
    })

    expect(tokens).toEqual([
      { type: 'motion', value: 'qcf', rawValue: '236' },
      { type: 'unknown', value: '@', rawValue: '@' },
      { type: 'button', value: 'LP', rawValue: 'LP' },
    ])
  })

  it('normalizes modifier aliases regardless of case', () => {
    const tokens = parseNotation('J. > dj. > CH')

    expect(tokens).toEqual([
      { type: 'modifier', value: 'j.', rawValue: 'J.' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'separator', value: '>', rawValue: '>' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'modifier', value: 'dj.', rawValue: 'dj.' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'separator', value: '>', rawValue: '>' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'modifier', value: 'ch', rawValue: 'CH' },
    ])
  })

  it('parses repeat suffixes on grouped notation', () => {
    const tokens = parseNotation('(236) x3 ~ (LP)*N', {
      buttonInputs: ['LP'],
    })

    expect(tokens).toEqual([
      { type: 'repeat-start', value: '(', rawValue: '(' },
      { type: 'motion', value: 'qcf', rawValue: '236' },
      {
        type: 'repeat-end',
        value: ')',
        rawValue: ')',
        repeatCount: 3,
        repeatLabel: 'x3',
      },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'joiner', value: '~', rawValue: '~' },
      { type: 'separator', value: ' ', rawValue: ' ' },
      { type: 'repeat-start', value: '(', rawValue: '(' },
      { type: 'button', value: 'LP', rawValue: 'LP' },
      {
        type: 'repeat-end',
        value: ')',
        rawValue: ')',
        repeatCount: undefined,
        repeatLabel: '*N',
      },
    ])
  })

  it('parses modifier + direction + button (jc.9D)', () => {
    const tokens = parseNotation('jc.9D', { buttonInputs: ['D'] })
    expect(tokens).toEqual([
      { type: 'modifier', value: 'jc.', rawValue: 'jc.' },
      { type: 'direction', value: 'up-forward', rawValue: '9' },
      { type: 'button', value: 'D', rawValue: 'D' },
    ])
  })

  it('does not match direction inside words like "feint"', () => {
    const tokens = parseNotation('22B (feint) > 5[C]', { buttonInputs: ['B', 'C'] })
    // The critical check: 'f' should NOT be parsed as direction 'forward'
    const unknowns = tokens.filter((t) => t.type === 'unknown' && t.value === 'f')
    expect(unknowns.length).toBeGreaterThan(0) // 'f' should be unknown, not direction
    // Verify that forward direction inside parentheses is not matched
    const forwardDirs = tokens.filter((t) => t.type === 'direction' && t.value === 'forward')
    expect(forwardDirs.length).toBe(0) // No forward direction should match
  })

  it('parses grouped notation with repeats inside parentheses', () => {
    const tokens = parseNotation('(236A > 4B)x5', { buttonInputs: ['A', 'B'] })
    // Should parse: (, 236, A, >, 4, B, ), x, 5
    // The motion 236 and directions 4 should be recognized inside parens
    const motions = tokens.filter((t) => t.type === 'motion')
    expect(motions.some((m) => m.value === 'qcf')).toBe(true) // 236 should be qcf motion
    const directions = tokens.filter((t) => t.type === 'direction')
    expect(directions.some((d) => d.value === 'back')).toBe(true) // 4 should be direction
  })
})
