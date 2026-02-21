# CONVENTIONS.md - commitprompt Coding Conventions

## Language and Style
- All code, comments, and documentation in English
- No em dashes anywhere - use commas, hyphens, or colons instead
- TypeScript strict mode, NodeNext module resolution
- Named exports from all modules (no default exports)
- JSDoc comments on all exported functions

## Module Structure
- 4 modules: diff-reader, diff-parser, prompt-builder, index (CLI)
- Each module has a single responsibility
- Import with `.js` extension (NodeNext ESM requirement):
  `import { parseDiff } from './diff-parser.js';`

## Testing
- Jest with ts-jest/presets/default-esm
- Tests in `src/__tests__/`
- Test files use real fixture diffs from `src/fixtures/` via `readFileSync`
- No hardcoded diff strings in tests
- Describe blocks per fixture or mode, not per function

## Git
- Conventional commits: `feat(scope): description`
- No direct commits to main - use feature branches
- CI must pass before merge

## Error Handling
- User-facing errors: plain language, actionable ("Run `git add` first...")
- Internal errors: include original message for debugging
- Never silently swallow errors that affect output correctness

## Naming
- changeType values: feat, fix, docs, refactor, test, chore, ci (no perf in parser)
- Mode values: commit, pr, changelog
- File naming: kebab-case for source files, camelCase for variables/functions
