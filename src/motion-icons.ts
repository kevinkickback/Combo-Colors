import holdBackUrl from '../assets/motion-icons/arrows/hold/back.svg'
import holdDownUrl from '../assets/motion-icons/arrows/hold/down.svg'
import holdDownBackUrl from '../assets/motion-icons/arrows/hold/down-back.svg'
import holdDownForwardUrl from '../assets/motion-icons/arrows/hold/down-forward.svg'
import holdForwardUrl from '../assets/motion-icons/arrows/hold/forward.svg'
import holdUpUrl from '../assets/motion-icons/arrows/hold/up.svg'
import holdUpBackUrl from '../assets/motion-icons/arrows/hold/up-back.svg'
import holdUpForwardUrl from '../assets/motion-icons/arrows/hold/up-forward.svg'
import tapBackUrl from '../assets/motion-icons/arrows/tap/back.svg'
import tapDownUrl from '../assets/motion-icons/arrows/tap/down.svg'
import tapDownBackUrl from '../assets/motion-icons/arrows/tap/down-back.svg'
import tapDownForwardUrl from '../assets/motion-icons/arrows/tap/down-forward.svg'
import tapForwardUrl from '../assets/motion-icons/arrows/tap/forward.svg'
import tapUpUrl from '../assets/motion-icons/arrows/tap/up.svg'
import tapUpBackUrl from '../assets/motion-icons/arrows/tap/up-back.svg'
import tapUpForwardUrl from '../assets/motion-icons/arrows/tap/up-forward.svg'
import joystickDpUrl from '../assets/motion-icons/joystick/dp.svg'
import joystickHcbUrl from '../assets/motion-icons/joystick/hcb.svg'
import joystickHcfUrl from '../assets/motion-icons/joystick/hcf.svg'
import holdJoystickBackUrl from '../assets/motion-icons/joystick/hold/back.svg'
import holdJoystickDownUrl from '../assets/motion-icons/joystick/hold/down.svg'
import holdJoystickDownBackUrl from '../assets/motion-icons/joystick/hold/down-back.svg'
import holdJoystickDownForwardUrl from '../assets/motion-icons/joystick/hold/down-forward.svg'
import holdJoystickForwardUrl from '../assets/motion-icons/joystick/hold/forward.svg'
import holdJoystickUpUrl from '../assets/motion-icons/joystick/hold/up.svg'
import holdJoystickUpBackUrl from '../assets/motion-icons/joystick/hold/up-back.svg'
import holdJoystickUpForwardUrl from '../assets/motion-icons/joystick/hold/up-forward.svg'
import joystickQcbUrl from '../assets/motion-icons/joystick/qcb.svg'
import joystickQcfUrl from '../assets/motion-icons/joystick/qcf.svg'
import joystickRdpUrl from '../assets/motion-icons/joystick/rdp.svg'
import joystickSpdUrl from '../assets/motion-icons/joystick/spd.svg'
import tapJoystickBackUrl from '../assets/motion-icons/joystick/tap/back.svg'
import tapJoystickDownUrl from '../assets/motion-icons/joystick/tap/down.svg'
import tapJoystickDownBackUrl from '../assets/motion-icons/joystick/tap/down-back.svg'
import tapJoystickDownForwardUrl from '../assets/motion-icons/joystick/tap/down-forward.svg'
import tapJoystickForwardUrl from '../assets/motion-icons/joystick/tap/forward.svg'
import tapJoystickUpUrl from '../assets/motion-icons/joystick/tap/up.svg'
import tapJoystickUpBackUrl from '../assets/motion-icons/joystick/tap/up-back.svg'
import tapJoystickUpForwardUrl from '../assets/motion-icons/joystick/tap/up-forward.svg'
import {
  type CanonicalRenderValue,
  DIRECTION_DEFINITIONS,
  MOTION_DEFINITIONS,
} from './notation-schema'
import type { MotionIconStyle } from './settings'

export type ArrowDirectionValue =
  | 'down-back'
  | 'down'
  | 'down-forward'
  | 'back'
  | 'forward'
  | 'up-back'
  | 'up'
  | 'up-forward'

export interface IconImage {
  source: string
  alt: string
  lowered?: boolean
}

