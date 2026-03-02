# NEXT_ACTIONS - commitprompt

## Current State

v0.1.0 published on npm. 59/59 tests passing. All quality gates (lint, type check, tests) green.
GitHub Actions and GitLab CI live. ESLint with typescript-eslint and custom no-em-dash rule configured.

## Ready - Work These Next

### T-004: Add --copy flag for clipboard output [medium] (issue #1)

- **Goal:** Copy the generated prompt directly to the system clipboard, eliminating the manual copy step
- **Context:** The entire value proposition is "paste into an LLM". Right now users must manually select and copy terminal output. A `--copy` flag closes the last-mile UX gap. Use Node.js child_process to call the platform-native clipboard command (`clip` on Windows, `pbcopy` on macOS, `xclip`/`xsel` on Linux) - no new dependencies needed.
- **What to do:**
  1. Add a `copyToClipboard(text: string): void` helper in a new `clipboard.ts` module
  2. Detect platform via `process.platform` and spawn the appropriate command (`clip`, `pbcopy`, `xclip -selection clipboard`)
  3. Pipe the prompt text to the spawned process via stdin
  4. Add `--copy` flag to CLI in `index.ts` - when set, copy output AND still print to stdout
  5. Print a confirmation line to stderr (e.g., "Copied to clipboard") so stdout stays clean for piping
  6. Add unit tests for the clipboard module (mock `child_process.execSync`)
  7. Update README.md with the new flag
- **Files:** `src/clipboard.ts` (new), `src/index.ts`, `src/__tests__/clipboard.test.ts` (new), `README.md`
- **Definition of Done:**
  - [ ] `commitprompt --copy` copies prompt to clipboard and prints confirmation to stderr
  - [ ] `commitprompt --copy --mode pr` works with all modes
  - [ ] Graceful error when clipboard command unavailable (warning, not crash)
  - [ ] Tests pass including new clipboard tests
  - [ ] README documents the flag

### T-005: Support reading diff from stdin [medium] (issue #2)

- **Goal:** Enable piping diffs into commitprompt via stdin (e.g., `git diff HEAD~3 | commitprompt --mode pr`)
- **Context:** Currently the tool only reads from `git diff --staged` or a file via `--diff`. Unix convention expects CLI tools to accept stdin when no file argument is given. This unlocks workflows like comparing arbitrary refs, using with other diff tools, or chaining in shell scripts. When neither `--diff` nor `--staged` is specified and stdin is not a TTY, read from stdin.
- **What to do:**
  1. In `diff-reader.ts`, add `readStdin(): string` that reads from `process.stdin` synchronously (use `fs.readFileSync('/dev/stdin', 'utf-8')` or `fs.readFileSync(0, 'utf-8')`)
  2. In `index.ts`, detect piped input: if no `--diff` and no `--staged` flag, check `process.stdin.isTTY` - if falsy, read stdin instead of running `git diff --staged`
  3. Add integration test: write a diff to a temp file, then test the stdin reading path
  4. Update README.md with piping examples
- **Files:** `src/diff-reader.ts`, `src/index.ts`, `src/__tests__/integration.test.ts`, `README.md`
- **Definition of Done:**
  - [ ] `git diff HEAD~3 | commitprompt` works and produces correct prompt
  - [ ] `cat changes.diff | commitprompt --mode pr` works
  - [ ] When stdin is a TTY and no flags given, default behavior (staged diff) is preserved
  - [ ] Tests cover the stdin code path
  - [ ] README shows piping examples

### T-006: Add --branch flag for branch diff comparison [medium] (issue #3)

- **Goal:** Generate prompts from the full diff between current branch and a base branch, ideal for PR descriptions
- **Context:** The `--mode pr` flag exists but reads only staged changes. For PR workflows, users need the complete branch diff. A `--branch <base>` flag that runs `git diff <base>...HEAD` provides the full picture. This makes `commitprompt --mode pr --branch main` the natural workflow before opening a PR.
- **What to do:**
  1. In `diff-reader.ts`, add `readBranchDiff(base: string, cwd?: string): string` that runs `git diff <base>...HEAD`
  2. Add `--branch <base>` option to CLI in `index.ts`
  3. Make `--branch` mutually exclusive with `--diff` and `--staged` (error if combined)
  4. Add a fixture for a multi-commit branch diff and write tests
  5. Update README.md with branch comparison examples
- **Files:** `src/diff-reader.ts`, `src/index.ts`, `src/__tests__/integration.test.ts`, `README.md`
- **Definition of Done:**
  - [ ] `commitprompt --branch main --mode pr` outputs a prompt with the full branch diff
  - [ ] Error message when `--branch` combined with `--diff`
  - [ ] Error message when branch name is invalid or not found
  - [ ] Tests cover the branch diff code path
  - [ ] README documents the flag with examples

### T-007: Add --type flag to override change type detection [low] (issue #4)

- **Goal:** Let users override the auto-detected change type when heuristics get it wrong
- **Context:** The TRUST.md notes that `changeType` heuristics are path-based and can misclassify mixed-purpose changes. A `--type fix` flag gives users control. This is a small addition with clear value for edge cases.
- **What to do:**
  1. Add `--type <type>` option to CLI in `index.ts` with choices matching the `ChangeType` union
  2. When provided, override `parsedDiff.changeType` before passing to `buildPrompt`
  3. Validate the value against known types; show clear error for invalid types
  4. Add tests for the override behavior
  5. Update README.md
- **Files:** `src/index.ts`, `src/__tests__/integration.test.ts`, `README.md`
- **Definition of Done:**
  - [ ] `commitprompt --type fix` forces changeType to 'fix' regardless of heuristics
  - [ ] Invalid type values produce a clear error message
  - [ ] Tests verify override behavior
  - [ ] README documents the flag

### T-008: Shell autocomplete [low] (issue #5)

- **Goal:** Add tab completion for commitprompt flags in bash, zsh, and fish shells
- **Context:** Commander v12 has built-in support for generating shell completion scripts. This is polish that improves discoverability of flags for regular users.
- **What to do:**
  1. Research Commander's `program.completions()` API or use a helper like `tabtab`
  2. Add a `commitprompt completion` subcommand that outputs the completion script
  3. Document installation instructions for bash, zsh, and fish in README.md
  4. Test that the completion script is valid shell syntax
- **Files:** `src/index.ts`, `README.md`
- **Definition of Done:**
  - [ ] `commitprompt completion` outputs a working completion script
  - [ ] At least bash and zsh are supported
  - [ ] README includes installation instructions for completions

## Blocked

(none)

## Recently Completed

  T-003: Add GitLab CI support (.gitlab-ci.yml template)
  T-001: Add --context flag (reads first paragraph of README.md into prompt)
  T-002: ESLint setup with typescript-eslint and no-em-dash rule
