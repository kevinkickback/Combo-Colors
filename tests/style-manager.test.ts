import { describe, expect, it } from 'vitest'
import { ICON_SIZE_PRESETS } from '../src/style-manager'

describe('icon size presets', () => {
  it('renders joystick icons slightly larger than arrows at every size', () => {
    for (const preset of Object.values(ICON_SIZE_PRESETS)) {
      expect(Number.parseFloat(preset.joystick)).toBeGreaterThan(Number.parseFloat(preset.motion))
    }
  })

  it('keeps small unchanged and increases medium and large by 25 percent', () => {
    expect(ICON_SIZE_PRESETS.small).toEqual({
      button: '1.2rem',
      motion: '1.4rem',
      joystick: '1.55rem',
      font: '1rem',
    })
    expect(ICON_SIZE_PRESETS.medium).toEqual({
      button: '1.75rem',
      motion: '2rem',
      joystick: '2.25rem',
      font: '1.5rem',
    })
    expect(ICON_SIZE_PRESETS.large).toEqual({
      button: '2.25rem',
      motion: '2.5rem',
      joystick: '2.8125rem',
      font: '1.75rem',
    })
  })
})
