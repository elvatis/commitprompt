/**
 * diff-reader.ts
 * Reads a git diff from staged changes, a file, stdin, or a branch comparison.
 * Also exports smart diff trimming.
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

/**
 * Read the staged diff from the current git repo.
 * Throws a helpful message if nothing is staged or git is not found.
 */
export function readStagedDiff(cwd?: string): string {
  const workdir = cwd ?? process.cwd();
  let raw: string;
  try {
    raw = execSync('git diff --staged', {
      cwd: workdir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('not found') || message.includes('not recognized')) {
      throw new Error('git not found. Please install git and try again.', { cause: err });
    }
    throw new Error(`Failed to run git diff --staged: ${message}`, { cause: err });
  }

  if (!raw || raw.trim() === '') {
    throw new Error(
      'Nothing staged. Run `git add` first, then `commitprompt`.'
    );
  }

  return raw;
}

/**
 * Read a diff comparing the current branch to the given base branch.
 * Uses `git diff <branch>...HEAD` (three-dot) to show only what the current
 * branch introduced relative to the merge-base of <branch>.
 */
export function readBranchDiff(branch: string, cwd?: string): string {
  const workdir = cwd ?? process.cwd();
  let raw: string;
  try {
    raw = execSync(`git diff ${branch}...HEAD`, {
      cwd: workdir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('not found') || message.includes('not recognized')) {
      throw new Error('git not found. Please install git and try again.', { cause: err });
    }
    throw new Error(
      `Failed to run git diff ${branch}...HEAD: ${message}`,
      { cause: err }
    );
  }

  if (!raw || raw.trim() === '') {
    throw new Error(
      `No differences found between current branch and "${branch}".`
    );
  }

  return raw;
}

/**
 * Read a diff from a file path (for testing or piping).
 */
export function readDiffFile(path: string): string {
  try {
    const content = readFileSync(path, 'utf-8');
    if (!content || content.trim() === '') {
      throw new Error(`Diff file is empty: ${path}`);
    }
    return content;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read diff file: ${message}`, { cause: err });
  }
}

/**
 * Read a diff from stdin (pipe mode).
 * This is a synchronous read of all stdin data.
 */
export function readStdinDiff(): string {
  const buf = readFileSync('/dev/stdin', 'utf-8');
  if (!buf || buf.trim() === '') {
    throw new Error('Stdin is empty. Pipe a git diff to commitprompt.');
  }
  return buf;
}

/**
 * Return true when stdin is NOT a terminal (i.e. data is being piped in).
 */
export function isStdinPiped(): boolean {
  return !process.stdin.isTTY;
}

/**
 * Smart-trim a diff to maxLines.
 * Strategy: keep all file headers (diff --git, ---, +++, @@) and
 * fill the rest with the changed lines (+/-) from the most impactful hunks.
 */
export function trimDiff(raw: string, maxLines = 120): string {
  const lines = raw.split('\n');
  if (lines.length <= maxLines) {
    return raw;
  }

  const result: string[] = [];
  let count = 0;

  for (const line of lines) {
    // Always keep file headers and hunk headers
    const isHeader =
      line.startsWith('diff --git') ||
      line.startsWith('index ') ||
      line.startsWith('--- ') ||
      line.startsWith('+++ ') ||
      line.startsWith('new file') ||
      line.startsWith('deleted file') ||
      line.startsWith('@@ ');

    if (isHeader) {
      result.push(line);
      count++;
      continue;
    }

    if (count < maxLines) {
      result.push(line);
      count++;
    } else {
      // Append a truncation notice only once
      if (result[result.length - 1] !== '... (diff truncated)') {
        result.push('... (diff truncated)');
      }
      break;
    }
  }

  return result.join('\n');
}
