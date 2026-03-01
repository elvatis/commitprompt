/**
 * context-reader.ts
 * Reads repo context (package.json name, README intro) for the --context flag.
 */
import { readFileSync } from 'fs';

/**
 * Extract the first paragraph from a README.md string.
 * Skips the leading `# Title` line and returns the first non-empty
 * paragraph (text block between blank lines).
 */
export function extractReadmeIntro(content: string): string {
  const sanitized = content.replace(/^\uFEFF/, '');
  const lines = sanitized.split('\n');
  const paragraph: string[] = [];
  let pastTitle = false;

  for (const line of lines) {
    // Skip the leading title line (e.g., "# commitprompt")
    if (!pastTitle && line.startsWith('# ')) {
      pastTitle = true;
      continue;
    }

    // Skip blank lines before the paragraph starts
    if (paragraph.length === 0 && line.trim() === '') {
      continue;
    }

    // Stop at the next blank line after collecting paragraph text
    if (paragraph.length > 0 && line.trim() === '') {
      break;
    }

    // Stop at the next heading
    if (paragraph.length > 0 && line.startsWith('#')) {
      break;
    }

    // Skip heading lines that appear before text (e.g., badges section)
    if (paragraph.length === 0 && line.startsWith('#')) {
      continue;
    }

    paragraph.push(line.trim());
  }

  return paragraph.join(' ');
}

/**
 * Read repo context: package.json name and README.md first paragraph.
 * Returns undefined if no context could be gathered.
 */
export function readRepoContext(): string | undefined {
  const parts: string[] = [];

  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8')) as { name?: string };
    if (pkg.name) {
      parts.push(`Project: ${pkg.name}`);
    }
  } catch {
    // Ignore missing package.json - context is optional
  }

  try {
    const readme = readFileSync('README.md', 'utf-8');
    const intro = extractReadmeIntro(readme);
    if (intro) {
      parts.push(intro);
    }
  } catch {
    // Ignore missing README.md - context is optional
  }

  return parts.length > 0 ? parts.join('\n') : undefined;
}
