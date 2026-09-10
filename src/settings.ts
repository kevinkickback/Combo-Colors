import type { App, ColorComponent } from 'obsidian'
import { Notice, PluginSettingTab, Setting, setIcon } from 'obsidian'
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
  settingsLayout: SettingsLayout
  notationColorSettingsExpanded: boolean
}

export type MotionIconStyle = 'joystick' | 'arrows'
export type SettingsLayout = 'tabs' | 'list'

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
    settingsLayout: 'tabs',
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
    settingsLayout:
      persistedSettings.settingsLayout === 'tabs' || persistedSettings.settingsLayout === 'list'
        ? persistedSettings.settingsLayout
        : defaults.settingsLayout,
    notationColorSettingsExpanded:
      typeof persistedSettings.notationColorSettingsExpanded === 'boolean'
        ? persistedSettings.notationColorSettingsExpanded
        : defaults.notationColorSettingsExpanded,
  }
}

export const DEFAULT_SETTINGS: Settings = createDefaultSettings()

const RELEASE_DATES: Readonly<Record<string, string>> = {
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
  private activeSection: 'general' | 'profiles' | 'about' = 'general'

  constructor(app: App, plugin: comboColors) {
    super(app, plugin)
    this.plugin = plugin
  }

  private createSectionHeader(
    containerEl: HTMLElement,
    title: string,
    description: string,
    action?: { icon: string; label: string; onClick: () => void },
  ): void {
    const header = containerEl.createDiv({ cls: 'cc-settings-section-header' })
    const setting = new Setting(header).setName(title).setDesc(description).setHeading()
    setting.settingEl.addClass('cc-settings-section-heading')

    if (action) {
      setting.addButton((button) =>
        button.setIcon(action.icon).setTooltip(action.label).setCta().onClick(action.onClick),
      )
    }
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
      this.display()
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
      this.display()
      new Notice('Custom profile deleted')
    }).open()
  }

  private openResetSettingsModal(): void {
    new ResetSettingsModal(this.app, async () => {
      this.plugin.settings = createDefaultSettings()
      await this.plugin.saveSettings()
      this.plugin.rerenderPreviewViews()
      this.activeSection = 'general'
      this.display()
      new Notice('Settings reset')
    }).open()
  }

  private createGeneralSection(containerEl: HTMLElement): void {
    this.createSectionHeader(
      containerEl,
      'General',
      'Control how Combo Colors notation is displayed in reading view.',
    )

    const generalSection = containerEl.createDiv({ cls: 'cc-settings-card' })

    new Setting(generalSection)
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
            this.plugin.rerenderPreviewViews()
          })
      })
      .settingEl.addClass('cc-general-setting')

    new Setting(generalSection)
      .setName('Motion icon style')
      .setDesc('Display motions as joystick symbols or arrows')
      .addDropdown((dropdown) => {
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
      .settingEl.addClass('cc-general-setting')

    new Setting(generalSection)
      .setName('Reset settings')
      .setDesc('Restore defaults and remove every custom profile')
      .addButton((button) =>
        button
          .setButtonText('Reset settings')
          .setWarning()
          .onClick(() => this.openResetSettingsModal()),
      )
      .settingEl.addClass('cc-general-setting')
  }

  private createProfileSection(containerEl: HTMLElement): void {
    const profileId = this.plugin.settings.selectedProfile
    const profileData = this.plugin.settings.profiles[profileId]
    if (!profileData) {
      new Notice('Profile not found')
      return
    }

    this.createSectionHeader(
      containerEl,
      'Profiles',
      'Select a notation profile, manage custom profiles, and customize input colors.',
      {
        icon: 'plus',
        label: 'Create profile',
        onClick: () => this.openCreateProfileModal(),
      },
    )

    const generalSection = containerEl.createDiv({ cls: 'cc-settings-card' })

    const activeProfileSetting = new Setting(generalSection)
      .setName('Active profile')
      .setDesc(
        createFragment((frag) => {
          frag.createDiv({ text: 'Choose the profile to configure.' })
          const usage = frag.createDiv()
          usage.appendText('To use this profile, add ')
          const copyLink = usage.createEl('a', {
            text: `cc_profile: ${profileId}`,
            cls: 'cc-frontmatter-copy',
            attr: {
              href: '#',
              title: 'Copy frontmatter property',
              'aria-label': `Copy cc_profile: ${profileId}`,
            },
          })
          copyLink.addEventListener('click', (event) => {
            event.preventDefault()
            void copyLink.win.navigator.clipboard
              .writeText(`cc_profile: ${profileId}`)
              .then(() => {
                new Notice('Copied to clipboard')
              })
              .catch(() => {
                new Notice('Could not copy to clipboard')
              })
          })
          usage.appendText(" to the file's frontmatter.")
        }),
      )
      .addDropdown((dropdown) => {
        for (const [listedProfileId, listedProfile] of Object.entries(
          this.plugin.settings.profiles,
        )) {
          dropdown.addOption(listedProfileId, listedProfile.name)
        }
        dropdown.setValue(this.plugin.settings.selectedProfile).onChange(async (value) => {
          this.plugin.settings.selectedProfile = value
          await this.plugin.saveSettings()
          this.display()
        })
      })
      .addButton((button) =>
        button
          .setIcon('trash')
          .setTooltip(
            profileId in inputMap ? 'Built-in profiles cannot be deleted' : 'Delete profile',
          )
          .setClass('cc-profile-delete-button')
          .setDisabled(profileId in inputMap)
          .onClick(() => this.openDeleteProfileModal(profileId, profileData.name)),
      )
    activeProfileSetting.settingEl.addClass('cc-general-setting')

    if (!(profileId in inputMap)) {
      new Setting(generalSection)
        .setName('Profile inputs')
        .setDesc('Add, edit, or remove inputs for this custom profile')
        .addButton((button) =>
          button.setButtonText('Edit inputs').onClick(() => {
            const existingInputs = Object.entries(profileData.desc).map(([name, description]) => ({
              name,
              description,
              color: profileData.colors[name] || '#000000',
            }))

            new InputsModal(
              this.app,
              async (inputs) => {
                try {
                  await this.plugin.saveProfileInputs(profileId, inputs)
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
        .settingEl.addClass('cc-general-setting')
    }

    new Setting(generalSection)
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
      .settingEl.addClass('cc-general-setting')

    if (!this.plugin.settings.notationColorSettingsExpanded) {
      return
    }

    const colorSection = generalSection.createDiv({ cls: 'cc-color-settings-container' })

    new Setting(colorSection)
      .setName('Text color')
      .setDesc('Applies to all inputs below')
      .addButton((button) =>
        button
          .setIcon('reset')
          .setTooltip('Reset text color')
          .setClass('clickable-icon')
          .setClass('extra-setting-button')
          .onClick(async () => {
            profileData.textColor = '#FFFFFF'
            await this.plugin.saveSettings()
            this.plugin.rerenderPreviewViews({ profileId })
            this.display()
          }),
      )
      .addColorPicker((picker) => {
        picker.setValue(profileData.textColor || '#FFFFFF').onChange(async (value) => {
          profileData.textColor = value
          await this.plugin.saveSettings()
          this.plugin.rerenderPreviewViews({ profileId })
        })
      })
      .settingEl.addClass('cc-color-setting')

    for (const [input, description] of Object.entries(profileData.desc)) {
      let colorPicker: ColorComponent
      new Setting(colorSection)
        .setName(input)
        .setDesc(description)
        .addButton((button) => {
          const defaultProfile = inputMap[profileId]
          const defaultColor = defaultProfile?.colors?.[input] || profileData.defaultColors?.[input]

          return button
            .setIcon('reset')
            .setTooltip(`Reset ${input} color`)
            .setClass('clickable-icon')
            .setClass('extra-setting-button')
            .setDisabled(!defaultColor)
            .onClick(async () => {
              if (defaultColor) {
                profileData.colors[input] = defaultColor
                colorPicker.setValue(defaultColor)
                await this.plugin.saveSettings()
                this.plugin.rerenderPreviewViews({ profileId })
              }
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
        .settingEl.addClass('cc-color-setting')
    }
  }

  private createAboutSection(containerEl: HTMLElement): void {
    this.createSectionHeader(
      containerEl,
      'About',
      'Plugin information, project links, and settings maintenance.',
    )

    const aboutSection = containerEl.createDiv({ cls: 'cc-settings-card' })
    const releaseDate = getReleaseDate(this.plugin.manifest.version)
    new Setting(aboutSection)
      .setName('Plugin information')
      .setDesc(
        createFragment((frag) => {
          frag.createDiv({ text: `Version ${this.plugin.manifest.version}` })
          if (releaseDate) {
            frag.createDiv({ text: `Released ${releaseDate}` })
          }
          frag.createDiv({ text: 'Color and visualize fighting-game notation in Obsidian.' })
        }),
      )
      .settingEl.addClass('cc-general-setting')

    new Setting(aboutSection)
      .setName('Notation guide')
      .setDesc('View supported shorthand, syntax, and active-profile inputs')
      .addButton((button) =>
        button.setButtonText('Open guide').onClick(() => this.plugin.openNotationGuide()),
      )
      .settingEl.addClass('cc-general-setting')

    new Setting(aboutSection)
      .setName('Project repository')
      .setDesc('Documentation, releases, and issue tracking')
      .addButton((button) =>
        button.setButtonText('Open GitHub').onClick(() => {
          this.containerEl.win.open(
            'https://github.com/kevinkickback/Combo-Colors',
            '_blank',
            'noopener',
          )
        }),
      )
      .settingEl.addClass('cc-general-setting')
  }

  private getSections(): Array<{
    id: 'general' | 'profiles' | 'about'
    label: string
    icon: string
    render: (containerEl: HTMLElement) => void
  }> {
    return [
      {
        id: 'general',
        label: 'General',
        icon: 'settings-2',
        render: (containerEl) => this.createGeneralSection(containerEl),
      },
      {
        id: 'profiles',
        label: 'Profiles',
        icon: 'palette',
        render: (containerEl) => this.createProfileSection(containerEl),
      },
      {
        id: 'about',
        label: 'About',
        icon: 'info',
        render: (containerEl) => this.createAboutSection(containerEl),
      },
    ]
  }

  private createTopbar(containerEl: HTMLElement): void {
    const topbar = containerEl.createDiv({ cls: 'cc-settings-topbar' })
    const title = topbar.createDiv({ cls: 'cc-settings-title' })
    const titleSetting = new Setting(title)
      .setName('Appearance and profiles')
      .setDesc('Configure notation rendering and profile colors')
      .setHeading()
    titleSetting.settingEl.addClass('cc-settings-main-heading')

    const layoutToggle = topbar.createDiv({
      cls: 'cc-settings-layout-toggle',
      attr: { role: 'group', 'aria-label': 'Settings layout' },
    })

    for (const option of [
      { value: 'tabs' as const, icon: 'layout-grid', label: 'Tabs' },
      { value: 'list' as const, icon: 'list', label: 'List' },
    ]) {
      const active = this.plugin.settings.settingsLayout === option.value
      const button = layoutToggle.createEl('button', {
        cls: `cc-settings-layout-button${active ? ' is-active' : ''}`,
        attr: {
          type: 'button',
          title: `${option.label} layout`,
          'aria-label': `${option.label} layout`,
          'aria-pressed': String(active),
        },
      })
      setIcon(button, option.icon)
      button.addEventListener('click', () => {
        if (this.plugin.settings.settingsLayout === option.value) return
        this.plugin.settings.settingsLayout = option.value
        void this.plugin.saveSettings().then(() => this.display())
      })
    }
  }

  private createTabbedLayout(containerEl: HTMLElement): void {
    const sections = this.getSections()
    const tabs = containerEl.createDiv({
      cls: 'cc-settings-tabs',
      attr: { role: 'tablist', 'aria-label': 'Combo Colors settings sections' },
    })

    const activateSection = (index: number, focus: boolean): void => {
      const section = sections[index]
      if (!section) return
      this.activeSection = section.id
      this.display()
      if (focus) {
        this.containerEl.querySelector<HTMLElement>(`#cc-settings-tab-${section.id}`)?.focus()
      }
    }

    sections.forEach((section, index) => {
      const active = section.id === this.activeSection
      const button = tabs.createEl('button', {
        cls: `cc-settings-tab${active ? ' is-active' : ''}`,
        attr: {
          id: `cc-settings-tab-${section.id}`,
          type: 'button',
          role: 'tab',
          'aria-selected': String(active),
          'aria-controls': `cc-settings-panel-${section.id}`,
          tabindex: active ? '0' : '-1',
        },
      })
      const icon = button.createSpan({ cls: 'cc-settings-tab-icon' })
      setIcon(icon, section.icon)
      button.createSpan({ text: section.label })
      button.addEventListener('click', () => {
        if (section.id === this.activeSection) return
        activateSection(index, false)
      })
      button.addEventListener('keydown', (event) => {
        let targetIndex: number | null = null
        if (event.key === 'ArrowRight') targetIndex = (index + 1) % sections.length
        if (event.key === 'ArrowLeft') targetIndex = (index - 1 + sections.length) % sections.length
        if (event.key === 'Home') targetIndex = 0
        if (event.key === 'End') targetIndex = sections.length - 1
        if (targetIndex === null) return
        event.preventDefault()
        activateSection(targetIndex, true)
      })
    })

    const panel = containerEl.createDiv({
      cls: 'cc-settings-panel',
      attr: {
        id: `cc-settings-panel-${this.activeSection}`,
        role: 'tabpanel',
        'aria-labelledby': `cc-settings-tab-${this.activeSection}`,
      },
    })
    const activeSection = sections.find((section) => section.id === this.activeSection)
    ;(activeSection ?? sections[0]).render(panel)
  }

  private createListLayout(containerEl: HTMLElement): void {
    const list = containerEl.createDiv({ cls: 'cc-settings-list' })
    for (const section of this.getSections()) {
      const sectionEl = list.createDiv({ cls: `cc-settings-list-section is-${section.id}` })
      section.render(sectionEl)
    }
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()
    containerEl.addClass('cc-settings')
    this.createTopbar(containerEl)

    if (this.plugin.settings.settingsLayout === 'list') {
      this.createListLayout(containerEl)
      return
    }

    this.createTabbedLayout(containerEl)
  }
}
