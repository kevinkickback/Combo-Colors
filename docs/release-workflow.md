# Release workflow

`dev` is the integration branch and `main` is the stable production branch. Do not push commits or
tags directly to `main`. Changes reach it only through a same-repository `dev` to `main` pull
request; short-lived branches should merge into `dev` first.

## CI and merging

CI runs for non-draft pull requests targeting `dev` or `main` and performs linting, type checking,
tests, and a production build. A ready `dev` to `main` PR is squash-merged automatically after the
checked revision passes. Other pull requests are never auto-merged.

Configure branch protection for `main` to reject direct pushes, allow squash merging, and require
the **Lint, type-check, test, and build** check. Required reviews can remain enabled; GitHub's merge
API still honors the repository's merge requirements. Do not require the downstream merge or
release jobs as pre-merge checks.

## Releasing

1. On `dev`, update `docs/changelog.md` with a unique `# vX.Y.Z` section and nonempty notes.
2. Bump the version without creating a tag:

   ```bash
   npm version X.Y.Z --no-git-tag-version
   ```

3. Commit and push all generated metadata (`package.json`, `package-lock.json`, `manifest.json`, and
   `versions.json`) plus the changelog.
4. Open a ready PR from `dev` to `main`. Once CI and GitHub's merge requirements pass, the workflow
   squash-merges the exact checked revision.

The release workflow compares `package.json` with the squash commit's parent. If the version did
not change, the PR simply merges and no release is created. If it changed, the workflow:

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
- A rerun may safely reuse the workflow-created tag and draft; assets are replaced by name.
- If validation fails after the version reaches `main`, fix it on `dev` and use a new version in the
  next `dev` to `main` PR. Do not delete and reuse a released version.

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
