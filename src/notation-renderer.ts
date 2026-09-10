import { tokensToColorSegments, tokensToImageSegments } from './adapter'
import { parseNotation } from './parser'
import { type CustomProfile, getProfileInputKeys, type MotionIconStyle } from './settings'

export interface NotationRenderState {
  profileId: string
  textMode: string
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

export class NotationRenderer {
  private notationState = new WeakMap<HTMLElement, NotationRenderState>()

  hasState(notation: HTMLElement): boolean {
    return this.notationState.has(notation)
  }

  ensureState(notation: HTMLElement, state: NotationRenderState): void {
    if (!this.notationState.has(notation)) {
      this.notationState.set(notation, state)
    }
  }

  applyTextMode(
    element: HTMLElement,
    notation: HTMLElement,
    profileId: string,
    profile: CustomProfile,
    textMode: string,
  ): void {
    const tokens = parseNotation(textMode, {
      buttonInputs: getProfileInputKeys(profile),
    })
    const segments = tokensToColorSegments(tokens, profile)

    this.notationState.set(notation, {
      profileId,
      textMode,
    })

    notation.empty()
    const fragment = createFragment()

    for (const segment of segments) {
      if (segment.kind === 'plain') {
        fragment.appendText(segment.text)
      } else {
        fragment.append(
          element.createSpan({
            cls: `cc-${profileId}-${segment.input} cc-profile-color`,
            text: segment.rawText,
            attr: {
              'data-color-input': segment.input,
              'data-profile-id': profileId,
            },
          }),
        )
      }
    }

    notation.append(fragment)
  }

  renderImageMode(
    notation: HTMLElement,
    profiles: Record<string, CustomProfile>,
    motionIconStyle: MotionIconStyle = 'joystick',
  ): void {
    const state = this.notationState.get(notation)
    if (!state) return

    const profile = profiles[state.profileId]
    if (!profile) return

    const tokens = parseNotation(state.textMode, {
      buttonInputs: getProfileInputKeys(profile),
    })
    const segments = tokensToImageSegments(tokens, profile, motionIconStyle)

    notation.empty()
    const fragment = createFragment()
    let previousSegmentWasIconGroup = false

    for (const segment of segments) {
      if (segment.kind === 'plain') {
        fragment.appendText(segment.text)
        previousSegmentWasIconGroup = false
        continue
      }

      if (segment.kind === 'icon-group') {
        const group = notation.ownerDocument.createElement('span')
        group.className = `cc-motion-icon-group cc-motion-icon-group--${segment.iconStyle}`
        group.setAttribute('role', 'group')
        group.setAttribute('aria-label', segment.label)

        for (const icon of segment.icons) {
          const image = notation.ownerDocument.createElement('img')
          image.className = ['motionIcon', icon.lowered ? 'cc-motion-icon--lowered' : '']
            .filter(Boolean)
            .join(' ')
          image.src = icon.source
          image.alt = icon.alt
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

      const svg = notation.ownerDocument.createElementNS(SVG_NAMESPACE, 'svg')
      svg.setAttribute(
        'class',
        [
          'buttonIcon',
          `cc-${state.profileId}-${segment.input}`,
          'cc-profile-color',
          segment.held ? 'cc-button-icon--hold' : '',
          previousSegmentWasIconGroup ? 'cc-button-icon--after-motion' : '',
        ]
          .filter(Boolean)
          .join(' '),
      )
      svg.setAttribute('viewBox', '0 0 100 100')
      svg.setAttribute('role', 'img')
      svg.setAttribute('aria-label', segment.alt)
      svg.setAttribute('focusable', 'false')
      svg.setAttribute('data-color-input', segment.input)
      svg.setAttribute('data-profile-id', state.profileId)

      const title = notation.ownerDocument.createElementNS(SVG_NAMESPACE, 'title')
      title.textContent = segment.alt
      svg.append(title)

      if (segment.held) {
        const holdRing = notation.ownerDocument.createElementNS(SVG_NAMESPACE, 'circle')
        holdRing.setAttribute('class', 'cc-button-hold-ring')
        holdRing.setAttribute('cx', '50')
        holdRing.setAttribute('cy', '50')
        holdRing.setAttribute('r', '48')
        svg.append(holdRing)
      }

      const circle = notation.ownerDocument.createElementNS(SVG_NAMESPACE, 'circle')
      circle.setAttribute('cx', '50')
      circle.setAttribute('cy', '50')
      circle.setAttribute('r', segment.held ? '39' : '45')
      circle.setAttribute('fill', 'white')
      svg.append(circle)

      const text = notation.ownerDocument.createElementNS(SVG_NAMESPACE, 'text')
      text.setAttribute('x', '50')
      text.setAttribute('y', '50')
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'central')
      text.setAttribute('font-family', 'Arial')
      text.setAttribute('font-weight', 'bold')
      text.setAttribute('font-size', String(segment.fontSize))
      text.setAttribute('fill', 'black')
      text.textContent = segment.input
      svg.append(text)

      fragment.append(svg)
      previousSegmentWasIconGroup = false
    }

    notation.append(fragment)
  }
}
