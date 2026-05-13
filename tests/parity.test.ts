import { describe, expect, it } from 'vitest'
import type { ImageRenderSegment } from '../src/adapter'
import { tokensToColorSegments, tokensToImageSegments } from '../src/adapter'
import { parseNotation } from '../src/parser'
import { colorPatterns, imageMap } from '../src/patterns'

/** Expand SVG segments by their repeat count, matching legacy renderer behaviour. */
function svgAlts(segments: ImageRenderSegment[]): string[] {
  return segments
    .filter((s) => s.kind === 'svg')
    .flatMap((s) => {
      const seg = s as { alt: string; repeat: number }
      return Array<string>(seg.repeat ?? 1).fill(seg.alt)
    })
}

// Inline profile types for testing
interface TestProfile {
  name: string
  desc: Record<string, string>
  colors: Record<string, string>
}

// Test profiles matching real notation styles
const profiles: Record<string, TestProfile> = {
  asw: {
    name: 'ASW',
    desc: { A: 'Weak', B: 'Strong', C: 'Heavy', D: 'Drive' },
    colors: { A: '#DE1616', B: '#1F8CCC', C: '#009E4E', D: '#E8982C' },
  },
  trd: {
    name: 'TRD',
    desc: { LP: 'Light', MP: 'Medium', HP: 'Heavy' },
    colors: { LP: '#1F8CCC', MP: '#E8982C', HP: '#DE1616' },
  },
  sf: {
    name: 'SF6',
    desc: {
      LP: 'Light Punch',
      MP: 'Medium Punch',
      HP: 'Hard Punch',
      LK: 'Light Kick',
      MK: 'Medium Kick',
      HK: 'Hard Kick',
    },
    colors: {
      LP: '#8ECBDE',
      MP: '#E8AA2C',
      HP: '#DE1616',
      LK: '#8EDE99',
      MK: '#C47ED1',
      HK: '#DE8E16',
    },
  },
  tekken: {
    name: 'Tekken',
    desc: { '1': 'LP', '2': 'RP', '3': 'LK', '4': 'RK' },
    colors: { '1': '#8ECBDE', '2': '#DE1616', '3': '#8EDE99', '4': '#E8AA2C' },
  },
}

/**
 * Parity test fixture: real-world notation strings that should parse
 * equivalently in both parser mode and legacy regex mode.
 *
 * Note: Parenthesized/grouped motions like (qcf)x3 are handled MORE correctly
 * by the parser than the legacy regex, so they are not included in parity tests.
 * These represent parser improvements, not regressions.
 *
 * Format: { notation, profile, description }
/**
 * Each fixture compares parser mode against legacy regex mode.
 * `parserColors` is set for cases where the parser intentionally produces MORE
 * colored segments than regex — motions/directions/modifiers/joiners that are
 * connected to a button (via joiner tokens or directly adjacent) inherit that
 * button's color. The legacy regex only colors the button itself.
 */
