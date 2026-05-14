import type { App } from 'obsidian'
import { MarkdownView } from 'obsidian'
import type { NotationRenderer } from './notation-renderer'

interface RerenderOptions {
  filePath?: string
  profileId?: string
}

type RenderNotationAsImages = (notation: HTMLElement) => void
type RerenderPreviewViews = (options?: RerenderOptions) => void

const MISSING_PROFILE_WARNING = '[ No notation profile in frontmatter ]'

export class ModeToggle {
  constructor(
    private readonly app: App,
    private readonly notationRenderer: NotationRenderer,
    private readonly renderNotationAsImages: RenderNotationAsImages,
    private readonly rerenderPreviewViews: RerenderPreviewViews,
  ) {}

  toggleNotations = (): void => {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!activeView) return

    const notations = activeView.containerEl.querySelectorAll<HTMLElement>('.notation')
    const button = activeView.containerEl.querySelector<HTMLElement>('.combo')
    let needsTextModeRerender = false

    for (const notation of notations) {
      if (notation.textContent === MISSING_PROFILE_WARNING) continue

      // Cache text content for toggling back to text mode.
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
        needsTextModeRerender = true
      }
    }

    if (needsTextModeRerender) {
      this.rerenderPreviewViews({ filePath: activeView.file?.path })
    }

    if (notations.length > 0 && button) {
      button.textContent =
        button.textContent === 'Text notation' ? 'Icon notation' : 'Text notation'
    }
  }
}
