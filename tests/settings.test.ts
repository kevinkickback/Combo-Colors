import { describe, expect, it } from 'vitest'
import {
  createDefaultSettings,
  DEFAULT_SETTINGS,
  getProfileInputKeys,
  inputMap,
  mergeSettingsWithDefaults,
} from '../src/settings'

describe('settings defaults', () => {
  it('uses expected default selected profile and icon size', () => {
    expect(DEFAULT_SETTINGS.selectedProfile).toBe('asw')
    expect(DEFAULT_SETTINGS.iconSize).toBe('medium')
    expect(DEFAULT_SETTINGS.naturalLanguageNotation).toBe(false)
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

  it('returns canonical profile input keys from color definitions', () => {
    const inputs = getProfileInputKeys({
      name: 'Test',
      desc: {
        A: 'Attack',
        MissingColor: 'Uncolored token',
      },
      colors: {
        A: '#ffffff',
        '': '#000000',
      },
    })

    expect(inputs).toEqual(['A'])
  })

  it('creates default settings with isolated nested profile objects', () => {
    const defaults = createDefaultSettings()
    defaults.profiles.asw.colors.A = '#000000'

    expect(inputMap.asw.colors.A).toBe('#DE1616')
  })

  it('merges persisted settings into fresh defaults without mutating canonical defaults', () => {
    const merged = mergeSettingsWithDefaults({
      selectedProfile: 'asw',
      profiles: {
        asw: {
          colors: {
            A: '#123456',
          },
        },
      },
      iconSize: 'small',
    })

    expect(merged.iconSize).toBe('small')
    expect(merged.profiles.asw.colors.A).toBe('#123456')
    expect(DEFAULT_SETTINGS.profiles.asw.colors.A).toBe('#DE1616')
  })

  it('ignores invalid profile ids from persisted settings', () => {
    const merged = mergeSettingsWithDefaults({
      selectedProfile: '__proto__',
      profiles: {
        __proto__: {
          name: 'Bad',
          desc: { A: 'Bad' },
          colors: { A: '#123456' },
        },
        custom_1: {
          name: 'Safe',
          desc: { A: 'Attack' },
          colors: { A: '#123456' },
        },
      },
    })

    expect(Object.keys(merged.profiles)).not.toContain('__proto__')
    expect(merged.profiles.custom_1?.name).toBe('Safe')
    expect(merged.selectedProfile).toBe('asw')
  })

  it('filters invalid persisted colors and falls back for textColor', () => {
    const merged = mergeSettingsWithDefaults({
      profiles: {
        asw: {
          colors: {
            A: 'javascript:alert(1)',
            B: '#123456',
          },
          textColor: 'invalid-color-value',
        },
      },
    })

    expect(merged.profiles.asw.colors.A).toBe('#DE1616')
    expect(merged.profiles.asw.colors.B).toBe('#123456')
    expect(merged.profiles.asw.textColor).toBeUndefined()
  })
})
