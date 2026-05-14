import { type MarkdownPostProcessorContext, MarkdownView, Plugin } from 'obsidian'
import { validateAndNormalizeInputs } from './input-validation'
import { ModeToggle } from './mode-toggle'
import { NotationObserver } from './notation-observer'
import { NotationRenderer } from './notation-renderer'
import { RendererCordinator } from './renderer-cordinator'
import { mergeSettingsWithDefaults, type Settings, settingsTab } from './settings'
import { StyleManager } from './style-manager'

interface ProfileInputEdit {
  name: string
  description: string
  color: string
}

export default class comboColors extends Plugin {
  styleElement!: HTMLStyleElement
  settings!: Settings

  private notationRenderer = new NotationRenderer()
  private styleManager!: StyleManager
  private rerenderCoordinator!: RendererCordinator
  private notationObserver!: NotationObserver
  private modeToggle!: ModeToggle

  async onload() {
    const workspaceDocument = this.app.workspace.containerEl.ownerDocument
    this.styleElement = createEl('style', { attr: { id: 'dynamic-colors' } })
    workspaceDocument.head.appendChild(this.styleElement)
    this.styleManager = new StyleManager(this.styleElement, this.app.workspace.containerEl)
    this.rerenderCoordinator = new RendererCordinator(this.app)
    this.notationObserver = new NotationObserver(
      this.app.workspace.containerEl,
      this.notationRenderer,
      (notation) => this.renderNotationAsImages(notation),
    )
    this.modeToggle = new ModeToggle(
      this.app,
      this.notationRenderer,
      (notation) => this.renderNotationAsImages(notation),
      (options) => this.rerenderPreviewViews(options),
    )

    await this.loadSettings()

    // Generate profile & icon size CSS rules for immediate use
    for (const profileId of Object.keys(this.settings.profiles)) {
      this.updateColorsForProfile(profileId)
    }

    this.updateIconSizes()

    // Setup mutation observer to handle newly added DOM elements
    this.notationObserver.connect()

    // First processor: Convert =:notation:= syntax into spans
    this.registerMarkdownPostProcessor((element: HTMLElement) => {
      this.replaceNotationSyntax(element)
    })

    // Second processor: Apply colors and process inputs based on profile
    this.registerMarkdownPostProcessor(
      (element: HTMLElement, context: MarkdownPostProcessorContext) => {
        const file = context.sourcePath
        const frontmatter = this.app.metadataCache.getCache(file)?.frontmatter
        const frontmatterProfile = frontmatter?.cc_profile
        const profileId = frontmatterProfile ? String(frontmatterProfile).trim() : null
        const profile = profileId ? this.settings.profiles[profileId] : null

        for (const notation of element.querySelectorAll('.notation')) {
          if (!this.isHtmlElement(notation)) continue

          const textMode = notation.textContent || ''

          if (!profile || !profileId) {
            notation.textContent = '[ No notation profile in frontmatter ]'
            notation.addClass('warning')
            continue
          }

          this.notationRenderer.applyTextMode(
            element,
            notation,
            profileId,
            profile,
            textMode,
            this.settings.naturalLanguageNotation,
          )
        }
      },
    )

    this.registerMarkdownPostProcessor((element: HTMLElement) => {
      for (const codeblock of element.querySelectorAll<HTMLElement>('code')) {
        if (codeblock.innerText.trim() === 'comboButton' && codeblock.parentNode) {
          const button = element.createEl('button', {
            text: 'Icon notation',
            cls: 'combo',
          })
          button.addEventListener('click', this.modeToggle.toggleNotations)
          codeblock.parentNode.replaceChild(button, codeblock)
        }
      }
    })

    // Handle profile changes in frontmatter
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        this.rerenderCoordinator.onMetadataChanged(file, (options) =>
          this.rerenderPreviewViews(options),
        )
      }),
    )

    // Process queued rerenders when switching views
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.rerenderCoordinator.onLayoutChange((options) => this.rerenderPreviewViews(options))
      }),
    )

    this.addCommand({
      id: 'toggle-icons',
      name: 'Toggle notation icons',
      callback: this.modeToggle.toggleNotations,
    })

    this.addSettingTab(new settingsTab(this.app, this))
  }

  updateColorsForProfile(profileId: string) {
    const profile = this.settings.profiles[profileId]
    if (!profile) return
    this.styleManager.updateColorsForProfile(profileId, profile)
  }

  updateIconSizes() {
    this.styleManager.updateIconSizes(this.settings.iconSize)
  }

  private renderNotationAsImages(notation: HTMLElement) {
    this.notationRenderer.renderImageMode(
      notation,
      this.settings.profiles,
      this.createSvgElement,
      this.settings.naturalLanguageNotation,
    )
  }

  private createSvgElement = (
    span: HTMLElement,
    config: { class?: string; source: string; alt?: string },
  ) => {
    const svgDoc = new DOMParser().parseFromString(config.source, 'image/svg+xml')
    const sourceViewBox = svgDoc.documentElement.getAttribute('viewBox') || '0 0 100 100'
    const altText = config.alt?.trim()

    const svg = span.createSvg('svg', {
      cls: config.class,
      attr: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: sourceViewBox,
        role: altText ? 'img' : null,
        'aria-label': altText || null,
        'aria-hidden': altText ? null : 'true',
        focusable: 'false',
      },
    })

    if (altText) {
      svg.createEl('title', { text: altText })
    }

    svg.append(...Array.from(svgDoc.documentElement.childNodes))
    return svg
  }

  onunload() {
    this.styleElement?.remove()
    this.notationObserver.disconnect()
  }

  async loadSettings() {
    this.settings = mergeSettingsWithDefaults(await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  async saveProfileInputs(profileId: string, inputs: ProfileInputEdit[]): Promise<void> {
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
      const color =
        previousColors[input.name] === input.color ? previousColors[input.name] : input.color
      profile.colors[input.name] = color
      if (previousColors[input.name] !== input.color) {
        profile.defaultColors[input.name] = input.color
      }
    }

    await this.saveSettings()
    this.updateColorsForProfile(profileId)
    this.rerenderPreviewViews({ profileId })
  }

  rerenderPreviewViews(options: { filePath?: string; profileId?: string } = {}) {
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

  private isHtmlElement(value: unknown): value is HTMLElement {
    const maybeInstanceOf = value as {
      instanceOf?: (ctor: typeof HTMLElement) => boolean
    }
    if (typeof maybeInstanceOf?.instanceOf === 'function') {
      return maybeInstanceOf.instanceOf(HTMLElement)
    }
    return value instanceof HTMLElement
  }

  private isLiteralContextElement(element: Element): boolean {
    if (element.matches('code, pre, kbd, samp, script, style, textarea')) {
      return true
    }

    return (
      element.classList.contains('math') ||
      element.classList.contains('math-block') ||
      element.classList.contains('cm-inline-code')
    )
  }

  private isElementNode(node: Node): boolean {
    const maybeInstanceOf = node as {
      instanceOf?: (ctor: typeof Element) => boolean
    }

    if (typeof maybeInstanceOf.instanceOf === 'function') {
      return maybeInstanceOf.instanceOf(Element)
    }

    return node.nodeType === Node.ELEMENT_NODE
  }

  private isTextNode(node: Node): boolean {
    const maybeInstanceOf = node as {
      instanceOf?: (ctor: typeof Text) => boolean
    }

    if (typeof maybeInstanceOf.instanceOf === 'function') {
      return maybeInstanceOf.instanceOf(Text)
    }

    return node.nodeType === Node.TEXT_NODE
  }

  private replaceNotationSyntax(element: HTMLElement): void {
    const processNode = (node: Node) => {
      if (this.isElementNode(node)) {
        const currentElement = node as Element
        if (this.isLiteralContextElement(currentElement)) {
          return
        }
      }

      if (!this.isTextNode(node)) {
        if (this.isElementNode(node)) {
          for (const child of node.childNodes) processNode(child)
        }
        return
      }

      const text = node.textContent || ''
      const regex = /=:(.+?):=/g
      let match = regex.exec(text)
      if (!match) return

      const fragment = element.ownerDocument.createDocumentFragment()
      let lastIndex = 0

      while (match) {
        fragment.append(text.slice(lastIndex, match.index))

        const notationSpan = element.ownerDocument.createElement('span')
        notationSpan.className = 'notation'
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

    for (const node of element.childNodes) processNode(node)
  }
}
