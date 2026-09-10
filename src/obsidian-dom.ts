interface ObsidianWindow extends Window {
  createFragment(): DocumentFragment
  createEl<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K]
  createSpan(): HTMLSpanElement
  createSvg<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K]
}

/** Returns the Obsidian-extended window that owns a rendered node. */
export function getObsidianWindow(node: Node): ObsidianWindow {
  return node.win as ObsidianWindow
}
