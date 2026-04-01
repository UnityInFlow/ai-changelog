# State: ai-changelog

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-01)

**Core value:** Turn unreadable agent commits into clear, grouped changelogs automatically
**Current focus:** v0.0.1 released. Planning v0.1.0.

## Current Phase

**Complete** — v0.0.1 published to npm as `@unityinflow/ai-changelog`

## Completed Phases

### Phase 2: Generator + CLI + Release ✅

Completed 2026-04-01. 58 tests passing. Published to npm.
- Handlebars templates (product + technical)
- Changelog generator with GSD grouping and commit-type fallback
- Config loader + init command
- GitHub Releases integration
- CLI: generate, publish, init commands
- Integration tests (CLI + GitHub)
- Release prep: CONTRIBUTING.md, CHANGELOG.md, version bump
- npm publish: `@unityinflow/ai-changelog@0.0.1`
- GitHub Release: https://github.com/UnityInFlow/ai-changelog/releases/tag/v0.0.1
- 6 v0.1.0 issues created (LLM integration, semver, Jira/Linear, Slack, templates, monorepo)

### Phase 1: Core Parsers + Git Walker ✅

Completed 2026-04-01. 32 tests passing.
- Conventional commit parser (8 tests)
- GSD summary parser (8 tests)
- GSD requirements parser (6 tests)
- Git commit walker (4 tests)
- Commit-to-phase matcher (6 tests)

## Session Notes

- 2026-04-01: Phase 1 built using Superpowers subagent-driven development. Switching to GSD workflow for Phase 2.
- Self-hosted CI runners configured (arc-runner-unityinflow + orangepi)
- 2026-04-01: v0.0.1 released and published to npm. 5 PRs merged, 58 tests, all CI green.

---
*Last updated: 2026-04-01*
