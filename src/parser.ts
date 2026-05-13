import { DIRECTION_DEFINITIONS, MODIFIER_DEFINITIONS, MOTION_DEFINITIONS } from './notation-schema'

export type ParserTokenType =
  | 'direction'
  | 'motion'
  | 'button'
  | 'separator'
  | 'joiner'
  | 'modifier'
  | 'repeat-start'
  | 'repeat-end'
  | 'unknown'

export interface ParserToken {
  type: ParserTokenType
  value: string
  rawValue: string
  repeatCount?: number
  repeatLabel?: string
}

export interface ParserOptions {
  buttonInputs?: string[]
  allowNaturalLanguageNotation?: boolean
}

const WORD_CHAR = /[A-Za-z0-9_]/
const DIGIT_OR_DOT = /[0-9.]/

// Separators mark transitions between distinct actions (chain, link, land, etc.)
const SEPARATORS = new Set([',', '>', '|>'])
// Joiners bind elements into a single combined input (qcf.LP, 6A+B, 236A~A)
const JOINERS = new Set(['.', '+', '~'])

function createSortedAliasEntries<
  T extends {
    value: string
    aliases: readonly string[]
    naturalLanguageAliases?: readonly string[]
  },
>(
  definitions: readonly T[],
  includeNaturalLanguageAliases: boolean,
): Array<{ alias: string; value: string }> {
  return definitions
    .flatMap((definition) => {
      const aliases = [...definition.aliases]
      if (includeNaturalLanguageAliases && 'naturalLanguageAliases' in definition) {
        aliases.push(...(definition.naturalLanguageAliases ?? []))
      }

      return aliases.map((alias) => ({ alias: alias.toLowerCase(), value: definition.value }))
    })
    .sort((left, right) => right.alias.length - left.alias.length)
}

function isWordCharacter(char: string | undefined): boolean {
  return typeof char === 'string' && WORD_CHAR.test(char)
}

function hasNumericBoundary(input: string, start: number, length: number): boolean {
  const before = input[start - 1]
  const after = input[start + length]
  return !isWordCharacter(before) && !(typeof after === 'string' && DIGIT_OR_DOT.test(after))
}

function isIsolatedNumericAlias(input: string, start: number, aliasLength: number): boolean {
  // Check if a single-digit numeric alias is isolated (likely a repeat count or comment)
  // Examples: "(3)" should skip, but "(4B)" should allow
  if (aliasLength !== 1) return false
  if (!/[0-9]/.test(input[start])) return false

  const before = input[start - 1]
  const after = input[start + aliasLength]

  // If before is '(' and after is ')', it's isolated: "(3)"
  if (before === '(' && after === ')') return true

  // If before is '(' and after is whitespace followed by ')', it's isolated: "( 3 )"
  if (before === '(') {
    let i = start + 1
    while (i < input.length && /\s/.test(input[i])) i += 1
    if (input[i] === ')') return true
  }

  // Otherwise it's not isolated, allow normal parsing: "(3A)", "(3B)"
  return false
}

function hasAliasBoundary(input: string, start: number, length: number, alias: string): boolean {
  const before = input[start - 1]
  const after = input[start + length]
  const isNumericAlias = /^[0-9]+$/.test(alias)

  // Skip isolated single-digit aliases like "(3)" that are likely repeat counts
  if (isIsolatedNumericAlias(input, start, length)) {
    return false
  }

  // For numeric aliases (directions and motions like '1-9', '236', '214'),
  // allow word characters after them so buttons can follow directly (e.g., 4B, 236A)
  if (isNumericAlias) {
    return true
  }

  // For single-character non-numeric aliases (like 'f' for forward, 'b' for back),
  // require word boundaries on BOTH sides to avoid matching inside words like "feint"
  if (length === 1) {
    const beforeOk = typeof before !== 'string' || !isWordCharacter(before)
    const afterOk = typeof after !== 'string' || !isWordCharacter(after)
    return beforeOk && afterOk
  }

  // For multi-character aliases (like 'qcf', 'dp'), only check the before boundary
  if (!isWordCharacter(before)) {
    return true
  }

  if (/[^A-Za-z0-9_]$/.test(alias)) {
    return false
  }

  return !isWordCharacter(after)
}

function hasButtonBoundaries(input: string, start: number, length: number): boolean {
  const before = input[start - 1]
  const after = input[start + length]
  const beforeIsAllowed =
    typeof before !== 'string' || !isWordCharacter(before) || /[0-9]/.test(before)
  // Allow 'x' and '*' after buttons for repeat patterns (e.g., Bx5, LP*N)
  const afterIsAllowed = !isWordCharacter(after) || /[x*]/.test(after)
  return beforeIsAllowed && afterIsAllowed
}

function consumeRepeatSuffix(
  input: string,
  index: number,
): { repeatCount?: number; repeatLabel?: string; length: number } | null {
  let cursor = index
  while (cursor < input.length && /\s/.test(input[cursor])) {
    cursor += 1
  }

  const marker = input[cursor]
  if (marker !== 'x' && marker !== '*') return null

  let end = cursor + 1
  while (end < input.length && /[A-Za-z0-9]/.test(input[end])) {
    end += 1
  }

  if (end === cursor + 1) return null

  const rawValue = input.slice(cursor, end)
  const suffix = input.slice(cursor + 1, end)
  const parsedCount = Number.parseInt(suffix, 10)

  return {
    repeatCount: Number.isNaN(parsedCount) ? undefined : parsedCount,
    repeatLabel: rawValue,
    length: end - index,
  }
}

