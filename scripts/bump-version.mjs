import { readFileSync, writeFileSync } from 'node:fs'

const targetVersion = process.env.npm_package_version
if (
  typeof targetVersion !== 'string' ||
  !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(targetVersion)
) {
  throw new Error('npm_package_version must contain a stable X.Y.Z version.')
}

// read minAppVersion from manifest.json and bump version to target version
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
const { minAppVersion } = manifest
manifest.version = targetVersion
writeFileSync('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)

// update versions.json with target version and minAppVersion from manifest.json
const versions = JSON.parse(readFileSync('versions.json', 'utf8'))
versions[targetVersion] = minAppVersion
writeFileSync('versions.json', `${JSON.stringify(versions, null, 2)}\n`)