const NOTATION_FIXTURES = [
  // ASW single-button combos
  { notation: 'A', profile: 'asw', desc: 'Single weak button' },
  { notation: 'B > C', profile: 'asw', desc: 'Button chain' },
  { notation: 'A , B , C , D', profile: 'asw', desc: 'Comma-separated buttons' },

  // ASW motion + button combos joined with '.'
  // motion, joiner '.', and button all get colored
  { notation: 'qcf.A', profile: 'asw', desc: 'QCF + weak', parserColors: ['A', 'A', 'A'] },
  { notation: 'hcf.B', profile: 'asw', desc: 'HCF + strong', parserColors: ['B', 'B', 'B'] },
  // Numeric-alias motions: digits fail boundary check before '.', become unknowns; joiner '.' + button colored
  { notation: '236.C', profile: 'asw', desc: 'Numpad motion + heavy', parserColors: ['C', 'C'] },

  // ASW complex patterns from README
  // Directions directly adjacent to buttons (no joiner) still inherit
  {
    notation: '2A > 5B > 236C',
    profile: 'asw',
    desc: 'Numpad notation chain',
    parserColors: ['A', 'A', 'B', 'B', 'C', 'C'],
  },
  // direction + '.' + button: direction, joiner, and button all colored
  {
    notation: 'cr.A , st.B , qcf.C',
    profile: 'asw',
    desc: 'Direction aliases + buttons',
    parserColors: ['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'],
  },

  // TRD multi-char buttons
  { notation: 'LP', profile: 'trd', desc: 'Multi-char light punch' },
  { notation: 'LP > MP > HP', profile: 'trd', desc: 'Punch chain' },
  {
    notation: 'qcf.MP',
    profile: 'trd',
    desc: 'QCF + medium punch',
    parserColors: ['MP', 'MP', 'MP'],
  },
  // Numeric digits fail boundary before '.'; joiner '.' + button colored
  { notation: '214.HP', profile: 'trd', desc: 'Numpad motion + heavy', parserColors: ['HP', 'HP'] },

  // Mixed content: motion + '.' + button, then separator, then direction + '.' + button
  {
    notation: 'dp.C > cr.D',
    profile: 'asw',
    desc: 'DP motion + crouch',
    parserColors: ['C', 'C', 'C', 'D', 'D', 'D'],
  },

  // Edge cases with separators and modifiers
  // 'A.j.B': A(button), '.'(joiner→B), j.(modifier→B), B(button)
  {
    notation: 'A.j.B',
    profile: 'asw',
    desc: 'Button with jump modifier',
    parserColors: ['A', 'B', 'B', 'B'],
  },
  // 'A , j.B , A': j.(modifier→B) and B both colored; A's on either side unaffected by separator
  {
    notation: 'A , j.B , A',
    profile: 'asw',
    desc: 'Modifiers between buttons',
    parserColors: ['A', 'A', 'B', 'B'],
  },

  // ── Numpad notation: double motions ──────────────────────────────────────
  // 236236 = double QCF (super). Regex matches as one entry (repeat:2). Parser → double-qcf token.
  {
    notation: '236236A',
    profile: 'asw',
    desc: 'Double QCF super (numpad)',
    parserColors: ['A', 'A'],
  },
  {
    notation: '214214B',
    profile: 'asw',
    desc: 'Double QCB super (numpad)',
    parserColors: ['B', 'B'],
  },

  // ── Numpad notation: simple directions ───────────────────────────────────
  { notation: '6A', profile: 'asw', desc: 'Forward + button (numpad)', parserColors: ['A', 'A'] },
  { notation: '4B', profile: 'asw', desc: 'Back + button (numpad)', parserColors: ['B', 'B'] },
  { notation: '8C', profile: 'asw', desc: 'Up + button (numpad)', parserColors: ['C', 'C'] },
  {
    notation: '9D',
    profile: 'asw',
    desc: 'Up-forward + button (numpad)',
    parserColors: ['D', 'D'],
  },
  { notation: '1A', profile: 'asw', desc: 'Down-back + button (numpad)', parserColors: ['A', 'A'] },
  { notation: '7B', profile: 'asw', desc: 'Up-back + button (numpad)', parserColors: ['B', 'B'] },

  // ── Traditional (named) notation ─────────────────────────────────────────
  { notation: 'qcf.A', profile: 'asw', desc: 'QCF (traditional)', parserColors: ['A', 'A', 'A'] },
  { notation: 'qcb.B', profile: 'asw', desc: 'QCB (traditional)', parserColors: ['B', 'B', 'B'] },
  { notation: 'dp.C', profile: 'asw', desc: 'DP (traditional)', parserColors: ['C', 'C', 'C'] },
  { notation: 'rdp.D', profile: 'asw', desc: 'RDP (traditional)', parserColors: ['D', 'D', 'D'] },
  { notation: 'hcf.B', profile: 'asw', desc: 'HCF (traditional)', parserColors: ['B', 'B', 'B'] },
  { notation: 'hcb.C', profile: 'asw', desc: 'HCB (traditional)', parserColors: ['C', 'C', 'C'] },

  // ── Dash notations ───────────────────────────────────────────────────────
  {
    notation: '66A',
    profile: 'asw',
    desc: 'Dash forward + button (numpad)',
    parserColors: ['A', 'A'],
  },
  {
    notation: '44B',
    profile: 'asw',
    desc: 'Dash back + button (numpad)',
    parserColors: ['B', 'B'],
  },
  {
    notation: 'dash.A',
    profile: 'asw',
    desc: 'Dash forward (traditional)',
    parserColors: ['A', 'A', 'A'],
  },
  {
    notation: 'back dash.B',
    profile: 'asw',
    desc: 'Backdash (traditional)',
    parserColors: ['B', 'B', 'B'],
  },

  // ── Double-down crouching ─────────────────────────────────────────────────
  {
    notation: '22B',
    profile: 'asw',
    desc: 'Double-down + button (numpad)',
    parserColors: ['B', 'B'],
  },

  // ── Hold / charged inputs ─────────────────────────────────────────────────
  { notation: '5[C]', profile: 'asw', desc: 'Charged heavy', parserColors: ['C', 'C'] },
  // Direction '5' before 'C' is colored: direction(5→C), C = 2 C's; direction(2→B), B = 2 B's
  {
    notation: '2[B] > 5C',
    profile: 'asw',
    desc: 'Charged strong into heavy',
    parserColors: ['B', 'B', 'C', 'C'],
  },

  // ── Air notation ─────────────────────────────────────────────────────────
  { notation: 'j.A', profile: 'asw', desc: 'Jump + weak', parserColors: ['A', 'A'] },
  { notation: 'j.B > j.C', profile: 'asw', desc: 'Air chain', parserColors: ['B', 'B', 'C', 'C'] },
  // j.(modifier→B), 236(motion→B), B(button) = 3 B's
  { notation: 'j.236B', profile: 'asw', desc: 'Air QCF (numpad)', parserColors: ['B', 'B', 'B'] },

  // ── Plus / simultaneous inputs ────────────────────────────────────────────
  // A(button→A), +(joiner→B), B(button→B) = A, B, B
  { notation: 'A+B', profile: 'asw', desc: 'Simultaneous A+B', parserColors: ['A', 'B', 'B'] },
  // A(A), +(joiner→D), D(D), 236(motion→C), C(C) = A, D, D, C, C
  {
    notation: 'A+D > 236C',
    profile: 'asw',
    desc: 'Simultaneous A+D into QCF C',
    parserColors: ['A', 'D', 'D', 'C', 'C'],
  },

  // ── Multi-char button profiles (TRD) ─────────────────────────────────────
  {
    notation: '236.LP',
    profile: 'trd',
    desc: 'QCF light punch (numpad+traditional)',
    parserColors: ['LP', 'LP'],
  },
  {
    notation: 'qcf.HP',
    profile: 'trd',
    desc: 'QCF HP (traditional)',
    parserColors: ['HP', 'HP', 'HP'],
  },
  { notation: 'LP > MP > HP > MP > LP', profile: 'trd', desc: 'Full punch chain (TRD)' },
  {
    notation: 'qcf.MP , dp.HP',
    profile: 'trd',
    desc: 'Motion chain (TRD)',
    parserColors: ['MP', 'MP', 'MP', 'HP', 'HP', 'HP'],
  },

  // ── Street Fighter style (SF6) 6-button ──────────────────────────────────
  { notation: 'LP > MP > HP', profile: 'sf', desc: 'Punch target combo (SF6)' },
  {
    notation: '236LP > 214HP',
    profile: 'sf',
    desc: 'Fireball into shoryu (SF6)',
    parserColors: ['LP', 'LP', 'HP', 'HP'],
  },
  {
    notation: 'qcf.MK > qcb.HK',
    profile: 'sf',
    desc: 'Traditional motion chain (SF6)',
    parserColors: ['MK', 'MK', 'MK', 'HK', 'HK', 'HK'],
  },

  // ── Long combo sequences ──────────────────────────────────────────────────
  {
    notation: '2A , 2B , 236C > 214D , j.A > j.B > j.C',
    profile: 'asw',
    desc: 'Full combo sequence (ASW)',
    parserColors: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'A', 'A', 'B', 'B', 'C', 'C'],
  },
  {
    notation: 'cr.LP , st.MP > qcf.HP , dp.HP',
    profile: 'sf',
    desc: 'Classic SF bnb (traditional)',
    // cr(dir→LP), .(join→LP), LP; st(dir→MP), .(join→MP), MP; qcf(mot→HP), .(join→HP), HP; dp(mot→HP), .(join→HP), HP
    parserColors: ['LP', 'LP', 'LP', 'MP', 'MP', 'MP', 'HP', 'HP', 'HP', 'HP', 'HP', 'HP'],
  },
]

