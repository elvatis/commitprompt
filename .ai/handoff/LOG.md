# LOG.md - commitprompt Build History

## 2026-02-21 - Initial Implementation (AAHP auto)

### What was built
- `src/diff-reader.ts`: reads staged diff via `git diff --staged` or from a file;
  smart-trims diffs longer than 120 lines, keeping file headers and hunk headers
- `src/diff-parser.ts`: parses raw git diff into structured ParsedDiff:
  file paths, per-file +/- counts, isNew/isDeleted flags, total counts, changeType
  Heuristics for changeType: docs, test, ci, feat, refactor, fix, with sensible fallback
- `src/prompt-builder.ts`: builds mode-specific prompts with 4 sections:
  header, changed files, diff summary (trimmed), mode instructions
- `src/index.ts`: commander CLI with --mode, --diff, --staged, --context flags
- 3 test suites, 42 tests total, all using real fixture diffs from failprompt
- GitHub Actions CI workflow
- AAHP handoff files

### Why
commitprompt is a companion tool to failprompt (github.com/homeofe/failprompt).
Where failprompt turns CI failure logs into AI prompts, commitprompt turns staged
git diffs into AI prompts for commit messages, PR descriptions, and changelogs.

### Decisions made
- Used real fixture diffs from failprompt codebase (TypeScript bugfix, test expansion,
  docs update, CI workflow addition) to ensure tests reflect real-world patterns
- Smart diff trimming preserves file headers and hunk markers so LLMs get context
  even when diffs are truncated
- changeType detection uses path-based heuristics (docs, test, ci keywords) before
  falling back to structural analysis (all-new vs deletion-heavy vs default feat)
- Blank addition/deletion lines (just `+` or `-`) are counted as they represent
  real empty lines added/removed in the diff

### E2E verified
Ran against a real staged change (echo to README.md), verified all 3 modes produce
valid structured prompts. Output saved in src/fixtures/e2e-output.txt.
