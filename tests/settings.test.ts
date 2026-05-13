import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, inputMap } from '../src/settings'

describe('settings defaults', () => {
  it('uses expected default selected profile and icon size', () => {
    expect(DEFAULT_SETTINGS.selectedProfile).toBe('asw')
    expect(DEFAULT_SETTINGS.iconSize).toBe('medium')
  })

  it('includes built-in profile ids', () => {
    expect(Object.keys(DEFAULT_SETTINGS.profiles).sort()).toEqual(['alt', 'asw', 'trd'])
  })

  it('ensures built-in profiles define matching desc and color keys', () => {
    for (const profile of Object.values(inputMap)) {
      const descKeys = Object.keys(profile.desc).sort()
      const colorKeys = Object.keys(profile.colors).sort()

      expect(colorKeys).toEqual(descKeys)
    }
  })
})
