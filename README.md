# @unityinflow/ai-changelog

> AI-aware changelog generator — product and technical changelogs from agent commits and GSD planning files.

## The Problem

Agent-generated commits are either terse machine strings or verbose implementation noise. Nobody can read 200 agent commits and understand what actually shipped.

Teams need:
- A **product changelog** ("users can now log in with Google") — for stakeholders
- A **technical changelog** ("added OAuth2 flow, JWT session tokens") — for devs

## Installation

```bash
npm install -g @unityinflow/ai-changelog
```

Or use without installing:

```bash
npx @unityinflow/ai-changelog generate
```

## Usage

```bash
# Generate changelog from last tag to HEAD
ai-changelog generate

# Specific range
ai-changelog generate --from v1.0.0 --to HEAD

# Technical format (includes file changes, decisions)
ai-changelog generate --format technical

# Write to file (prepends new version on top of existing content)
ai-changelog generate --output CHANGELOG.md

# Push to GitHub Releases
GITHUB_TOKEN=xxx ai-changelog publish --release v1.2.0

# Create config file
ai-changelog init
```

## Output Formats

**Product (default):**
```markdown
## v1.2.0 — April 2026

### Phase 1
- Users can now log in with Google OAuth
- JWT session token management

### Breaking Changes
- None
```

**Technical:**
```markdown
## v1.2.0 — April 2026

### Phase 1
- `feat(auth)`: add Google OAuth with PKCE flow (abc1234)
- `feat(auth)`: JWT session tokens in httpOnly cookies (def5678)

**Decisions:**
- Chose PKCE flow over implicit grant for security
**Files changed:**
- `src/auth/google-oauth.ts`
- `src/auth/jwt.ts`
```

## GSD Integration

If your project uses the GSD (Get Stuff Done) methodology with `.planning/` files, ai-changelog automatically groups changes by phase using GSD SUMMARY.md files for richer context.

Without GSD files, changes are grouped by conventional commit type (feat, fix, docs, etc.) with a warning:

```
No GSD files found, grouping by commit type. Use GSD for richer changelogs.
```

## Configuration

Create `ai-changelog.config.json` in your project root:

```json
{
  "groupBy": "phase",
  "formats": ["product", "technical"],
  "output": "CHANGELOG.md",
  "github": {
    "repo": "owner/repo",
    "createRelease": true
  },
  "gsdDir": ".planning"
}
```

Or run `ai-changelog init` to create a default config file.

## Exit Codes

- `0` — success
- `1` — error

## License

MIT
