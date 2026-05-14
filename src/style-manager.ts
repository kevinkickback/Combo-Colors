import { isSafeCssColor } from './color-validation'
import { validateProfileId } from './profile-validation'
import type { CustomProfile, Settings } from './settings'

function escapeCssIdentifier(token: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(token)
  }

  return token.replace(/[^A-Za-z0-9_-]/g, (char) => `\\${char}`)
}

export class StyleManager {
  constructor(
    private readonly styleElement: HTMLStyleElement,
    private readonly workspaceContainerEl: HTMLElement,
  ) {}

  updateColorsForProfile(profileId: string, profile: CustomProfile): void {
    const sheet = this.styleElement.sheet
    if (!sheet) return

    const profileValidation = validateProfileId(profileId)
    if (!profileValidation.valid) return
    const normalizedProfileId = profileValidation.normalized

    const textColor = isSafeCssColor(profile.textColor) ? profile.textColor.trim() : '#FFFFFF'
    const profileClassPrefix = `cc-${normalizedProfileId}-`

    // Remove existing rules for this profile before adding new ones.
    for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
      const rule = sheet.cssRules[i]
      if (rule instanceof CSSStyleRule && rule.selectorText.includes(profileClassPrefix)) {
        sheet.deleteRule(i)
      }
    }

    for (const input in profile.colors) {
      if (!Object.prototype.hasOwnProperty.call(profile.colors, input)) continue
      const color = profile.colors[input]
      if (!isSafeCssColor(color)) continue

      const className = `${profileClassPrefix}${input}`
      const selectorClassName = escapeCssIdentifier(className)
      sheet.insertRule(
        `.${selectorClassName} { --notation-color: ${color.trim()}; --text-color: ${textColor}; }`,
      )
    }

    const elements = this.workspaceContainerEl.querySelectorAll<HTMLElement>('[data-profile-id]')

    for (const element of elements) {
      if (element.getAttribute('data-profile-id') !== normalizedProfileId) continue

      const input = element.getAttribute('data-color-input')
      if (!input || !profile.colors[input]) continue

      element.addClass(`${profileClassPrefix}${input}`)
      element.addClass('cc-profile-color')
    }
  }

  updateIconSizes(iconSize: Settings['iconSize']): void {
    const sheet = this.styleElement.sheet
    if (!sheet) return

    // Remove existing icon size rules.
    for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
      const rule = sheet.cssRules[i]
      if (
        rule instanceof CSSStyleRule &&
        (rule.selectorText === '.buttonIcon' ||
          rule.selectorText === '.motionIcon' ||
          rule.selectorText === '.notation.imageMode')
      ) {
        sheet.deleteRule(i)
      }
    }

    const sizes = {
      small: { button: '1.2rem', motion: '1.4rem', font: '1rem' },
      medium: { button: '1.4rem', motion: '1.6rem', font: '1.2rem' },
      large: { button: '1.8rem', motion: '2.0rem', font: '1.4rem' },
    }

    const selectedSize = sizes[iconSize]
    sheet.insertRule(`.buttonIcon { height: ${selectedSize.button}; vertical-align: text-bottom; }`)
    sheet.insertRule(
      `.motionIcon { height: ${selectedSize.motion}; vertical-align: text-bottom; margin-left: -0.1rem; }`,
    )
    sheet.insertRule(`.notation.imageMode { font-size: ${selectedSize.font}; }`)
  }
}