describe('Parser ↔ Legacy Regex Parity', () => {
  /**
   * Fixture: Verify parser and regex modes identify the same colored buttons.
   * Where `parserColors` is provided, the parser intentionally produces more
   * colored segments (motions/directions joined to buttons inherit that color).
   */
  it.each(NOTATION_FIXTURES)('colors match: $desc ($notation)', ({
    notation,
    profile: profileKey,
    parserColors,
  }) => {
    const profile = profiles[profileKey]
    if (!profile) throw new Error(`Unknown profile: ${profileKey}`)

    // Parser mode: tokenize and extract colored buttons
    const parserTokens = parseNotation(notation, { buttonInputs: Object.keys(profile.colors) })
    const parserSegments = tokensToColorSegments(
      parserTokens,
      profile as Parameters<typeof tokensToColorSegments>[1],
    )
    const parserColored = parserSegments
      .filter((s) => s.kind === 'colored')
      .map((s) => (s as { input: string }).input)
      .sort()

    if (parserColors) {
      // Parser intentionally colors more than regex for this fixture
      expect(parserColored).toEqual([...parserColors].sort())
    } else {
      // Legacy regex mode: find all matches using color patterns
      const regexPatterns = colorPatterns(profile)
      const regexColored = []
      for (const [pattern, input] of regexPatterns) {
        pattern.lastIndex = 0
        let match = pattern.exec(notation)
        while (match !== null) {
          regexColored.push(input)
          match = pattern.exec(notation)
        }
      }
      regexColored.sort()

      // Both modes should identify the same colored buttons
      expect(parserColored).toEqual(regexColored)
    }
  })

  /**
   * Fixture: Verify parser mode produces SVG segment alt-text in same order as legacy.
   * This is the core parity check for image/icon mode.
   */
  it.each(NOTATION_FIXTURES)('SVG alts match: $desc ($notation)', ({
    notation,
    profile: profileKey,
  }) => {
    const profile = profiles[profileKey]
    if (!profile) throw new Error(`Unknown profile: ${profileKey}`)

    // Parser mode: tokenize and extract SVG alt-texts
    const parserTokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
    const parserSegments = tokensToImageSegments(
      parserTokens,
      profile as Parameters<typeof tokensToImageSegments>[1],
    )
    // Expand repeat counts to match legacy renderer behaviour (repeat:2 = two icons)
    const parserAlts = parserSegments
      .filter((s) => s.kind === 'svg')
      .flatMap((s) => {
        const seg = s as { alt: string; repeat: number }
        return Array<string>(seg.repeat ?? 1).fill(seg.alt)
      })

    // Legacy regex mode: simulate image conversion
    const regexMotions = imageMap(profile)
    const regexAlts = []
    let pos = 0
    const text = notation

    while (pos < text.length) {
      let matched = false
      const isAfterX = pos > 0 && text[pos - 1].toLowerCase() === 'x'

      for (const [regex, config] of regexMotions) {
        regex.lastIndex = 0
        if (isAfterX) continue

        const match = regex.exec(text.substring(pos))
        if (!match || match.index !== 0) continue

        // For each SVG in imageMap, add its alt (accounting for repeat)
        const count = config.repeat || 1
        for (let i = 0; i < count; i++) {
          regexAlts.push(config.alt || '')
        }

        pos += match[0].length
        matched = true
        break
      }

      if (!matched) {
        pos++
      }
    }

    // Parity: both should have the same SVG alts in the same order
    expect(parserAlts).toEqual(regexAlts)
  })

  /**
   * Snapshot test: Verify specific real-world examples produce expected colored buttons.
   */
  describe('Colored button identification', () => {
    it('identifies all buttons in complex combo: 2A > 5B > 236C (ASW)', () => {
      const profile = profiles.asw
      const notation = '2A > 5B > 236C'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.colors) })
      const segments = tokensToColorSegments(
        tokens,
        profile as Parameters<typeof tokensToColorSegments>[1],
      )
      const colored = segments
        .filter((s) => s.kind === 'colored')
        .map((s) => (s as { input: string }).input)

      // Direction '2' directly precedes 'A' (no separator), inherits A's color.
      // Direction '5' directly precedes 'B', inherits B's color.
      // Motion '236' directly precedes 'C', inherits C's color.
      expect(colored).toEqual(['A', 'A', 'B', 'B', 'C', 'C'])
    })

    it('handles multi-char button profile: LP > MP > HP (TRD)', () => {
      const profile = profiles.trd
      const notation = 'LP > MP > HP'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.colors) })
      const segments = tokensToColorSegments(
        tokens,
        profile as Parameters<typeof tokensToColorSegments>[1],
      )
      const colored = segments
        .filter((s) => s.kind === 'colored')
        .map((s) => (s as { input: string }).input)

      expect(colored).toEqual(['LP', 'MP', 'HP'])
    })

    it('ignores buttons not in profile: A > X > B (ASW)', () => {
      const profile = profiles.asw
      const notation = 'A > X > B'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.colors) })
      const segments = tokensToColorSegments(
        tokens,
        profile as Parameters<typeof tokensToColorSegments>[1],
      )
      const colored = segments
        .filter((s) => s.kind === 'colored')
        .map((s) => (s as { input: string }).input)

      // Only A and B are in ASW profile; X is not
      expect(colored).toEqual(['A', 'B'])
    })
  })

  /**
   * Snapshot test: Verify specific real-world examples produce expected SVG sequence.
   */
  describe('SVG icon sequence', () => {
    it('maps numpad notation to correct SVG alts: 2A > 5B > 236C (ASW)', () => {
      const profile = profiles.asw
      const notation = '2A > 5B > 236C'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )
      const svgAlts = segments
        .filter((s) => s.kind === 'svg')
        .map((s) => (s as { alt: string }).alt)

      // Expected: Down(2), A, Neutral(5,empty), B, QCF(236), C
      expect(svgAlts).toEqual(['Down', 'A', '', 'B', 'QCF', 'C'])
    })

    it('handles motion-only notation: qcf > hcb > dp (ASW)', () => {
      const profile = profiles.asw
      const notation = 'qcf > hcb > dp'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )

      expect(svgAlts(segments)).toEqual(['QCF', 'HCB', 'DP'])
    })

    it('maps double-motion super: 236236A (ASW)', () => {
      const profile = profiles.asw
      const notation = '236236A'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )

      // double-qcf emits 2× QCF, then A button
      expect(svgAlts(segments)).toEqual(['QCF', 'QCF', 'A'])
    })

    it('maps double-motion super: 214214B (ASW)', () => {
      const profile = profiles.asw
      const notation = '214214B'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )

      expect(svgAlts(segments)).toEqual(['QCB', 'QCB', 'B'])
    })

    it('maps dash notation: 66A (ASW)', () => {
      const profile = profiles.asw
      const notation = '66A'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )

      // dash = 2× Forward icon, then A
      expect(svgAlts(segments)).toEqual(['Forward', 'Forward', 'A'])
    })

    it('maps back-dash notation: 44B (ASW)', () => {
      const profile = profiles.asw
      const notation = '44B'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )

      // backdash = 2× Back icon, then B
      expect(svgAlts(segments)).toEqual(['Back', 'Back', 'B'])
    })

    it('maps diagonal directions: 1A, 3B, 7C, 9D (ASW)', () => {
      const profile = profiles.asw

      const cases: Array<[string, string[]]> = [
        ['1A', ['DownBack', 'A']],
        ['3B', ['DownForward', 'B']],
        ['7C', ['UpBack', 'C']],
        ['9D', ['UpForward', 'D']],
      ]

      for (const [notation, expectedAlts] of cases) {
        const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
        const segments = tokensToImageSegments(
          tokens,
          profile as Parameters<typeof tokensToImageSegments>[1],
        )
        expect(svgAlts(segments)).toEqual(expectedAlts)
      }
    })

    it('maps all cardinal directions: 2, 4, 5, 6, 8 (ASW)', () => {
      const profile = profiles.asw

      const cases: Array<[string, string[]]> = [
        ['2A', ['Down', 'A']],
        ['4B', ['Back', 'B']],
        ['5C', ['', 'C']], // neutral = empty alt
        ['6D', ['Forward', 'D']],
        ['8A', ['Up', 'A']],
      ]

      for (const [notation, expectedAlts] of cases) {
        const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
        const segments = tokensToImageSegments(
          tokens,
          profile as Parameters<typeof tokensToImageSegments>[1],
        )
        expect(svgAlts(segments)).toEqual(expectedAlts)
      }
    })

    it('handles SF6-style 6-button multi-char combo: 236LP > 214HP', () => {
      const profile = profiles.sf
      const notation = '236LP > 214HP'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )

      expect(svgAlts(segments)).toEqual(['QCF', 'LP', 'QCB', 'HP'])
    })

    it('handles HCF and HCB motions (numpad)', () => {
      const profile = profiles.asw

      const tokens = parseNotation('41236A', { buttonInputs: Object.keys(profile.desc) })
      const segsHcf = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )
      expect(svgAlts(segsHcf)).toEqual(['HCF', 'A'])

      const tokens2 = parseNotation('63214B', { buttonInputs: Object.keys(profile.desc) })
      const segsHcb = tokensToImageSegments(
        tokens2,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )
      expect(svgAlts(segsHcb)).toEqual(['HCB', 'B'])
    })

    it('handles DP and RDP (numpad)', () => {
      const profile = profiles.asw

      const tokens = parseNotation('623C', { buttonInputs: Object.keys(profile.desc) })
      const segsDp = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )
      expect(svgAlts(segsDp)).toEqual(['DP', 'C'])

      const tokens2 = parseNotation('421D', { buttonInputs: Object.keys(profile.desc) })
      const segsRdp = tokensToImageSegments(
        tokens2,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )
      expect(svgAlts(segsRdp)).toEqual(['RDP', 'D'])
    })

    it('does not produce false-positive icons for comment text (feint, three)', () => {
      const profile = profiles.asw
      // 'feint' should not produce a Forward icon for 'f'
      // '(3)' should not produce a DownForward icon for '3'
      const notation = '22B (feint) > 236A(3)'

      const tokens = parseNotation(notation, { buttonInputs: Object.keys(profile.desc) })
      const segments = tokensToImageSegments(
        tokens,
        profile as Parameters<typeof tokensToImageSegments>[1],
      )

      // Should have: Down(22→repeat:2), B, QCF(236), A — no extra icons
      expect(svgAlts(segments)).toEqual(['Down', 'Down', 'B', 'QCF', 'A'])
    })
  })

  /**
   * Comprehensive property test: For all fixtures, verify that parser mode
   * produces a non-empty result whenever legacy regex mode does.
   */
  it('parser mode produces output for all regex-matched fixtures', () => {
    for (const { notation, profile: profileKey } of NOTATION_FIXTURES) {
      const profile = profiles[profileKey]
      if (!profile) continue

      // Legacy: check if any color pattern matches
      const regexPatterns = colorPatterns(profile as Parameters<typeof colorPatterns>[0])
      let regexFound = false
      for (const [pattern] of regexPatterns) {
        pattern.lastIndex = 0
        if (pattern.test(notation)) {
          regexFound = true
          break
        }
      }

      // Parser: check if any button is colored
      const parserTokens = parseNotation(notation, { buttonInputs: Object.keys(profile.colors) })
      const parserSegments = tokensToColorSegments(
        parserTokens,
        profile as Parameters<typeof tokensToColorSegments>[1],
      )
      const parserFound = parserSegments.some((s) => s.kind === 'colored')

      // If legacy found matches, parser should too (rough parity check)
      // Note: parser is stricter, so it may not match false-positive regex hits
      if (regexFound) {
        expect(parserFound).toBe(true)
      }
    }
  })
})
