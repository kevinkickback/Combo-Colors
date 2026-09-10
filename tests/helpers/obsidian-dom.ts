type ObsidianTestWindow = Window &
  typeof globalThis & {
    createFragment(): DocumentFragment
    createEl<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K]
    createSpan(): HTMLSpanElement
    createSvg<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K]
  }

export function installObsidianDomHelpers(window: Window & typeof globalThis): void {
  const obsidianWindow = window as ObsidianTestWindow
  Object.defineProperty(window.document, 'win', { configurable: true, value: obsidianWindow })
  Object.defineProperty(window.Node.prototype, 'win', {
    configurable: true,
    get(this: Node) {
      return this.ownerDocument?.defaultView ?? obsidianWindow
    },
  })
  ;(
    window.Element.prototype as Element & { setCssProps(props: Record<string, string>): void }
  ).setCssProps = function (props: Record<string, string>) {
    const element = this as Element & { style: CSSStyleDeclaration }
    for (const [property, value] of Object.entries(props))
      element.style.setProperty(property, value)
  }
  obsidianWindow.createFragment = () => window.document.createDocumentFragment()
  obsidianWindow.createEl = (tag) => window.document.createElement(tag)
  obsidianWindow.createSpan = () => window.document.createElement('span')
  obsidianWindow.createSvg = (tag) =>
    window.document.createElementNS('http://www.w3.org/2000/svg', tag)
}
