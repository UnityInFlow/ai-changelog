# Contributing to ai-changelog

## Development

```bash
npm install          # install deps
npm test             # run tests
npm run test:watch   # watch mode
npm run build        # build to dist/
npm run lint         # type check
```

## Adding a New Output Format

1. Create a Handlebars template in `src/templates/<format>.hbs`
2. Add the format name to the `ChangelogConfig` type in `src/types.ts`
3. Test with: `ai-changelog generate --format <format>`

## Adding a New Parser

1. Create `src/parsers/<parser>.ts` implementing the parse function
2. Create `tests/parsers/<parser>.test.ts` with at least 3 passing and 3 failing cases
3. Wire it into `matcher.ts` or `generator.ts` as needed

## Commit Convention

```
feat: add new parser
fix: handle edge case in GSD summary
test: add fixtures for phase matching
docs: update README
```
