# Roadmap: ai-changelog

## Phase 1: Core Parsers + Git Walker ✅

**Goal:** Parse git history and GSD planning files into structured data.

**Scope:**
- Conventional commit parser
- GSD SUMMARY.md parser
- GSD REQUIREMENTS.md parser
- Git commit walker (simple-git)
- Commit-to-phase matcher

**Status:** Complete — 32 tests passing, PR #1 created

## Phase 2: Generator + CLI + Release

**Goal:** Generate changelogs from parsed data, expose via CLI, publish to npm.

**Scope:**
- Handlebars templates (product + technical formats)
- Changelog generator (groups by phase, renders templates)
- Config loader (ai-changelog.config.json + defaults + init)
- GitHub Releases integration (@octokit/rest)
- Full CLI (generate, publish, init commands)
- CLI integration tests
- README, CONTRIBUTING, LICENSE
- Version bump to 0.0.1
- npm publish + GitHub Release

**Requirements covered:** GEN-01, GEN-02, TMPL-01, CFG-01, CFG-02, CLI-01, CLI-02, CLI-03, GH-01, REL-01, REL-02, REL-03, REL-04

---
*Last updated: 2026-04-01*
