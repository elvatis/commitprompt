# commitprompt

Turn your `git diff --staged` into a ready-to-paste AI prompt for commit messages, PR descriptions, and changelogs.

## Installation

```bash
npm install -g @elvatis_com/commitprompt
```

Or use without installing:

```bash
npx @elvatis_com/commitprompt
```

## Usage

### Commit message (default)

```bash
git add src/my-fix.ts
commitprompt
# Prints a structured prompt - paste it into ChatGPT, Claude, or any LLM
```

### PR description

```bash
git add .
commitprompt --mode pr
```

### Changelog entry

```bash
commitprompt --mode changelog
```

### Include repo context

```bash
commitprompt --context
# Adds a "## Context" section with project name (from package.json) and README intro
```

### Read diff from a file

```bash
commitprompt --diff path/to/change.diff
commitprompt --diff path/to/change.diff --mode pr
```

## How it works

1. **Reads** your staged diff (via `git diff --staged`) or a diff file
2. **Parses** the diff: extracts changed files with +/- counts, detects change type (feat, fix, docs, test, ci...)
3. **Builds** a structured prompt with file list, diff summary, and mode-specific instructions - ready to paste into any LLM

## Output example

```
# Commit Message Request

## Changed Files
- src/error-extractor.ts (+50 -14)

## Diff Summary
\`\`\`diff
diff --git a/src/error-extractor.ts b/src/error-extractor.ts
...
\`\`\`

## Instructions
Write a conventional commit message for these changes.
Format: <type>(<scope>): <description>
Types: feat, fix, docs, refactor, test, chore, ci, perf
Keep the subject line under 72 characters.
If the change is complex, add a body paragraph explaining WHY (not WHAT).
```

## Options

| Flag | Description | Default |
| ---- | ----------- | ------- |
| `--mode <commit\|pr\|changelog>` | Output format | `commit` |
| `--diff <path>` | Read diff from file instead of git | - |
| `--staged` | Explicit staged diff (same as default) | - |
| `--context` | Include repo context (package.json name, README intro) in prompt | - |

## CI support

The project includes CI configurations for both GitHub Actions and GitLab CI:

- **GitHub Actions**: `.github/workflows/ci.yml` - runs type checking and tests on all branches
- **GitLab CI**: `.gitlab-ci.yml` - same pipeline (type check + tests) using the `node:20` image

The diff parser also recognizes both GitHub and GitLab CI file paths (`.github/`, `.gitlab/`, `.gitlab-ci.yml`) when detecting the `ci` change type.

## AAHP case study

This tool was built using the [AAHP (AI-to-AI Handoff Protocol)](https://github.com/elvatis/AAHP).

Its sibling project [failprompt](https://github.com/elvatis/failprompt) does the same thing for CI failure logs: turn GitHub Actions errors into structured AI prompts for debugging.

Both tools follow the same 4-module pattern: reader, parser, builder, CLI.

## License

MIT

<!-- E2E test marker -->
