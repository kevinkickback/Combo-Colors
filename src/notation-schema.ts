export interface AliasDefinition {
  value: string
  aliases: readonly string[]
  naturalLanguageAliases?: readonly string[]
}

export const DIRECTION_DEFINITIONS = [
  {
    value: 'down-back',
    aliases: ['db', '1'],
    naturalLanguageAliases: ['down-back', 'down back'],
  },
  { value: 'down', aliases: ['cr', '2'], naturalLanguageAliases: ['crouch', 'crouching', 'down'] },
  {
    value: 'down-forward',
    aliases: ['df', '3'],
    naturalLanguageAliases: ['down-forward', 'down forward'],
  },
  { value: 'back', aliases: ['b', '4'], naturalLanguageAliases: ['back'] },
  {
    value: 'neutral',
    aliases: ['st', '5'],
    naturalLanguageAliases: ['neutral', 'stand', 'standing'],
  },
  { value: 'forward', aliases: ['f', '6'], naturalLanguageAliases: ['forward'] },
  {
    value: 'up-back',
    aliases: ['ub', '7'],
    naturalLanguageAliases: ['up-back', 'up back'],
  },
  { value: 'up', aliases: ['u', '8'], naturalLanguageAliases: ['up'] },
  {
    value: 'up-forward',
    aliases: ['uf', '9'],
    naturalLanguageAliases: ['up-forward', 'up forward'],
  },
] as const satisfies readonly AliasDefinition[]

export const MOTION_DEFINITIONS = [
  {
    value: 'double-qcf',
    aliases: ['2qcf', '236236'],
    naturalLanguageAliases: ['double quarter circle forward', 'double qcf'],
  },
  {
    value: 'double-qcb',
    aliases: ['2qcb', '214214'],
    naturalLanguageAliases: ['double quarter circle back', 'double qcb'],
  },
  {
    value: 'hcfb',
    aliases: ['hcfb', '412364'],
    naturalLanguageAliases: ['half circle forward back'],
  },
  {
    value: 'hcbf',
    aliases: ['hcbf', '632146'],
    naturalLanguageAliases: ['half circle back forward'],
  },
  {
    value: 'qcf',
    aliases: ['qcf', '236'],
    naturalLanguageAliases: ['quarter circle forward'],
  },
  {
    value: 'qcb',
    aliases: ['qcb', '214'],
    naturalLanguageAliases: ['quarter circle back'],
  },
  { value: 'dp', aliases: ['dp', '623'], naturalLanguageAliases: ['dragon punch'] },
  { value: 'rdp', aliases: ['rdp', '421'], naturalLanguageAliases: ['reverse dragon punch'] },
  {
    value: 'hcf',
    aliases: ['hcf', '41236'],
    naturalLanguageAliases: ['half circle forward'],
  },
  {
    value: 'hcb',
    aliases: ['hcb', '63214'],
    naturalLanguageAliases: ['half circle back'],
  },
  {
    value: 'dash-back',
    aliases: ['44'],
    naturalLanguageAliases: ['back dash', 'dash back', 'backdashing'],
  },
  {
    value: 'dash-forward',
    aliases: ['66'],
    naturalLanguageAliases: ['forward dash', 'dash forward', 'dashing', 'dash'],
  },
  {
    value: 'double-down',
    aliases: ['dd', '22'],
    naturalLanguageAliases: ['down down', 'double down'],
  },
  {
    value: 'double-up',
    aliases: ['uu', '88'],
    naturalLanguageAliases: ['up up', 'double jumping'],
  },
] as const satisfies readonly AliasDefinition[]

export const MODIFIER_DEFINITIONS = [
  { value: 'j.', aliases: ['j.'], naturalLanguageAliases: ['jump', 'jumping'] },
  { value: 'dj.', aliases: ['dj.'], naturalLanguageAliases: ['double jump', 'double jumping'] },
  { value: 'sj.', aliases: ['sj.'], naturalLanguageAliases: ['super jump', 'super jumping'] },
  { value: 'jc.', aliases: ['jc.'], naturalLanguageAliases: ['jump cancel'] },
  { value: 'sjc.', aliases: ['sjc.'], naturalLanguageAliases: ['super jump cancel'] },
  { value: 'dl.', aliases: ['dl.'] },
  { value: 'cl.', aliases: ['cl.'] },
  { value: 'f.', aliases: ['f.'] },
  { value: 'dd.', aliases: ['dd.'], naturalLanguageAliases: ['double down'] },
  { value: 'ch', aliases: ['ch'] },
  { value: 'whiff', aliases: ['whiff'] },
] as const satisfies readonly AliasDefinition[]

export type DirectionValue = (typeof DIRECTION_DEFINITIONS)[number]['value']
export type MotionValue = (typeof MOTION_DEFINITIONS)[number]['value']
export type CanonicalRenderValue = DirectionValue | MotionValue
