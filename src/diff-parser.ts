/**
 * diff-parser.ts
 * Parses a raw git diff string into structured data.
 */

export interface DiffFile {
  path: string;
  additions: number;
  deletions: number;
  isNew: boolean;
  isDeleted: boolean;
}

export type ChangeType = 'feat' | 'fix' | 'docs' | 'refactor' | 'test' | 'chore' | 'ci';

export interface ParsedDiff {
  files: DiffFile[];
  totalAdditions: number;
  totalDeletions: number;
  changeType: ChangeType;
}

/**
 * Parse a raw git diff string and return structured information.
 */
export function parseDiff(raw: string): ParsedDiff {
  const lines = raw.split('\n');
  const files: DiffFile[] = [];

  let currentFile: DiffFile | null = null;

  for (const line of lines) {
    // New file block starts with "diff --git a/... b/..."
    if (line.startsWith('diff --git ')) {
      if (currentFile) {
        files.push(currentFile);
      }
      // Extract the b/ path (destination path)
      const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      const path = match ? match[2] : line.replace('diff --git a/', '').split(' b/')[0];
      currentFile = {
        path,
        additions: 0,
        deletions: 0,
        isNew: false,
        isDeleted: false,
      };
      continue;
    }

    if (!currentFile) continue;

    if (line.startsWith('new file mode')) {
      currentFile.isNew = true;
      continue;
    }
    if (line.startsWith('deleted file mode')) {
      currentFile.isDeleted = true;
      continue;
    }

    // Count additions (lines starting with + but not +++)
    if (line.startsWith('+') && !line.startsWith('+++')) {
      currentFile.additions++;
      continue;
    }

    // Count deletions (lines starting with - but not ---)
    if (line.startsWith('-') && !line.startsWith('---')) {
      currentFile.deletions++;
      continue;
    }
  }

  // Push the last file
  if (currentFile) {
    files.push(currentFile);
  }

  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  const changeType = detectChangeType(files, totalAdditions, totalDeletions);

  return { files, totalAdditions, totalDeletions, changeType };
}

/**
 * Heuristic detection of the change type based on the files touched.
 */
function detectChangeType(
  files: DiffFile[],
  totalAdditions: number,
  totalDeletions: number
): ChangeType {
  const paths = files.map((f) => f.path);

  // Only docs files: *.md, *.txt, docs/, .ai/
  const isDocFile = (p: string): boolean =>
    /\.(md|txt)$/.test(p) || p.includes('docs/') || p.includes('.ai/');
  if (paths.every(isDocFile)) {
    return 'docs';
  }

  // Only test files: *.test.ts, *.spec.ts, __tests__
  const isTestFile = (p: string): boolean =>
    /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(p) || p.includes('__tests__');
  if (paths.every(isTestFile)) {
    return 'test';
  }

  // Only CI files: .github/, ci.yml, .gitignore, .gitattributes
  const isCiFile = (p: string): boolean =>
    p.includes('.github/') ||
    /ci\.ya?ml$/.test(p) ||
    p === '.gitignore' ||
    p === '.gitattributes';
  if (paths.every(isCiFile)) {
    return 'ci';
  }

  // New files added with no deletions: feature
  if (files.every((f) => f.isNew) && totalDeletions === 0) {
    return 'feat';
  }

  // More deletions than additions (significant cleanup): refactor
  if (totalDeletions > totalAdditions * 1.5 && totalDeletions > 5) {
    return 'refactor';
  }

  // Small changes to files with "fix", "error", "bug" in path: fix
  const hasFixPath = paths.some((p) =>
    /\b(fix|error|bug)\b/i.test(p.toLowerCase())
  );
  if (hasFixPath && totalAdditions + totalDeletions < 50) {
    return 'fix';
  }

  // Default: feature
  return 'feat';
}
