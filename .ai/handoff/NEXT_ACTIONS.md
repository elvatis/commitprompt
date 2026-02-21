# NEXT_ACTIONS.md - commitprompt

## Priority Order

### 1. npm publish (MEDIUM - human required)
- Package name: `@elvatis_com/commitprompt` (scoped, due to conflict with `commit-prompt`)
- Run `npm login` as Emre (if not already logged in)
- Run `npm publish --access=public` from project root
- Verify at npmjs.com/package/@elvatis_com/commitprompt
- After publish: update STATUS.md

### 2. --context flag enhancement (LOW)
- Currently reads package.json name
- Extend to read first paragraph of README.md
- Include in prompt header as context block

### 3. ESLint setup (LOW)
- Add eslint with typescript-eslint
- Add `npm run lint` to CI
- Enforce no-em-dash rule via custom lint rule

### 4. GitLab CI support (LOW)
- Add `.gitlab-ci.yml` template
- Mirror the GitHub Actions workflow

### 5. Shell autocomplete (OPTIONAL)
- Add `commitprompt completion` command via commander
- Support bash/zsh/fish

## Completed

- [x] Initial implementation: diff reader, parser, prompt builder, CLI
- [x] 42/42 tests passing using real fixtures
- [x] GitHub Actions CI live
- [x] E2E test verified (output in src/fixtures/e2e-output.txt)
- [x] AAHP handoff files created
