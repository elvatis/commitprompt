#!/usr/bin/env node
/**
 * index.ts - CLI entry point for commitprompt
 * Reads a git diff and formats it as a structured AI prompt.
 */
import { program } from 'commander';
import { readFileSync } from 'fs';
import { readStagedDiff, readDiffFile } from './diff-reader.js';
import { parseDiff } from './diff-parser.js';
import { buildPrompt, type Mode } from './prompt-builder.js';

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
    '--context',
    'Include repo context (package.json name, README intro) - reserved for future use'
  )
  .parse(process.argv);

const opts = program.opts<{
  mode: string;
  diff?: string;
  staged?: boolean;
  context?: boolean;
}>();

// Validate mode
const validModes: Mode[] = ['commit', 'pr', 'changelog'];
if (!validModes.includes(opts.mode as Mode)) {
  console.error(
    `Error: invalid mode "${opts.mode}". Valid modes: commit, pr, changelog`
  );
  process.exit(1);
}
const mode = opts.mode as Mode;

// Optional context: read package.json name if --context flag is set
let contextNote = '';
if (opts.context) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8')) as { name?: string };
    if (pkg.name) {
      contextNote = `<!-- Repo: ${pkg.name} -->`;
    }
  } catch {
    // Ignore missing package.json - context is optional
  }
}

// Read the diff
let raw: string;
try {
  if (opts.diff) {
    raw = readDiffFile(opts.diff);
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
const prompt = buildPrompt(parsed, raw, mode);

const output = contextNote ? `${contextNote}\n\n${prompt}` : prompt;
process.stdout.write(output + '\n');
