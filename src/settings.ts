import type { App, ColorComponent } from 'obsidian'
import { Notice, PluginSettingTab, Setting } from 'obsidian'
import { isSafeCssColor } from './color-validation'
import type comboColors from './main'
import { CustomProfileModal, DeleteProfileModal, InputsModal } from './modal'
import { validateProfileId } from './profile-validation'

export interface CustomProfile {
  name: string
  desc: Record<string, string>
  colors: Record<string, string>
  defaultColors?: Record<string, string>
  textColor?: string
}

export interface Settings {
  selectedProfile: string
  profiles: Record<string, CustomProfile>
  iconSize: 'small' | 'medium' | 'large'
  naturalLanguageNotation: boolean
  notationColorSettingsExpanded: boolean
}

export type InputMapType = Record<string, CustomProfile>

export const inputMap: InputMapType = {
  asw: {
    name: 'ASW Standard',
    desc: {
      A: 'Weak attack, weak punch',
      B: 'Strong attack, weak kick',
      C: 'Heavy attack, strong punch, clash',
      D: 'Strong kick, drive, dust, homing dash, change',
      E: 'Arcana, extra attack',
      K: 'Kick',
      P: 'Punch, partner',
      S: 'Slash, special',
      HS: 'Heavy slash',
      MS: 'MP skill',
      OD: 'Overdrive',
      RC: 'Rapid cancel, roman cancel',
      DRC: 'Drift roman cancel',
      YRC: 'Yellow roman cancel',
      BRC: 'Blue roman cancel',
      PRC: 'Purple roman cancel',
    },
    colors: {
      A: '#DE1616', // red
      B: '#1F8CCC', // blue
      C: '#009E4E', // green
      D: '#E8982C', // orange
      E: '#892CE8', // purple
      K: '#1F8CCC', // blue
      P: '#FF87D1', // pink
      S: '#009E4E', // green
      HS: '#DE1616', // red
      MS: '#E8982C', // orange
      OD: '#892CE8', // purple
      RC: '#DE1616', // red
      DRC: '#DE1616', // red
      BRC: '#1F8CCC', // blue
      YRC: '#E8982C', // orange
      PRC: '#892CE8', // purple
    },
  },
  alt: {
    name: 'Modern Alt',
    desc: {
      A: 'A button',
      B: 'B button',
      X: 'X button',
      Y: 'Y button',
      L: 'Light attack',
      M: 'Medium attack',
      H: 'Heavy attack',
      S: 'Special attack',
      U: 'Unique attack',
      A1: 'Assist 1',
      A2: 'Assist 2',
    },
    colors: {
      A: '#009E4E', // green
      B: '#DE1616', // red
      X: '#1F8CCC', // blue
      Y: '#E8982C', // orange
      L: '#1F8CCC', // blue
      M: '#E8982C', // orange
      H: '#DE1616', // red
      S: '#009E4E', // green
      U: '#FF87D1', // pink
      A1: '#892CE8', // purple
      A2: '#892CE8', // purple
    },
  },
  trd: {
    name: 'Traditional',
    desc: {
      P: 'Any punch',
      K: 'Any kick',
      LP: 'Light punch',
      MP: 'Medium punch',
      HP: 'Heavy punch',
      LK: 'Light kick',
      MK: 'Medium kick',
      HK: 'Heavy kick',
      DI: 'Drive impact',
      DR: 'Drive rush',
      VT: 'V-trigger',
      FA: 'Focus attack',
      PP: 'Perfect parry',
    },
    colors: {
      P: '#FF87D1', // pink
      K: '#892CE8', // purple
      LP: '#1F8CCC', // blue
      MP: '#E8982C', // orange
      HP: '#DE1616', // red
      LK: '#1F8CCC', // blue
      MK: '#E8982C', // orange
      HK: '#DE1616', // red
      DI: '#009E4E', // green
      DR: '#009E4E', // green
      VT: '#DE1616', // red
      FA: '#E8982C', // orange
      PP: '#1F8CCC', // blue
    },
  },
}

