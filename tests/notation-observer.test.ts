import { describe, expect, it } from 'vitest'
import { NotationObserver } from '../src/notation-observer'

if (typeof globalThis.HTMLElement === 'undefined') {
  ;(globalThis as unknown as { HTMLElement: unknown }).HTMLElement = class {}
}

function makeNotationNode(name: string) {
  return {
    name,
    instanceOf: () => true,
    hasClass: (className: string) => className === 'notation',
    querySelectorAll: () => [],
  }
}

describe('NotationObserver', () => {
  it('collects a direct notation node and nested notation descendants', () => {
    const direct = makeNotationNode('direct')
    const nested = makeNotationNode('nested')
    const node = {
      instanceOf: () => true,
      hasClass: (className: string) => className === 'notation',
      querySelectorAll: () => [nested],
    }

    const observer = new NotationObserver({} as never, {} as never, () => undefined) as unknown as {
      collectNotationNodes: (node: any) => any[]
    }

    // Include direct notation node itself and descendants.
    const nodes = observer.collectNotationNodes(node)

    expect(nodes).toHaveLength(2)
    expect(nodes).toContain(node)
    expect(nodes).toContain(nested)
    expect(nodes).not.toContain(direct)
  })

  it('de-duplicates notation nodes returned from descendant queries', () => {
    const duplicated = makeNotationNode('dup')
    const node = {
      instanceOf: () => true,
      hasClass: () => false,
      querySelectorAll: () => [duplicated, duplicated],
    }

    const observer = new NotationObserver({} as never, {} as never, () => undefined) as unknown as {
      collectNotationNodes: (node: any) => any[]
    }

    const nodes = observer.collectNotationNodes(node)

    expect(nodes).toEqual([duplicated])
  })
})
