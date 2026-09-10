import { tokensToColorSegments, tokensToImageSegments } from './adapter'
import { isSafeCssColor } from './color-validation'
import { getObsidianWindow } from './obsidian-dom'
import { parseNotation } from './parser'
import {
  type CustomProfile,
  getProfileInputKeys,
  type MotionIconStyle,
  type Settings,
} from './settings'

const ICON_SIZE_CLASSES = ['cc-icon-size-small', 'cc-icon-size-medium', 'cc-icon-size-large']

function safeColor(value: string | undefined, fallback: string): string {
  return isSafeCssColor(value) ? value.trim() : fallback
}

export class NotationRenderer {
  applyTextMode(
    notation: HTMLElement,
    profileId: string,
    profile: CustomProfile,
    textMode: string,
  ): void {
    const tokens = parseNotation(textMode, { buttonInputs: getProfileInputKeys(profile) })
    const segments = tokensToColorSegments(tokens, profile)

    const activeWindow = getObsidianWindow(notation)
    const fragment = activeWindow.createFragment()

    for (const segment of segments) {
      if (segment.kind === 'plain') {
        fragment.append(segment.text)
        continue
      }

      const span = activeWindow.createSpan()
      span.className = 'cc-profile-color'
      span.textContent = segment.rawText
      span.dataset.colorInput = segment.input
      span.dataset.profileId = profileId
      span.setCssProps({
        '--cc-notation-color': safeColor(profile.colors[segment.input], '#fff'),
        '--cc-text-color': safeColor(profile.textColor, '#fff'),
      })
      fragment.append(span)
    }

    notation.replaceChildren(fragment)
  }

  renderImageMode(
    notation: HTMLElement,
    profileId: string,
    textMode: string,
    profiles: Record<string, CustomProfile>,
    motionIconStyle: MotionIconStyle = 'joystick',
    iconSize: Settings['iconSize'] = 'medium',
  ): void {
    const profile = profiles[profileId]
    if (!profile) return

    const tokens = parseNotation(textMode, { buttonInputs: getProfileInputKeys(profile) })
    const segments = tokensToImageSegments(tokens, profile, motionIconStyle)

    notation.classList.remove(...ICON_SIZE_CLASSES)
    notation.classList.add('cc-image-mode', `cc-icon-size-${iconSize}`)
    const activeWindow = getObsidianWindow(notation)
    const fragment = activeWindow.createFragment()
    let previousSegmentWasIconGroup = false

    for (const segment of segments) {
      if (segment.kind === 'plain') {
        fragment.append(segment.text)
        previousSegmentWasIconGroup = false
        continue
      }

      if (segment.kind === 'icon-group') {
        const group = activeWindow.createSpan()
        group.className = `cc-motion-icon-group cc-motion-icon-group--${segment.iconStyle}`
        group.setAttribute('role', 'img')
        group.setAttribute('aria-label', segment.label)

        for (const icon of segment.icons) {
          const image = activeWindow.createEl('img')
          image.className = [
            'cc-motion-icon',
            icon.lowered ? 'cc-motion-icon--lowered' : '',
            icon.className ?? '',
          ]
            .filter(Boolean)
            .join(' ')
          image.src = icon.source
          image.alt = ''
          image.setAttribute('aria-hidden', 'true')
          image.draggable = false
          group.append(image)
        }

        if (group.childElementCount > 0) {
          fragment.append(group)
          previousSegmentWasIconGroup = true
        } else {
          previousSegmentWasIconGroup = false
        }
        continue
      }

      const svg = activeWindow.createSvg('svg')
      svg.setAttribute(
        'class',
        [
          'cc-button-icon',
          'cc-profile-color',
          segment.held ? 'cc-button-icon--hold' : '',
          previousSegmentWasIconGroup ? 'cc-button-icon--after-motion' : '',
        ]
          .filter(Boolean)
          .join(' '),
      )
      svg.setCssProps({
        '--cc-notation-color': safeColor(profile.colors[segment.input], '#fff'),
        '--cc-text-color': safeColor(profile.textColor, '#fff'),
      })
      svg.setAttribute('viewBox', '0 0 100 100')
      svg.setAttribute('role', 'img')
      svg.setAttribute('aria-label', segment.alt)
      svg.setAttribute('focusable', 'false')
      svg.setAttribute('data-color-input', segment.input)
      svg.setAttribute('data-profile-id', profileId)

      const title = activeWindow.createSvg('title')
      title.textContent = segment.alt
      svg.append(title)

      if (segment.held) {
        const holdRing = activeWindow.createSvg('circle')
        holdRing.setAttribute('class', 'cc-button-hold-ring')
        holdRing.setAttribute('cx', '50')
        holdRing.setAttribute('cy', '50')
        holdRing.setAttribute('r', '48')
        svg.append(holdRing)
      }

      const circle = activeWindow.createSvg('circle')
      circle.setAttribute('cx', '50')
      circle.setAttribute('cy', '50')
      circle.setAttribute('r', segment.held ? '39' : '45')
      svg.append(circle)

      const text = activeWindow.createSvg('text')
      text.setAttribute('x', '50')
      text.setAttribute('y', '50')
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'central')
      text.setAttribute('font-family', 'Arial')
      text.setAttribute('font-weight', 'bold')
      text.setAttribute('font-size', String(segment.fontSize))
      text.textContent = segment.input
      svg.append(text)

      fragment.append(svg)
      previousSegmentWasIconGroup = false
    }

    notation.replaceChildren(fragment)
  }
}
