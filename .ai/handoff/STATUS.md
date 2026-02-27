# STATUS.md - commitprompt

Last updated: 2026-02-27

## Build Health

| Check        | Status    | Notes                                          |
| ------------ | --------- | ---------------------------------------------- |
| `tsc`        | (Verified) Clean | Strict mode, NodeNext, zero errors       |
| `npm run lint` | (Verified) Clean | ESLint + typescript-eslint + no-em-dash rule |
| `npm test`   | (Verified) 59/59 | 3 suites: diff-parser, prompt-builder, integration |
| GitHub CI    | (Verified) Live  | `.github/workflows/ci.yml` on main       |
| GitLab CI    | (Verified) Live  | `.gitlab-ci.yml` at project root          |
| npm publish  | (Verified) Live   | Published as `@elvatis_com/commitprompt@0.1.0` on npm                     |

## What Exists

- `src/diff-reader.ts` - reads diff from git or file, smart-trims long diffs
- `src/diff-parser.ts` - parses diff into structured data, detects change type
- `src/prompt-builder.ts` - builds mode-specific prompts (commit, pr, changelog)
- `src/context-reader.ts` - reads repo context (package.json name, README intro) for --context flag
- `src/index.ts` - CLI entrypoint with commander
- `src/__tests__/diff-parser.test.ts` - parser tests using real fixtures
- `src/__tests__/prompt-builder.test.ts` - builder tests using real fixtures
- `src/__tests__/integration.test.ts` - end-to-end tests using real fixtures
- `src/fixtures/*.diff` - real diffs from github.com/homeofe/failprompt
- `.github/workflows/ci.yml` - GitHub Actions CI
- `.gitlab-ci.yml` - GitLab CI pipeline
- `eslint.config.js` - ESLint flat config with typescript-eslint and custom no-em-dash rule
- `eslint-rules/no-em-dash.js` - Custom ESLint rule disallowing em dash characters
- `README.md` - installation and usage docs

## Verified Behaviors

- Reads staged diff via `git diff --staged`
- Reads diff from file via `--diff path`
- Outputs structured AI prompt for commit, PR, or changelog modes
- Smart-trims diffs longer than 120 lines
- Detects change type: feat, fix, docs, refactor, test, chore, ci
- Friendly error if nothing staged
- `--context` flag includes package.json name and README first paragraph in prompt

## Known Gaps

No known gaps. All planned tasks completed.
