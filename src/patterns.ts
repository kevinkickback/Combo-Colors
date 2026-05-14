import {
  type CanonicalRenderValue,
  DIRECTION_DEFINITIONS,
  MOTION_DEFINITIONS,
} from './notation-schema'
import type { CustomProfile } from './settings'

export interface MotionConfig {
  source: string
  class: string
  alt: string
  repeat?: number
}

interface ButtonConfig {
  source: string
  class: string
  alt: string
}

type ButtonMap = Map<string, ButtonConfig>

const MOTION_CONFIG_BY_CANONICAL: Record<CanonicalRenderValue, MotionConfig> = {
  'double-qcf': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><path d="M157 92.044V92h-13l20.035-25L184 92h-12v.045c0 31.797-18.593 59.301-40.002 69.281-13.897 8.023-28.7 11.342-42.992 10.774H84.5v-32.915h15v17.501c30.86-3.69 57.5-29.552 57.5-64.642" fill="white"/><circle cx="92" cy="92" r="50" fill="red"/></svg>`,
    class: 'motionIcon',
    alt: 'QCF',
    repeat: 2,
  },
  'double-qcb': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M356.825 419.567v-.044h-13l20.035-25 19.965 25h-12v.045a80 80 0 01-40.002 69.281c-13.897 8.023-28.7 11.342-42.992 10.774h-4.506v-32.915h15v17.501c30.86-3.691 57.499-29.552 57.5-64.642z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
    class: 'motionIcon',
    alt: 'QCB',
    repeat: 2,
  },
  hcfb: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M338.967 426.975v-15l32.915.001v4.506a78.189 78.189 0 01-2.709 23.748c-12.891 48.946-70.305 75.688-117.347 48.53a80.002 80.002 0 01-40.002-69.282v-.002h.001v-.044h-12l19.965-25 20.035 25h-13v.044c.001 35.09 26.64 60.951 57.5 64.642l.002.003c2.462.294 4.951.447 7.455.453v-.099h.044c5.981 0 11.694-.774 17.075-2.211 5.22-1.446 10.395-3.592 15.425-6.496a64.944 64.944 0 0025.079-26.132 64.964 64.964 0 006.986-22.661z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
    class: 'motionIcon',
    alt: 'HCF',
  },
  hcbf: {
    source: `<svg viewBox="0 0 184 184.046" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M244.682 427.03v-15l-32.915.002v4.506a78.189 78.189 0 0 0 2.71 23.748c12.89 48.946 70.304 75.688 117.346 48.53a80.002 80.002 0 0 0 40.002-69.282v-.046h12l-19.966-25-20.035 25h13v.044c0 35.09-26.64 60.95-57.5 64.642l-.002.003a64.168 64.168 0 0 1-7.455.453v-.1h-.044c-5.98 0-11.694-.773-17.075-2.21-5.22-1.446-10.395-3.592-15.425-6.496a64.944 64.944 0 0 1-25.079-26.132 64.964 64.964 0 0 1-6.986-22.661z" bx:origin="0.534512 0.762394" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red" pointer-events="none"/></g></svg>`,
    class: 'motionIcon',
    alt: 'HCBF',
  },
  qcf: {
    source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184 184"><path d="M157 92.044V92h-13l20.035-25L184 92h-12v.045c0 31.797-18.593 59.301-40.002 69.281-13.897 8.023-28.7 11.342-42.992 10.774H84.5v-32.915h15v17.501c30.86-3.69 57.5-29.552 57.5-64.642" fill="#fff"/><circle cx="92" cy="92" r="50" fill="red"/></svg>`,
    class: 'motionIcon',
    alt: 'QCF',
  },
  qcb: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M356.825 419.567v-.044h-13l20.035-25 19.965 25h-12v.045a80 80 0 01-40.002 69.281c-13.897 8.023-28.7 11.342-42.992 10.774h-4.506v-32.915h15v17.501c30.86-3.691 57.499-29.552 57.5-64.642z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
    class: 'motionIcon',
    alt: 'QCB',
  },
  dp: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M254.803 426.976l47.568 54.716h-59.89v12.5l-25-20 25-20v12.5h26.974l-47.568-54.716h69.961v15h-37.045z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'DP',
  },
  rdp: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M328.902 426.975l-47.568 54.716h59.89v12.5l25-20-25-20v12.5H314.25l47.568-54.716h-69.96v15h37.044z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'RDP',
  },
  hcf: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M338.967 426.975v-15l32.915.001v4.506a78.189 78.189 0 01-2.709 23.748c-12.891 48.946-70.305 75.688-117.347 48.53a80.002 80.002 0 01-40.002-69.282v-.002h.001v-.044h-12l19.965-25 20.035 25h-13v.044c.001 35.09 26.64 60.951 57.5 64.642l.002.003c2.462.294 4.951.447 7.455.453v-.099h.044c5.981 0 11.694-.774 17.075-2.211 5.22-1.446 10.395-3.592 15.425-6.496a64.944 64.944 0 0025.079-26.132 64.964 64.964 0 006.986-22.661z" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/></g></svg>`,
    class: 'motionIcon',
    alt: 'HCF',
  },
  hcb: {
    source: `<svg viewBox="0 0 184 184.046" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><path d="M244.682 427.03v-15l-32.915.002v4.506a78.189 78.189 0 0 0 2.71 23.748c12.89 48.946 70.304 75.688 117.346 48.53a80.002 80.002 0 0 0 40.002-69.282v-.046h12l-19.966-25-20.035 25h13v.044c0 35.09-26.64 60.95-57.5 64.642l-.002.003a64.168 64.168 0 0 1-7.455.453v-.1h-.044c-5.98 0-11.694-.773-17.075-2.21-5.22-1.446-10.395-3.592-15.425-6.496a64.944 64.944 0 0 1-25.079-26.132 64.964 64.964 0 0 1-6.986-22.661z" bx:origin="0.534512 0.762394" fill="white"/><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red" pointer-events="none"/></g></svg>`,
    class: 'motionIcon',
    alt: 'HCB',
  },
  'dash-back': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.801 426.976h67.023v12.5l25-20-25-20v12.5h-67.023v15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Back',
    repeat: 2,
  },
  'dash-forward': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.848 411.976h-67.023v-12.5l-25 20 25 20v-12.5h67.023v-15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Forward',
    repeat: 2,
  },
  'double-down': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M284.324 419.453v67.023h-12.5l20 25 20-25h-12.5v-67.023h-15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Down',
    repeat: 2,
  },
  'double-up': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M299.324 419.5v-67.024h12.5l-20-25-20 25h12.5V419.5h15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Up',
    repeat: 2,
  },
  'down-back': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M286.505 424.763l47.392 47.393-8.839 8.838 31.82 3.536-3.535-31.82-8.84 8.839-47.392-47.393-10.606 10.607z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'DownBack',
  },
  down: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M284.324 419.453v67.023h-12.5l20 25 20-25h-12.5v-67.023h-15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Down',
  },
  'down-forward': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M286.538 414.156l-47.393 47.393-8.838-8.84-3.536 31.82 31.82-3.535-8.839-8.839 47.392-47.392-10.606-10.607z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'DownForward',
  },
  back: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.801 426.976h67.023v12.5l25-20-25-20v12.5h-67.023v15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Back',
  },
  neutral: { source: '', class: 'hidden', alt: '' },
  forward: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M291.848 411.976h-67.023v-12.5l-25 20 25 20v-12.5h67.023v-15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Forward',
  },
  'up-back': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M297.111 424.796l47.392-47.393 8.84 8.84 3.535-31.82-31.82 3.535 8.839 8.839-47.393 47.393 10.607 10.607z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'UpBack',
  },
  up: {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M299.324 419.5v-67.024h12.5l-20-25-20 25h12.5V419.5h15z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'Up',
  },
  'up-forward': {
    source: `<svg viewBox="0 0 184 184" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 383.825 -327.476)"><circle cx="-291.825" cy="-419.499" r="50" transform="rotate(180)" fill="red"/><path d="M297.144 414.19l-47.393-47.393 8.84-8.839-31.82-3.535 3.535 31.82 8.839-8.84 47.392 47.393 10.607-10.607z" fill="white"/></g></svg>`,
    class: 'motionIcon',
    alt: 'UpForward',
  },
}

