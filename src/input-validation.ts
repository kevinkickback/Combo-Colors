import type { InputConfig } from './modal'

const INPUT_NAME_REGEX = /^[A-Za-z0-9_-]+$/

export interface InputValidationResult {
  valid: boolean
  message?: string
  inputs: InputConfig[]
}

export function normalizeInputName(name: string): string {
  return name.trim()
}

export function validateAndNormalizeInputs(inputs: InputConfig[]): InputValidationResult {
  const seenNames = new Set<string>()
  const normalizedInputs: InputConfig[] = []

  for (const input of inputs) {
    const normalizedName = normalizeInputName(input.name)
    const normalizedDescription = input.description.trim()

    if (!normalizedName) {
      return {
        valid: false,
        message: 'Input names cannot be empty.',
        inputs: normalizedInputs,
      }
    }

    if (!INPUT_NAME_REGEX.test(normalizedName)) {
      return {
        valid: false,
        message: 'Input names can only use letters, numbers, underscores, and hyphens.',
        inputs: normalizedInputs,
      }
    }

    const duplicateKey = normalizedName.toLowerCase()
    if (seenNames.has(duplicateKey)) {
      return {
        valid: false,
        message: `Duplicate input name: ${normalizedName}`,
        inputs: normalizedInputs,
      }
    }
    seenNames.add(duplicateKey)

    normalizedInputs.push({
      name: normalizedName,
      description: normalizedDescription,
      color: input.color,
    })
  }

  return {
    valid: true,
    inputs: normalizedInputs,
  }
}
