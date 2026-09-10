import { type App, MarkdownView, type TFile, type WorkspaceLeaf } from 'obsidian'

export interface RerenderOptions {
  filePath?: string
  profileId?: string
}

export class RendererCoordinator {
  private readonly metadataChanged = new Map<string, WorkspaceLeaf>()

  constructor(
    private readonly app: App,
    private readonly rerenderPreviewViews: (options?: RerenderOptions) => void,
  ) {}

  onMetadataChanged(file: TFile): void {
    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      const view = leaf.view
      if (!(view instanceof MarkdownView) || view.file?.path !== file.path) continue

      if (view.getMode() === 'preview') {
        this.rerenderPreviewViews({ filePath: file.path })
      } else if (view.getMode() === 'source') {
        this.metadataChanged.set(file.path, leaf)
      }
    }
  }

  onLayoutChange(): void {
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
  }

  clear(): void {
    this.metadataChanged.clear()
  }
}