export function getMissingCanonicalMotionConfigs(): CanonicalRenderValue[] {
  const missing: CanonicalRenderValue[] = []

  for (const definition of MOTION_DEFINITIONS) {
    if (!MOTION_CONFIG_BY_CANONICAL[definition.value]) {
      missing.push(definition.value)
    }
  }

  for (const definition of DIRECTION_DEFINITIONS) {
    if (!MOTION_CONFIG_BY_CANONICAL[definition.value]) {
      missing.push(definition.value)
    }
  }

  return missing
}

// Generate button inputs based on profile
export const generateButtonMap = (profile: CustomProfile): ButtonMap => {
  const buttonMap = new Map()

  const calculateFontSize = (input: string): number => {
    const length = input.length
    if (length <= 1) return 80
    if (length === 2) return 60
    if (length === 3) return 50
    return Math.max(30, 80 - length * 10)
  }

  for (const input in profile.colors) {
    if (!Object.prototype.hasOwnProperty.call(profile.colors, input)) continue
    const fontSize = calculateFontSize(input)
    const svgText = `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="45" fill="white"/>
				<text
					x="50"
					y="50"
					text-anchor="middle"
					dominant-baseline="central"
					font-family="Arial"
					font-weight="bold"
					font-size="${fontSize}"
					fill="black"
				>${input}</text>
			</svg>`

    buttonMap.set(input, {
      source: svgText,
      class: 'buttonIcon',
      alt: input,
    })
  }

  return buttonMap
}

// Returns motion and direction SVG configs keyed by canonical parser value (e.g. 'qcf', 'down').
// Used by the parser adapter to look up SVG configs without alias re-parsing.
export const canonicalMotionMap = (): Map<string, MotionConfig> => {
  const missingDefinitions = getMissingCanonicalMotionConfigs()
  if (missingDefinitions.length > 0) {
    throw new Error(`Missing canonical motion configuration(s): ${missingDefinitions.join(', ')}`)
  }

  const result = new Map<string, MotionConfig>()

  for (const definition of MOTION_DEFINITIONS) {
    result.set(definition.value, MOTION_CONFIG_BY_CANONICAL[definition.value])
  }

  for (const definition of DIRECTION_DEFINITIONS) {
    result.set(definition.value, MOTION_CONFIG_BY_CANONICAL[definition.value])
  }

  return result
}
