# Release workflow

`dev` is the integration branch and `main` is the stable production branch. Do not push commits or
tags directly to `main`. Changes reach it only through a same-repository `dev` to `main` pull
request; short-lived branches should merge into `dev` first.

## Branches and repository settings

Configure the `main` ruleset to reject direct pushes, allow squash merging, require the branch to
be up to date, and require the **Lint, type-check, and test** check. Allow workflow
`contents: write` and `pull-requests: write` permissions.

Automatic Copilot review can remain enabled for draft pull requests and new pushes, but it is
advisory. CI and merging do not poll or wait for it. Review any findings before publishing the
draft release.

Do not require the downstream merge or release jobs as pre-merge checks.

### Trusted automatic merge

`ci.yml` runs with read-only permissions for non-draft pull requests targeting `dev` or `main`. It
performs Biome formatting checks, the official Obsidian JavaScript/TypeScript and CSS lint checks,
type checking, coverage tests, and a production build.

After CI completes, `merge.yml` runs from protected `main`. For a ready same-repository `dev` to
`main` pull request, it verifies the required CI job passed exactly once for the current head,
confirms `main` has not moved since the tested merge revision, and squash-merges that exact head.

Changes to these release-infrastructure paths are deliberately excluded from automatic merging and
require an explicit maintainer merge after CI:

- `.github/workflows/**`
- `.github/scripts/**`
- `scripts/check-release.mjs`

This prevents a pull request from redefining the checks or privileged release logic that would
approve that same pull request.

### One-time workflow bootstrap

GitHub loads a `workflow_run` workflow from the default branch. The pull request that initially
adds or changes this automation must therefore be squash-merged manually after CI passes. Future
release-infrastructure changes use the same manual exception.

## Releasing a new version

1. Start from `dev`, ensure it is synchronized with `origin/dev`, and confirm the release contains
   no unrelated working-tree changes.
2. Update `docs/changelog.md` with a unique `# vX.Y.Z` section and nonempty user-facing notes.
3. Bump the version without creating a tag:

   ```bash
   npm version X.Y.Z --no-git-tag-version
   ```

4. Run the local release gate:

   ```bash
   npm ci
   npm run lint
   npm run typecheck
   npm run test:coverage
   npm run build
   node scripts/check-release.mjs
   ```

5. Commit and push the complete release source, `docs/changelog.md`, and all generated metadata
   (`package.json`, `package-lock.json`, `manifest.json`, and `versions.json`).
6. Open a ready pull request from `dev` to `main`. Once CI and GitHub's merge requirements pass, the
   workflow squash-merges the exact checked revision.

The complete flow is:

**pull request -> read-only CI -> trusted automatic merge -> read-only build -> exact artifact
validation -> draft release -> manual review -> manual publish**

Automated merges send a protected repository event because GitHub does not emit a new push workflow
for a merge performed with `GITHUB_TOKEN`. A manual infrastructure merge emits a normal `main`
push. Both paths load `release.yml` from protected `main`.

The release workflow:

1. Skips the release when the package version did not change, except for guarded recovery or
   explicit draft-rebuild mode.
2. Confirms the source is a squash commit from a merged same-repository `dev` to `main` pull
   request.
3. Uses a protected copy of `scripts/check-release.mjs` to validate the candidate source's stable
   version, synchronized package and Obsidian metadata, and matching changelog section.
4. Builds the plugin in a job with read-only repository permissions and no release token in its
   environment.
5. Transfers `main.js`, `manifest.json`, and `styles.css` as temporary workflow artifacts.
6. Validates the exact three-file bundle before granting publishing credentials, records build
   provenance, and creates one clean draft release.
7. Verifies exactly one draft exists, its unprefixed tag targets the requested source commit, and it
   contains exactly the three expected assets.

The workflow never publishes a release. Inspect and test the draft in Obsidian, review any Copilot
findings, and publish it manually when ready.

## Existing-draft behavior

Normal retries are idempotent:

- A published release always stops the workflow.
- Matching drafts are removed only after the complete replacement bundle validates, then one clean
  draft is created with the new notes and artifacts.
- A matching tag without a release is reused to finish interrupted draft creation.
- Duplicate unpublished drafts are consolidated into one clean draft.
- A tag targeting another source requires explicit draft-rebuild mode.

To rebuild an unpublished version after corrective code or release automation is merged without
another version bump, leave the old draft and tag in place and dispatch:

```bash
gh api --method POST repos/kevinkickback/Combo-Colors/dispatches \
  -f event_type=rebuild-release \
  -f 'client_payload[source_sha]=<corrected-main-sha>'
```

Rebuild mode requires an unchanged package version. It validates the complete replacement bundle
before removing matching unpublished drafts or moving the tag. It refuses to modify any published
release. Do not publish a matching draft while a rebuild run is active.

If the current version's never-published draft and tag were intentionally deleted, a later
same-version `dev` to `main` pull request can recreate them only when no matching GitHub release
exists and the version remains the highest entry in `versions.json`.

## Operational rules

- Do not manually create or push the release tag.
- Do not manually create the GitHub release.
- Do not publish a draft while its release or rebuild workflow is active.
- Never delete, move, or reuse a published version tag.
- Existing releases use unprefixed version tags such as `1.4.2`; changelog headings use
  `# v1.4.2`.
- Publish only after checking the release notes, all three assets, the installed plugin, and any
  background review findings.

Validate current release metadata locally with:

```bash
node scripts/check-release.mjs
```

The expected draft assets are:

- `main.js`
- `manifest.json`
- `styles.css`

Build provenance can be verified with GitHub CLI:

```bash
gh attestation verify main.js --repo kevinkickback/Combo-Colors
gh attestation verify manifest.json --repo kevinkickback/Combo-Colors
gh attestation verify styles.css --repo kevinkickback/Combo-Colors
```
