# commitprompt

> **Archived and no longer maintained.** This project is no longer actively developed and has been archived. It is provided as-is under the MIT License. Feel free to fork and use it.

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

### Read diff from stdin (pipe mode)

If stdin is not a TTY, `commitprompt` reads the diff from it automatically:

```bash
git diff HEAD~1 | commitprompt
git diff main...HEAD | commitprompt --mode pr
cat my-changes.diff | commitprompt --mode changelog
```

### Compare against a branch

```bash
# Show everything your current branch added relative to main
commitprompt --branch main

# Short alias
commitprompt -b develop --mode pr
```

### Override the detected change type

```bash
# Force the type to "fix" regardless of what the heuristic detects
commitprompt --type fix

# Combine with other flags
commitprompt --branch main --type feat --mode commit
```

Valid types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`

### Copy to clipboard

```bash
# Copy the generated prompt directly to your clipboard
commitprompt --copy
commitprompt -c

# Works with all other flags
commitprompt --mode pr --branch main --copy
commitprompt --diff changes.diff -c
```

On **macOS** this uses `pbcopy`. On **Linux** it tries `xclip` then `xsel`. On **Windows/WSL** it uses `clip.exe`. If no clipboard tool is found, the prompt is printed to stdout as a fallback with a warning on stderr.

### Shell autocomplete

```bash
# Bash - add to ~/.bashrc
eval "$(commitprompt --completions bash)"

# Zsh - add to ~/.zshrc
eval "$(commitprompt --completions zsh)"
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
| `-b, --branch <name>` | Compare current branch against `<name>` | - |
| `--type <type>` | Override auto-detected change type | - |
| `--context` | Include repo context (package.json name, README intro) in prompt | - |
| `--completions <bash\|zsh>` | Print shell completion script and exit | - |
| `-c, --copy` | Copy the generated prompt to the system clipboard | - |

**Input priority:** `--diff` > `--branch` > stdin pipe > `--staged` (default)

## CI support

The project includes CI configurations for both GitHub Actions and GitLab CI:

- **GitHub Actions**: `.github/workflows/ci.yml` - runs type checking and tests on all branches
- **GitLab CI**: `.gitlab-ci.yml` - same pipeline (type check + tests) using the `node:20` image

The diff parser also recognizes both GitHub and GitLab CI file paths (`.github/`, `.gitlab/`, `.gitlab-ci.yml`) when detecting the `ci` change type.

## AAHP case study

This tool was built using the [AAHP (AI-to-AI Handoff Protocol)](https://github.com/homeofe/AAHP).

Its sibling project [failprompt](https://github.com/elvatis/failprompt) does the same thing for CI failure logs: turn GitHub Actions errors into structured AI prompts for debugging.

Both tools follow the same 4-module pattern: reader, parser, builder, CLI.

## License

MIT

<!-- E2E test marker -->
