# Project Requirements

## Phase 1: Authentication

- REQ-001: Users can log in with Google OAuth
- REQ-002: Sessions expire after 24 hours
- REQ-003: Rate limiting on auth endpoints

## Phase 2: Dashboard

- REQ-010: Dashboard shows cost per agent session
- REQ-011: Costs update in real time
- REQ-012: Export cost data as CSV

## Acceptance Criteria

- [ ] All auth flows tested with Playwright
- [ ] Dashboard loads in under 2 seconds
- [ ] CSV export matches displayed data
