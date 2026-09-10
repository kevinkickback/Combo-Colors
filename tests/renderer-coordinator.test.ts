import { MarkdownView } from 'obsidian'
import { describe, expect, it, vi } from 'vitest'
import { RendererCoordinator } from '../src/renderer-coordinator'

describe('RendererCoordinator', () => {
  it('rerenders preview files when frontmatter is removed', () => {
    const view = Object.create(MarkdownView.prototype) as MarkdownView
    Object.assign(view, {
      file: { path: 'note.md' },
      getMode: () => 'preview',
    })
    const rerender = vi.fn()
    const coordinator = new RendererCoordinator(
      {
        workspace: { getLeavesOfType: () => [{ view }] },
        metadataCache: { getFileCache: () => null },
      } as never,
      rerender,
    )

    coordinator.onMetadataChanged({ path: 'note.md' } as never)

    expect(rerender).toHaveBeenCalledWith({ filePath: 'note.md' })
  })
})
