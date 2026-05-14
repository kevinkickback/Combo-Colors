import { describe, expect, it } from 'vitest'
import comboColors from '../src/main'

const { JSDOM } = require('jsdom') as {
  JSDOM: new (
    html?: string,
  ) => {
    window: {
      Element: typeof Element
      Text: typeof Text
      document: Document
    }
  }
}

function withDom<T>(run: (root: HTMLElement) => T): T {
  const dom = new JSDOM('<div id="root"></div>')
  const previousElement = globalThis.Element
  const previousText = globalThis.Text

  ;(globalThis as unknown as { Element: typeof dom.window.Element }).Element = dom.window.Element
  ;(globalThis as unknown as { Text: typeof dom.window.Text }).Text = dom.window.Text

  try {
    const root = dom.window.document.querySelector('#root') as HTMLElement
    return run(root)
  } finally {
    ;(globalThis as unknown as { Element: typeof previousElement }).Element = previousElement
    ;(globalThis as unknown as { Text: typeof previousText }).Text = previousText
  }
}

describe('markdown notation postprocessor', () => {
  it('converts prose notation syntax into notation spans', () => {
    withDom((root) => {
      root.innerHTML = '<p>Use =:LP:= and =:MP:= in prose.</p>'

      const plugin = Object.create(comboColors.prototype) as {
        replaceNotationSyntax: (element: HTMLElement) => void
      }
      plugin.replaceNotationSyntax(root)

      const notations = root.querySelectorAll('.notation')
      expect(notations).toHaveLength(2)
      expect(notations[0]?.textContent).toBe('LP')
      expect(notations[1]?.textContent).toBe('MP')
    })
  })

  it('does not transform notation syntax inside code and pre blocks', () => {
    withDom((root) => {
      root.innerHTML = [
        '<p>Convert this: =:A:=</p>',
        '<code>Keep this literal: =:B:=</code>',
        '<pre>Also literal: =:C:=</pre>',
      ].join('')

      const plugin = Object.create(comboColors.prototype) as {
        replaceNotationSyntax: (element: HTMLElement) => void
      }
      plugin.replaceNotationSyntax(root)

      const notations = root.querySelectorAll('.notation')
      expect(notations).toHaveLength(1)
      expect(root.querySelector('p .notation')?.textContent).toBe('A')
      expect(root.querySelector('code')?.textContent).toContain('=:B:=')
      expect(root.querySelector('pre')?.textContent).toContain('=:C:=')
    })
  })
})
