import { type App, MarkdownView, type TFile, type WorkspaceLeaf } from 'obsidian'

export interface RerenderOptions {
  filePath?: string
  profileId?: string
}

export class RendererCordinator {
  private readonly metadataChanged = new Map<string, WorkspaceLeaf>()

  constructor(private readonly app: App) {}

  onMetadataChanged(file: TFile, rerenderPreviewViews: (options?: RerenderOptions) => void): void {
    const metadata = this.app.metadataCache.getFileCache(file)
    if (!metadata?.frontmatter) return

    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      const view = leaf.view
      if (!(view instanceof MarkdownView) || view.file !== file) continue

      if (view.getMode() === 'preview') {
        rerenderPreviewViews({ filePath: file.path })
      } else if (view.getMode() === 'source') {
        this.metadataChanged.set(file.path, leaf)
      }
    }
  }

  onLayoutChange(rerenderPreviewViews: (options?: RerenderOptions) => void): void {
    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      const view = leaf.view
      if (!(view instanceof MarkdownView)) continue

      const filePath = view.file?.path
      if (!filePath || view.getMode() !== 'preview') continue

      const matchedLeaf = this.metadataChanged.get(filePath)
      if (matchedLeaf === leaf) {
        rerenderPreviewViews({ filePath })
        this.metadataChanged.delete(filePath)
      }
    }
  }
}
