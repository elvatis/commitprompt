/**
 * integration.test.ts
 * End-to-end tests: real fixture -> parse -> build prompt -> verify output.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseDiff } from '../diff-parser.js';
import { buildPrompt } from '../prompt-builder.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../fixtures');

const bugfixDiff = readFileSync(join(fixturesDir, 'bugfix.diff'), 'utf-8');
const newFeatureDiff = readFileSync(join(fixturesDir, 'new-feature.diff'), 'utf-8');
const docsOnlyDiff = readFileSync(join(fixturesDir, 'docs-only.diff'), 'utf-8');
const multiFileDiff = readFileSync(join(fixturesDir, 'multi-file.diff'), 'utf-8');

describe('integration: bugfix.diff -> commit prompt', () => {
  it('produces a complete commit prompt containing real file names', () => {
    const parsed = parseDiff(bugfixDiff);
    const prompt = buildPrompt(parsed, bugfixDiff, 'commit');

    // Header present
    expect(prompt).toContain('# Commit Message Request');
    // Real file name from fixture
    expect(prompt).toContain('src/error-extractor.ts');
    // Sections present
    expect(prompt).toContain('## Changed Files');
    expect(prompt).toContain('## Diff Summary');
    expect(prompt).toContain('## Instructions');
    // Commit-specific instruction keywords
    expect(prompt).toContain('conventional commit message');
  });

  it('diff summary contains content from the actual diff', () => {
    const parsed = parseDiff(bugfixDiff);
    const prompt = buildPrompt(parsed, bugfixDiff, 'commit');
    // The diff summary should reference the actual changed file
    expect(prompt).toContain('error-extractor.ts');
  });
});

describe('integration: new-feature.diff -> pr prompt', () => {
  it('produces a complete PR prompt for test file changes', () => {
    const parsed = parseDiff(newFeatureDiff);
    const prompt = buildPrompt(parsed, newFeatureDiff, 'pr');

    // Header
    expect(prompt).toContain('# PR Description Request');
    // Real file from fixture
    expect(prompt).toContain('integration.test.ts');
    // PR-specific structure
    expect(prompt).toContain('## Instructions');
    expect(prompt).toContain('Pull Request description');
    expect(prompt).toContain('What changed');
    expect(prompt).toContain('How to test');
  });

  it('changeType is test for this fixture', () => {
    const parsed = parseDiff(newFeatureDiff);
    expect(parsed.changeType).toBe('test');
  });
});

describe('integration: docs-only.diff -> changelog prompt', () => {
  it('produces a complete changelog prompt for docs changes', () => {
    const parsed = parseDiff(docsOnlyDiff);
    const prompt = buildPrompt(parsed, docsOnlyDiff, 'changelog');

    // Header
    expect(prompt).toContain('# Changelog Entry Request');
    // Real file from fixture
    expect(prompt).toContain('STATUS.md');
    // Changelog-specific instructions
    expect(prompt).toContain('## Instructions');
    expect(prompt).toContain('Keep a Changelog format');
    expect(prompt).toContain('Added / Changed / Fixed / Removed');
  });

  it('changeType is docs for this fixture', () => {
    const parsed = parseDiff(docsOnlyDiff);
    expect(parsed.changeType).toBe('docs');
  });
});

describe('integration: multi-file.diff (CI workflow) -> commit prompt', () => {
  it('produces a prompt containing the CI file', () => {
    const parsed = parseDiff(multiFileDiff);
    const prompt = buildPrompt(parsed, multiFileDiff, 'commit');

    expect(prompt).toContain('# Commit Message Request');
    expect(prompt).toContain('ci.yml');
    expect(prompt).toContain('## Changed Files');
    expect(prompt).toContain('## Instructions');
  });

  it('changeType is ci for this fixture', () => {
    const parsed = parseDiff(multiFileDiff);
    expect(parsed.changeType).toBe('ci');
  });

  it('full pipeline is non-empty and well-structured', () => {
    const parsed = parseDiff(multiFileDiff);
    const prompt = buildPrompt(parsed, multiFileDiff, 'commit');

    // Must have all four major sections
    const sections = [
      '# Commit Message Request',
      '## Changed Files',
      '## Diff Summary',
      '## Instructions',
    ];
    for (const section of sections) {
      expect(prompt).toContain(section);
    }
  });
});
