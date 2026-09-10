import { afterEach, describe, expect, it } from 'vitest'
import { NotationRenderer } from '../src/notation-renderer'
import type { CustomProfile } from '../src/settings'

const { JSDOM } = require('jsdom') as {
  JSDOM: new (html?: string) => { window: Window & typeof globalThis }
}

const profile: CustomProfile = {
  name: 'Test',
  desc: { A: 'Attack' },
  colors: { A: '#ffffff' },
}

const previousCreateFragment = globalThis.createFragment

afterEach(() => {
  globalThis.createFragment = previousCreateFragment
})

describe('NotationRenderer arrow mode', () => {
  it('renders a non-breaking arrow group with ordered, accessible images', () => {
    const dom = new JSDOM('<span class="notation imageMode"></span>')
    const notation = dom.window.document.querySelector('.notation') as HTMLElement
    ;(notation as HTMLElement & { empty(): void }).empty = () => notation.replaceChildren()
    globalThis.createFragment = () => dom.window.document.createDocumentFragment()

    const renderer = new NotationRenderer()
    renderer.ensureState(notation, { profileId: 'test', textMode: '236' })
    renderer.renderImageMode(notation, { test: profile }, 'arrows')

    const group = notation.querySelector('.cc-motion-icon-group')
    const images = [...notation.querySelectorAll<HTMLImageElement>('.cc-motion-icon-group img')]
    expect(group?.getAttribute('aria-label')).toBe('QCF')
    expect(group?.classList.contains('cc-motion-icon-group--arrows')).toBe(true)
    expect(images.map((image) => image.alt)).toEqual(['Down', 'Down-Forward', 'Forward'])
    expect(images.every((image) => Boolean(image.getAttribute('src')))).toBe(true)

    renderer.renderImageMode(notation, { test: profile }, 'joystick')

    const joystickImages = notation.querySelectorAll('.cc-motion-icon-group img.motionIcon')
    expect(notation.querySelector('.cc-motion-icon-group--joystick')).not.toBeNull()
    expect(joystickImages).toHaveLength(1)
    expect((joystickImages[0] as HTMLImageElement).alt).toBe('QCF')
  })

  it('creates dynamic button SVGs without parsing fixed icon source', () => {
    const dom = new JSDOM('<span class="notation imageMode"></span>')
    const notation = dom.window.document.querySelector('.notation') as HTMLElement
    ;(notation as HTMLElement & { empty(): void }).empty = () => notation.replaceChildren()
    globalThis.createFragment = () => dom.window.document.createDocumentFragment()

    const renderer = new NotationRenderer()
    renderer.ensureState(notation, { profileId: 'test', textMode: 'A' })
    renderer.renderImageMode(notation, { test: profile }, 'joystick')

    const button = notation.querySelector('svg.buttonIcon')
    expect(button?.getAttribute('aria-label')).toBe('A')
    expect(button?.getAttribute('data-color-input')).toBe('A')
    expect(button?.querySelector('text')?.textContent).toBe('A')
  })

  it('optically aligns joystick directions and spaces an adjacent button', () => {
    const dom = new JSDOM('<span class="notation imageMode"></span>')
    const notation = dom.window.document.querySelector('.notation') as HTMLElement
    ;(notation as HTMLElement & { empty(): void }).empty = () => notation.replaceChildren()
    globalThis.createFragment = () => dom.window.document.createDocumentFragment()

    const renderer = new NotationRenderer()
    renderer.ensureState(notation, { profileId: 'test', textMode: '4A' })
    renderer.renderImageMode(notation, { test: profile }, 'joystick')

    expect(
      notation.querySelector('.motionIcon')?.classList.contains('cc-motion-icon--lowered'),
    ).toBe(true)
    expect(
      notation.querySelector('svg.buttonIcon')?.classList.contains('cc-button-icon--after-motion'),
    ).toBe(true)

    const spacedNotation = dom.window.document.createElement('span')
    ;(spacedNotation as HTMLElement & { empty(): void }).empty = () =>
      spacedNotation.replaceChildren()
    globalThis.createFragment = () => {
      const fragment = dom.window.document.createDocumentFragment()
      ;(fragment as DocumentFragment & { appendText(text: string): void }).appendText = (text) =>
        fragment.append(dom.window.document.createTextNode(text))
      return fragment
    }
    renderer.ensureState(spacedNotation, { profileId: 'test', textMode: '2 A' })
    renderer.renderImageMode(spacedNotation, { test: profile }, 'joystick')

    expect(
      spacedNotation.querySelector('.motionIcon')?.classList.contains('cc-motion-icon--lowered'),
    ).toBe(false)
    expect(
      spacedNotation
        .querySelector('svg.buttonIcon')
        ?.classList.contains('cc-button-icon--after-motion'),
    ).toBe(false)
  })

  it('renders held buttons with a distinct outer ring and accessible label', () => {
    const dom = new JSDOM('<span class="notation imageMode"></span>')
    const notation = dom.window.document.querySelector('.notation') as HTMLElement
    ;(notation as HTMLElement & { empty(): void }).empty = () => notation.replaceChildren()
    globalThis.createFragment = () => dom.window.document.createDocumentFragment()

    const renderer = new NotationRenderer()
    renderer.ensureState(notation, { profileId: 'test', textMode: '[A]' })
    renderer.renderImageMode(notation, { test: profile }, 'joystick')

    const button = notation.querySelector('svg.buttonIcon')
    expect(button?.classList.contains('cc-button-icon--hold')).toBe(true)
    expect(button?.getAttribute('aria-label')).toBe('A (hold)')
    expect(button?.querySelector('.cc-button-hold-ring')?.getAttribute('r')).toBe('48')
    expect(button?.querySelector('circle:not(.cc-button-hold-ring)')?.getAttribute('r')).toBe('39')
  })
})
