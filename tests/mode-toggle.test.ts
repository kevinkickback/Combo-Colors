import { MarkdownView } from 'obsidian'
import { describe, expect, it, vi } from 'vitest'
import { ModeToggle } from '../src/mode-toggle'

interface TestNotation {
  textContent: string
  hasClass: (cls: string) => boolean
  toggleClass: (cls: string, value: boolean) => void
  querySelector: <T>(selector: string) => T | null
}

function createNotation(options: { text?: string; imageMode?: boolean }): TestNotation {
  let isImageMode = !!options.imageMode

  return {
    textContent: options.text ?? 'A',
    hasClass: (cls: string) => cls === 'imageMode' && isImageMode,
    toggleClass: (cls: string, value: boolean) => {
      if (cls === 'imageMode') isImageMode = value
    },
    querySelector: () => null,
  }
}

describe('ModeToggle', () => {
  it('rerenders once when multiple notations toggle back to text mode', () => {
    const notations = [createNotation({ imageMode: true }), createNotation({ imageMode: true })]
    const button = { textContent: 'Text notation' }

    const view = Object.create(MarkdownView.prototype) as any
    view.containerEl = {
      querySelectorAll: (selector: string) => (selector === '.notation' ? notations : []),
      querySelector: (selector: string) => (selector === '.combo' ? button : null),
    }
    view.file = { path: 'note.md' }

    const rerenderPreviewViews = vi.fn()
    const renderNotationAsImages = vi.fn()

    const toggle = new ModeToggle(
      {
        workspace: {
          getActiveViewOfType: () => view,
        },
      } as never,
      {
        hasState: () => true,
        ensureState: vi.fn(),
      } as never,
      renderNotationAsImages,
      rerenderPreviewViews,
    )

    toggle.toggleNotations()

    expect(renderNotationAsImages).not.toHaveBeenCalled()
    expect(rerenderPreviewViews).toHaveBeenCalledTimes(1)
    expect(rerenderPreviewViews).toHaveBeenCalledWith({ filePath: 'note.md' })
    expect(button.textContent).toBe('Icon notation')
  })

  it('does not rerender when toggling from text mode to image mode', () => {
    const notation = createNotation({ imageMode: false })
    const view = Object.create(MarkdownView.prototype) as any
    view.containerEl = {
      querySelectorAll: (selector: string) => (selector === '.notation' ? [notation] : []),
      querySelector: () => null,
    }
    view.file = { path: 'note.md' }

    const rerenderPreviewViews = vi.fn()
    const renderNotationAsImages = vi.fn()

    const toggle = new ModeToggle(
      {
        workspace: {
          getActiveViewOfType: () => view,
        },
      } as never,
      {
        hasState: () => true,
        ensureState: vi.fn(),
      } as never,
      renderNotationAsImages,
      rerenderPreviewViews,
    )

    toggle.toggleNotations()

    expect(renderNotationAsImages).toHaveBeenCalledTimes(1)
    expect(rerenderPreviewViews).not.toHaveBeenCalled()
  })
})