function consumeBracketedButton(
  input: string,
  index: number,
  buttonInputs: Set<string>,
): { token: ParserToken; length: number } | null {
  if (input[index] !== '[') return null

  const closeIndex = input.indexOf(']', index + 1)
  if (closeIndex < 0) return null

  const rawValue = input.slice(index, closeIndex + 1)
  const value = input.slice(index + 1, closeIndex)

  if (!buttonInputs.has(value)) return null

  return {
    token: {
      type: 'button',
      value,
      rawValue,
    },
    length: rawValue.length,
  }
}

function consumeAlias(
  inputLower: string,
  input: string,
  index: number,
  aliases: Array<{ alias: string; value: string }>,
  tokenType: 'motion' | 'direction',
): { token: ParserToken; length: number } | null {
  for (const aliasEntry of aliases) {
    const alias = aliasEntry.alias
    if (!inputLower.startsWith(alias, index)) continue

    const rawValue = input.slice(index, index + alias.length)
    const isNumericAlias = /^[0-9]+$/.test(alias)

    if (isNumericAlias) {
      if (!hasNumericBoundary(input, index, alias.length)) continue
    }

    if (!hasAliasBoundary(input, index, alias.length, alias)) {
      continue
    }

    return {
      token: {
        type: tokenType,
        value: aliasEntry.value,
        rawValue,
      },
      length: alias.length,
    }
  }

  return null
}

function consumeButton(
  input: string,
  index: number,
  buttonInputs: string[],
): { token: ParserToken; length: number } | null {
  for (const buttonInput of buttonInputs) {
    if (!buttonInput) continue
    if (!input.startsWith(buttonInput, index)) continue
    if (!hasButtonBoundaries(input, index, buttonInput.length)) continue

    return {
      token: {
        type: 'button',
        value: buttonInput,
        rawValue: buttonInput,
      },
      length: buttonInput.length,
    }
  }

  return null
}

function consumeModifier(
  input: string,
  index: number,
  aliases: Array<{ alias: string; value: string }>,
): { token: ParserToken; length: number } | null {
  for (const aliasEntry of aliases) {
    const alias = aliasEntry.alias
    if (!input.toLowerCase().startsWith(alias, index)) continue
    if (!hasAliasBoundary(input, index, alias.length, alias)) continue
    return {
      token: {
        type: 'modifier',
        value: aliasEntry.value,
        rawValue: input.slice(index, index + alias.length),
      },
      length: alias.length,
    }
  }

  return null
}

export function parseNotation(input: string, options: ParserOptions = {}): ParserToken[] {
  const tokens: ParserToken[] = []
  const buttonInputs = options.buttonInputs ?? []
  const allowNaturalLanguageNotation = options.allowNaturalLanguageNotation ?? false
  const buttonInputSet = new Set(buttonInputs)
  const sortedButtonInputs = [...buttonInputs].sort((left, right) => right.length - left.length)
  const inputLower = input.toLowerCase()

  const motionAliasEntries = createSortedAliasEntries(
    MOTION_DEFINITIONS,
    allowNaturalLanguageNotation,
  )
  const directionAliasEntries = createSortedAliasEntries(
    DIRECTION_DEFINITIONS,
    allowNaturalLanguageNotation,
  )
  const modifierAliasEntries = createSortedAliasEntries(
    MODIFIER_DEFINITIONS,
    allowNaturalLanguageNotation,
  )

  let index = 0
  while (index < input.length) {
    const char = input[index]

    if (/\s/.test(char)) {
      // Emit space as a separator token to preserve spacing in output
      tokens.push({ type: 'separator', value: ' ', rawValue: char })
      index += 1
      continue
    }

    if (char === '(') {
      tokens.push({ type: 'repeat-start', value: '(', rawValue: '(' })
      index += 1
      continue
    }

    if (char === ')') {
      const repeatSuffix = consumeRepeatSuffix(input, index + 1)
      tokens.push(
        repeatSuffix
          ? {
              type: 'repeat-end',
              value: ')',
              rawValue: ')',
              repeatCount: repeatSuffix.repeatCount,
              repeatLabel: repeatSuffix.repeatLabel,
            }
          : { type: 'repeat-end', value: ')', rawValue: ')' },
      )
      index += repeatSuffix ? repeatSuffix.length + 1 : 1
      continue
    }

    if (char === '|' && input[index + 1] === '>') {
      tokens.push({ type: 'separator', value: '|>', rawValue: '|>' })
      index += 2
      continue
    }

    if (SEPARATORS.has(char)) {
      tokens.push({ type: 'separator', value: char, rawValue: char })
      index += 1
      continue
    }

    if (JOINERS.has(char)) {
      tokens.push({ type: 'joiner', value: char, rawValue: char })
      index += 1
      continue
    }

    const bracketedButton = consumeBracketedButton(input, index, buttonInputSet)
    if (bracketedButton) {
      tokens.push(bracketedButton.token)
      index += bracketedButton.length
      continue
    }

    const modifier = consumeModifier(input, index, modifierAliasEntries)
    if (modifier) {
      tokens.push(modifier.token)
      index += modifier.length
      continue
    }

    const motion = consumeAlias(inputLower, input, index, motionAliasEntries, 'motion')
    if (motion) {
      tokens.push(motion.token)
      index += motion.length
      continue
    }

    // Buttons are checked before single-char direction aliases so that configured
    // profile inputs (e.g. 'B') are not shadowed by direction aliases (e.g. 'b' = back).
    const button = consumeButton(input, index, sortedButtonInputs)
    if (button) {
      tokens.push(button.token)
      index += button.length
      continue
    }

    const direction = consumeAlias(inputLower, input, index, directionAliasEntries, 'direction')
    if (direction) {
      tokens.push(direction.token)
      index += direction.length
      continue
    }

    tokens.push({
      type: 'unknown',
      value: char,
      rawValue: char,
    })
    index += 1
  }

  return tokens
}
