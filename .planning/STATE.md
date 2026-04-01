# State: ai-changelog

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-01)

**Core value:** Turn unreadable agent commits into clear, grouped changelogs automatically
**Current focus:** Phase 2 — Generator + CLI + Release

## Current Phase

**Phase 2** — Generator, templates, config, CLI, GitHub Releases, npm publish

### Progress

- [ ] Handlebars templates (product + technical)
- [ ] Changelog generator
- [ ] Config loader + init
- [ ] GitHub Releases integration
- [ ] CLI (generate, publish, init)
- [ ] Integration tests
- [ ] Release prep (README, CONTRIBUTING, version bump)
- [ ] npm publish

## Completed Phases

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

---
*Last updated: 2026-04-01*