export interface MotionIconGroup {
  label: string
  icons: IconImage[]
}

interface MotionIconDefinition {
  label: string
  joystickSteps?: readonly JoystickIconValue[]
  arrowSteps?: readonly ArrowDirectionValue[]
}

type JoystickIconValue = ArrowDirectionValue | 'qcf' | 'qcb' | 'dp' | 'rdp' | 'hcf' | 'hcb' | 'spd'

type JoystickMotionIconValue = Exclude<JoystickIconValue, ArrowDirectionValue>

// Arrow assets and decomposition behavior are adapted from notation.LABS MotionIcon.tsx.
export const TAP_ARROW_ICON_MAP: Record<ArrowDirectionValue, string> = {
  'down-back': tapDownBackUrl,
  down: tapDownUrl,
  'down-forward': tapDownForwardUrl,
  back: tapBackUrl,
  forward: tapForwardUrl,
  'up-back': tapUpBackUrl,
  up: tapUpUrl,
  'up-forward': tapUpForwardUrl,
}

export const HOLD_ARROW_ICON_MAP: Record<ArrowDirectionValue, string> = {
  'down-back': holdDownBackUrl,
  down: holdDownUrl,
  'down-forward': holdDownForwardUrl,
  back: holdBackUrl,
  forward: holdForwardUrl,
  'up-back': holdUpBackUrl,
  up: holdUpUrl,
  'up-forward': holdUpForwardUrl,
}

export const ARROW_ALT_TEXT: Record<ArrowDirectionValue, string> = {
  'down-back': 'Down-Back',
  down: 'Down',
  'down-forward': 'Down-Forward',
  back: 'Back',
  forward: 'Forward',
  'up-back': 'Up-Back',
  up: 'Up',
  'up-forward': 'Up-Forward',
}

export const TAP_JOYSTICK_ICON_MAP: Record<ArrowDirectionValue, IconImage> = {
  'down-back': { source: tapJoystickDownBackUrl, alt: 'DownBack' },
  down: { source: tapJoystickDownUrl, alt: 'Down' },
  'down-forward': { source: tapJoystickDownForwardUrl, alt: 'DownForward' },
  back: { source: tapJoystickBackUrl, alt: 'Back', lowered: true },
  forward: { source: tapJoystickForwardUrl, alt: 'Forward', lowered: true },
  'up-back': { source: tapJoystickUpBackUrl, alt: 'UpBack', lowered: true },
  up: { source: tapJoystickUpUrl, alt: 'Up', lowered: true },
  'up-forward': { source: tapJoystickUpForwardUrl, alt: 'UpForward', lowered: true },
}

const JOYSTICK_MOTION_ICON_MAP: Record<JoystickMotionIconValue, IconImage> = {
  qcf: { source: joystickQcfUrl, alt: 'QCF' },
  qcb: { source: joystickQcbUrl, alt: 'QCB' },
  dp: { source: joystickDpUrl, alt: 'DP' },
  rdp: { source: joystickRdpUrl, alt: 'RDP' },
  hcf: { source: joystickHcfUrl, alt: 'HCF' },
  hcb: { source: joystickHcbUrl, alt: 'HCB' },
  spd: { source: joystickSpdUrl, alt: '360', lowered: true },
}

export const HOLD_JOYSTICK_ICON_MAP: Record<ArrowDirectionValue, IconImage> = {
  'down-back': { source: holdJoystickDownBackUrl, alt: 'DownBack (hold)' },
  down: { source: holdJoystickDownUrl, alt: 'Down (hold)' },
  'down-forward': { source: holdJoystickDownForwardUrl, alt: 'DownForward (hold)' },
  back: { source: holdJoystickBackUrl, alt: 'Back (hold)', lowered: true },
  forward: { source: holdJoystickForwardUrl, alt: 'Forward (hold)', lowered: true },
  'up-back': { source: holdJoystickUpBackUrl, alt: 'UpBack (hold)', lowered: true },
  up: { source: holdJoystickUpUrl, alt: 'Up (hold)', lowered: true },
  'up-forward': { source: holdJoystickUpForwardUrl, alt: 'UpForward (hold)', lowered: true },
}

