import { readFile, writeFile } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

let notesFile
let previousVersion
let sourceRoot
const arguments_ = process.argv.slice(2)
for (let index = 0; index < arguments_.length; index += 1) {
  const argument = arguments_[index]
  const value = arguments_[index + 1]
  if (
    argument === '--notes-file' ||
    argument === '--previous-version' ||
    argument === '--source-root'
  ) {
    if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value.`)
    if (argument === '--notes-file') notesFile = value
    else if (argument === '--previous-version') previousVersion = value
    else sourceRoot = value
    index += 1
  } else {
    throw new Error(`Unknown argument: ${argument}`)
  }
}

const root = sourceRoot
  ? pathToFileURL(`${resolve(sourceRoot)}${sep}`)
  : new URL('../', import.meta.url)
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'))

const packageJson = await readJson('package.json')
const packageLock = await readJson('package-lock.json')
const manifest = await readJson('manifest.json')
const versions = await readJson('versions.json')
const version = packageJson.version
const stableVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

if (typeof version !== 'string' || !stableVersionPattern.test(version)) {
  throw new Error('Releases require a stable X.Y.Z package version.')
}

const metadataVersions = new Map([
  ['package-lock.json', packageLock.version],
  ['package-lock.json root package', packageLock.packages?.['']?.version],
  ['manifest.json', manifest.version],
])
const mismatches = [...metadataVersions].filter(([, value]) => value !== version)
if (mismatches.length > 0) {
  const details = mismatches.map(([source, value]) => `${source}: ${value ?? 'missing'}`).join('\n')
  throw new Error(`Version metadata does not match package.json (${version}):\n${details}`)
}

if (typeof manifest.minAppVersion !== 'string' || versions[version] !== manifest.minAppVersion) {
  throw new Error(
    `versions.json must map ${version} to manifest.json minAppVersion (${manifest.minAppVersion ?? 'missing'}).`,
  )
}

if (previousVersion !== undefined) {
  if (!stableVersionPattern.test(previousVersion)) {
    throw new Error(`Previous package version is not stable X.Y.Z: ${previousVersion}`)
  }
  const current = version.split('.').map(Number)
  const previous = previousVersion.split('.').map(Number)
  const comparison = current.findIndex((part, index) => part !== previous[index])
  if (comparison === -1 || current[comparison] < previous[comparison]) {
    throw new Error(`Release version must increase (${previousVersion} -> ${version}).`)
  }
}

const changelog = await readFile(new URL('docs/changelog.md', root), 'utf8')
const lines = changelog.split(/\r?\n/)
const heading = `# v${version}`
const starts = lines.flatMap((line, index) => (line.trim() === heading ? [index] : []))
if (starts.length !== 1) {
  throw new Error(`Expected exactly one "${heading}" heading in docs/changelog.md.`)
}

const start = starts[0]
const nextRelease = lines.findIndex(
  (line, index) => index > start && /^# v\d+\.\d+\.\d+\s*$/.test(line.trim()),
)
const notes = lines
  .slice(start + 1, nextRelease === -1 ? undefined : nextRelease)
  .join('\n')
  .trim()
if (!notes) {
  throw new Error(`Release notes for ${version} are empty.`)
}

if (notesFile !== undefined) await writeFile(notesFile, `${notes}\n`)

console.log(`Obsidian release metadata and notes validated for ${version}.`)
