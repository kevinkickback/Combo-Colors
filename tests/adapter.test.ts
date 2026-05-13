import { describe, expect, it } from 'vitest'
import { tokensToColorSegments, tokensToImageSegments } from '../src/adapter'
import { parseNotation } from '../src/parser'
import type { CustomProfile } from '../src/settings'

const aswProfile: CustomProfile = {
  name: 'Test ASW',
  desc: { A: 'Weak', B: 'Strong', C: 'Heavy', D: 'Drive' },
  colors: {
    A: '#DE1616',
    B: '#1F8CCC',
    C: '#009E4E',
    D: '#E8982C',
  },
}

const trdProfile: CustomProfile = {
  name: 'Test TRD',
  desc: { LP: 'Light punch', MP: 'Medium punch', HP: 'Heavy punch' },
  colors: { LP: '#1F8CCC', MP: '#E8982C', HP: '#DE1616' },
}

// ---------------------------------------------------------------------------
// Color / text mode adapter
// ---------------------------------------------------------------------------

describe('tokensToColorSegments', () => {
  it('maps profile button tokens to colored segments', () => {
    const tokens = parseNotation('2A > 5B', { buttonInputs: ['A', 'B'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    // With the new behavior, directions inherit the color of the following button
    // So '2' gets colored as 'A', and '5' gets colored as 'B'
    const colored = segments.filter((s) => s.kind === 'colored')
    expect(colored).toHaveLength(4) // 2→A, A, 5→B, B
    expect(colored.map((s) => (s as { input: string }).input)).toEqual(['A', 'A', 'B', 'B'])
  })

  it('emits plain segments for non-button tokens', () => {
    const tokens = parseNotation('236 > A', { buttonInputs: ['A'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredSegments = segments.filter((s) => s.kind === 'colored')
    const plainSegments = segments.filter((s) => s.kind === 'plain')

    // '236 > A' has a '>' separator which breaks color inheritance, so only 'A' is colored
    expect(coloredSegments).toHaveLength(1)
    // '>', spaces, and the motion are plain
    expect(plainSegments.length).toBeGreaterThan(0)
    expect(plainSegments.some((s) => s.kind === 'plain' && s.text === '>')).toBe(true)
  })

  it('preserves rawText for bracketed button inputs', () => {
    const tokens = parseNotation('[A] > B', { buttonInputs: ['A', 'B'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const aSeg = segments.find((s) => s.kind === 'colored' && s.input === 'A')
    expect(aSeg).toEqual({ kind: 'colored', input: 'A', rawText: '[A]' })
  })

  it('does not color tokens whose value is not in the profile', () => {
    const tokens = parseNotation('2LP > HP', { buttonInputs: ['LP', 'HP'] })
    const segments = tokensToColorSegments(tokens, trdProfile)

    const colored = segments.filter((s) => s.kind === 'colored')
    // Direction '2' inherits LP's color, plus LP and HP are colored themselves
    expect(colored).toHaveLength(3)
    const coloredInputs = colored.map((s) => (s as { input: string }).input)
    expect(coloredInputs).toEqual(['LP', 'LP', 'HP'])
  })

  // Regression fixture: README example 'cr.A , st.B , qcf.C'
  it('fixture: traditional alias notation produces expected segments', () => {
    const profile: CustomProfile = {
      name: 'Fixture',
      desc: { A: '', B: '', C: '' },
      colors: { A: '#DE1616', B: '#1F8CCC', C: '#009E4E' },
    }
    const tokens = parseNotation('cr.A , st.B , qcf.C', { buttonInputs: ['A', 'B', 'C'] })
    const segments = tokensToColorSegments(tokens, profile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // cr (direction) inherits A via '.'; '.' (joiner) also inherits A; A is button.
    // Same for st→B and qcf→C groups.
    expect(coloredInputs).toEqual(['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'])
  })
})

// ---------------------------------------------------------------------------
// Image mode adapter
// ---------------------------------------------------------------------------

describe('tokensToImageSegments', () => {
  it('maps qcf motion token to an SVG segment', () => {
    const tokens = parseNotation('236', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    expect(segments[0].kind).toBe('svg')
    if (segments[0].kind === 'svg') {
      expect(segments[0].alt).toBe('QCF')
      expect(segments[0].cssClass).toBe('motionIcon')
      expect(segments[0].repeat).toBe(1)
      expect(segments[0].source).toContain('<svg')
    }
  })

  it('maps a direction token to its SVG segment', () => {
    const tokens = parseNotation('2', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    expect(segments[0].kind).toBe('svg')
    if (segments[0].kind === 'svg') {
      expect(segments[0].alt).toBe('Down')
    }
  })

  it('gives doubled motions repeat:2', () => {
    const tokens = parseNotation('236236', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    if (segments[0].kind === 'svg') {
      expect(segments[0].repeat).toBe(2)
      expect(segments[0].alt).toBe('QCF')
    }
  })

  it('maps profile button to SVG segment', () => {
    const tokens = parseNotation('A', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    expect(segments[0].kind).toBe('svg')
    if (segments[0].kind === 'svg') {
      expect(segments[0].alt).toBe('A')
      expect(segments[0].cssClass).toBe('buttonIcon')
    }
  })

  it('drops repeat-start and repeat-end structural tokens', () => {
    const tokens = parseNotation('(236) x3', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments.every((s) => s.kind !== 'plain' || !['(', ')'].includes(s.text))).toBe(true)
    expect(segments.some((s) => s.kind === 'svg')).toBe(true)
  })

  it('emits plain segment for separators', () => {
    const tokens = parseNotation('236 > A', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    const separators = segments.filter((s) => s.kind === 'plain' && s.text === '>')
    expect(separators).toHaveLength(1)
  })

  // Regression fixture: '2A > 5B > 236C' from README
  it('fixture: numpad notation maps to correct SVG sequence', () => {
    const profile: CustomProfile = {
      name: 'Fixture',
      desc: { A: '', B: '', C: '' },
      colors: { A: '#DE1616', B: '#1F8CCC', C: '#009E4E' },
    }
    const tokens = parseNotation('2A > 5B > 236C', { buttonInputs: ['A', 'B', 'C'] })
    const segments = tokensToImageSegments(tokens, profile)

    const svgAlts = segments.filter((s) => s.kind === 'svg').map((s) => (s as { alt: string }).alt)
    // '5' is direction 'neutral' which has alt='' (hidden); still emitted for render-parity with legacy
    expect(svgAlts).toEqual(['Down', 'A', '', 'B', 'QCF', 'C'])
  })
})

// ---------------------------------------------------------------------------
// Integration tests: full parser → adapter pipeline
// ---------------------------------------------------------------------------

describe('Parser + Adapter integration', () => {
  it('parses and colors ABCD notation with ASW-style profile', () => {
    // Profile has A, B, C, D defined
    const notation = 'A, B > C, D'
    const tokens = parseNotation(notation, { buttonInputs: ['A', 'B', 'C', 'D'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    expect(coloredInputs).toEqual(['A', 'B', 'C', 'D'])
  })

  it('parses and colors multi-char notation (LP/MP/HP) with TRD-style profile', () => {
    const notation = 'LP, MP > HP'
    const tokens = parseNotation(notation, { buttonInputs: ['LP', 'MP', 'HP'] })
    const segments = tokensToColorSegments(tokens, trdProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    expect(coloredInputs).toEqual(['LP', 'MP', 'HP'])
  })

  it('renders images for motion-button combos with correct SVG sequence', () => {
    const notation = 'qcf.A hcf.B'
    const tokens = parseNotation(notation, { buttonInputs: ['A', 'B'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    const svgAlts = segments.filter((s) => s.kind === 'svg').map((s) => (s as { alt: string }).alt)
    // Should have QCF, A, HCF, B as SVG segments (separators become plain)
    expect(svgAlts.length).toBe(4)
    expect(svgAlts[0]).toBe('QCF')
    expect(svgAlts[1]).toBe('A')
    expect(svgAlts[2]).toBe('HCF')
    expect(svgAlts[3]).toBe('B')
  })

  it('preserves non-matching text and handles mixed content', () => {
    const notation = 'A . B'
    const tokens = parseNotation(notation, { buttonInputs: ['A', 'B'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredCount = segments.filter((s) => s.kind === 'colored').length
    const plainCount = segments.filter((s) => s.kind === 'plain').length

    // Should have 2 colored (A, B) and at least 1 plain (separator)
    expect(coloredCount).toBe(2)
    expect(plainCount).toBeGreaterThan(0)
  })

  it('handles repeat notation structures in token stream', () => {
    const notation = '(qcf)x3'
    const tokens = parseNotation(notation)
    const segments = tokensToImageSegments(tokens, aswProfile)

    // Should produce at least one SVG segment (the motion qcf)
    const svgSegments = segments.filter((s) => s.kind === 'svg')
    expect(svgSegments.length).toBeGreaterThan(0)
  })

  it('handles empty and whitespace-only input gracefully', () => {
    const emptyTokens = parseNotation('', { buttonInputs: ['A'] })
    const emptySegments = tokensToColorSegments(emptyTokens, aswProfile)

    expect(emptySegments.length).toBe(0)

    const whitespaceTokens = parseNotation('   ', { buttonInputs: ['A'] })
    const whitespaceSegments = tokensToColorSegments(whitespaceTokens, aswProfile)

    // Spaces are now separator tokens that become plain segments
    expect(whitespaceSegments.length).toBe(3)
    expect(whitespaceSegments).toEqual([
      { kind: 'plain', text: ' ' },
      { kind: 'plain', text: ' ' },
      { kind: 'plain', text: ' ' },
    ])
  })

  it('correctly distinguishes buttons from direction aliases in same notation', () => {
    // Buttons with lowercase direction aliases nearby: 'A' button, 'b' direction, 'A' button
    const notation = 'A b A'
    const tokens = parseNotation(notation, { buttonInputs: ['A'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // Should have 2 colored buttons (A, A) and direction 'b' as plain
    expect(coloredInputs).toEqual(['A', 'A'])
  })

  it('allows modifiers to inherit color through a direction token', () => {
    // jc.9D: modifier jc. should inherit through direction 9 to reach button D
    const notation = 'jc.9D'
    const tokens = parseNotation(notation, { buttonInputs: ['D'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // All tokens should inherit D's color: jc. (modifier), 9 (direction), D (button)
    expect(coloredInputs).toEqual(['D', 'D', 'D'])
  })

  it('colors motion + button with repeat suffix (214Bx5)', () => {
    // 214Bx5: motion 214, button B, then x5 (repeat suffix parsed as unknown tokens)
    // With B now recognized as a button, 214 inherits B's color and B is colored
    const notation = '214Bx5'
    const tokens = parseNotation(notation, { buttonInputs: ['B'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // 214 (motion) inherits B's color, B (button) is colored; x and 5 remain plain (unknown)
    expect(coloredInputs).toEqual(['B', 'B'])
  })

  it('does NOT render SVG icon for "f" in "feint" comment', () => {
    // Critical: '22B (feint) > 5[C]' should NOT show a forward direction icon for 'f'
    const tokens = parseNotation('22B (feint) > 5[C]', { buttonInputs: ['B', 'C'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    // Check that no forward direction icon is rendered
    const forwardIcons = segments.filter((s) => s.kind === 'svg' && s.alt === 'Forward')
    expect(forwardIcons).toHaveLength(0)

    // The 'f' should appear as plain text, not as an SVG segment
    const plainSegments = segments.filter((s) => s.kind === 'plain')
    const plainText = plainSegments.map((s) => s.text).join('')
    expect(plainText).toContain('f')
  })

  it('does NOT render SVG icon for "3" in isolated repeat count "(3)"', () => {
    // Critical: '(3)' should NOT show a down-forward direction icon for '3'
    // '3' in parentheses is a repeat count context, not a direction
    const tokens = parseNotation('236A (3)', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    // Check that no down-forward direction icon for '3' is rendered
    const directionIcons = segments.filter((s) => s.kind === 'svg' && s.alt === 'Down-Forward')
    expect(directionIcons).toHaveLength(0)

    // The '3' should appear as plain text, not as an SVG segment
    const plainSegments = segments.filter((s) => s.kind === 'plain')
    const plainText = plainSegments.map((s) => s.text).join('')
    expect(plainText).toContain('3')
  })

  it('DOES render SVG icon for "3" in combo context like "(3A)"', () => {
    // In contrast, '(3A)' should render '3' as a down-forward direction
    // because it's followed by button 'A' (not isolated in parentheses)
    const tokens = parseNotation('(3A)', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    // Should have down-forward direction and button A as SVG segments
    const svgSegments = segments.filter((s) => s.kind === 'svg')
    expect(svgSegments.length).toBeGreaterThanOrEqual(2)

    const svgAlts = svgSegments.map((s) => s.alt)
    expect(svgAlts).toContain('DownForward') // '3' as direction
    expect(svgAlts).toContain('A') // Button A
  })

  it('user issue: exact ASW notation with comments and isolated repeat', () => {
    // User reported: 22B (feint) > 5[C] , 214Bx5 |> 236A(3)
    // Should NOT render 'f' in "(feint)" or '3' in "(3)" as direction icons
    const notation = '22B (feint) > 5[C] , 214Bx5 |> 236A(3)'
    const tokens = parseNotation(notation, { buttonInputs: ['B', 'C', 'A'] })

    // DEBUG: Log all tokens to verify parser is correct
    console.log('=== DEBUG: User notation tokens ===')
    for (const token of tokens) {
      console.log(
        `${token.type.padEnd(15)} | value: ${token.value.padEnd(15)} | raw: ${token.rawValue}`,
      )
    }

    const segments = tokensToImageSegments(tokens, aswProfile)

    // Extract SVG segments with their alt values
    const svgAlts = segments.filter((s) => s.kind === 'svg').map((s) => s.alt)

    // DEBUG: Log SVG segments
    console.log('=== DEBUG: SVG segments ===')
    console.log('SVG alts:', svgAlts)

    // Verify no extra Forward or DownForward icons from comments/isolated digits
    // We expect: DoublDown, B, Neutral, C, DoublQCB, B, QCF, A
    // NOT: Forward (from feint), DownForward (from isolated 3)
    const unexpectedIcons = svgAlts.filter((alt) => alt === 'Forward' || alt === 'DownForward')
    expect(unexpectedIcons).toHaveLength(0)

    // Plain segments should contain the comment and isolated repeat
    const plainText = segments
      .filter((s) => s.kind === 'plain')
      .map((s) => s.text)
      .join('')
    expect(plainText).toContain('feint')
    expect(plainText).toContain('3')
  })
})
