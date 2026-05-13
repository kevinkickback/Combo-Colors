import {
  type MarkdownPostProcessorContext,
  MarkdownView,
  Plugin,
  type WorkspaceLeaf,
} from 'obsidian'
import { NotationRenderer } from './notation-renderer'
import { DEFAULT_SETTINGS, type Settings, settingsTab } from './settings'

interface ProfileInputEdit {
  name: string
  description: string
  color: string
}

export default class comboColors extends Plugin {
  styleElement!: HTMLStyleElement
  settings!: Settings

  private metadataChanged!: Map<string, WorkspaceLeaf>
  private mutationObserver: MutationObserver | null = null
  private notationRenderer = new NotationRenderer()

  async onload() {
    const workspaceDocument = this.app.workspace.containerEl.ownerDocument
    this.styleElement = createEl('style', { attr: { id: 'dynamic-colors' } })
    workspaceDocument.head.appendChild(this.styleElement)
    this.metadataChanged = new Map()

    await this.loadSettings()

    // Generate profile & icon size CSS rules for immediate use
    for (const profileId of Object.keys(this.settings.profiles)) {
      this.updateColorsForProfile(profileId)
      this.updateIconSizes()
    }

    this.updateIconSizes()

    // Setup mutation observer to handle newly added DOM elements
    this.setupMutationObserver()

    // First processor: Convert =:notation:= syntax into spans
    this.registerMarkdownPostProcessor((element: HTMLElement) => {
      const processNode = (node: Node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            for (const child of node.childNodes) processNode(child)
          }
          return
        }

        const text = node.textContent || ''
        const regex = /=:(.+?):=/g
        let match = regex.exec(text)
        if (!match) return

        const fragment = createFragment()
        let lastIndex = 0

        while (match) {
          fragment.appendText(text.slice(lastIndex, match.index))
          fragment.append(element.createSpan({ cls: 'notation', text: match[1] }))
          lastIndex = regex.lastIndex
          match = regex.exec(text)
        }

        fragment.appendText(text.slice(lastIndex))
        if (node.parentNode) {
          node.parentNode.replaceChild(fragment, node)
        }
      }

      for (const node of element.childNodes) processNode(node)
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
            notation.classList.add('warning')
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
          this.registerDomEvent(button, 'click', this.toggleNotations)
          codeblock.parentNode.replaceChild(button, codeblock)
        }
      }
    })

    // Handle profile changes in frontmatter
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        const metadata = this.app.metadataCache.getFileCache(file)
        if (!metadata?.frontmatter) return

        for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
          const view = leaf.view
          if (!(view instanceof MarkdownView) || view.file !== file) continue

          if (view.getMode() === 'preview') {
            this.rerenderPreviewViews({ filePath: file.path })
          } else if (view.getMode() === 'source') {
            this.metadataChanged.set(file.path, leaf)
          }
        }
      }),
    )

    // Process queued rerenders when switching views
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
          const view = leaf.view
          if (!(view instanceof MarkdownView)) continue

          const filePath = view.file?.path
          if (!filePath || view.getMode() !== 'preview') continue

          const matchedLeaf = this.metadataChanged.get(filePath)
          if (matchedLeaf === leaf) {
            this.rerenderPreviewViews({ filePath })
            this.metadataChanged.delete(filePath)
          }
        }
      }),
    )

    this.addCommand({
      id: 'toggle-icons',
      name: 'Toggle notation icons',
      callback: this.toggleNotations,
    })

    this.addSettingTab(new settingsTab(this.app, this))
  }

  updateColorsForProfile(profileId: string) {
    const profile = this.settings.profiles[profileId]
    if (!profile) return

    const sheet = this.styleElement.sheet
    if (!sheet) return

    // Remove existing rules for this profile before adding new ones
    for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
      const rule = sheet.cssRules[i]
      if (rule instanceof CSSStyleRule && rule.selectorText.includes(`cc-${profileId}-`)) {
        sheet.deleteRule(i)
      }
    }

    for (const input in profile.colors) {
      if (!Object.prototype.hasOwnProperty.call(profile.colors, input)) continue
      const color = profile.colors[input]
      const className = `cc-${profileId}-${input}`
      sheet.insertRule(
        `.${className} { --notation-color: ${color}; --text-color: ${profile.textColor || '#FFFFFF'}; }`,
      )
    }

    const elements = this.app.workspace.containerEl.querySelectorAll<HTMLElement>(
      `[data-profile-id="${profileId}"]`,
    )

    for (const element of elements) {
      const input = element.getAttribute('data-color-input')
      if (!input || !profile.colors[input]) continue

      element.classList.add(`cc-${profileId}-${input}`, 'cc-profile-color')
    }
  }

  updateIconSizes() {
    const sheet = this.styleElement.sheet
    if (!sheet) return

    // Remove existing icon size rules
    for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
      const rule = sheet.cssRules[i]
      if (
        rule instanceof CSSStyleRule &&
        (rule.selectorText === '.buttonIcon' ||
          rule.selectorText === '.motionIcon' ||
          rule.selectorText === '.notation.imageMode')
      ) {
        sheet.deleteRule(i)
      }
    }

    const sizes = {
      small: { button: '1.2rem', motion: '1.4rem', font: '1rem' },
      medium: { button: '1.4rem', motion: '1.6rem', font: '1.2rem' },
      large: { button: '1.8rem', motion: '2.0rem', font: '1.4rem' },
    }

    const selectedSize = sizes[this.settings.iconSize]
    sheet.insertRule(`.buttonIcon { height: ${selectedSize.button}; vertical-align: text-bottom; }`)
    sheet.insertRule(
      `.motionIcon { height: ${selectedSize.motion}; vertical-align: text-bottom; margin-left: -0.1rem; }`,
    )
    sheet.insertRule(`.notation.imageMode { font-size: ${selectedSize.font}; }`)
  }

  private renderNotationAsImages(notation: HTMLElement) {
    this.notationRenderer.renderImageMode(
      notation,
      this.settings.profiles,
      this.createSvgElement,
      this.settings.naturalLanguageNotation,
    )
  }

  private toggleNotations = () => {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!activeView) return

    const notations = activeView.containerEl.querySelectorAll<HTMLElement>('.notation')
    const button = activeView.containerEl.querySelector<HTMLElement>('.combo')

    for (const notation of notations) {
      if (notation.textContent === '[ No notation profile in frontmatter ]') continue

      // Cache text content for toggling back to text mode
      if (!this.notationRenderer.hasState(notation)) {
        const profileSpan = notation.querySelector<HTMLElement>('[data-profile-id]')
        const profileId = profileSpan?.getAttribute('data-profile-id')
        if (profileId) {
          this.notationRenderer.ensureState(notation, {
            profileId,
            textMode: notation.textContent || '',
          })
        }
      }

      const isImageMode = !notation.hasClass('imageMode')
      notation.toggleClass('imageMode', isImageMode)

      if (isImageMode) {
        this.renderNotationAsImages(notation)
      } else {
        this.rerenderPreviewViews({ filePath: activeView.file?.path })
      }
    }

    if (notations.length > 0 && button) {
      button.textContent =
        button.textContent === 'Text notation' ? 'Icon notation' : 'Text notation'
    }
  }

  private createSvgElement(
    span: HTMLElement,
    config: { class?: string; source: string; alt?: string },
  ) {
    const svgDoc = new DOMParser().parseFromString(config.source, 'image/svg+xml')
    const sourceViewBox = svgDoc.documentElement.getAttribute('viewBox') || '0 0 100 100'

    const svg = span.createSvg('svg', {
      cls: config.class,
      attr: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: sourceViewBox,
        alt: config.alt || null,
      },
    })
    svg.append(...Array.from(svgDoc.documentElement.childNodes))
    return svg
  }

  onunload() {
    this.styleElement?.remove()
    // Clean up mutation observers
    this.disconnectMutationObserver()
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  async saveProfileInputs(profileId: string, inputs: ProfileInputEdit[]): Promise<void> {
    const profile = this.settings.profiles[profileId]
    if (!profile) return

    const previousColors = { ...profile.colors }
    profile.desc = {}
    profile.colors = {}
    profile.defaultColors ??= {}

    for (const input of inputs) {
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

  private setupMutationObserver() {
    const workspaceDocument = this.app.workspace.containerEl.ownerDocument
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if we're in image mode by looking for notation elements with imageMode class
          const isImageMode = !!this.app.workspace.containerEl.querySelector('.notation.imageMode')

          if (isImageMode) {
            for (const node of mutation.addedNodes) {
              if (this.isHtmlElement(node)) {
                // Process any notation elements in the new content
                const notations = node.querySelectorAll('.notation')
                for (const notation of notations) {
                  if (this.isHtmlElement(notation) && !notation.hasClass('imageMode')) {
                    // Cache text content for toggling back to text mode
                    if (!this.notationRenderer.hasState(notation)) {
                      const profileId = notation
                        .querySelector<HTMLElement>('[data-profile-id]')
                        ?.getAttribute('data-profile-id')
                      if (profileId) {
                        this.notationRenderer.ensureState(notation, {
                          profileId,
                          textMode: notation.textContent || '',
                        })
                      }
                    }
                    notation.addClass('imageMode')
                    this.renderNotationAsImages(notation)
                  }
                }
              }
            }
          }
        }
      }
    })

    // Observe the entire document for changes
    this.mutationObserver.observe(workspaceDocument.body, {
      childList: true,
      subtree: true,
    })
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

  private disconnectMutationObserver() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }
  }
}
