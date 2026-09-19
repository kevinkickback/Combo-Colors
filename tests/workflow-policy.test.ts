import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const workflowPath = (name: string) => resolve(process.cwd(), '.github', 'workflows', name)
const readWorkflow = async (name: string) =>
  (await readFile(workflowPath(name), 'utf8')).replace(/\r\n/g, '\n')

describe('workflow policy', () => {
  test('keeps pull-request CI read-only and scoped to main', async () => {
    const workflow = await readWorkflow('ci.yml')

    expect(workflow).toContain('pull_request:')
    expect(workflow).toContain('branches: [main]')
    expect(workflow).not.toContain('branches: [dev, main]')
    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('name: Lint, type-check, and test')
    expect(workflow).toContain('run: npm run version:check')
    expect(workflow).toContain('run: npm run test:coverage')
    expect(workflow).toContain('runs-on: ubuntu-26.04')
    expect(workflow).not.toContain('contents: write')
    expect(workflow).not.toContain('pull-requests: write')
    expect(workflow).not.toContain('github.rest.pulls.merge')
  })

  test('uses GitHub native merging instead of a privileged merge workflow', async () => {
    await expect(access(workflowPath('merge.yml'))).rejects.toThrow()
  })

  test('creates an exact draft only from a protected current-main dispatch', async () => {
    const workflow = await readWorkflow('release.yml')

    expect(workflow).toContain('repository_dispatch:')
    expect(workflow).toContain('types: [release-requested]')
    expect(workflow).not.toContain('workflow_dispatch:')
    expect(workflow).not.toContain('push:\n    branches: [main]')
    expect(workflow).toContain('Require the current main revision')
    expect(workflow).toContain('A full main source SHA is required.')
    expect(workflow).toContain('branch.commit.sha !== sourceSha')
    expect(workflow).toContain('--published-tags-file release-metadata/published-tags.txt')
    expect(workflow).toContain('tag="$version"')
    expect(workflow).toContain('draft(s) already exist for $RELEASE_TAG')
    expect(workflow).toContain('Tag $RELEASE_TAG points to $existing_sha instead of $SOURCE_SHA')
    expect(workflow).not.toContain('rebuild-release')

    const validateJob = workflow.slice(
      workflow.indexOf('\n  validate-source:'),
      workflow.indexOf('\n  release-state:'),
    )
    expect(validateJob).toContain('permissions:\n      contents: read')
    expect(validateJob).toContain('node scripts/check-release.mjs')
    expect(validateJob).not.toContain('contents: write')

    const releaseStateJob = workflow.slice(
      workflow.indexOf('\n  release-state:'),
      workflow.indexOf('\n  build:'),
    )
    expect(releaseStateJob).toContain('permissions:\n      contents: write')
    expect(releaseStateJob).not.toContain('actions/checkout')
    expect(releaseStateJob).not.toContain('scripts/check-release.mjs')

    const buildJob = workflow.slice(
      workflow.indexOf('\n  build:'),
      workflow.indexOf('\n  publish-release:'),
    )
    expect(buildJob).toContain('runs-on: ubuntu-26.04')
    expect(buildJob).toContain('permissions:\n      contents: read')
    expect(buildJob).toContain('run: npm run build')
    expect(buildJob).toContain('main.js')
    expect(buildJob).toContain('manifest.json')
    expect(buildJob).toContain('styles.css')
    expect(buildJob).not.toContain('GH_TOKEN')
    expect(buildJob).not.toContain('contents: write')

    const publishJob = workflow.slice(
      workflow.indexOf('\n  publish-release:'),
      workflow.indexOf('\n  verify-release:'),
    )
    const validateIndex = publishJob.indexOf('Validate completed artifact bundle')
    const attestIndex = publishJob.indexOf('Attest build provenance')
    const mutateIndex = publishJob.indexOf('Create draft from completed artifacts')
    expect(validateIndex).toBeGreaterThan(-1)
    expect(validateIndex).toBeLessThan(attestIndex)
    expect(attestIndex).toBeLessThan(mutateIndex)
    expect(publishJob).toContain('Expected exactly 3 release artifacts')
    expect(publishJob).toContain('manifest.json version $manifest_version does not match')
    expect(publishJob).toContain('assert_current_main')
    expect(publishJob).toContain('assert_no_releases')
    expect(publishJob).toContain('gh release create "$RELEASE_TAG" release-artifacts/*')
    expect(publishJob).not.toContain('gh release edit')
    expect(publishJob).not.toContain('gh release upload')
    expect(publishJob).not.toContain('--method DELETE')
    expect(publishJob).not.toContain('--method PATCH')

    expect(workflow).toContain('Expected exactly one draft for $RELEASE_TAG')
    expect(workflow).toContain('Expected exactly 3 release assets')
    expect(workflow).toContain('select(.size <= 0)')
    expect(workflow).toContain('Release notes do not match the validated changelog.')
  })

  test('pins every official action to an immutable commit', async () => {
    const workflows = await Promise.all(['ci.yml', 'release.yml'].map(readWorkflow))
    const actionUses = workflows.flatMap((workflow) =>
      [...workflow.matchAll(/uses:\s+(actions\/[^@\s]+)@([^\s#]+)/g)].map((match) => ({
        action: match[1],
        revision: match[2],
      })),
    )

    expect(actionUses.length).toBeGreaterThan(0)
    expect(actionUses.every(({ revision }) => /^[0-9a-f]{40}$/.test(revision))).toBe(true)
  })

  test('uses Node 22 for every repository-run Node job', async () => {
    const workflows = await Promise.all(['ci.yml', 'release.yml'].map(readWorkflow))
    const nodeVersions = workflows.flatMap((workflow) =>
      [
        ...workflow.matchAll(
          /uses: actions\/setup-node@[^\n]+\n\s+with:\n\s+node-version: "?(\d+)"?/g,
        ),
      ].map((match) => match[1]),
    )

    expect(nodeVersions).toEqual(['22', '22', '22'])
  })
})
