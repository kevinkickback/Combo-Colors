import { MarkdownView } from 'obsidian'
import { describe, expect, it, vi } from 'vitest'
import { ModeToggle } from '../src/mode-toggle'

describe('ModeToggle', () => {
  it('stores image mode for the active file and rerenders every matching preview', () => {
    const view = Object.create(MarkdownView.prototype) as MarkdownView
    Object.assign(view, { file: { path: 'note.md' } })
    const setImageModeForFile = vi.fn()
    const rerenderPreviewViews = vi.fn()
    const toggle = new ModeToggle(
      { workspace: { getActiveViewOfType: () => view } } as never,
      () => false,
      setImageModeForFile,
      rerenderPreviewViews,
    )

    toggle.toggleNotations()

    expect(setImageModeForFile).toHaveBeenCalledWith('note.md', true)
    expect(rerenderPreviewViews).toHaveBeenCalledWith({ filePath: 'note.md' })
  })

  it('turns image mode off without depending on rendered DOM state', () => {
    const view = Object.create(MarkdownView.prototype) as MarkdownView
    Object.assign(view, { file: { path: 'note.md' } })
    const setImageModeForFile = vi.fn()
    const toggle = new ModeToggle(
      { workspace: { getActiveViewOfType: () => view } } as never,
      () => true,
      setImageModeForFile,
      vi.fn(),
    )

    toggle.toggleNotations()

    expect(setImageModeForFile).toHaveBeenCalledWith('note.md', false)
  })

  it('does nothing when no Markdown file is active', () => {
    const setImageModeForFile = vi.fn()
    const rerenderPreviewViews = vi.fn()
    const toggle = new ModeToggle(
      { workspace: { getActiveViewOfType: () => null } } as never,
      () => false,
      setImageModeForFile,
      rerenderPreviewViews,
    )

    toggle.toggleNotations()

    expect(setImageModeForFile).not.toHaveBeenCalled()
    expect(rerenderPreviewViews).not.toHaveBeenCalled()
  })
})
