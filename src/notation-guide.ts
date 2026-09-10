import {
  DIRECTION_DEFINITIONS,
  type DirectionValue,
  MODIFIER_DEFINITIONS,
  MOTION_DEFINITIONS,
  type MotionValue,
} from './notation-schema'

export interface NotationGuideRow {
  aliases: readonly string[]
  resolution: string
}

export interface DirectionGuideRow extends NotationGuideRow {
  value: DirectionValue
  symbol: string
}

const DIRECTION_LABELS: Record<DirectionValue, string> = {
  'down-back': 'Down-back',
  down: 'Down',
  'down-forward': 'Down-forward',
  back: 'Back',
  neutral: 'Neutral',
  forward: 'Forward',
  'up-back': 'Up-back',
  up: 'Up',
  'up-forward': 'Up-forward',
}

const DIRECTION_SYMBOLS: Record<DirectionValue, string> = {
  'down-back': '↙',
  down: '↓',
  'down-forward': '↘',
  back: '←',
  neutral: '⊙',
  forward: '→',
  'up-back': '↖',
  up: '↑',
  'up-forward': '↗',
}

const MOTION_LABELS: Record<MotionValue, string> = {
  'double-qcf': 'Double quarter-circle forward',
  'double-qcb': 'Double quarter-circle back',
  hcfb: 'Half-circle forward, then back',
  hcbf: 'Half-circle back, then forward',
  qcf: 'Quarter-circle forward',
  qcb: 'Quarter-circle back',
  dp: 'Dragon-punch motion',
  rdp: 'Reverse dragon-punch motion',
  hcf: 'Half-circle forward',
  hcb: 'Half-circle back',
  'tiger-knee': 'Tiger-knee motion',
  'full-circle': 'Full circle (360)',
  'double-circle': 'Two full circles (720)',
  'triple-circle': 'Three full circles (1080)',
  'down-up': 'Down, then up',
  'up-down': 'Up, then down',
  'back-forward': 'Back, then forward',
  'forward-back': 'Forward, then back',
  'back-down-forward': 'Back, down, forward',
  'forward-down-back': 'Forward, down, back',
  'forward-down-forward': 'Forward, down-forward, down',
  'dash-back': 'Back twice (backdash)',
  'dash-forward': 'Forward twice (forward dash)',
  'double-down': 'Down twice',
  'double-up': 'Up twice',
}

const MODIFIER_LABELS: Record<string, string> = {
  'j.': 'Jumping',
  'dj.': 'Double jump',
  'sj.': 'Super jump',
  'jc.': 'Jump cancel',
  'sjc.': 'Super-jump cancel',
  'dl.': 'Delay',
  'cl.': 'Close',
  'f.': 'Far',
  'dd.': 'Double down',
  ch: 'Counter hit',
  whiff: 'Whiff',
}

export const DIRECTION_GUIDE_ROWS: DirectionGuideRow[] = DIRECTION_DEFINITIONS.map(
  (definition) => ({
    value: definition.value,
    aliases: definition.aliases,
    symbol: DIRECTION_SYMBOLS[definition.value],
    resolution: DIRECTION_LABELS[definition.value],
  }),
)

export const MOTION_GUIDE_ROWS: NotationGuideRow[] = MOTION_DEFINITIONS.map((definition) => ({
  aliases: definition.aliases,
  resolution: MOTION_LABELS[definition.value],
}))

export const MODIFIER_GUIDE_ROWS: NotationGuideRow[] = MODIFIER_DEFINITIONS.map((definition) => ({
  aliases: definition.aliases,
  resolution: MODIFIER_LABELS[definition.value] ?? definition.value,
}))

export const SYNTAX_GUIDE_ROWS: NotationGuideRow[] = [
  { aliases: ['=:combo:='], resolution: 'Notation delimiters' },
  { aliases: ['[2]', '[b]', '[A]'], resolution: 'Hold a direction or profile input' },
  { aliases: ['A+B'], resolution: 'Simultaneous inputs' },
  { aliases: ['236A~A'], resolution: 'Cancel or follow-up input' },
  { aliases: ['qcf.A'], resolution: 'Join a motion and button' },
  { aliases: [',', '>', '|>'], resolution: 'Separate actions or transitions' },
  { aliases: ['Ax5', 'A*N'], resolution: 'Repeat an input' },
  { aliases: ['(A>B)x3'], resolution: 'Repeat a sequence' },
]
