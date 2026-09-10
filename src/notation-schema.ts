export interface AliasDefinition {
  value: string
  aliases: readonly string[]
}

export const DIRECTION_DEFINITIONS = [
  {
    value: 'down-back',
    aliases: ['db', '1'],
  },
  {
    value: 'down',
    aliases: ['cr', '2', 'd'],
  },
  {
    value: 'down-forward',
    aliases: ['df', '3'],
  },
  {
    value: 'back',
    aliases: ['b', '4'],
  },
  {
    value: 'neutral',
    aliases: ['st', '5'],
  },
  {
    value: 'forward',
    aliases: ['f', '6'],
  },
  {
    value: 'up-back',
    aliases: ['ub', '7'],
  },
  {
    value: 'up',
    aliases: ['u', '8'],
  },
  {
    value: 'up-forward',
    aliases: ['uf', '9'],
  },
] as const satisfies readonly AliasDefinition[]

export const MOTION_DEFINITIONS = [
  {
    value: 'double-qcf',
    aliases: ['2qcf', 'qcfqcf', '236236'],
  },
  {
    value: 'double-qcb',
    aliases: ['2qcb', 'qcbqcb', '214214'],
  },
  {
    value: 'hcfb',
    aliases: ['hcfb', '412364'],
  },
  {
    value: 'hcbf',
    aliases: ['hcbf', '632146'],
  },
  {
    value: 'qcf',
    aliases: ['qcf', '236'],
  },
  {
    value: 'qcb',
    aliases: ['qcb', '214'],
  },
  {
    value: 'dp',
    aliases: ['dp', 'srk', 'shoryuken', '623'],
  },
  {
    value: 'rdp',
    aliases: ['rdp', '421'],
  },
  {
    value: 'hcf',
    aliases: ['hcf', '41236'],
  },
  {
    value: 'hcb',
    aliases: ['hcb', '63214'],
  },
  {
    value: 'tiger-knee',
    aliases: ['tk', '2369'],
  },
  {
    value: 'full-circle',
    aliases: ['spd', '360'],
  },
  {
    value: 'double-circle',
    aliases: ['720'],
  },
  { value: 'triple-circle', aliases: ['1080'] },
  { value: 'down-up', aliases: ['28'] },
  { value: 'up-down', aliases: ['82'] },
  { value: 'back-forward', aliases: ['46'] },
  { value: 'forward-back', aliases: ['64'] },
  { value: 'back-down-forward', aliases: ['426'] },
  { value: 'forward-down-back', aliases: ['624'] },
  {
    value: 'forward-down-forward',
    aliases: ['632'],
  },
  {
    value: 'dash-back',
    aliases: ['backdash', 'bb', '44'],
  },
  {
    value: 'dash-forward',
    aliases: ['ff', '66'],
  },
  {
    value: 'double-down',
    aliases: ['dd', '22'],
  },
  {
    value: 'double-up',
    aliases: ['uu', '88'],
  },
] as const satisfies readonly AliasDefinition[]

export const MODIFIER_DEFINITIONS = [
  { value: 'j.', aliases: ['j.'] },
  { value: 'dj.', aliases: ['dj.'] },
  { value: 'sj.', aliases: ['sj.'] },
  { value: 'jc.', aliases: ['jc.'] },
  { value: 'sjc.', aliases: ['sjc.'] },
  { value: 'dl.', aliases: ['dl.'] },
  { value: 'cl.', aliases: ['cl.'] },
  { value: 'f.', aliases: ['f.'] },
  { value: 'dd.', aliases: ['dd.'] },
  { value: 'ch', aliases: ['ch'] },
  { value: 'whiff', aliases: ['whiff'] },
] as const satisfies readonly AliasDefinition[]

export type DirectionValue = (typeof DIRECTION_DEFINITIONS)[number]['value']
export type MotionValue = (typeof MOTION_DEFINITIONS)[number]['value']
export type CanonicalRenderValue = DirectionValue | MotionValue
