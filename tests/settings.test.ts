import { describe, expect, it } from 'vitest'
import {
  createDefaultSettings,
  DEFAULT_SETTINGS,
  getProfileInputKeys,
  getReleaseDate,
  inputMap,
  mergeSettingsWithDefaults,
} from '../src/settings'

describe('settings defaults', () => {
  it('uses expected default selected profile and icon size', () => {
    expect(DEFAULT_SETTINGS.selectedProfile).toBe('asw')
    expect(DEFAULT_SETTINGS.iconSize).toBe('medium')
    expect(DEFAULT_SETTINGS.motionIconStyle).toBe('joystick')
    expect(DEFAULT_SETTINGS.settingsLayout).toBe('tabs')
  })

  it('includes built-in profile ids', () => {
    expect(Object.keys(DEFAULT_SETTINGS.profiles).sort()).toEqual(['alt', 'asw', 'trd'])
  })

  it('provides the published release date for the current manifest version', () => {
    expect(getReleaseDate('1.4.1')).toBe('September 10, 2026')
    expect(getReleaseDate('1.3.4')).toBe('May 29, 2026')
    expect(getReleaseDate('unreleased')).toBeUndefined()
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

  it('persists valid motion icon styles and defaults missing or invalid values', () => {
    expect(mergeSettingsWithDefaults({ motionIconStyle: 'arrows' }).motionIconStyle).toBe('arrows')
    expect(mergeSettingsWithDefaults({}).motionIconStyle).toBe('joystick')
    expect(mergeSettingsWithDefaults({ motionIconStyle: 'invalid' }).motionIconStyle).toBe(
      'joystick',
    )
  })

  it('persists valid settings layouts and defaults missing or invalid values', () => {
    expect(mergeSettingsWithDefaults({ settingsLayout: 'list' }).settingsLayout).toBe('list')
    expect(mergeSettingsWithDefaults({}).settingsLayout).toBe('tabs')
    expect(mergeSettingsWithDefaults({ settingsLayout: 'invalid' }).settingsLayout).toBe('tabs')
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

  it('discards reserved input keys from manually edited persisted data', () => {
    const persisted = JSON.parse(`{
      "profiles": {
        "custom_1": {
          "name": "Safe",
          "desc": { "__proto__": "Bad", "A": "Attack" },
          "colors": { "constructor": "#000000", "A": "#123456" }
        }
      }
    }`)
    const profile = mergeSettingsWithDefaults(persisted).profiles.custom_1

    expect(Object.prototype.hasOwnProperty.call(profile.desc, '__proto__')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(profile.colors, 'constructor')).toBe(false)
    expect(profile.desc.A).toBe('Attack')
    expect(profile.colors.A).toBe('#123456')
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