export function cloneProfile(profile: CustomProfile): CustomProfile {
  return {
    name: profile.name,
    desc: { ...profile.desc },
    colors: { ...profile.colors },
    defaultColors: profile.defaultColors ? { ...profile.defaultColors } : undefined,
    textColor: profile.textColor,
  }
}

export function cloneProfiles(
  profiles: Record<string, CustomProfile>,
): Record<string, CustomProfile> {
  const cloned: Record<string, CustomProfile> = {}
  for (const profileId of Object.keys(profiles)) {
    const profile = profiles[profileId]
    if (!profile) continue
    cloned[profileId] = cloneProfile(profile)
  }
  return cloned
}

export function createDefaultSettings(): Settings {
  return {
    selectedProfile: 'asw',
    profiles: cloneProfiles(inputMap),
    iconSize: 'medium',
    naturalLanguageNotation: false,
    notationColorSettingsExpanded: true,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {}

  const next: Record<string, string> = {}
  for (const [key, recordValue] of Object.entries(value)) {
    if (typeof recordValue === 'string') {
      next[key] = recordValue
    }
  }

  return next
}

function toColorRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {}

  const next: Record<string, string> = {}
  for (const [key, recordValue] of Object.entries(value)) {
    if (isSafeCssColor(recordValue)) {
      next[key] = recordValue.trim()
    }
  }

  return next
}

function mergeProfile(
  persistedProfile: unknown,
  fallbackProfile?: CustomProfile,
): CustomProfile | null {
  if (!isRecord(persistedProfile)) return null

  const persistedDesc = toStringRecord(persistedProfile.desc)
  const persistedColors = toColorRecord(persistedProfile.colors)
  const persistedDefaultColors = toColorRecord(persistedProfile.defaultColors)

  const base = fallbackProfile ? cloneProfile(fallbackProfile) : null

  return {
    name:
      typeof persistedProfile.name === 'string'
        ? persistedProfile.name
        : (base?.name ?? 'Custom profile'),
    desc: {
      ...(base?.desc ?? {}),
      ...persistedDesc,
    },
    colors: {
      ...(base?.colors ?? {}),
      ...persistedColors,
    },
    defaultColors:
      Object.keys(persistedDefaultColors).length > 0 || base?.defaultColors
        ? {
            ...(base?.defaultColors ?? {}),
            ...persistedDefaultColors,
          }
        : undefined,
    textColor: isSafeCssColor(persistedProfile.textColor)
      ? persistedProfile.textColor.trim()
      : base?.textColor,
  }
}

export function mergeSettingsWithDefaults(persistedSettings: unknown): Settings {
  const defaults = createDefaultSettings()
  if (!isRecord(persistedSettings)) return defaults

  const mergedProfiles = cloneProfiles(defaults.profiles)
  const persistedProfiles = isRecord(persistedSettings.profiles) ? persistedSettings.profiles : {}

  for (const [profileId, profileValue] of Object.entries(persistedProfiles)) {
    if (!validateProfileId(profileId).valid) continue

    const fallbackProfile = mergedProfiles[profileId]
    const mergedProfile = mergeProfile(profileValue, fallbackProfile)
    if (!mergedProfile) continue
    mergedProfiles[profileId] = mergedProfile
  }

  const selectedProfile =
    typeof persistedSettings.selectedProfile === 'string' &&
    Object.prototype.hasOwnProperty.call(mergedProfiles, persistedSettings.selectedProfile)
      ? persistedSettings.selectedProfile
      : defaults.selectedProfile

  const iconSize =
    persistedSettings.iconSize === 'small' ||
    persistedSettings.iconSize === 'medium' ||
    persistedSettings.iconSize === 'large'
      ? persistedSettings.iconSize
      : defaults.iconSize

  return {
    selectedProfile,
    profiles: mergedProfiles,
    iconSize,
    naturalLanguageNotation:
      typeof persistedSettings.naturalLanguageNotation === 'boolean'
        ? persistedSettings.naturalLanguageNotation
        : defaults.naturalLanguageNotation,
    notationColorSettingsExpanded:
      typeof persistedSettings.notationColorSettingsExpanded === 'boolean'
        ? persistedSettings.notationColorSettingsExpanded
        : defaults.notationColorSettingsExpanded,
  }
}

