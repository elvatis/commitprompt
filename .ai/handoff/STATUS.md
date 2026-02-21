# STATUS.md - commitprompt

Last updated: 2026-02-21

## Build Health

| Check        | Status    | Notes                                          |
| ------------ | --------- | ---------------------------------------------- |
| `tsc`        | (Verified) Clean | Strict mode, NodeNext, zero errors       |
| `npm test`   | (Verified) 42/42 | 3 suites: diff-parser, prompt-builder, integration |
| GitHub CI    | (Verified) Live  | `.github/workflows/ci.yml` on main       |
| npm publish  | (Assumed) Pending | Scoped as `@elvatis_com/commitprompt`; run `npm publish --access=public`  |

## What Exists

- `src/diff-reader.ts` - reads diff from git or file, smart-trims long diffs
- `src/diff-parser.ts` - parses diff into structured data, detects change type
- `src/prompt-builder.ts` - builds mode-specific prompts (commit, pr, changelog)
- `src/index.ts` - CLI entrypoint with commander
- `src/__tests__/diff-parser.test.ts` - parser tests using real fixtures
- `src/__tests__/prompt-builder.test.ts` - builder tests using real fixtures
- `src/__tests__/integration.test.ts` - end-to-end tests using real fixtures
- `src/fixtures/*.diff` - real diffs from github.com/homeofe/failprompt
- `.github/workflows/ci.yml` - GitHub Actions CI
- `README.md` - installation and usage docs

## Verified Behaviors

- Reads staged diff via `git diff --staged`
- Reads diff from file via `--diff path`
- Outputs structured AI prompt for commit, PR, or changelog modes
- Smart-trims diffs longer than 120 lines
- Detects change type: feat, fix, docs, refactor, test, chore, ci
- Friendly error if nothing staged

## Known Gaps

| Gap         | Severity | Notes                                 |
| ----------- | -------- | ------------------------------------- |
| npm publish | MEDIUM   | Needs `npm login` from Emre           |
| --context   | LOW      | Flag exists, reads package.json name  |
| ESLint      | LOW      | Optional, nice to have                |