function getJoystickIcon(step: JoystickIconValue, hold: boolean): IconImage {
  if (Object.prototype.hasOwnProperty.call(TAP_JOYSTICK_ICON_MAP, step)) {
    const direction = step as ArrowDirectionValue
    return hold ? HOLD_JOYSTICK_ICON_MAP[direction] : TAP_JOYSTICK_ICON_MAP[direction]
  }

  return JOYSTICK_MOTION_ICON_MAP[step as JoystickMotionIconValue]
}

const FULL_CIRCLE_ARROW_STEPS = [
  'forward',
  'down-forward',
  'down',
  'down-back',
  'back',
  'up-back',
  'up',
  'up-forward',
] as const satisfies readonly ArrowDirectionValue[]

export function getArrowIconUrl(direction: ArrowDirectionValue, hold = false): string | undefined {
  return (hold ? HOLD_ARROW_ICON_MAP : TAP_ARROW_ICON_MAP)[direction]
}

const MOTION_ICON_REGISTRY: Record<CanonicalRenderValue, MotionIconDefinition> = {
  'double-qcf': {
    label: 'QCF',
    joystickSteps: ['qcf', 'qcf'],
    arrowSteps: ['down', 'down-forward', 'forward', 'down', 'down-forward', 'forward'],
  },
  'double-qcb': {
    label: 'QCB',
    joystickSteps: ['qcb', 'qcb'],
    arrowSteps: ['down', 'down-back', 'back', 'down', 'down-back', 'back'],
  },
  hcfb: {
    label: 'HCF',
    joystickSteps: ['hcf'],
    arrowSteps: ['back', 'down-back', 'down', 'down-forward', 'forward', 'back'],
  },
  hcbf: {
    label: 'HCBF',
    joystickSteps: ['hcb'],
    arrowSteps: ['forward', 'down-forward', 'down', 'down-back', 'back', 'forward'],
  },
  qcf: {
    label: 'QCF',
    joystickSteps: ['qcf'],
    arrowSteps: ['down', 'down-forward', 'forward'],
  },
  qcb: {
    label: 'QCB',
    joystickSteps: ['qcb'],
    arrowSteps: ['down', 'down-back', 'back'],
  },
  dp: {
    label: 'DP',
    joystickSteps: ['dp'],
    arrowSteps: ['forward', 'down', 'down-forward'],
  },
  rdp: {
    label: 'RDP',
    joystickSteps: ['rdp'],
    arrowSteps: ['back', 'down', 'down-back'],
  },
  hcf: {
    label: 'HCF',
    joystickSteps: ['hcf'],
    arrowSteps: ['back', 'down-back', 'down', 'down-forward', 'forward'],
  },
  hcb: {
    label: 'HCB',
    joystickSteps: ['hcb'],
    arrowSteps: ['forward', 'down-forward', 'down', 'down-back', 'back'],
  },
  'tiger-knee': {
    label: 'Tiger Knee',
    joystickSteps: ['qcf', 'up-forward'],
    arrowSteps: ['down', 'down-forward', 'forward', 'up-forward'],
  },
  'full-circle': {
    label: '360',
    joystickSteps: ['spd'],
    arrowSteps: FULL_CIRCLE_ARROW_STEPS,
  },
  'double-circle': {
    label: '720',
    joystickSteps: ['spd', 'spd'],
    arrowSteps: [...FULL_CIRCLE_ARROW_STEPS, ...FULL_CIRCLE_ARROW_STEPS],
  },
  'triple-circle': {
    label: '1080',
    joystickSteps: ['spd', 'spd', 'spd'],
    arrowSteps: [
      ...FULL_CIRCLE_ARROW_STEPS,
      ...FULL_CIRCLE_ARROW_STEPS,
      ...FULL_CIRCLE_ARROW_STEPS,
    ],
  },
  'down-up': {
    label: 'Down-Up',
    joystickSteps: ['down', 'up'],
    arrowSteps: ['down', 'up'],
  },
  'up-down': {
    label: 'Up-Down',
    joystickSteps: ['up', 'down'],
    arrowSteps: ['up', 'down'],
  },
  'back-forward': {
    label: 'Back-Forward',
    joystickSteps: ['back', 'forward'],
    arrowSteps: ['back', 'forward'],
  },
  'forward-back': {
    label: 'Forward-Back',
    joystickSteps: ['forward', 'back'],
    arrowSteps: ['forward', 'back'],
  },
  'back-down-forward': {
    label: 'Back-Down-Forward',
    joystickSteps: ['back', 'down', 'forward'],
    arrowSteps: ['back', 'down', 'forward'],
  },
  'forward-down-back': {
    label: 'Forward-Down-Back',
    joystickSteps: ['forward', 'down', 'back'],
    arrowSteps: ['forward', 'down', 'back'],
  },
  'forward-down-forward': {
    label: 'Forward-Down-Forward',
    joystickSteps: ['forward', 'down-forward', 'down'],
    arrowSteps: ['forward', 'down-forward', 'down'],
  },
  'dash-back': {
    label: 'Back',
    joystickSteps: ['back', 'back'],
    arrowSteps: ['back', 'back'],
  },
  'dash-forward': {
    label: 'Forward',
    joystickSteps: ['forward', 'forward'],
    arrowSteps: ['forward', 'forward'],
  },
  'double-down': {
    label: 'Down',
    joystickSteps: ['down', 'down'],
    arrowSteps: ['down', 'down'],
  },
  'double-up': {
    label: 'Up',
    joystickSteps: ['up', 'up'],
    arrowSteps: ['up', 'up'],
  },
  'down-back': {
    label: 'DownBack',
    joystickSteps: ['down-back'],
    arrowSteps: ['down-back'],
  },
  down: { label: 'Down', joystickSteps: ['down'], arrowSteps: ['down'] },
  'down-forward': {
    label: 'DownForward',
    joystickSteps: ['down-forward'],
    arrowSteps: ['down-forward'],
  },
  back: { label: 'Back', joystickSteps: ['back'], arrowSteps: ['back'] },
  neutral: { label: 'Neutral' },
  forward: {
    label: 'Forward',
    joystickSteps: ['forward'],
    arrowSteps: ['forward'],
  },
  'up-back': {
    label: 'UpBack',
    joystickSteps: ['up-back'],
    arrowSteps: ['up-back'],
  },
  up: { label: 'Up', joystickSteps: ['up'], arrowSteps: ['up'] },
  'up-forward': {
    label: 'UpForward',
    joystickSteps: ['up-forward'],
    arrowSteps: ['up-forward'],
  },
}

