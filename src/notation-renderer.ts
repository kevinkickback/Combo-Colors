import { tokensToColorSegments, tokensToImageSegments } from './adapter'
import { parseNotation } from './parser'
import { type CustomProfile, getProfileInputKeys } from './settings'

export interface NotationRenderState {
  profileId: string
  textMode: string
}

interface SvgCreateConfig {
  class?: string
  source: string
  alt?: string
}

type SvgFactory = (host: HTMLElement, config: SvgCreateConfig) => SVGElement

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
    allowNaturalLanguageNotation: boolean,
  ): void {
    const tokens = parseNotation(textMode, {
      buttonInputs: getProfileInputKeys(profile),
      allowNaturalLanguageNotation,
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
    createSvgElement: SvgFactory,
    allowNaturalLanguageNotation: boolean,
  ): void {
    const state = this.notationState.get(notation)
    if (!state) return

    const profile = profiles[state.profileId]
    if (!profile) return

    const buttonColorMap = new Map<string, string>()
    for (const span of notation.querySelectorAll('span.cc-profile-color')) {
      const input = span.getAttribute('data-color-input')
      const cls = span.className
      if (input && cls) {
        buttonColorMap.set(input, cls)
      }
    }

    const tokens = parseNotation(state.textMode, {
      buttonInputs: getProfileInputKeys(profile),
      allowNaturalLanguageNotation,
    })
    const segments = tokensToImageSegments(tokens, profile)

    notation.empty()
    const fragment = createFragment()

    for (const segment of segments) {
      if (segment.kind === 'plain') {
        fragment.appendText(segment.text)
        continue
      }

      const element = createSvgElement(notation, {
        source: segment.source,
        class: segment.cssClass,
        alt: segment.alt,
      })

      if (segment.cssClass === 'buttonIcon') {
        const colorClass = buttonColorMap.get(segment.alt)
        if (colorClass) {
          element.setAttr('class', `buttonIcon ${colorClass}`)
        }
      }

      const repeat = segment.repeat ?? 1
      for (let i = 0; i < repeat; i++) {
        fragment.append(i === 0 ? element : element.cloneNode(true))
      }
    }

    notation.append(fragment)
  }
}
