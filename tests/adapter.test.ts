import { describe, expect, it } from 'vitest'
import {
  type ImageRenderSegment,
  tokensToColorSegments,
  tokensToImageSegments,
} from '../src/adapter'
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

function imageAlts(segments: ImageRenderSegment[]): string[] {
  return segments.flatMap((segment) => {
    if (segment.kind === 'icon-group') return segment.icons.map((icon) => icon.alt)
    if (segment.kind === 'button-icon') return [segment.alt]
    return []
  })
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

  it('colors direction/motion notation with dot-joiners before buttons', () => {
    const downTokens = parseNotation('d.[HP]', { buttonInputs: ['HP'] })
    const downSegments = tokensToColorSegments(downTokens, trdProfile)
    const downColored = downSegments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // direction d, joiner ., and button [HP]
    expect(downColored).toEqual(['HP', 'HP', 'HP'])

    const motionTokens = parseNotation('236.LP', { buttonInputs: ['LP'] })
    const motionSegments = tokensToColorSegments(motionTokens, trdProfile)
    const motionColored = motionSegments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // motion 236, joiner ., and button LP
    expect(motionColored).toEqual(['LP', 'LP', 'LP'])
  })

  it('colors numeric count annotations attached to a colored action', () => {
    const tokens = parseNotation('236C(2)', { buttonInputs: ['C'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // qcf, C, (, 2, ) all inherit C's color
    expect(coloredInputs).toEqual(['C', 'C', 'C', 'C', 'C'])
  })

  it('colors parenthesized repeat suffix forms like (x3) and (xN)', () => {
    const tokens = parseNotation('236A(x3)', { buttonInputs: ['A'] })
    const segments = tokensToColorSegments(tokens, aswProfile)
    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // qcf, A, (, x, 3, ) all inherit A
    expect(coloredInputs).toEqual(['A', 'A', 'A', 'A', 'A', 'A'])
  })

  it('keeps textual parenthetical notes plain', () => {
    const tokens = parseNotation('236C(feint)', { buttonInputs: ['C'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // qcf and C inherit/use C; note text stays plain
    expect(coloredInputs).toEqual(['C', 'C'])

    const plainText = segments
      .filter((s) => s.kind === 'plain')
      .map((s) => s.text)
      .join('')

    expect(plainText).toContain('(feint)')
  })

  it('colors attached repeat suffixes like x7 and xN', () => {
    const numericTokens = parseNotation('236Cx7', { buttonInputs: ['C'] })
    const numericSegments = tokensToColorSegments(numericTokens, aswProfile)
    const numericColored = numericSegments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // qcf, C, x, 7 all inherit/use C
    expect(numericColored).toEqual(['C', 'C', 'C', 'C'])

    const symbolicTokens = parseNotation('236CxN', { buttonInputs: ['C'] })
    const symbolicSegments = tokensToColorSegments(symbolicTokens, aswProfile)
    const symbolicColored = symbolicSegments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // qcf, C, x, N all inherit/use C
    expect(symbolicColored).toEqual(['C', 'C', 'C', 'C'])
  })
})

// ---------------------------------------------------------------------------
// Image mode adapter
// ---------------------------------------------------------------------------

describe('tokensToImageSegments', () => {
  it('emits ordered arrow steps for directions and decomposable motions', () => {
    const cases = [
      ['2', ['Down']],
      ['236A', ['Down', 'Down-Forward', 'Forward']],
      ['623P', ['Forward', 'Down', 'Down-Forward']],
      ['qcf.LP', ['Down', 'Down-Forward', 'Forward']],
      ['44', ['Back', 'Back']],
      ['236236', ['Down', 'Down-Forward', 'Forward', 'Down', 'Down-Forward', 'Forward']],
    ] as const

    for (const [notation, steps] of cases) {
      const profile = notation.includes('LP') ? trdProfile : aswProfile
      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.colors) })
      const group = tokensToImageSegments(tokens, profile, 'arrows').find(
        (segment) => segment.kind === 'icon-group',
      )
      expect(group?.kind).toBe('icon-group')
      if (group?.kind === 'icon-group') {
        expect(group.icons.map((icon) => icon.alt)).toEqual(steps)
      }
    }
  })

  it('uses hold assets for bracketed directions in both icon styles', () => {
    const tokens = parseNotation('[4] 6')

    for (const style of ['joystick', 'arrows'] as const) {
      const groups = tokensToImageSegments(tokens, aswProfile, style).filter(
        (segment) => segment.kind === 'icon-group',
      )

      expect(groups).toHaveLength(2)
      expect(groups[0]?.kind === 'icon-group' ? groups[0].icons[0]?.alt : undefined).toContain(
        '(hold)',
      )
      expect(groups[1]?.kind === 'icon-group' ? groups[1].icons[0]?.alt : undefined).not.toContain(
        '(hold)',
      )
    }
  })

  it('renders circular motions entirely as arrows in arrow mode', () => {
    const tokens = parseNotation('360A > 720B > 1080C', {
      buttonInputs: ['A', 'B', 'C'],
    })
    const segments = tokensToImageSegments(tokens, aswProfile, 'arrows')
    const groups = segments.filter((segment) => segment.kind === 'icon-group')
    expect(groups.map((group) => group.icons.length)).toEqual([8, 16, 24])
    expect(imageAlts(segments).filter((alt) => alt === '360' || alt === '720')).toEqual([])
    expect(imageAlts(segments).filter((alt) => ['A', 'B', 'C'].includes(alt))).toEqual([
      'A',
      'B',
      'C',
    ])
  })

  it('preserves the default joystick segment contract', () => {
    const tokens = parseNotation('236A', { buttonInputs: ['A'] })
    expect(tokensToImageSegments(tokens, aswProfile)).toEqual(
      tokensToImageSegments(tokens, aswProfile, 'joystick'),
    )
  })

  it('maps qcf motion token to an icon group', () => {
    const tokens = parseNotation('236', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    expect(segments[0].kind).toBe('icon-group')
    if (segments[0].kind === 'icon-group') {
      expect(segments[0].label).toBe('QCF')
      expect(segments[0].icons).toHaveLength(1)
      expect(segments[0].icons[0]?.source).toBeTruthy()
    }
  })

  it('maps a direction token to its icon group', () => {
    const tokens = parseNotation('2', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    expect(segments[0].kind).toBe('icon-group')
    if (segments[0].kind === 'icon-group') {
      expect(segments[0].label).toBe('Down')
    }
  })

  it('represents doubled motions with two images in one group', () => {
    const tokens = parseNotation('236236', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    if (segments[0].kind === 'icon-group') {
      expect(segments[0].icons).toHaveLength(2)
      expect(segments[0].label).toBe('QCF')
    }
  })

  it('maps profile buttons to dynamic button segments', () => {
    const tokens = parseNotation('A', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toHaveLength(1)
    expect(segments[0].kind).toBe('button-icon')
    if (segments[0].kind === 'button-icon') {
      expect(segments[0].alt).toBe('A')
      expect(segments[0].fontSize).toBe(80)
      expect(segments[0].held).toBe(false)
    }
  })

  it('marks bracketed profile buttons as held button icons', () => {
    const tokens = parseNotation('[A]', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments).toEqual([
      {
        kind: 'button-icon',
        input: 'A',
        alt: 'A (hold)',
        fontSize: 80,
        held: true,
      },
    ])
  })

  it('preserves repeat-start and repeat-end parentheses as plain text', () => {
    const tokens = parseNotation('(236) x3', { buttonInputs: [] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    const plainText = segments
      .filter((s) => s.kind === 'plain')
      .map((s) => s.text)
      .join('')

    expect(plainText).toContain('(')
    expect(plainText).toContain(')')
    expect(segments.some((s) => s.kind === 'icon-group')).toBe(true)
  })

  it('keeps count-annotation parentheses in icon mode (3C(1))', () => {
    const tokens = parseNotation('3C(1)', { buttonInputs: ['C'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    const plainText = segments
      .filter((s) => s.kind === 'plain')
      .map((s) => s.text)
      .join('')

    expect(plainText).toContain('(1)')
  })

  it('emits plain segment for separators', () => {
    const tokens = parseNotation('236 > A', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    const separators = segments.filter((s) => s.kind === 'plain' && s.text === '>')
    expect(separators).toHaveLength(1)
  })

  // Regression fixture: '2A > 5B > 236C' from README
  it('fixture: numpad notation maps to the correct icon sequence', () => {
    const profile: CustomProfile = {
      name: 'Fixture',
      desc: { A: '', B: '', C: '' },
      colors: { A: '#DE1616', B: '#1F8CCC', C: '#009E4E' },
    }
    const tokens = parseNotation('2A > 5B > 236C', { buttonInputs: ['A', 'B', 'C'] })
    const segments = tokensToImageSegments(tokens, profile)

    // Neutral has no fixed icon and is skipped.
    expect(imageAlts(segments)).toEqual(['Down', 'A', 'B', 'QCF', 'C'])
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

  it('renders motion-button combos in the correct icon sequence', () => {
    const notation = 'qcf.A hcf.B'
    const tokens = parseNotation(notation, { buttonInputs: ['A', 'B'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(imageAlts(segments)).toEqual(['QCF', 'A', 'HCF', 'B'])
  })

  it('preserves non-matching text and handles mixed content', () => {
    const notation = 'A . B'
    const tokens = parseNotation(notation, { buttonInputs: ['A', 'B'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredCount = segments.filter((s) => s.kind === 'colored').length
    const plainCount = segments.filter((s) => s.kind === 'plain').length

    // A, '.', and B all inherit/use button color when separated only by spaces.
    expect(coloredCount).toBe(3)
    expect(plainCount).toBeGreaterThan(0)
  })

  it('handles repeat notation structures in token stream', () => {
    const notation = '(qcf)x3'
    const tokens = parseNotation(notation)
    const segments = tokensToImageSegments(tokens, aswProfile)

    expect(segments.some((segment) => segment.kind === 'icon-group')).toBe(true)
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

    // The middle direction token inherits color from the following A across spaces.
    expect(coloredInputs).toEqual(['A', 'A', 'A'])
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
    // 214Bx5: motion 214, button B, then x5 repeat suffix (unknown token run)
    // Motion, button, and suffix all inherit B's color when attached.
    const notation = '214Bx5'
    const tokens = parseNotation(notation, { buttonInputs: ['B'] })
    const segments = tokensToColorSegments(tokens, aswProfile)

    const coloredInputs = segments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)

    // 214 (motion), B (button), x and 5 all use B's color
    expect(coloredInputs).toEqual(['B', 'B', 'B', 'B'])
  })

  it('does NOT render an icon for "f" in "feint" comment', () => {
    // Critical: '22B (feint) > 5[C]' should NOT show a forward direction icon for 'f'
    const tokens = parseNotation('22B (feint) > 5[C]', { buttonInputs: ['B', 'C'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    // Check that no forward direction icon is rendered
    expect(imageAlts(segments)).not.toContain('Forward')

    // The 'f' should appear as plain text, not as an icon segment.
    const plainSegments = segments.filter((s) => s.kind === 'plain')
    const plainText = plainSegments.map((s) => s.text).join('')
    expect(plainText).toContain('f')
  })

  it('does NOT render an icon for "3" in isolated repeat count "(3)"', () => {
    // Critical: '(3)' should NOT show a down-forward direction icon for '3'
    // '3' in parentheses is a repeat count context, not a direction
    const tokens = parseNotation('236A (3)', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    // Check that no down-forward direction icon for '3' is rendered
    expect(imageAlts(segments)).not.toContain('DownForward')

    // The '3' should appear as plain text, not as an icon segment.
    const plainSegments = segments.filter((s) => s.kind === 'plain')
    const plainText = plainSegments.map((s) => s.text).join('')
    expect(plainText).toContain('3')
  })

  it('DOES render an icon for "3" in combo context like "(3A)"', () => {
    // In contrast, '(3A)' should render '3' as a down-forward direction
    // because it's followed by button 'A' (not isolated in parentheses)
    const tokens = parseNotation('(3A)', { buttonInputs: ['A'] })
    const segments = tokensToImageSegments(tokens, aswProfile)

    const alts = imageAlts(segments)
    expect(alts).toContain('DownForward')
    expect(alts).toContain('A')
  })

  it('user issue: exact ASW notation with comments and isolated repeat', () => {
    // User reported: 22B (feint) > 5[C] , 214Bx5 |> 236A(3)
    // Should NOT render 'f' in "(feint)" or '3' in "(3)" as direction icons
    const notation = '22B (feint) > 5[C] , 214Bx5 |> 236A(3)'
    const tokens = parseNotation(notation, { buttonInputs: ['B', 'C', 'A'] })

    const segments = tokensToImageSegments(tokens, aswProfile)

    // Verify no extra Forward or DownForward icons from comments/isolated digits
    // We expect: DoublDown, B, Neutral, C, DoublQCB, B, QCF, A
    // NOT: Forward (from feint), DownForward (from isolated 3)
    const unexpectedIcons = imageAlts(segments).filter(
      (alt) => alt === 'Forward' || alt === 'DownForward',
    )
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
