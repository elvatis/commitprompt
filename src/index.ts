#!/usr/bin/env node
/**
 * index.ts - CLI entry point for commitprompt
 * Reads a git diff and formats it as a structured AI prompt.
 */
import { program } from 'commander';
import {
  readStagedDiff,
  readDiffFile,
  readBranchDiff,
  readStdinDiff,
  isStdinPiped,
} from './diff-reader.js';
import { parseDiff } from './diff-parser.js';
import { buildPrompt, type Mode } from './prompt-builder.js';
import { readRepoContext } from './context-reader.js';

// Valid commit types (also used for autocomplete)
const VALID_TYPES = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'ci', 'perf'];

program
  .name('commitprompt')
  .description(
    'Turn your git diff into a ready-to-paste AI prompt for commit messages, PR descriptions, and changelogs'
  )
  .version('0.1.0')
  .option(
    '--mode <mode>',
    'Output mode: commit, pr, or changelog',
    'commit'
  )
  .option('--diff <path>', 'Read diff from a file instead of git diff --staged')
  .option('--staged', 'Explicitly read from git diff --staged (default behavior)')
  .option(
    '-b, --branch <name>',
    'Compare current branch against <name> instead of using staged diff'
  )
  .option(
    '--type <type>',
    `Override auto-detected change type (${VALID_TYPES.join(', ')})`
  )
  .option(
    '--context',
    'Include repo context (package.json name, README intro) in the prompt'
  )
  .option(
    '--completions <shell>',
    'Print shell completion script for bash or zsh and exit'
  )
  .parse(process.argv);

const opts = program.opts<{
  mode: string;
  diff?: string;
  staged?: boolean;
  branch?: string;
  type?: string;
  context?: boolean;
  completions?: string;
}>();

// Handle --completions before anything else
if (opts.completions) {
  const shell = opts.completions.toLowerCase();
  if (shell === 'bash') {
    process.stdout.write(getBashCompletion());
    process.exit(0);
  } else if (shell === 'zsh') {
    process.stdout.write(getZshCompletion());
    process.exit(0);
  } else {
    console.error(`Error: unsupported shell "${shell}". Supported: bash, zsh`);
    process.exit(1);
  }
}

// Validate mode
const validModes: Mode[] = ['commit', 'pr', 'changelog'];
if (!validModes.includes(opts.mode as Mode)) {
  console.error(
    `Error: invalid mode "${opts.mode}". Valid modes: commit, pr, changelog`
  );
  process.exit(1);
}
const mode = opts.mode as Mode;

// Validate --type if provided
if (opts.type && !VALID_TYPES.includes(opts.type)) {
  console.error(
    `Error: invalid type "${opts.type}". Valid types: ${VALID_TYPES.join(', ')}`
  );
  process.exit(1);
}

// Optional context: read package.json name and README intro if --context flag is set
const contextString = opts.context ? readRepoContext() : undefined;

// Read the diff (priority: --diff > --branch > stdin pipe > --staged/default)
let raw: string;
try {
  if (opts.diff) {
    raw = readDiffFile(opts.diff);
  } else if (opts.branch) {
    raw = readBranchDiff(opts.branch);
  } else if (isStdinPiped()) {
    raw = readStdinDiff();
  } else {
    raw = readStagedDiff();
  }
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}

// Parse and build prompt
const parsed = parseDiff(raw);

// Apply --type override
if (opts.type) {
  (parsed as { changeType: string }).changeType = opts.type;
}

const prompt = buildPrompt(parsed, raw, mode, 120, contextString);

process.stdout.write(prompt + '\n');

// --- Completion scripts ---

function getBashCompletion(): string {
  return `# commitprompt bash completion
# Add to ~/.bashrc:
#   eval "$(commitprompt --completions bash)"

_commitprompt_completions() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  opts="--mode --diff --staged --branch --type --context --completions --help --version"

  case "\${prev}" in
    --mode)
      COMPREPLY=( \$(compgen -W "commit pr changelog" -- "\${cur}") )
      return 0
      ;;
    --type|-t)
      COMPREPLY=( \$(compgen -W "${VALID_TYPES.join(' ')}" -- "\${cur}") )
      return 0
      ;;
    --branch|-b)
      # Complete with local branch names
      local branches
      branches=\$(git branch --format='%(refname:short)' 2>/dev/null)
      COMPREPLY=( \$(compgen -W "\${branches}" -- "\${cur}") )
      return 0
      ;;
    --diff)
      COMPREPLY=( \$(compgen -f -- "\${cur}") )
      return 0
      ;;
    --completions)
      COMPREPLY=( \$(compgen -W "bash zsh" -- "\${cur}") )
      return 0
      ;;
  esac

  COMPREPLY=( \$(compgen -W "\${opts}" -- "\${cur}") )
}

complete -F _commitprompt_completions commitprompt
`;
}

function getZshCompletion(): string {
  return `#compdef commitprompt
# commitprompt zsh completion
# Add to ~/.zshrc:
#   eval "$(commitprompt --completions zsh)"

_commitprompt() {
  local -a opts type_vals mode_vals shell_vals

  mode_vals=('commit:Generate a commit message' 'pr:Generate a PR description' 'changelog:Generate a changelog entry')
  type_vals=(${VALID_TYPES.map(t => `'${t}'`).join(' ')})
  shell_vals=('bash:Bash completion script' 'zsh:Zsh completion script')

  _arguments \\
    '--mode[Output mode]:mode:(commit pr changelog)' \\
    '--diff[Read diff from file]:file:_files' \\
    '--staged[Use git diff --staged]' \\
    '(-b --branch)'{-b,--branch}'[Compare against branch]:branch:__git_branch_names' \\
    '--type[Override commit type]:type:(${VALID_TYPES.join(' ')})' \\
    '--context[Include repo context]' \\
    '--completions[Print shell completion]:shell:(bash zsh)' \\
    '--help[Show help]' \\
    '--version[Show version]'
}

_commitprompt "$@"
`;
}
