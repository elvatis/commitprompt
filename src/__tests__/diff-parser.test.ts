/**
 * diff-parser.test.ts
 * Tests for the diff parser using real fixture files.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseDiff } from '../diff-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../fixtures');

const bugfixDiff = readFileSync(join(fixturesDir, 'bugfix.diff'), 'utf-8');
const newFeatureDiff = readFileSync(join(fixturesDir, 'new-feature.diff'), 'utf-8');
const docsOnlyDiff = readFileSync(join(fixturesDir, 'docs-only.diff'), 'utf-8');
const multiFileDiff = readFileSync(join(fixturesDir, 'multi-file.diff'), 'utf-8');

describe('parseDiff - bugfix.diff', () => {
  it('detects src/error-extractor.ts as the changed file', () => {
    const result = parseDiff(bugfixDiff);
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('src/error-extractor.ts');
  });

  it('has both additions and deletions', () => {
    const result = parseDiff(bugfixDiff);
    expect(result.totalAdditions).toBeGreaterThan(0);
    expect(result.totalDeletions).toBeGreaterThan(0);
  });

  it('counts additions correctly (50 lines including blank + lines)', () => {
    const result = parseDiff(bugfixDiff);
    const file = result.files.find((f) => f.path === 'src/error-extractor.ts');
    expect(file).toBeDefined();
    expect(file!.additions).toBe(50);
  });

  it('counts deletions correctly (14 actual - lines)', () => {
    const result = parseDiff(bugfixDiff);
    const file = result.files.find((f) => f.path === 'src/error-extractor.ts');
    expect(file).toBeDefined();
    expect(file!.deletions).toBe(14);
  });

  it('file is not marked as new or deleted', () => {
    const result = parseDiff(bugfixDiff);
    const file = result.files.find((f) => f.path === 'src/error-extractor.ts');
    expect(file).toBeDefined();
    expect(file!.isNew).toBe(false);
    expect(file!.isDeleted).toBe(false);
  });
});

describe('parseDiff - new-feature.diff (test file changes)', () => {
  it('detects the integration test file as changed', () => {
    const result = parseDiff(newFeatureDiff);
    const paths = result.files.map((f) => f.path);
    expect(paths.some((p) => p.includes('integration.test.ts'))).toBe(true);
  });

  it('detects changeType as test (only test files changed)', () => {
    const result = parseDiff(newFeatureDiff);
    expect(result.changeType).toBe('test');
  });

  it('counts 143 additions and 33 deletions (includes blank + lines)', () => {
    const result = parseDiff(newFeatureDiff);
    expect(result.totalAdditions).toBe(143);
    expect(result.totalDeletions).toBe(33);
  });
});

describe('parseDiff - docs-only.diff', () => {
  it('detects changeType as docs', () => {
    const result = parseDiff(docsOnlyDiff);
    expect(result.changeType).toBe('docs');
  });

  it('detects the STATUS.md file', () => {
    const result = parseDiff(docsOnlyDiff);
    const paths = result.files.map((f) => f.path);
    expect(paths.some((p) => p.includes('STATUS.md'))).toBe(true);
  });

  it('counts 2 additions and 2 deletions', () => {
    const result = parseDiff(docsOnlyDiff);
    expect(result.totalAdditions).toBe(2);
    expect(result.totalDeletions).toBe(2);
  });
});

describe('parseDiff - multi-file.diff (CI workflow)', () => {
  it('detects at least one file changed', () => {
    const result = parseDiff(multiFileDiff);
    expect(result.files.length).toBeGreaterThanOrEqual(1);
  });

  it('detects ci.yml as changed', () => {
    const result = parseDiff(multiFileDiff);
    const paths = result.files.map((f) => f.path);
    expect(paths.some((p) => p.includes('ci.yml'))).toBe(true);
  });

  it('detects changeType as ci', () => {
    const result = parseDiff(multiFileDiff);
    expect(result.changeType).toBe('ci');
  });

  it('marks ci.yml as a new file', () => {
    const result = parseDiff(multiFileDiff);
    const ciFile = result.files.find((f) => f.path.includes('ci.yml'));
    expect(ciFile).toBeDefined();
    expect(ciFile!.isNew).toBe(true);
  });

  it('counts 27 additions and 0 deletions (new file, includes blank lines)', () => {
    const result = parseDiff(multiFileDiff);
    expect(result.totalAdditions).toBe(27);
    expect(result.totalDeletions).toBe(0);
  });
});
