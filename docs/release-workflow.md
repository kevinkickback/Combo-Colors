# CI/CD and Release Workflow

## Branches and repository settings

`main` is the only long-lived branch. Start each change from current `main` on a short-lived branch,
open a pull request back to `main`, and delete the branch after its squash merge.

Protect `main` with the repository's **Main Protection** ruleset:

- Disable direct pushes and require the branch to be up to date before merging.
- Allow squash merging only; disable merge commits and rebase merging.
- Enable GitHub native auto-merge and automatic head-branch deletion.
- Require **Lint, type-check, and test**.
- Enable automatic Copilot review, including review of new pushes.
- Do not require review-conversation resolution. Copilot is advisory input before enabling
  auto-merge and before publishing a release.

Passing CI does not opt a pull request into merging. Once a change is intentionally ready, select
**Enable auto-merge** with the squash method. GitHub then merges the exact eligible revision after
all branch-protection requirements pass. There is no custom merge workflow or repository-dispatch
handoff.

Pull requests that change `.github/workflows/**`, `.github/scripts/**`, or
`scripts/check-release.mjs` are the exception: do not enable auto-merge until the complete workflow
diff and advisory review have been inspected. Once that review is complete, the pull request may use
the same native squash auto-merge path. CI status names alone are not a trust boundary because a pull
request can change the workflow that produces them. Add required CODEOWNERS approval for these paths
when the project has a second maintainer; a solo maintainer cannot provide an independent approval.

---

## Day-to-day development

Create a branch from current `main`:

```bash
git switch main
git pull --ff-only
git switch -c feat/short-description
```

Commit and push the branch, then open a pull request:

```bash
git push -u origin feat/short-description
gh pr create --base main --fill
gh pr merge --auto --squash
```

The final command opts that pull request into GitHub native auto-merge. It does not bypass CI,
branch protection, or an out-of-date base.

`ci.yml` runs on every non-draft pull request targeting `main`. It validates release metadata,
runs Biome plus the official Obsidian JavaScript/TypeScript and CSS lint rules, type-checks, executes
Vitest with coverage, and produces the three-file plugin build. Repository-run Node commands use
Node 22, and Linux CI and release jobs use the explicit `ubuntu-26.04` runner.

## Releasing a version

### 1. Prepare the release on a feature branch

Update `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` together:

```bash
npm version 1.0.0 --no-git-tag-version
```

Add a unique `# v1.0.0` section with nonempty user-facing notes to `docs/changelog.md`.
Validate the synchronized Obsidian metadata and notes with `npm run version:check`, then open a
normal pull request to `main` and enable squash auto-merge.

### 2. Manually create the draft

After the release pull request reaches `main`, fetch its exact revision and send the manual release
request:

```bash
git fetch origin main
gh api --method POST repos/kevinkickback/Combo-Colors/dispatches \
  -f event_type=release-requested \
  -f "client_payload[source_sha]=$(git rev-parse origin/main)"
```

Repository dispatch always loads the workflow from protected `main`; the supplied revision must
still be the current `main` head when validation and draft creation run.

The workflow:

1. Requires a full source revision that is the current `main` head.
2. Validates stable version metadata, the matching changelog, and a version newer than every
   published stable release in a read-only job.
3. Inspects draft and tag state in a separate job that executes no repository code.
4. Refuses to modify any existing release or move an existing tag.
5. Builds the plugin without repository write credentials.
6. Validates the exact `main.js`, `manifest.json`, and `styles.css` bundle.
7. Re-checks that no release appeared and repeatedly verifies `main` and the tag immediately before
   creating the draft.
8. Records build provenance, creates one clean draft, and verifies its notes, tag, and assets.

The workflow never publishes the release. Review the release notes, all three assets, an installed
plugin test, and any advisory review findings before publishing the draft manually.

### Recovery and repeat runs

The manual workflow is state-aware and never deletes or moves pre-existing release state:

| Existing state | Result |
| --- | --- |
| No tag and no release | Creates both after successful builds |
| Correct tag and no release | Reuses the tag and creates the draft |
| Any unpublished draft | Stops; inspect and delete the draft deliberately before rerunning |
| Unpublished tag points elsewhere | Stops; inspect and delete the tag deliberately before rerunning |
| Any published release for the version | Always stops; use a new version |

If a tag and release were both deleted, run the workflow normally. If a failed attempt left a draft
or an unpublished tag at the wrong commit, inspect that state on GitHub, remove only the confirmed
unpublished object, and rerun. The workflow uses atomic tag creation and immediate state
revalidation to stop safely when a concurrent tag, draft, or `main` change is detected.

### Release artifacts

- `main.js`
- `manifest.json`
- `styles.css`

---

## Operational rules

- Do not create version tags or releases manually; run the release workflow.
- Never replace or convert a published release. Corrections to a published version require a new
  version.
- Do not publish a draft while its workflow is active.
- Publish only after reviewing release notes, all three assets, an installed plugin test, and any
  advisory findings.
- Stable releases use `X.Y.Z` package versions and unprefixed `X.Y.Z` tags, as required by the
  Obsidian community-plugin release convention. Prerelease/build suffixes are rejected.

`npm run build` type-checks and bundles the production plugin before release assets are accepted.

Publish an approved draft with:

```bash
gh release edit 1.0.0 --draft=false --repo kevinkickback/Combo-Colors
```

Inspect release runs with:

```bash
gh run list --repo kevinkickback/Combo-Colors --workflow release.yml --limit 5
gh run view <RUN_ID> --repo kevinkickback/Combo-Colors
```