export const DEFAULT_SETTINGS: Settings = createDefaultSettings()

export function getProfileInputKeys(profile: CustomProfile): string[] {
  return Object.keys(profile.colors).filter((input) => input.trim().length > 0)
}

export class settingsTab extends PluginSettingTab {
  plugin: comboColors

  constructor(app: App, plugin: comboColors) {
    super(app, plugin)
    this.plugin = plugin
  }

  private createProfileSection(containerEl: HTMLElement): void {
    const profile = this.plugin.settings.selectedProfile
    const profileData = this.plugin.settings.profiles[profile]
    if (!profileData) {
      new Notice('Profile not found')
      return
    }

    new Setting(containerEl)
      .setName('Notation profile')
      .addButton((button) =>
        button.setIcon('plus').onClick(() => {
          new CustomProfileModal(this.app, async (profileId, profileName) => {
            const profileIdValidation = validateProfileId(profileId)
            if (!profileIdValidation.valid) {
              new Notice(profileIdValidation.message || 'Invalid profile ID')
              return
            }

            const normalizedProfileId = profileIdValidation.normalized

            if (normalizedProfileId in this.plugin.settings.profiles) {
              new Notice('Profile ID already exists')
              return
            }

            this.plugin.settings.profiles[normalizedProfileId] = {
              name: profileName,
              desc: {},
              colors: {},
              textColor: '#FFFFFF',
            }
            this.plugin.settings.selectedProfile = normalizedProfileId
            await this.plugin.saveSettings()
            this.display()
            new Notice('Custom profile created')
          }).open()
        }),
      )
      .addButton((button) =>
        button
          .setIcon('trash')
          .setWarning()
          .setDisabled(profile in inputMap)
          .onClick(() => {
            new DeleteProfileModal(this.app, profile, profileData.name, async () => {
              delete this.plugin.settings.profiles[profile]
              this.plugin.settings.selectedProfile = 'asw'
              await this.plugin.saveSettings()
              this.display()
              new Notice('Custom profile deleted')
            }).open()
          }),
      )
      .addDropdown((dropdown) => {
        for (const key in this.plugin.settings.profiles) {
          if (!Object.prototype.hasOwnProperty.call(this.plugin.settings.profiles, key)) continue
          const listedProfile = this.plugin.settings.profiles[key]
          dropdown.addOption(key, listedProfile.name)
        }
        dropdown.setValue(this.plugin.settings.selectedProfile).onChange(async (value) => {
          this.plugin.settings.selectedProfile = value
          await this.plugin.saveSettings()
          this.display()
        })
      })
      .setDesc(
        createFragment((frag) => {
          frag.appendText('To use this profile, add ')
          const span = frag.createSpan({
            text: `cc_profile: ${profile}`,
            cls: 'hlt-interaction',
          })
          span.addEventListener('click', () => {
            void navigator.clipboard
              .writeText(`cc_profile: ${profile}`)
              .then(() => {
                new Notice('Copied to clipboard')
              })
              .catch(() => {
                new Notice('Could not copy to clipboard')
              })
          })
          frag.appendText(" to the file's frontmatter")
        }),
      )

    new Setting(containerEl)
      .setName('Icon size')
      .setDesc('Set the size of notation icons')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('small', 'Small')
          .addOption('medium', 'Medium')
          .addOption('large', 'Large')
          .setValue(this.plugin.settings.iconSize)
          .onChange(async (value) => {
            if (value !== 'small' && value !== 'medium' && value !== 'large') return
            this.plugin.settings.iconSize = value
            await this.plugin.saveSettings()
            this.plugin.updateIconSizes()
          })
      })

    new Setting(containerEl)
      .setName('Allow natural language')
      .setDesc(
        'Use full-text phrases like "quarter circle forward" (Does NOT disable shorthand notation)',
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.naturalLanguageNotation).onChange(async (value) => {
          this.plugin.settings.naturalLanguageNotation = value
          await this.plugin.saveSettings()
          this.plugin.rerenderPreviewViews()
        })
      })

    new Setting(containerEl)
      .setName('Color settings')
      .setDesc('Customize the colors for notation text and icons')
      .addButton((button) => {
        const isExpanded = this.plugin.settings.notationColorSettingsExpanded
        return button
          .setIcon(isExpanded ? 'chevron-down' : 'chevron-right')
          .setTooltip(isExpanded ? 'Collapse color settings' : 'Expand color settings')
          .onClick(async () => {
            this.plugin.settings.notationColorSettingsExpanded = !isExpanded
            await this.plugin.saveSettings()
            this.display()
          })
      })

    if (!this.plugin.settings.notationColorSettingsExpanded) {
      return
    }

    const colorSection = containerEl.createDiv({ cls: 'color-settings-container' })

    new Setting(colorSection)
      .setName('Text color')
      .setDesc('Applies to all inputs below')
      .addButton((button) =>
        button
          .setIcon('reset')
          .setClass('clickable-icon')
          .setClass('extra-setting-button')
          .onClick(async () => {
            profileData.textColor = '#FFFFFF'
            await this.plugin.saveSettings()
            this.plugin.updateColorsForProfile(profile)
            this.display()
          }),
      )
      .addColorPicker((picker) => {
        picker.setValue(profileData.textColor || '#FFFFFF').onChange(async (value) => {
          profileData.textColor = value
          await this.plugin.saveSettings()
          this.plugin.updateColorsForProfile(profile)
        })
      })

    // Add individual color settings
    for (const input in profileData.desc) {
      if (!Object.prototype.hasOwnProperty.call(profileData.desc, input)) continue
      const desc = profileData.desc[input]
      let colorPicker: ColorComponent
      new Setting(colorSection)
        .setName(input)
        .setDesc(desc)
        .addButton((button) => {
          const defaultProfile = inputMap[profile]
          const defaultColor = defaultProfile?.colors?.[input] || profileData.defaultColors?.[input]

          return button
            .setIcon('reset')
            .setClass('clickable-icon')
            .setClass('extra-setting-button')
            .setDisabled(!defaultColor)
            .onClick(async () => {
              if (defaultColor) {
                profileData.colors[input] = defaultColor
                colorPicker.setValue(defaultColor)
                await this.plugin.saveSettings()
                this.plugin.updateColorsForProfile(profile)
              }
            })
        })
        .addColorPicker((picker) => {
          colorPicker = picker
          picker.setValue(profileData.colors[input] || '#000000').onChange(async (value) => {
            profileData.colors[input] = value
            await this.plugin.saveSettings()
            this.plugin.updateColorsForProfile(profile)
          })
        })
    }

    if (!(profile in inputMap)) {
      new Setting(colorSection).addButton((button) =>
        button.setButtonText('Edit inputs').onClick(() => {
          const existingInputs = []
          for (const name in profileData.desc) {
            if (!Object.prototype.hasOwnProperty.call(profileData.desc, name)) continue
            const description = profileData.desc[name]
            existingInputs.push({
              name,
              description,
              color: profileData.colors[name] || '#000000',
            })
          }

          new InputsModal(
            this.app,
            async (inputs) => {
              try {
                await this.plugin.saveProfileInputs(profile, inputs)
                this.display()
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Could not save inputs'
                new Notice(message)
              }
            },
            existingInputs,
          ).open()
        }),
      )
    }
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()
    this.createProfileSection(containerEl)
  }
}
