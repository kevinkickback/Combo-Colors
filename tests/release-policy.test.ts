import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  packageVersion: '2.0.0',
  lockVersion: '2.0.0',
  rootLockVersion: '2.0.0',
  manifestVersion: '2.0.0',
  minAppVersion: '1.2.3',
  versions: { '2.0.0': '1.2.3' } as Record<string, string>,
  changelog: '# v2.0.0\n\n- New release\n\n# v1.9.0\n\n- Previous release',
  writes: [] as Array<{ path: string; contents: string }>,
}))

vi.mock('node:fs/promises', () => {
  const mock = {
    readFile: (url: URL) => {
      const path = url.pathname.replace(/\\/g, '/')
      if (path.endsWith('/package.json')) {
        return JSON.stringify({ version: state.packageVersion })
      }
      if (path.endsWith('/package-lock.json')) {
        return JSON.stringify({
          version: state.lockVersion,
          packages: { '': { version: state.rootLockVersion } },
        })
      }
      if (path.endsWith('/manifest.json')) {
        return JSON.stringify({
          version: state.manifestVersion,
          minAppVersion: state.minAppVersion,
        })
      }
      if (path.endsWith('/versions.json')) return JSON.stringify(state.versions)
      if (path.endsWith('/docs/changelog.md')) return state.changelog
      throw new Error(`Missing mocked file: ${path}`)
    },
    writeFile: (path: string, contents: string) => {
      state.writes.push({ path, contents })
    },
  }
  return { ...mock, default: mock }
})

beforeEach(() => {
  vi.resetModules()
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  Object.assign(state, {
    packageVersion: '2.0.0',
    lockVersion: '2.0.0',
    rootLockVersion: '2.0.0',
    manifestVersion: '2.0.0',
    minAppVersion: '1.2.3',
    versions: { '2.0.0': '1.2.3' },
    changelog: '# v2.0.0\n\n- New release\n\n# v1.9.0\n\n- Previous release',
    writes: [],
  })
  process.argv = ['node', 'scripts/release/check-release.mjs']
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function run() {
  return import('../scripts/release/check-release.mjs')
}

test('accepts synchronized Obsidian release metadata', async () => {
  await expect(run()).resolves.toBeDefined()
  expect(state.writes).toEqual([])
})

test('extracts only the current release section for draft notes', async () => {
  process.argv.push('--notes-file', 'release-notes.md')

  await run()

  expect(state.writes).toEqual([
    {
      path: 'release-notes.md',
      contents: '- New release\n',
    },
  ])
})

test.each([
  [
    'prerelease version',
    () => {
      state.packageVersion = '2.0.0-beta.1'
    },
    'stable X.Y.Z',
  ],
  [
    'lockfile version mismatch',
    () => {
      state.lockVersion = '1.9.0'
    },
    'Version metadata does not match',
  ],
  [
    'root lockfile version mismatch',
    () => {
      state.rootLockVersion = '1.9.0'
    },
    'Version metadata does not match',
  ],
  [
    'manifest version mismatch',
    () => {
      state.manifestVersion = '1.9.0'
    },
    'Version metadata does not match',
  ],
  [
    'versions metadata mismatch',
    () => {
      state.versions = { '2.0.0': '1.3.0' }
    },
    'versions.json must map',
  ],
  [
    'missing changelog section',
    () => {
      state.changelog = '# v1.9.0\n\n- Previous release'
    },
    'Expected exactly one',
  ],
  [
    'empty changelog section',
    () => {
      state.changelog = '# v2.0.0\n\n# v1.9.0\n\n- Previous release'
    },
    'Release notes for 2.0.0 are empty',
  ],
] as const)('rejects %s', async (_name, change, message) => {
  change()
  await expect(run()).rejects.toThrow(message)
})
