import type { ParserToken } from './parser'
import { canonicalMotionMap, generateButtonMap } from './patterns'
import type { CustomProfile } from './settings'

/**
 * A plain-text segment produced by the adapter. Contains the raw source
 * text that should be emitted verbatim (separators, modifiers, unknown tokens, etc.)
 */
export interface PlainSegment {
  kind: 'plain'
  text: string
}

/**
 * A colored-button segment. Maps to a CSS color span in the rendered output.
 * `input` is the profile button key (e.g. 'LP', 'A') used to derive the CSS class.
 * `rawText` is the source text as it appeared (may include brackets like '[A]').
 */
export interface ColorSegment {
  kind: 'colored'
  input: string
  rawText: string
}

/**
 * An SVG-icon segment. All fields map directly to what `createSvgElement` needs.
 * `repeat` mirrors motion config repeat counts (usually 1, 2 for doubled motions).
 */
export interface SvgSegment {
  kind: 'svg'
  source: string
  cssClass: string
  alt: string
  repeat: number
}

export type RenderSegment = PlainSegment | ColorSegment
export type ImageRenderSegment = PlainSegment | SvgSegment

/**
 * Converts a token list into render segments for text/color mode.
 *
 * Button tokens whose value matches a profile input become `ColorSegment`s.
 * Motion and direction tokens that precede a button inherit that button's color.
 * Separators and other tokens become `PlainSegment`s carrying the original raw text.
 */
export function tokensToColorSegments(
  tokens: ParserToken[],
  profile: CustomProfile,
): RenderSegment[] {
  const knownInputs = new Set(Object.keys(profile.colors))

  const resolveInheritedInput = (index: number): string | undefined => {
    const token = tokens[index]
    if (!token) return undefined

    if (token.type === 'button' && knownInputs.has(token.value)) {
      return token.value
    }

    if (
      token.type !== 'motion' &&
      token.type !== 'direction' &&
      token.type !== 'modifier' &&
      token.type !== 'joiner'
    ) {
      return undefined
    }

    // Look ahead for the next button, stopping at non-space separators.
    for (let i = index + 1; i < tokens.length; i++) {
      if (tokens[i].type === 'joiner' || tokens[i].type === 'modifier') {
        continue
      }

      if (tokens[i].type === 'separator') {
        if (tokens[i].rawValue === ' ') {
          continue
        }
        break
      }

      if (tokens[i].type === 'button' && knownInputs.has(tokens[i].value)) {
        return tokens[i].value
      }

      if (
        (token.type === 'motion' || token.type === 'direction') &&
        (tokens[i].type === 'motion' || tokens[i].type === 'direction')
      ) {
        break
      }
    }

    return undefined
  }

  const inheritedInputByIndex: Array<string | undefined> = tokens.map((_, index) =>
    resolveInheritedInput(index),
  )

  // Count annotations like (2) inherit the color of the immediately preceding
  // colored action token, but textual notes like (feint) remain plain.
  for (let start = 0; start < tokens.length; start++) {
    if (tokens[start].type !== 'repeat-start') continue

    let depth = 1
    let end = start + 1

    while (end < tokens.length && depth > 0) {
      if (tokens[end].type === 'repeat-start') depth += 1
      else if (tokens[end].type === 'repeat-end') depth -= 1
      end += 1
    }

    if (depth !== 0) continue

    const endIndex = end - 1
    const innerText = tokens
      .slice(start + 1, endIndex)
      .map((token) => token.rawValue)
      .join('')

    // Accept either a bare number (2), or a repeat-suffix form (x3, xN, *7, *N)
    if (!/^\s*\d+\s*$/.test(innerText) && !/^\s*[xX*][A-Za-z0-9]+\s*$/.test(innerText)) {
      continue
    }

    const previousToken = tokens[start - 1]
    if (!previousToken || previousToken.type === 'separator') {
      continue
    }

    const inheritedInput = inheritedInputByIndex[start - 1]
    if (!inheritedInput) {
      continue
    }

    for (let i = start; i <= endIndex; i++) {
      inheritedInputByIndex[i] = inheritedInput
    }
  }

  // Repeat suffixes like x7, xN, *7, *N inherit color when they are
  // directly attached to an already-colored action token (e.g. 236Cx7).
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.type !== 'unknown' || !/^[xX*]$/.test(token.rawValue)) {
      continue
    }

    const inheritedInput = inheritedInputByIndex[index - 1]
    const previousToken = tokens[index - 1]
    if (!inheritedInput || !previousToken || previousToken.type === 'separator') {
      continue
    }

    let cursor = index + 1
    while (
      cursor < tokens.length &&
      tokens[cursor].type === 'unknown' &&
      /^[A-Za-z0-9]$/.test(tokens[cursor].rawValue)
    ) {
      cursor += 1
    }

    if (cursor === index + 1) {
      continue
    }

    for (let i = index; i < cursor; i++) {
      inheritedInputByIndex[i] = inheritedInput
    }

    index = cursor - 1
  }

  // Second pass: generate segments, coloring motions/directions with following button color
  return tokens.map((token, index): RenderSegment => {
    const inheritedInput = inheritedInputByIndex[index]
    if (inheritedInput) {
      return { kind: 'colored', input: inheritedInput, rawText: token.rawValue }
    }

    // Everything else (separators, modifiers, unknown, etc.) becomes plain text
    return { kind: 'plain', text: token.rawValue }
  })
}

/**
 * Converts a token list into render segments for image/icon mode.
 *
 * Motion and direction tokens are looked up in the canonical SVG map.
 * Button tokens are looked up in the profile button map.
 * Structural tokens (repeat-start, repeat-end) are dropped — the icon
 * renderer does not need grouping markers.
 * Everything else becomes a `PlainSegment`.
 */
export function tokensToImageSegments(
  tokens: ParserToken[],
  profile: CustomProfile,
): ImageRenderSegment[] {
  const motionLookup = canonicalMotionMap()

  // Build button lookup keyed by alt string (which equals the button input key)
  const buttonLookup = new Map<string, SvgSegment>()
  for (const [, config] of generateButtonMap(profile)) {
    buttonLookup.set(config.alt, {
      kind: 'svg',
      source: config.source,
      cssClass: config.class,
      alt: config.alt,
      repeat: 1,
    })
  }

  const segments: ImageRenderSegment[] = []

  for (const token of tokens) {
    if (token.type === 'repeat-start' || token.type === 'repeat-end') {
      // Structural grouping markers are transparent in image mode
      continue
    }

    if (token.type === 'motion' || token.type === 'direction') {
      const config = motionLookup.get(token.value)
      if (config) {
        segments.push({
          kind: 'svg',
          source: config.source,
          cssClass: config.class,
          alt: config.alt,
          repeat: config.repeat ?? 1,
        })
        continue
      }
    }

    if (token.type === 'button') {
      const seg = buttonLookup.get(token.value)
      if (seg) {
        segments.push(seg)
        continue
      }
    }

    // '.' joiners are syntactic connectors in traditional notation (qcf.A, cr.LP).
    // They are not rendered in image mode; '+' and '~' remain visible.
    // '+' and '~' are kept — they carry semantic meaning (simultaneous / kara).
    if (token.type === 'joiner' && token.rawValue === '.') continue

    segments.push({ kind: 'plain', text: token.rawValue })
  }

  return segments
}
