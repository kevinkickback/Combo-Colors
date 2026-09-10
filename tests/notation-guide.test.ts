import { describe, expect, it } from 'vitest'
import { DIRECTION_GUIDE_ROWS, MODIFIER_GUIDE_ROWS, MOTION_GUIDE_ROWS } from '../src/notation-guide'
import {
  DIRECTION_DEFINITIONS,
  MODIFIER_DEFINITIONS,
  MOTION_DEFINITIONS,
} from '../src/notation-schema'

function aliasesFromDefinitions(
  definitions: ReadonlyArray<{ aliases: readonly string[] }>,
): string[] {
  return definitions.flatMap((definition) => definition.aliases)
}

function aliasesFromGuide(rows: ReadonlyArray<{ aliases: readonly string[] }>): string[] {
  return rows.flatMap((row) => row.aliases)
}

describe('notation guide', () => {
  it('documents every direction alias exposed by the parser schema', () => {
    expect(aliasesFromGuide(DIRECTION_GUIDE_ROWS)).toEqual(
      aliasesFromDefinitions(DIRECTION_DEFINITIONS),
    )
  })

  it('documents every motion alias exposed by the parser schema', () => {
    expect(aliasesFromGuide(MOTION_GUIDE_ROWS)).toEqual(aliasesFromDefinitions(MOTION_DEFINITIONS))
  })

  it('documents every modifier alias exposed by the parser schema', () => {
    expect(aliasesFromGuide(MODIFIER_GUIDE_ROWS)).toEqual(
      aliasesFromDefinitions(MODIFIER_DEFINITIONS),
    )
  })
})
