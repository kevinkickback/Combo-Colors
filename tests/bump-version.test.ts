import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  reads: [] as string[],
  writes: [] as Array<{ path: string; contents: string }>,
}))

vi.mock('node:fs', () => {
  const mock = {
    readFileSync: (path: string) => {
      state.reads.push(path)
      if (path === 'manifest.json') {
        return JSON.stringify({ version: '1.0.0', minAppVersion: '1.2.3' })
      }
      if (path === 'versions.json') return JSON.stringify({ '1.0.0': '1.2.3' })
      throw new Error(`Missing mocked file: ${path}`)
    },
    writeFileSync: (path: string, contents: string) => {
      state.writes.push({ path, contents })
    },
  }
  return { ...mock, default: mock }
})

const originalVersion = process.env.npm_package_version

beforeEach(() => {
  vi.resetModules()
  state.reads = []
  state.writes = []
  process.env.npm_package_version = '2.0.0'
})

afterEach(() => {
  if (originalVersion === undefined) delete process.env.npm_package_version
  else process.env.npm_package_version = originalVersion
})

const run = () => import('../scripts/bump-version.mjs')

test('updates Obsidian release metadata from the npm lifecycle version', async () => {
  await run()

  expect(state.writes).toEqual([
    {
      path: 'manifest.json',
      contents: `${JSON.stringify({ version: '2.0.0', minAppVersion: '1.2.3' }, null, 2)}\n`,
    },
    {
      path: 'versions.json',
      contents: `${JSON.stringify({ '1.0.0': '1.2.3', '2.0.0': '1.2.3' }, null, 2)}\n`,
    },
  ])
})

test('fails before reading or writing metadata without an npm lifecycle version', async () => {
  delete process.env.npm_package_version

  await expect(run()).rejects.toThrow('npm_package_version must contain a stable X.Y.Z version.')
  expect(state.reads).toEqual([])
  expect(state.writes).toEqual([])
})
