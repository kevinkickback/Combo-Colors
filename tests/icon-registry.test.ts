import { describe, expect, it } from 'vitest'
import { generateButtonIconMap } from '../src/icons/buttons'
import {
  ARROW_ALT_TEXT,
  type ArrowDirectionValue,
  getArrowIconUrl,
  getMissingCanonicalArrowIcons,
  getMissingCanonicalMotionIcons,
  HOLD_ARROW_ICON_MAP,
  HOLD_JOYSTICK_ICON_MAP,
  resolveMotionIconGroup,
  TAP_ARROW_ICON_MAP,
  TAP_JOYSTICK_ICON_MAP,
} from '../src/icons/motions'

const directions: ArrowDirectionValue[] = [
  'down-back',
  'down',
  'down-forward',
  'back',
  'forward',
  'up-back',
  'up',
  'up-forward',
]

describe('icon registry', () => {
  it('creates button definitions for every configured profile input', () => {
    const map = generateButtonIconMap({
      name: 'Test',
      desc: { A: '', LP: '', LONG: '' },
      colors: { A: '#fff', LP: '#fff', LONG: '#fff' },
    })

    expect(map.get('A')).toEqual({ alt: 'A', fontSize: 80 })
    expect(map.get('LP')).toEqual({ alt: 'LP', fontSize: 60 })
    expect(map.get('LONG')).toEqual({ alt: 'LONG', fontSize: 40 })
  })

  it('resolves every tap and hold arrow asset', () => {
    for (const direction of directions) {
      expect(getArrowIconUrl(direction)).toBe(TAP_ARROW_ICON_MAP[direction])
      expect(getArrowIconUrl(direction, true)).toBe(HOLD_ARROW_ICON_MAP[direction])
      expect(ARROW_ALT_TEXT[direction]).toBeTruthy()
    }
  })

  it('resolves distinct tap and hold joystick assets for every direction', () => {
    for (const direction of directions) {
      const tap = resolveMotionIconGroup(direction, 'joystick')?.icons[0]
      const hold = resolveMotionIconGroup(direction, 'joystick', true)?.icons[0]

      expect(tap?.source).toBeTruthy()
      expect(hold?.source).toBeTruthy()
      expect(tap).toEqual(TAP_JOYSTICK_ICON_MAP[direction])
      expect(hold).toEqual(HOLD_JOYSTICK_ICON_MAP[direction])
      expect(hold?.source).not.toBe(tap?.source)
      expect(hold?.alt).toContain('(hold)')
      expect(resolveMotionIconGroup(direction, 'joystick', true)?.label).toContain('Hold')
    }
  })

  it('marks only horizontal and upward joystick directions for optical lowering', () => {
    const loweredDirections = new Set<ArrowDirectionValue>([
      'back',
      'forward',
      'up-back',
      'up',
      'up-forward',
    ])

    for (const direction of directions) {
      expect(TAP_JOYSTICK_ICON_MAP[direction].lowered).toBe(
        loweredDirections.has(direction) ? true : undefined,
      )
      expect(HOLD_JOYSTICK_ICON_MAP[direction].lowered).toBe(
        loweredDirections.has(direction) ? true : undefined,
      )
    }
  })

  it('uses the same icon-group contract for joystick and arrow styles', () => {
    const joystick = resolveMotionIconGroup('qcf', 'joystick')
    const arrows = resolveMotionIconGroup('qcf', 'arrows')

    expect(joystick?.label).toBe('QCF')
    expect(joystick?.icons).toHaveLength(1)
    expect(joystick?.icons[0]?.alt).toBe('QCF')
    expect(arrows?.label).toBe('QCF')
    expect(arrows?.icons.map((icon) => icon.alt)).toEqual(['Down', 'Down-Forward', 'Forward'])
  })

  it('represents repeated joystick motions as repeated group images', () => {
    expect(resolveMotionIconGroup('double-qcf', 'joystick')?.icons).toHaveLength(2)
    expect(resolveMotionIconGroup('dash-back', 'joystick')?.icons).toHaveLength(2)
  })

  it('composes directional joystick motions from atomic icon assets', () => {
    const cases = [
      ['down-up', ['Down', 'Up']],
      ['up-down', ['Up', 'Down']],
      ['back-forward', ['Back', 'Forward']],
      ['forward-back', ['Forward', 'Back']],
      ['back-down-forward', ['Back', 'Down', 'Forward']],
      ['forward-down-back', ['Forward', 'Down', 'Back']],
      ['forward-down-forward', ['Forward', 'DownForward', 'Down']],
      ['tiger-knee', ['QCF', 'UpForward']],
      ['hcfb', ['HCF', 'Back']],
      ['hcbf', ['HCB', 'Forward']],
    ] as const

    for (const [canonical, expectedAlts] of cases) {
      expect(resolveMotionIconGroup(canonical, 'joystick')?.icons.map((icon) => icon.alt)).toEqual(
        expectedAlts,
      )
    }

    const back = resolveMotionIconGroup('back', 'joystick')?.icons[0]?.source
    const forward = resolveMotionIconGroup('forward', 'joystick')?.icons[0]?.source
    expect(
      resolveMotionIconGroup('back-forward', 'joystick')?.icons.map((icon) => icon.source),
    ).toEqual([back, forward])
  })

  it('composes 720 and 1080 from repeated SPD joystick icons', () => {
    const spdIcon = resolveMotionIconGroup('full-circle', 'joystick')?.icons[0]
    const spdSource = spdIcon?.source
    const doubleCircleSources = resolveMotionIconGroup('double-circle', 'joystick')?.icons.map(
      (icon) => icon.source,
    )
    const tripleCircleSources = resolveMotionIconGroup('triple-circle', 'joystick')?.icons.map(
      (icon) => icon.source,
    )

    expect(doubleCircleSources).toEqual([spdSource, spdSource])
    expect(tripleCircleSources).toEqual([spdSource, spdSource, spdSource])
    expect(spdIcon?.lowered).toBe(true)
    expect(spdIcon?.className).toBe('cc-motion-icon--spd')
  })

  it('renders complete arrow revolutions for circular motions', () => {
    expect(resolveMotionIconGroup('full-circle', 'arrows')?.icons).toHaveLength(8)
    expect(resolveMotionIconGroup('double-circle', 'arrows')?.icons).toHaveLength(16)
    expect(resolveMotionIconGroup('triple-circle', 'arrows')?.icons).toHaveLength(24)

    expect(resolveMotionIconGroup('full-circle', 'arrows')?.icons.map((icon) => icon.alt)).toEqual([
      'Forward',
      'Down-Forward',
      'Down',
      'Down-Back',
      'Back',
      'Up-Back',
      'Up',
      'Up-Forward',
    ])
  })

  it('handles neutral and unsupported values without throwing', () => {
    expect(resolveMotionIconGroup('neutral', 'arrows')).toBeUndefined()
    expect(resolveMotionIconGroup('unsupported', 'joystick')).toBeUndefined()
    expect(getArrowIconUrl('neutral' as ArrowDirectionValue)).toBeUndefined()
  })

  it('covers every canonical direction and motion with a joystick asset', () => {
    expect(getMissingCanonicalMotionIcons()).toEqual([])
  })

  it('covers every canonical direction and motion without joystick fallback in arrow mode', () => {
    expect(getMissingCanonicalArrowIcons()).toEqual([])
  })
})
