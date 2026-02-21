/**
 * prompt-builder.ts
 * Builds mode-specific AI prompts from parsed diff data.
 */
import { type ParsedDiff } from './diff-parser.js';
import { trimDiff } from './diff-reader.js';

export type Mode = 'commit' | 'pr' | 'changelog';

/**
 * Build a formatted AI prompt for the given mode.
 * @param diff - Parsed diff data
 * @param raw - Raw diff string (will be trimmed)
 * @param mode - Output mode: commit, pr, or changelog
 * @param maxLines - Maximum lines to include in the diff summary
 */
export function buildPrompt(
  diff: ParsedDiff,
  raw: string,
  mode: Mode,
  maxLines = 120
): string {
  const header = buildHeader(mode);
  const filesSection = buildFilesSection(diff);
  const diffSummary = buildDiffSummary(raw, maxLines);
  const instructions = buildInstructions(mode);

  return [header, filesSection, diffSummary, instructions].join('\n\n');
}

function buildHeader(mode: Mode): string {
  const titles: Record<Mode, string> = {
    commit: '# Commit Message Request',
    pr: '# PR Description Request',
    changelog: '# Changelog Entry Request',
  };
  return titles[mode];
}

function buildFilesSection(diff: ParsedDiff): string {
  const lines = ['## Changed Files'];

  if (diff.files.length === 0) {
    lines.push('(no files detected)');
    return lines.join('\n');
  }

  for (const file of diff.files) {
    const additions = `+${file.additions}`;
    const deletions = `-${file.deletions}`;
    const flags: string[] = [];
    if (file.isNew) flags.push('new file');
    if (file.isDeleted) flags.push('deleted');
    const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
    lines.push(`- ${file.path} (${additions} ${deletions})${flagStr}`);
  }

  return lines.join('\n');
}

function buildDiffSummary(raw: string, maxLines: number): string {
  const trimmed = trimDiff(raw, maxLines);
  return `## Diff Summary\n\`\`\`diff\n${trimmed}\n\`\`\``;
}

function buildInstructions(mode: Mode): string {
  switch (mode) {
    case 'commit':
      return [
        '## Instructions',
        'Write a conventional commit message for these changes.',
        'Format: <type>(<scope>): <description>',
        'Types: feat, fix, docs, refactor, test, chore, ci, perf',
        'Keep the subject line under 72 characters.',
        'If the change is complex, add a body paragraph explaining WHY (not WHAT).',
      ].join('\n');

    case 'pr':
      return [
        '## Instructions',
        'Write a GitHub Pull Request description with:',
        '- A one-line summary (becomes the PR title)',
        '- A "What changed" section (bullet points)',
        '- A "Why" section (motivation)',
        '- A "How to test" section',
      ].join('\n');

    case 'changelog':
      return [
        '## Instructions',
        'Write a changelog entry in Keep a Changelog format.',
        'Section: Added / Changed / Fixed / Removed (pick the right one)',
        'Be user-facing: describe what users can now do, not implementation details.',
      ].join('\n');
  }
}
