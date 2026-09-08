import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'))

const packageJson = await readJson('package.json')
const packageLock = await readJson('package-lock.json')
const manifest = await readJson('manifest.json')
const versions = await readJson('versions.json')
const version = packageJson.version

if (typeof version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
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
const notes = lines.slice(start + 1, nextRelease === -1 ? undefined : nextRelease).join('\n').trim()
if (!notes) {
  throw new Error(`Release notes for ${version} are empty.`)
}

const unknownArguments = process.argv.slice(2).filter((argument, index, arguments_) => {
  return argument !== '--notes-file' && arguments_[index - 1] !== '--notes-file'
})
if (unknownArguments.length > 0) {
  throw new Error(`Unknown argument: ${unknownArguments[0]}`)
}

const notesFlag = process.argv.indexOf('--notes-file')
if (notesFlag !== -1) {
  const outputPath = process.argv[notesFlag + 1]
  if (!outputPath) throw new Error('--notes-file requires a path.')
  await writeFile(outputPath, `${notes}\n`)
}

console.log(`Obsidian release metadata and notes validated for ${version}.`)
