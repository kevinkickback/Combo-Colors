import type { CustomProfile } from '../settings'

export interface ButtonIconDefinition {
  alt: string
  fontSize: number
}

export function generateButtonIconMap(profile: CustomProfile): Map<string, ButtonIconDefinition> {
  const buttonMap = new Map<string, ButtonIconDefinition>()

  for (const input of Object.keys(profile.colors)) {
    const length = input.length
    const fontSize =
      length <= 1 ? 80 : length === 2 ? 60 : length === 3 ? 50 : Math.max(30, 80 - length * 10)
    buttonMap.set(input, { alt: input, fontSize })
  }

  return buttonMap
}
