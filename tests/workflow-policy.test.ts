import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const readWorkflow = (name: string) =>
  readFile(resolve(process.cwd(), '.github', 'workflows', name), 'utf8')

describe('trusted workflow policy', () => {
  test('keeps pull request CI read-only', async () => {
    const workflow = await readWorkflow('ci.yml')

    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('name: Lint, type-check, and test')
    expect(workflow).toContain('run: npm run test:coverage')
    expect(workflow).not.toContain('contents: write')
    expect(workflow).not.toContain('pull-requests: write')
    expect(workflow).not.toContain('actions/github-script')
    expect(workflow).not.toContain('workflows/release.yml')
  })

  test('auto-merges only the exact tested application revision', async () => {
    const workflow = await readWorkflow('merge.yml')

    expect(workflow).toContain('workflow_run:')
    expect(workflow).toContain('github.rest.actions.listJobsForWorkflowRun')
    expect(workflow).toContain("'Lint, type-check, and test'")
    expect(workflow).toContain("matches[0].conclusion !== 'success'")
    expect(workflow).toContain("pr.base.ref !== 'main'")
    expect(workflow).toContain("pr.head.ref !== 'dev'")
    expect(workflow).toContain('github.rest.pulls.listFiles')
    expect(workflow).toContain("path.startsWith('.github/workflows/')")
    expect(workflow).toContain("path.startsWith('.github/scripts/')")
    expect(workflow).toContain("path === 'scripts/check-release.mjs'")
    expect(workflow).toContain('Release infrastructure changes require a manual merge')
    expect(workflow).toContain('pr.base.sha !== testedBase')
    expect(workflow).toContain('currentBase.commit.sha !== testedBase')
    expect(workflow).toContain('sha: testedHead')
    expect(workflow).toContain("event_type: 'release-merged'")
    expect(workflow).toContain('github.rest.repos.createDispatchEvent')

    expect(workflow).not.toContain('actions/checkout')
    expect(workflow).not.toContain('actions/setup-node')
    expect(workflow).not.toContain('npm ci')
  })

  test('builds without write credentials and publishes only a complete exact bundle', async () => {
    const workflow = await readWorkflow('release.yml')

    expect(workflow).toContain('push:')
    expect(workflow).toContain('branches: [main]')
    expect(workflow).toContain('repository_dispatch:')
    expect(workflow).toContain('types: [release-merged, rebuild-release]')
    expect(workflow).not.toContain('workflow_call:')
    expect(workflow).not.toContain('workflow_dispatch:')
    expect(workflow).toContain(`ref: \${{ github.workflow_sha || github.sha }}`)
    expect(workflow).toContain('node ../trusted/scripts/check-release.mjs')
    expect(workflow).toContain('--source-root . --notes-file ../release-metadata/release-notes.md')
    expect(workflow).not.toContain('node scripts/check-release.mjs')

    const buildJob = workflow.slice(
      workflow.indexOf('\n  build:'),
      workflow.indexOf('\n  publish-release:'),
    )
    expect(buildJob).toContain('permissions:\n      contents: read')
    expect(buildJob).toContain('name: Preserve build artifacts')
    expect(buildJob).not.toContain('GH_TOKEN')
    expect(buildJob).not.toContain('contents: write')
    expect(buildJob).not.toContain('id-token: write')

    const publishJob = workflow.slice(
      workflow.indexOf('\n  publish-release:'),
      workflow.indexOf('\n  verify-release:'),
    )
    expect(publishJob).not.toContain('actions/checkout')
    expect(publishJob).toContain('contents: write')
    expect(publishJob).toContain('Validate completed artifact bundle')
    expect(publishJob).toContain('Expected exactly 3 release artifacts')
    expect(publishJob).toContain('Attest build provenance')
    expect(publishJob).toContain('Replace or create draft from completed artifacts')
    expect(publishJob).toContain(['for release_id in "$', '{release_ids[@]}"'].join(''))
    expect(publishJob).toContain('assert_draft "$release_id"')
    expect(publishJob).not.toContain('gh release upload')

    const validateIndex = publishJob.indexOf('Validate completed artifact bundle')
    const attestIndex = publishJob.indexOf('Attest build provenance')
    const mutateIndex = publishJob.indexOf('Replace or create draft from completed artifacts')
    expect(validateIndex).toBeGreaterThan(-1)
    expect(validateIndex).toBeLessThan(attestIndex)
    expect(attestIndex).toBeLessThan(mutateIndex)

    expect(workflow).toContain('Expected exactly one draft for $RELEASE_TAG')
    expect(workflow).toContain('Expected exactly 3 release assets')
    expect(workflow).toContain('Tag $RELEASE_TAG points to $tag_sha instead of $SOURCE_SHA')
  })

  test('pins every official action to an immutable commit', async () => {
    const workflows = await Promise.all(
      ['ci.yml', 'merge.yml', 'release.yml'].map((name) => readWorkflow(name)),
    )
    const actionUses = workflows.flatMap((workflow) =>
      [...workflow.matchAll(/uses:\s+(actions\/[^@\s]+)@([^\s#]+)/g)].map((match) => ({
        action: match[1],
        revision: match[2],
      })),
    )

    expect(actionUses.length).toBeGreaterThan(0)
    expect(actionUses.every(({ revision }) => /^[0-9a-f]{40}$/.test(revision))).toBe(true)
  })

  test('uses Node 22 for every repository-run Node step', async () => {
    const workflows = await Promise.all(['ci.yml', 'release.yml'].map((name) => readWorkflow(name)))
    const nodeVersions = workflows.flatMap((workflow) =>
      [
        ...workflow.matchAll(
          /uses: actions\/setup-node@[^\n]+\n\s+with:\n\s+node-version: "?(\d+)"?/g,
        ),
      ].map((match) => match[1]),
    )

    expect(nodeVersions.length).toBeGreaterThan(0)
    expect(nodeVersions.every((version) => version === '22')).toBe(true)
  })
})
