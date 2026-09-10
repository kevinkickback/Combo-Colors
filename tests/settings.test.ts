import { describe, expect, it } from 'vitest'
import {
  createDefaultSettings,
  DEFAULT_SETTINGS,
  getProfileInputKeys,
  getReleaseDate,
  inputMap,
  mergeSettingsWithDefaults,
  settingsTab,
} from '../src/settings'

interface TestSettingDefinition {
  type?: string
  heading?: string
  name?: string
  items?: TestSettingDefinition[]
}

function collectDefinitionNames(items: TestSettingDefinition[]): string[] {
  return items.flatMap((item) => [
    ...(item.name ? [item.name] : []),
    ...(item.items ? collectDefinitionNames(item.items) : []),
  ])
}

describe('settings defaults', () => {
  it('uses expected default selected profile and icon size', () => {
    expect(DEFAULT_SETTINGS.selectedProfile).toBe('asw')
    expect(DEFAULT_SETTINGS.iconSize).toBe('medium')
    expect(DEFAULT_SETTINGS.motionIconStyle).toBe('joystick')
  })

  it('includes built-in profile ids', () => {
    expect(Object.keys(DEFAULT_SETTINGS.profiles).sort()).toEqual(['alt', 'asw', 'trd'])
  })

  it('exposes settings to the Obsidian 1.13 settings search', () => {
    const tab = Object.assign(Object.create(settingsTab.prototype), {
      plugin: {
        settings: createDefaultSettings(),
        manifest: {
          version: '1.4.2',
          author: 'Kevin Kickback',
          minAppVersion: '1.13.1',
          description: 'Automatically apply color to fighting game combo notations.',
        },
      },
    }) as settingsTab
    const definitions = tab.getSettingDefinitions() as unknown as TestSettingDefinition[]
    const names = collectDefinitionNames(definitions)

    expect(names).toEqual(
      expect.arrayContaining([
        'Icon size',
        'Motion icon style',
        'Reset settings',
        'Profiles',
        'Active profile',
        'Colors',
        'Text color',
        'A',
        'About',
        'Plugin information',
        'Notation guide',
      ]),
    )
    expect(names).not.toContain('Project repository')
    expect(definitions[definitions.length - 1]).toMatchObject({
      type: 'group',
      heading: 'Maintenance',
    })
  })

  it('does not add a duplicate delete row for custom profiles', () => {
    const settings = createDefaultSettings()
    settings.profiles.custom_1 = {
      name: 'Custom profile',
      desc: {},
      colors: {},
      textColor: '#FFFFFF',
    }
    settings.selectedProfile = 'custom_1'
    const tab = Object.assign(Object.create(settingsTab.prototype), {
      plugin: {
        settings,
        manifest: {
          version: '1.4.2',
          author: 'Kevin Kickback',
          minAppVersion: '1.13.1',
          description: 'Automatically apply color to fighting game combo notations.',
        },
      },
    }) as settingsTab

    const names = collectDefinitionNames(
      tab.getSettingDefinitions() as unknown as TestSettingDefinition[],
    )

    expect(names).toContain('Profile inputs')
    expect(names).not.toContain('Create profile')
    expect(names).not.toContain('Delete profile')
  })

  it('provides the published release date for the current manifest version', () => {
    expect(getReleaseDate('1.4.2')).toBe('September 10, 2026')
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
