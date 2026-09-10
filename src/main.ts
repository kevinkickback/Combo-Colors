import { type MarkdownPostProcessorContext, MarkdownView, Plugin } from 'obsidian'
import { ModeToggle } from './mode-toggle'
import { NotationGuideModal } from './notation-guide-modal'
import { NotationRenderer } from './notation-renderer'
import { getObsidianWindow } from './obsidian-dom'
import { RendererCoordinator, type RerenderOptions } from './renderer-coordinator'
import { mergeSettingsWithDefaults, type Settings, settingsTab } from './settings'
import { type InputConfig, validateAndNormalizeInputs } from './validation'

const ELEMENT_NODE = 1
const TEXT_NODE = 3

export default class comboColors extends Plugin {
  settings!: Settings

  private notationRenderer = new NotationRenderer()
  private rerenderCoordinator!: RendererCoordinator
  private modeToggle!: ModeToggle
  private readonly imageModeFiles = new Set<string>()

  async onload() {
    this.rerenderCoordinator = new RendererCoordinator(this.app, (options) =>
      this.rerenderPreviewViews(options),
    )
    this.modeToggle = new ModeToggle(
      this.app,
      (filePath) => this.imageModeFiles.has(filePath),
      (filePath, enabled) => {
        if (enabled) this.imageModeFiles.add(filePath)
        else this.imageModeFiles.delete(filePath)
      },
      (options) => this.rerenderPreviewViews(options),
    )

    await this.loadSettings()

    this.registerMarkdownPostProcessor(
      (element: HTMLElement, context: MarkdownPostProcessorContext) => {
        this.replaceNotationSyntax(element)

        const filePath = context.sourcePath
        const frontmatter = this.app.metadataCache.getCache(filePath)?.frontmatter
        const frontmatterProfile: unknown = frontmatter?.cc_profile
        const profileId = typeof frontmatterProfile === 'string' ? frontmatterProfile.trim() : null
        const profile = profileId ? this.settings.profiles[profileId] : null
        const imageMode = this.imageModeFiles.has(filePath)

        for (const notation of element.querySelectorAll<HTMLElement>('.cc-notation')) {
          const textMode = notation.textContent || ''

          if (!profile || !profileId) {
            notation.setText('[ no notation profile in frontmatter ]')
            notation.addClass('cc-warning')
            continue
          }

          this.notationRenderer.applyTextMode(notation, profileId, profile, textMode)
          if (imageMode) {
            this.notationRenderer.renderImageMode(
              notation,
              profileId,
              textMode,
              this.settings.profiles,
              this.settings.motionIconStyle,
              this.settings.iconSize,
            )
          }
        }

        for (const codeblock of element.querySelectorAll<HTMLElement>('code')) {
          if (codeblock.textContent?.trim() === 'comboButton' && codeblock.parentNode) {
            const button = element.createEl('button', {
              text: imageMode ? 'Text notation' : 'Icon notation',
              cls: 'cc-mode-toggle',
              attr: { type: 'button' },
            })
            button.addEventListener('click', this.modeToggle.toggleNotations)
            codeblock.parentNode.replaceChild(button, codeblock)
          }
        }
      },
    )

    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        this.rerenderCoordinator.onMetadataChanged(file)
      }),
    )

    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.rerenderCoordinator.onLayoutChange()
      }),
    )

    this.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
        if (!this.imageModeFiles.delete(oldPath)) return
        this.imageModeFiles.add(file.path)
      }),
    )

    this.addCommand({
      id: 'toggle-icons',
      name: 'Toggle notation icons',
      callback: this.modeToggle.toggleNotations,
    })

    this.addCommand({
      id: 'open-notation-guide',
      name: 'Open notation guide',
      callback: () => this.openNotationGuide(),
    })

    this.addSettingTab(new settingsTab(this.app, this))
  }

  openNotationGuide(): void {
    const profile = this.settings.profiles[this.settings.selectedProfile]
    new NotationGuideModal(this.app, {
      name: profile?.name ?? 'Active profile',
      inputs: profile
        ? Object.keys(profile.colors).map((name) => ({
            name,
            description: profile.desc[name] ?? '',
          }))
        : [],
    }).open()
  }

  onunload() {
    this.imageModeFiles.clear()
    this.rerenderCoordinator.clear()
  }

  async loadSettings() {
    this.settings = mergeSettingsWithDefaults(await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  async saveProfileInputs(profileId: string, inputs: InputConfig[]): Promise<void> {
    const profile = this.settings.profiles[profileId]
    if (!profile) return

    const validated = validateAndNormalizeInputs(inputs)
    if (!validated.valid) {
      throw new Error(validated.message || 'Invalid profile inputs')
    }

    const previousColors = { ...profile.colors }
    profile.desc = {}
    profile.colors = {}
    profile.defaultColors ??= {}

    for (const input of validated.inputs) {
      profile.desc[input.name] = input.description
      profile.colors[input.name] = previousColors[input.name] ?? input.color
      if (previousColors[input.name] !== input.color) {
        profile.defaultColors[input.name] = input.color
      }
    }

    await this.saveSettings()
    this.rerenderPreviewViews({ profileId })
  }

  rerenderPreviewViews(options: RerenderOptions = {}) {
    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      const view = leaf.view
      if (!(view instanceof MarkdownView) || view.getMode() !== 'preview') continue

      if (options.filePath && view.file?.path !== options.filePath) {
        continue
      }

      if (options.profileId) {
        const filePath = view.file?.path
        if (!filePath) continue
        const frontmatter = this.app.metadataCache.getCache(filePath)?.frontmatter
        if (String(frontmatter?.cc_profile ?? '').trim() !== options.profileId) {
          continue
        }
      }

      view.previewMode.rerender(true)
    }
  }

  private isLiteralContextElement(element: HTMLElement): boolean {
    if (element.matches('code, pre, kbd, samp, script, style, textarea')) {
      return true
    }

    return (
      element.classList.contains('math') ||
      element.classList.contains('math-block') ||
      element.classList.contains('cm-inline-code')
    )
  }

  private replaceNotationSyntax(element: HTMLElement): void {
    const processNode = (node: Node) => {
      if (node.nodeType === ELEMENT_NODE) {
        const currentElement = node as HTMLElement
        if (this.isLiteralContextElement(currentElement)) return
        for (const child of [...node.childNodes]) processNode(child)
        return
      }

      if (node.nodeType !== TEXT_NODE) return

      const text = node.textContent || ''
      const regex = /=:(.+?):=/g
      let match = regex.exec(text)
      if (!match) return

      const activeWindow = getObsidianWindow(element)
      const fragment = activeWindow.createFragment()
      let lastIndex = 0

      while (match) {
        fragment.append(text.slice(lastIndex, match.index))

        const notationSpan = activeWindow.createSpan()
        notationSpan.className = 'cc-notation'
        notationSpan.textContent = match[1]
        fragment.append(notationSpan)

        lastIndex = regex.lastIndex
        match = regex.exec(text)
      }

      fragment.append(text.slice(lastIndex))
      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node)
      }
    }

    for (const node of [...element.childNodes]) processNode(node)
  }
}
