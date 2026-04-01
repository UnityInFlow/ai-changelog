# Tool 02: `ai-changelog`
## AI-Aware Changelog Generator — Deep Dive

> **Phase:** 1 · **Effort:** 3/10 · **Impact:** 6/10 · **Stack:** TypeScript  
> **Repo name:** `ai-changelog` · **npm:** `@your-org/ai-changelog`  
> **Build in:** Weeks 3–4

---

## 1. Problem Statement

Agent-generated commits are either terse machine strings (`feat(08-02): implement login`) or verbose implementation noise. Nobody can read 200 agent commits and understand what actually shipped. Teams need two things that don't exist:

1. A **product changelog** ("users can now log in with Google") — for stakeholders
2. A **technical changelog** ("added OAuth2 flow, JWT session tokens, rate limiting") — for devs

GSD produces rich SUMMARY.md, PLAN.md, and REQUIREMENTS.md files that contain exactly this information. Nobody reads them because nobody aggregates them.

---

## 2. Feature Specification

### v0.0.1 — MVP (Week 4)

```bash
# Generate changelog from HEAD to last tag
ai-changelog generate

# Specific range
ai-changelog generate --from v1.0.0 --to HEAD

# Write to file
ai-changelog generate --output CHANGELOG.md

# Push to GitHub Releases
ai-changelog publish --release v1.2.0

# Config
ai-changelog init  # creates ai-changelog.config.json
```

**Output — Product format:**
```markdown
## v1.2.0 — April 2026

### New features
- Users can now log in with Google OAuth (Phase 3)
- Dashboard shows real-time cost per agent session (Phase 4)

### Bug fixes
- Fixed context window overflow on large repository scans

### Breaking changes
- None
```

**Output — Technical format:**
```markdown
## v1.2.0 — April 2026

### Phase 3: OAuth integration
- Added `GoogleOAuthProvider` with PKCE flow
- JWT session tokens stored in httpOnly cookies
- Rate limiting: 10 login attempts per minute per IP
- Files changed: src/auth/, src/middleware/rate-limit.ts

### Phase 4: Token dashboard
- New `/dashboard/cost` route with HTMX polling
- SQLite schema: added `sessions` and `agent_calls` tables
```

### v0.1.0 — (Month 2)
- [ ] Semantic versioning suggestion: "based on changes, suggest v1.2.0 vs v2.0.0"
- [ ] Jira/Linear integration: link requirements to ticket IDs
- [ ] Slack/email announcement draft generation

---

## 3. Technical Architecture

### GSD File Parser

```typescript
// The key insight: GSD SUMMARY.md files have a consistent structure
// Parse them to extract: what was built, decisions made, files changed

interface GsdSummary {
  phase: number;
  planNumber: string;
  whatWasBuilt: string[];
  decisions: string[];
  filesChanged: string[];
  specRequirements: string[]; // links back to REQUIREMENTS.md
}

// Walk git history, find GSD files by path pattern
// .planning/*-SUMMARY.md
// .planning/*-REQUIREMENTS.md
```

### Config File

```json
{
  "groupBy": "phase",
  "formats": ["product", "technical"],
  "output": "CHANGELOG.md",
  "github": {
    "repo": "owner/repo",
    "createRelease": true
  },
  "templates": {
    "product": "./templates/product.hbs",
    "technical": "./templates/technical.hbs"
  }
}
```

---

## 4. Implementation Todos

### Week 3: Core Parser

- [ ] `src/parsers/gsd-summary.ts` — parse `.planning/*-SUMMARY.md`
- [ ] `src/parsers/gsd-requirements.ts` — parse REQUIREMENTS.md for feature names
- [ ] `src/git.ts` — walk git log, extract commits + changed files (use `simple-git`)
- [ ] `src/matcher.ts` — link commits to GSD files by date and branch
- [ ] Tests with real GSD project fixture

### Week 4: Generator + CLI + Release

- [ ] Handlebars templates for product + technical formats
- [ ] `src/generator.ts` — groups changes by phase/feature, detects breaking changes
- [ ] GitHub Releases integration via `@octokit/rest`
- [ ] Full CLI with commander.js
- [ ] `npm publish`, blog post, GSD Discord announcement

---

## 5. Success Metrics

| Metric | Week 4 Target | Month 2 Target |
|---|---|---|
| GitHub stars | 30 | 100 |
| npm downloads/week | 10 | 100 |
| GSD projects using it | 0 | 5 |

---

*Part of the AI Agent Tooling Ecosystem · See 00-MASTER-ANALYSIS.md for full context*
