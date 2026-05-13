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

  // First pass: identify which buttons will be colored
  const buttonsByIndex = new Map<number, string>()
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'button' && knownInputs.has(tokens[i].value)) {
      buttonsByIndex.set(i, tokens[i].value)
    }
  }

  // Second pass: generate segments, coloring motions/directions with following button color
  return tokens.map((token, index): RenderSegment => {
    // Button tokens are always colored if in profile
    if (token.type === 'button' && knownInputs.has(token.value)) {
      return { kind: 'colored', input: token.value, rawText: token.rawValue }
    }

    // Motion, direction, modifier, and joiner tokens all inherit color from the following button.
    // Joiners (. + ~) and modifiers (j. dj. etc.) are transparent in the look-ahead chain.
    // Modifiers and joiners can also pass through motion/direction tokens to find a button.
    // Separators (, > |> and spaces) always break the chain.
    if (
      (token.type === 'motion' ||
        token.type === 'direction' ||
        token.type === 'modifier' ||
        token.type === 'joiner') &&
      index < tokens.length - 1
    ) {
      // Look ahead for the next button, stopping at separators
      for (let i = index + 1; i < tokens.length; i++) {
        // Joiners and modifiers are transparent — skip past them
        if (tokens[i].type === 'joiner' || tokens[i].type === 'modifier') {
          continue
        }
        // Separators (and spaces) break the chain
        if (tokens[i].type === 'separator') {
          break
        }
        if (tokens[i].type === 'button' && knownInputs.has(tokens[i].value)) {
          return { kind: 'colored', input: tokens[i].value, rawText: token.rawValue }
        }
        // Motion/direction stops the chain only when looking from another motion/direction.
        // Modifiers and joiners can pass through to find a button beyond a direction.
        if (
          (token.type === 'motion' || token.type === 'direction') &&
          (tokens[i].type === 'motion' || tokens[i].type === 'direction')
        ) {
          break
        }
      }
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
