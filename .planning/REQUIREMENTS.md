# Requirements: ai-changelog

**Defined:** 2026-04-01
**Core Value:** Turn unreadable agent commits into clear, grouped changelogs automatically

## v1 Requirements

### Parsing

- [x] **PARSE-01**: Parse conventional commits (feat/fix/docs/chore/refactor/test)
- [x] **PARSE-02**: Parse GSD SUMMARY.md files (phase, what was built, decisions, files)
- [x] **PARSE-03**: Parse GSD REQUIREMENTS.md files (phases, features, criteria)

### Git

- [x] **GIT-01**: Walk git commit history between arbitrary refs
- [x] **GIT-02**: List tags in repository

### Matching

- [x] **MATCH-01**: Link commits to GSD phases by file path overlap

### Generation

- [ ] **GEN-01**: Generate product-format changelog (stakeholder-friendly)
- [ ] **GEN-02**: Generate technical-format changelog (developer-friendly)
- [ ] **TMPL-01**: Customizable Handlebars templates for both formats

### Configuration

- [ ] **CFG-01**: Load config from ai-changelog.config.json with defaults
- [ ] **CFG-02**: Init command creates config file

### CLI

- [ ] **CLI-01**: `ai-changelog generate` with --from, --to, --format, --output
- [ ] **CLI-02**: `ai-changelog publish --release <version>` to GitHub Releases
- [ ] **CLI-03**: `ai-changelog init` creates config

### Integration

- [ ] **GH-01**: Create GitHub Releases via @octokit/rest

### Release

- [ ] **REL-01**: Published to npm as @unityinflow/ai-changelog
- [ ] **REL-02**: README with problem statement, installation, examples
- [ ] **REL-03**: CONTRIBUTING.md with how to add templates
- [ ] **REL-04**: All tests pass on CI (self-hosted runners)

## v2 Requirements

### AI Enhancement

- **AI-01**: LLM-powered commit summarization for non-GSD projects
- **AI-02**: Semantic versioning suggestion based on change analysis

### Integrations

- **INT-01**: Jira/Linear ticket linking
- **INT-02**: Slack/email announcement draft generation

## Out of Scope

| Feature | Reason |
|---------|--------|
| LLM API calls | v0.1.0 — ship structured parsing first |
| Monorepo support | v0.1.0 — single-repo focus for MVP |
| Interactive changelog editor | Complexity, not needed for CLI tool |
| Recursive directory scanning for GSD files | v0.1.0 — flat .planning/ directory sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PARSE-01 | Phase 1 | Complete |
| PARSE-02 | Phase 1 | Complete |
| PARSE-03 | Phase 1 | Complete |
| GIT-01 | Phase 1 | Complete |
| GIT-02 | Phase 1 | Complete |
| MATCH-01 | Phase 1 | Complete |
| GEN-01 | Phase 2 | Pending |
| GEN-02 | Phase 2 | Pending |
| TMPL-01 | Phase 2 | Pending |
| CFG-01 | Phase 2 | Pending |
| CFG-02 | Phase 2 | Pending |
| CLI-01 | Phase 2 | Pending |
| CLI-02 | Phase 2 | Pending |
| CLI-03 | Phase 2 | Pending |
| GH-01 | Phase 2 | Pending |
| REL-01 | Phase 2 | Pending |
| REL-02 | Phase 2 | Pending |
| REL-03 | Phase 2 | Pending |
| REL-04 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after Phase 1 completion*
