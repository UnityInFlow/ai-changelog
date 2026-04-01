# Phase 2 Context: Generator + CLI + Release

**Phase:** 2
**Date:** 2026-04-01
**Status:** Ready for planning

## Decisions

### TMPL-01: Template customization — Custom paths supported from v0.0.1
Users can provide their own `.hbs` template files via config: `"templates": { "product": "./my-template.hbs" }`. If custom path exists, load it instead of built-in. Built-in product + technical templates are the default.

### GH-01: GitHub Releases auth — GITHUB_TOKEN env var only
No fallback to `gh` CLI auth. Users set `export GITHUB_TOKEN=xxx`. Document clearly in README. Keep it simple for v0.0.1.

### CLI-01: Changelog append behavior — Prepend new version on top
When `--output CHANGELOG.md` is used and the file exists, read existing content, insert new version at the top, keep history below. Newest-first ordering matches changelog convention.

### GEN-01: Product template sections — Features + Bug Fixes + Breaking Changes
Product (stakeholder) changelog shows only: New Features, Bug Fixes, Breaking Changes. Docs/refactoring/chore commits are omitted from product format. Technical template shows everything.

### GEN-02: Fallback without GSD files — Graceful fallback with warning
If no `.planning/` directory exists, group by commit type (feat/fix/docs/etc.) instead of by phase. Print warning: "No GSD files found, grouping by commit type. Use GSD for richer changelogs." Works on any repo with conventional commits.

## Deferred Ideas

- `gh auth token` fallback for GitHub Releases auth — v0.1.0
- Interactive changelog editor — out of scope
- LLM-powered commit summarization — v0.1.0

## Prior Phase Context

Phase 1 complete with 32 tests. Parsers, git walker, matcher all working. Code patterns established: named exports, strict TS, vitest, consistent test helper pattern (`makeCommit`, `makeSummary`).

## Downstream Notes

- **Planner:** Generator must handle both GSD-matched groups AND type-based fallback groups
- **Planner:** Config loader must support custom template paths
- **Planner:** CLI `--output` must prepend, not overwrite
- **Planner:** Product template has 3 sections only (features, fixes, breaking)
- **Planner:** Non-GSD repos get a warning + type-based grouping

---
*Created: 2026-04-01 after discuss-phase 2*
