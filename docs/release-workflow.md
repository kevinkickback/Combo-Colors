# Release workflow

`dev` is the integration branch and `main` is the stable production branch. Do not push commits or
tags directly to `main`. Changes reach it only through a same-repository `dev` to `main` pull
request; short-lived branches should merge into `dev` first.

## CI and merging

CI runs for non-draft pull requests targeting `dev` or `main` and performs Biome formatting checks,
the official Obsidian JavaScript/TypeScript and CSS lint checks, type checking, tests, and a
production build. A ready `dev` to `main` PR is squash-merged automatically after the checked
revision passes and any review conversations are resolved. Other pull requests are never
auto-merged.

Configure the `main` ruleset to reject direct pushes, allow squash merging, require review
conversations to be resolved, and require the **Lint, type-check, and test** check, which also runs
the production build. Enable automatic Copilot review for draft pull requests and new pushes. For a
ready release PR, the merge job first checks for a completed Copilot review of the exact checked
revision. If none exists, it watches the pull-request timeline for a Copilot review request or work
start. It allows one minute for that activity to appear and, once detected, waits up to ten minutes
total for the matching review to finish. It continues automatically when the review has no
unresolved findings; an unresolved review conversation blocks the merge through the repository
ruleset. Copilot review remains advisory: its approval or completion is not a required check, so
removing Copilot access, exhausting its quota, an undocumented timeline-event change, or a review
timeout cannot block a release indefinitely. The optional step has an eleven-minute hard timeout
to cover polling and API overhead. Required reviews can remain enabled; GitHub's merge API still
honors the repository's merge requirements. Do not require the downstream merge or release jobs as
pre-merge checks.

## Releasing

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
   npm run test:run
   npm run build
   node .github/check-release.mjs
   ```

5. Commit and push the complete release source, `docs/changelog.md`, and all generated metadata
   (`package.json`, `package-lock.json`, `manifest.json`, and `versions.json`).
6. Open a ready PR from `dev` to `main`. If Copilot reports a valid finding, fix it on `dev`, push the
   correction, and resolve the original conversation after the new review confirms the change.
   Once CI and GitHub's merge requirements pass, the workflow squash-merges the exact checked
   revision. Copilot being unavailable is not a reason to delay the release.

The release workflow compares `package.json` with the squash commit's parent. If the version did
not change and its tag exists, the PR simply merges and no release is created. An intentionally
deleted, never-published draft can be recreated at the current version only when both its tag and
GitHub release are absent and it is still the highest version declared in `versions.json`. For
either a new version or that guarded recovery case, the workflow:

- confirms the squash commit came from a merged same-repository `dev` to `main` PR;
- requires an increased stable `X.Y.Z` version across `package.json`, both lockfile fields, and
  `manifest.json`;
- checks that `versions.json` maps the release to `manifest.json`'s `minAppVersion`;
- extracts draft notes from the matching changelog section;
- creates the unprefixed `X.Y.Z` tag on the squash commit and creates a draft release;
- builds `main.js` and `styles.css`, attests those files plus `manifest.json`, and attaches all three;
- verifies the release remains a draft and contains every required asset.

Existing releases use unprefixed version tags, so the workflow intentionally creates `1.4.0`, not
`v1.4.0`. The changelog heading still uses `# v1.4.0`.

The workflow never publishes a release. Inspect and test the draft in Obsidian, then publish it
manually when it is ready.

## Important constraints

- Do not manually create or push the release tag.
- Do not manually create the GitHub release.
- Do not publish a draft until all workflow jobs have completed.
- A rerun may safely reuse the workflow-created tag and draft; assets are replaced by name. After
  fixing release automation through the normal `dev` to `main` process, rerun the **Release**
  workflow from `main` with the original release commit as `source-sha`.
- If release source validation fails after the version reaches `main`, fix it on `dev` and use a new
  version in the next `dev` to `main` PR. A never-published draft may instead be deleted together
  with its tag and recreated through another `dev` to `main` PR. Do not delete, move, or reuse a
  published version tag.

Validate the current release metadata locally with:

```bash
node .github/check-release.mjs
```

The expected draft assets are:

- `main.js`
- `manifest.json`
- `styles.css`

Build provenance is recorded with GitHub artifact attestations and can be verified with GitHub CLI:

```bash
gh attestation verify main.js --repo kevinkickback/Combo-Colors
gh attestation verify manifest.json --repo kevinkickback/Combo-Colors
gh attestation verify styles.css --repo kevinkickback/Combo-Colors
```
