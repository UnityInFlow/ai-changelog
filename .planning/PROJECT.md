# ai-changelog

## What This Is

A TypeScript CLI tool that generates **product changelogs** (for stakeholders) and **technical changelogs** (for developers) from git history and GSD planning files. Part of the UnityInFlow 20-tool AI agent ecosystem. Tool #02.

## Core Value

Turn 200 unreadable agent-generated commits into a clear, grouped changelog that tells stakeholders what shipped and tells developers what changed — automatically, from existing GSD files.

## Requirements

### Validated

- [x] **PARSE-01**: Parse conventional commits (feat/fix/docs/chore/refactor/test) — Phase 1, complete
- [x] **PARSE-02**: Parse GSD SUMMARY.md files (phase, what was built, decisions, files changed) — Phase 1, complete
- [x] **PARSE-03**: Parse GSD REQUIREMENTS.md files (phases, features, acceptance criteria) — Phase 1, complete
- [x] **GIT-01**: Walk git commit history between refs with file change tracking — Phase 1, complete
- [x] **MATCH-01**: Link commits to GSD phases by file path overlap — Phase 1, complete

### Active

- [ ] **GEN-01**: Generate product-format changelog (stakeholder-friendly, grouped by phase)
- [ ] **GEN-02**: Generate technical-format changelog (dev-friendly, with file changes and decisions)
- [ ] **TMPL-01**: Handlebars templates for both formats (customizable by users)
- [ ] **CFG-01**: Config file support (ai-changelog.config.json) with sensible defaults
- [ ] **CLI-01**: `ai-changelog generate` command with --from, --to, --format, --output flags
- [ ] **CLI-02**: `ai-changelog publish --release <version>` pushes to GitHub Releases
- [ ] **CLI-03**: `ai-changelog init` creates config file
- [ ] **GH-01**: GitHub Releases integration via @octokit/rest
- [ ] **REL-01**: Published to npm as @unityinflow/ai-changelog v0.0.1

### Out of Scope

- LLM-powered commit summarization — v0.1.0 feature, not v0.0.1
- Semantic versioning suggestion — v0.1.0
- Jira/Linear ticket linking — v0.1.0
- Slack/email announcement drafts — v0.1.0
- Custom rule plugins — beyond v0.1.0

## Context

- Phase 1 (parsers + git + matcher) is complete with 32 passing tests
- GitHub repo: https://github.com/UnityInFlow/ai-changelog
- PR #1 open for Phase 1 work
- Built with: TypeScript, tsup, vitest, commander, simple-git, handlebars, @octokit/rest
- Self-hosted CI runners (arc-runner-unityinflow + orangepi)
- Follows same development process as spec-linter (Tool #01)

## Constraints

- **Stack**: TypeScript strict, ES2022, ESM, tsup, vitest, commander
- **Quality**: No `any` types, no default exports, >80% test coverage on core logic
- **CI**: Self-hosted runners (Hetzner x64 + OrangePi ARM64), Node 18 + 20
- **Dependencies**: Must work without Git LFS, no LLM API calls in v0.0.1
- **Process**: ADRs for non-obvious decisions, PR checklist, smoke tests

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| simple-git over isomorphic-git | More mature, better Windows support | — Pending |
| Handlebars over EJS/mustache | Logic-less (secure), user-customizable, helpers for filtering | — Pending |
| @octokit/rest for GitHub Releases | Official SDK, well-typed | — Pending |
| No LLM in v0.0.1 | Ship fast, structured GSD files provide enough data | — Pending |
| Regex-based GSD parsing | GSD files have predictable structure, no AST parser needed | ✓ Good (proven in Phase 1) |

---
*Last updated: 2026-04-01 after Phase 1 completion*
