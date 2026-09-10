import type { App } from 'obsidian'
import { MarkdownView } from 'obsidian'
import type { RerenderOptions } from './renderer-coordinator'

type RerenderPreviewViews = (options?: RerenderOptions) => void

export class ModeToggle {
  constructor(
    private readonly app: App,
    private readonly isImageModeForFile: (filePath: string) => boolean,
    private readonly setImageModeForFile: (filePath: string, enabled: boolean) => void,
    private readonly rerenderPreviewViews: RerenderPreviewViews,
  ) {}

  toggleNotations = (): void => {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    const filePath = activeView?.file?.path
    if (!filePath) return

    this.setImageModeForFile(filePath, !this.isImageModeForFile(filePath))
    this.rerenderPreviewViews({ filePath })
  }
}
