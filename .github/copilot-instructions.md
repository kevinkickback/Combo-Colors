# Combo Colors Repository Instructions

Keep changes small, testable, and consistent with the existing Obsidian plugin architecture. These
are repository-wide guardrails; detailed setup and release procedures belong in the linked docs.

## Read the relevant guide first

| Work area | Guide |
| --- | --- |
| Setup, usage, supported notation, or repository layout | [README](../README.md) |
| Branches, pull requests, versioning, or releases | [CI/CD workflow](../docs/release-workflow.md) |
| User-visible release notes | [Changelog](../docs/changelog.md) |

Update the relevant guide in the same change when a stable contract or workflow changes.

## Non-negotiable rules

1. Keep source code in `src/`; never hand-edit generated `main.js` or other build output.
2. Preserve strict TypeScript boundaries. Do not introduce implicit or explicit `any` without a
   narrow, documented interoperability reason.
3. Keep notation parsing, validation, rendering, Obsidian DOM adaptation, and plugin lifecycle
   responsibilities in their existing modules. Search for an established helper before adding a
   parallel implementation.
4. Treat user-authored note content and imported settings as untrusted input. Validate before use
   and prefer Obsidian's safe DOM APIs over raw HTML injection.
5. Add or update behavior-focused Vitest coverage for functional changes. Do not weaken lint,
   type-check, or coverage requirements to make a change pass.
6. Keep `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` synchronized for a
   release. Use the documented release commands and never create release tags manually.
7. Before finishing, run the focused tests, `npm run lint`, `npm run typecheck`,
   `npm run test:coverage`, and `npm run build` as appropriate to the change.
