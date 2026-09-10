import type { App, ColorComponent, SettingDefinitionItem, SettingGroupItem } from 'obsidian'
import { Notice, PluginSettingTab } from 'obsidian'
import type comboColors from './main'
import { CustomProfileModal, DeleteProfileModal, InputsModal, ResetSettingsModal } from './modal'
import { isReservedRecordKey, isSafeCssColor, validateProfileId } from './validation'

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
  motionIconStyle: MotionIconStyle
}

export type MotionIconStyle = 'joystick' | 'arrows'

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
  for (const [profileId, profile] of Object.entries(profiles)) {
    cloned[profileId] = cloneProfile(profile)
  }
  return cloned
}

export function createDefaultSettings(): Settings {
  return {
    selectedProfile: 'asw',
    profiles: cloneProfiles(inputMap),
    iconSize: 'medium',
    motionIconStyle: 'joystick',
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {}

  const next: Record<string, string> = {}
  for (const [key, recordValue] of Object.entries(value)) {
    if (!isReservedRecordKey(key) && typeof recordValue === 'string') {
      next[key] = recordValue
    }
  }

  return next
}

function toColorRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {}

  const next: Record<string, string> = {}
  for (const [key, recordValue] of Object.entries(value)) {
    if (!isReservedRecordKey(key) && isSafeCssColor(recordValue)) {
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
    motionIconStyle:
      persistedSettings.motionIconStyle === 'joystick' ||
      persistedSettings.motionIconStyle === 'arrows'
        ? persistedSettings.motionIconStyle
        : defaults.motionIconStyle,
  }
}

export const DEFAULT_SETTINGS: Settings = createDefaultSettings()

const RELEASE_DATES: Readonly<Record<string, string>> = {
  '1.4.2': 'September 10, 2026',
  '1.4.1': 'September 10, 2026',
  '1.3.4': 'May 29, 2026',
}

export function getReleaseDate(version: string): string | undefined {
  return RELEASE_DATES[version]
}

export function getProfileInputKeys(profile: CustomProfile): string[] {
  return Object.keys(profile.colors).filter((input) => input.trim().length > 0)
}

export class settingsTab extends PluginSettingTab {
  plugin: comboColors

  constructor(app: App, plugin: comboColors) {
    super(app, plugin)
    this.plugin = plugin
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    const profileId = this.plugin.settings.selectedProfile
    const profileData = this.plugin.settings.profiles[profileId]
    const profileItems: SettingDefinitionItem[] = [
      {
        name: 'Active profile',
        desc: `Choose the profile to configure. Add cc_profile: ${profileId} to file properties.`,
        aliases: ['create profile', 'delete profile', 'profile management'],
        render: (setting) => {
          const canDeleteProfile = Boolean(profileData && !(profileId in inputMap))

          setting
            .setDesc(
              createFragment((fragment) => {
                fragment.appendText('Choose the profile to configure. Add ')
                fragment.createEl('code', {
                  text: `cc_profile: ${profileId}`,
                  cls: 'cc-profile-property',
                })
                fragment.appendText(' to file properties.')
              }),
            )
            .addDropdown((dropdown) => {
              for (const [listedProfileId, listedProfile] of Object.entries(
                this.plugin.settings.profiles,
              )) {
                dropdown.addOption(listedProfileId, listedProfile.name)
              }
              dropdown.setValue(profileId).onChange(async (value) => {
                this.plugin.settings.selectedProfile = value
                await this.plugin.saveSettings()
                this.update()
              })
            })
            .addButton((button) =>
              button
                .setIcon('plus')
                .setTooltip('Create profile')
                .onClick(() => this.openCreateProfileModal()),
            )
            .addButton((button) => {
              button
                .setIcon('trash')
                .setTooltip(
                  profileId in inputMap ? 'Built-in profiles cannot be deleted' : 'Delete profile',
                )
                .setDisabled(!canDeleteProfile)
                .onClick(() => {
                  if (canDeleteProfile && profileData) {
                    this.openDeleteProfileModal(profileId, profileData.name)
                  }
                })

              if (canDeleteProfile) button.setDestructive()
            })
        },
      },
    ]

    if (profileData && !(profileId in inputMap)) {
      profileItems.push({
        name: 'Profile inputs',
        desc: 'Add, edit, or remove notation tokens',
        render: (setting) => {
          setting.addButton((button) =>
            button.setButtonText('Manage').onClick(() => {
              const existingInputs = Object.entries(profileData.desc).map(
                ([name, description]) => ({
                  name,
                  description,
                  color: profileData.colors[name] || '#000000',
                }),
              )

              new InputsModal(
                this.app,
                async (inputs) => {
                  try {
                    await this.plugin.saveProfileInputs(profileId, inputs)
                    this.update()
                  } catch (error) {
                    const message = error instanceof Error ? error.message : 'Could not save inputs'
                    new Notice(message)
                  }
                },
                existingInputs,
              ).open()
            }),
          )
        },
      })
    }

    if (profileData) {
      const colorItems: SettingGroupItem[] = [
        {
          name: 'Text color',
          desc: 'Applies to every input in this profile',
          aliases: ['notation color'],
          render: (setting) => {
            setting
              .addButton((button) =>
                button
                  .setIcon('reset')
                  .setTooltip('Reset text color')
                  .onClick(async () => {
                    profileData.textColor = '#FFFFFF'
                    await this.plugin.saveSettings()
                    this.plugin.rerenderPreviewViews({ profileId })
                    this.update()
                  }),
              )
              .addColorPicker((picker) => {
                picker.setValue(profileData.textColor || '#FFFFFF').onChange(async (value) => {
                  profileData.textColor = value
                  await this.plugin.saveSettings()
                  this.plugin.rerenderPreviewViews({ profileId })
                })
              })
          },
        },
      ]

      for (const [input, description] of Object.entries(profileData.desc)) {
        colorItems.push({
          name: input,
          desc: description,
          aliases: [`${input} color`, 'input color'],
          render: (setting) => {
            let colorPicker: ColorComponent
            setting
              .addButton((button) => {
                const defaultProfile = inputMap[profileId]
                const defaultColor =
                  defaultProfile?.colors?.[input] || profileData.defaultColors?.[input]

                return button
                  .setIcon('reset')
                  .setTooltip(`Reset ${input} color`)
                  .setDisabled(!defaultColor)
                  .onClick(async () => {
                    if (!defaultColor) return
                    profileData.colors[input] = defaultColor
                    colorPicker.setValue(defaultColor)
                    await this.plugin.saveSettings()
                    this.plugin.rerenderPreviewViews({ profileId })
                  })
              })
              .addColorPicker((picker) => {
                colorPicker = picker
                picker.setValue(profileData.colors[input] || '#000000').onChange(async (value) => {
                  profileData.colors[input] = value
                  await this.plugin.saveSettings()
                  this.plugin.rerenderPreviewViews({ profileId })
                })
              })
          },
        })
      }

      profileItems.push({
        type: 'page',
        name: 'Colors',
        desc: `Customize notation colors for ${profileData.name}`,
        items: colorItems,
      })
    }

    const releaseDate = getReleaseDate(this.plugin.manifest.version)
    const pluginInfoLines = [
      {
        label: 'Version',
        value: this.plugin.manifest.version,
      },
    ]

    if (releaseDate) {
      pluginInfoLines.push({
        label: 'Released',
        value: releaseDate,
      })
    }

    pluginInfoLines.push(
      {
        label: 'Author',
        value: this.plugin.manifest.author,
      },
      {
        label: 'Compatibility',
        value: `Obsidian ${this.plugin.manifest.minAppVersion} or later`,
      },
      {
        label: 'License',
        value: 'MIT',
      },
      {
        label: 'Description',
        value: this.plugin.manifest.description,
      },
    )

    const aboutItems: SettingDefinitionItem[] = [
      {
        name: 'Plugin information',
        desc: pluginInfoLines.map(({ label, value }) => `${label}: ${value}`).join(' — '),
        render: (setting) => {
          setting.setDesc(
            createFragment((fragment) => {
              for (const { label, value } of pluginInfoLines) {
                const line = fragment.createDiv({ cls: 'cc-about-info-line' })
                line.createSpan({ text: `${label}: `, cls: 'cc-about-info-label' })
                line.appendText(value)
              }
            }),
          )
        },
      },
      {
        name: 'Notation guide',
        desc: 'View supported shorthand, syntax, and active-profile inputs',
        render: (setting) => {
          setting.addButton((button) =>
            button.setButtonText('Open guide').onClick(() => this.plugin.openNotationGuide()),
          )
        },
      },
    ]

    return [
      {
        name: 'Icon size',
        desc: 'Set the size of notation icons',
        render: (setting) => {
          setting.addDropdown((dropdown) => {
            dropdown
              .addOption('small', 'Small')
              .addOption('medium', 'Medium')
              .addOption('large', 'Large')
              .setValue(this.plugin.settings.iconSize)
              .onChange(async (value) => {
                if (value !== 'small' && value !== 'medium' && value !== 'large') return
                this.plugin.settings.iconSize = value
                await this.plugin.saveSettings()
                this.plugin.rerenderPreviewViews()
              })
          })
        },
      },
      {
        name: 'Motion icon style',
        desc: 'Display motions as joystick symbols or arrows',
        render: (setting) => {
          setting.addDropdown((dropdown) => {
            dropdown
              .addOption('joystick', 'Joystick')
              .addOption('arrows', 'Arrows')
              .setValue(this.plugin.settings.motionIconStyle)
              .onChange(async (value) => {
                if (value !== 'joystick' && value !== 'arrows') return
                this.plugin.settings.motionIconStyle = value
                await this.plugin.saveSettings()
                this.plugin.rerenderPreviewViews()
              })
          })
        },
      },
      {
        type: 'page',
        name: 'Profiles',
        desc: 'Select a notation profile and customize its inputs and colors',
        displayValue: () =>
          this.plugin.settings.profiles[this.plugin.settings.selectedProfile]?.name,
        items: profileItems,
      },
      {
        type: 'page',
        name: 'About',
        desc: 'Plugin information and notation help',
        items: aboutItems,
      },
      {
        type: 'group',
        heading: 'Maintenance',
        items: [
          {
            name: 'Reset settings',
            desc: 'Restore defaults and remove every custom profile',
            render: (setting) => {
              setting.addButton((button) =>
                button
                  .setButtonText('Reset settings')
                  .setDestructive()
                  .onClick(() => this.openResetSettingsModal()),
              )
            },
          },
        ],
      },
    ]
  }

  private openCreateProfileModal(): void {
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
      this.update()
      new Notice('Custom profile created')
    }).open()
  }

  private openDeleteProfileModal(profileId: string, profileName: string): void {
    if (profileId in inputMap) return

    new DeleteProfileModal(this.app, profileName, async () => {
      delete this.plugin.settings.profiles[profileId]
      this.plugin.settings.selectedProfile = 'asw'
      await this.plugin.saveSettings()
      this.plugin.rerenderPreviewViews({ profileId })
      this.update()
      new Notice('Custom profile deleted')
    }).open()
  }

  private openResetSettingsModal(): void {
    new ResetSettingsModal(this.app, async () => {
      this.plugin.settings = createDefaultSettings()
      await this.plugin.saveSettings()
      this.plugin.rerenderPreviewViews()
      this.update()
      new Notice('Settings reset')
    }).open()
  }
}
