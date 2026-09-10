import { describe, expect, it } from 'vitest'
import { NotationRenderer } from '../src/notation-renderer'
import type { CustomProfile } from '../src/settings'
import { installObsidianDomHelpers } from './helpers/obsidian-dom'

const { JSDOM } = require('jsdom') as {
  JSDOM: new (html?: string) => { window: Window & typeof globalThis }
}

const profile: CustomProfile = {
  name: 'Test',
  desc: { A: 'Attack' },
  colors: { A: '#ffffff' },
}

describe('NotationRenderer arrow mode', () => {
  it('applies validated profile colors directly in text mode', () => {
    const dom = new JSDOM('<div id="root"><span class="cc-notation">A</span></div>')
    installObsidianDomHelpers(dom.window)
    const root = dom.window.document.querySelector('#root') as HTMLElement
    const notation = root.querySelector('.cc-notation') as HTMLElement
    new NotationRenderer().applyTextMode(notation, 'test', profile, 'A')

    const colored = notation.querySelector<HTMLElement>('.cc-profile-color')
    expect(colored?.style.getPropertyValue('--cc-notation-color')).toBe('#ffffff')
    expect(colored?.style.getPropertyValue('--cc-text-color')).toBe('#fff')
  })

  it('clears image-mode styling when returning to text mode', () => {
    const dom = new JSDOM('<span class="cc-notation"></span>')
    installObsidianDomHelpers(dom.window)
    const notation = dom.window.document.querySelector('.cc-notation') as HTMLElement
    const renderer = new NotationRenderer()

    renderer.renderImageMode(notation, 'test', 'A', { test: profile }, 'joystick', 'large')
    expect(notation.classList.contains('cc-image-mode')).toBe(true)
    expect(notation.classList.contains('cc-icon-size-large')).toBe(true)

    renderer.applyTextMode(notation, 'test', profile, 'A')

    expect(notation.classList.contains('cc-image-mode')).toBe(false)
    expect(notation.classList.contains('cc-icon-size-large')).toBe(false)
    expect(notation.querySelector('.cc-profile-color')?.textContent).toBe('A')
  })

  it('renders a non-breaking arrow group with ordered, accessible images', () => {
    const dom = new JSDOM('<span class="cc-notation"></span>')
    installObsidianDomHelpers(dom.window)
    const notation = dom.window.document.querySelector('.cc-notation') as HTMLElement
    const renderer = new NotationRenderer()
    renderer.renderImageMode(notation, 'test', '236', { test: profile }, 'arrows')

    const group = notation.querySelector('.cc-motion-icon-group')
    const images = [...notation.querySelectorAll<HTMLImageElement>('.cc-motion-icon-group img')]
    expect(group?.getAttribute('aria-label')).toBe('QCF')
    expect(group?.classList.contains('cc-motion-icon-group--arrows')).toBe(true)
    expect(images.map((image) => image.alt)).toEqual(['', '', ''])
    expect(images.every((image) => image.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(images.every((image) => Boolean(image.getAttribute('src')))).toBe(true)

    renderer.renderImageMode(notation, 'test', '236', { test: profile }, 'joystick')

    const joystickImages = notation.querySelectorAll('.cc-motion-icon-group img.cc-motion-icon')
    expect(notation.querySelector('.cc-motion-icon-group--joystick')).not.toBeNull()
    expect(joystickImages).toHaveLength(1)
    expect((joystickImages[0] as HTMLImageElement).alt).toBe('')
  })

  it('creates dynamic button SVGs without parsing fixed icon source', () => {
    const dom = new JSDOM('<span class="cc-notation"></span>')
    installObsidianDomHelpers(dom.window)
    const notation = dom.window.document.querySelector('.cc-notation') as HTMLElement
    const renderer = new NotationRenderer()
    renderer.renderImageMode(notation, 'test', 'A', { test: profile }, 'joystick')

    const button = notation.querySelector('svg.cc-button-icon')
    expect(button?.getAttribute('aria-label')).toBe('A')
    expect(button?.getAttribute('data-color-input')).toBe('A')
    expect(button?.querySelector('text')?.textContent).toBe('A')
    expect(notation.classList.contains('cc-icon-size-medium')).toBe(true)
    expect((button as SVGElement).style.getPropertyValue('--cc-notation-color')).toBe('#ffffff')
  })

  it('optically aligns joystick directions and spaces an adjacent button', () => {
    const dom = new JSDOM('<span class="cc-notation"></span>')
    installObsidianDomHelpers(dom.window)
    const notation = dom.window.document.querySelector('.cc-notation') as HTMLElement
    const renderer = new NotationRenderer()
    renderer.renderImageMode(notation, 'test', '4A', { test: profile }, 'joystick')

    expect(
      notation.querySelector('.cc-motion-icon')?.classList.contains('cc-motion-icon--lowered'),
    ).toBe(true)
    expect(
      notation
        .querySelector('svg.cc-button-icon')
        ?.classList.contains('cc-button-icon--after-motion'),
    ).toBe(true)

    const spacedNotation = dom.window.document.createElement('span')
    renderer.renderImageMode(spacedNotation, 'test', '2 A', { test: profile }, 'joystick')

    expect(
      spacedNotation
        .querySelector('.cc-motion-icon')
        ?.classList.contains('cc-motion-icon--lowered'),
    ).toBe(false)
    expect(
      spacedNotation
        .querySelector('svg.cc-button-icon')
        ?.classList.contains('cc-button-icon--after-motion'),
    ).toBe(false)
  })

  it('renders held buttons with a distinct outer ring and accessible label', () => {
    const dom = new JSDOM('<span class="cc-notation"></span>')
    installObsidianDomHelpers(dom.window)
    const notation = dom.window.document.querySelector('.cc-notation') as HTMLElement
    const renderer = new NotationRenderer()
    renderer.renderImageMode(notation, 'test', '[A]', { test: profile }, 'joystick')

    const button = notation.querySelector('svg.cc-button-icon')
    expect(button?.classList.contains('cc-button-icon--hold')).toBe(true)
    expect(button?.getAttribute('aria-label')).toBe('A (hold)')
    expect(button?.querySelector('.cc-button-hold-ring')?.getAttribute('r')).toBe('48')
    expect(button?.querySelector('circle:not(.cc-button-hold-ring)')?.getAttribute('r')).toBe('39')
  })
})
