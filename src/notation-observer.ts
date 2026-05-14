import type { NotationRenderer } from './notation-renderer'

type RenderNotationAsImages = (notation: HTMLElement) => void
type ScheduledFlushId = number

export class NotationObserver {
  private mutationObserver: MutationObserver | null = null
  private pendingNodes = new Set<HTMLElement>()
  private rafId: ScheduledFlushId | null = null

  private getActiveWindow(): Window {
    return this.workspaceContainerEl.ownerDocument.defaultView ?? window
  }

  private scheduleFlush(callback: FrameRequestCallback): ScheduledFlushId {
    const activeWindow = this.getActiveWindow()

    if (typeof activeWindow.requestAnimationFrame === 'function') {
      return activeWindow.requestAnimationFrame(callback)
    }

    return activeWindow.setTimeout(() => callback(0), 0)
  }

  private cancelScheduledFlush(id: ScheduledFlushId): void {
    const activeWindow = this.getActiveWindow()

    if (typeof id === 'number' && typeof activeWindow.cancelAnimationFrame === 'function') {
      activeWindow.cancelAnimationFrame(id)
      return
    }

    activeWindow.clearTimeout(id)
  }

  constructor(
    private readonly workspaceContainerEl: HTMLElement,
    private readonly notationRenderer: NotationRenderer,
    private readonly renderNotationAsImages: RenderNotationAsImages,
  ) {}

  private flushPendingNotations = (): void => {
    this.rafId = null

    for (const node of this.pendingNodes) {
      const notations = this.collectNotationNodes(node)
      for (const notation of notations) {
        if (!this.isHtmlElement(notation) || notation.hasClass('imageMode')) continue

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

    this.pendingNodes.clear()
  }

  connect(): void {
    if (this.mutationObserver) return

    this.mutationObserver = new MutationObserver((mutations) => {
      const isImageMode = !!this.workspaceContainerEl.querySelector('.notation.imageMode')
      if (!isImageMode) return

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (!this.isHtmlElement(node)) continue

            this.pendingNodes.add(node)
          }
        }
      }

      if (this.pendingNodes.size > 0 && this.rafId === null) {
        this.rafId = this.scheduleFlush(this.flushPendingNotations)
      }
    })

    this.mutationObserver.observe(this.workspaceContainerEl, {
      childList: true,
      subtree: true,
    })
  }

  disconnect(): void {
    if (this.rafId !== null) {
      this.cancelScheduledFlush(this.rafId)
      this.rafId = null
    }
    this.pendingNodes.clear()

    if (!this.mutationObserver) return
    this.mutationObserver.disconnect()
    this.mutationObserver = null
  }

  private isHtmlElement(value: unknown): value is HTMLElement {
    const maybeInstanceOf = value as {
      instanceOf?: (ctor: typeof HTMLElement) => boolean
    }

    if (typeof maybeInstanceOf?.instanceOf === 'function') {
      return maybeInstanceOf.instanceOf(HTMLElement)
    }

    return (
      typeof value === 'object' &&
      value !== null &&
      'nodeType' in value &&
      (value as Node).nodeType === Node.ELEMENT_NODE
    )
  }

  private collectNotationNodes(node: HTMLElement): HTMLElement[] {
    const nodes = new Set<HTMLElement>()

    if (node.hasClass('notation')) {
      nodes.add(node)
    }

    for (const notationNode of node.querySelectorAll('.notation')) {
      if (!this.isHtmlElement(notationNode)) continue
      nodes.add(notationNode)
    }

    return Array.from(nodes)
  }
}