export function resolveMotionIconGroup(
  canonical: string,
  style: MotionIconStyle,
  hold = false,
): MotionIconGroup | undefined {
  const definition = MOTION_ICON_REGISTRY[canonical as CanonicalRenderValue]
  if (!definition) return undefined
  const label = hold ? `Hold ${definition.label}` : definition.label

  if (style === 'arrows') {
    if (!definition.arrowSteps?.length) return undefined

    const icons = definition.arrowSteps.flatMap((direction) => {
      const source = getArrowIconUrl(direction, hold)
      return source ? [{ source, alt: `${ARROW_ALT_TEXT[direction]}${hold ? ' (hold)' : ''}` }] : []
    })

    if (icons.length === definition.arrowSteps.length) {
      return { label, icons }
    }

    return undefined
  }

  if (!definition.joystickSteps?.length) return undefined

  return {
    label,
    icons: definition.joystickSteps.map((step) => ({ ...getJoystickIcon(step, hold) })),
  }
}

export function getMissingCanonicalMotionIcons(): CanonicalRenderValue[] {
  const canonicalValues = [...MOTION_DEFINITIONS, ...DIRECTION_DEFINITIONS].map(
    (definition) => definition.value,
  )

  return canonicalValues.filter((value) => {
    const definition = MOTION_ICON_REGISTRY[value]
    return !definition || (value !== 'neutral' && !definition.joystickSteps?.length)
  })
}

export function getMissingCanonicalArrowIcons(): CanonicalRenderValue[] {
  const canonicalValues = [...MOTION_DEFINITIONS, ...DIRECTION_DEFINITIONS].map(
    (definition) => definition.value,
  )

  return canonicalValues.filter((value) => {
    const definition = MOTION_ICON_REGISTRY[value]
    return !definition || (value !== 'neutral' && !definition.arrowSteps?.length)
  })
}
