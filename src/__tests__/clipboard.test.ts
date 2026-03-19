/**
 * clipboard.test.ts
 * Tests for the cross-platform clipboard utility.
 * We mock execSync to avoid requiring a real clipboard tool in CI.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as childProcess from 'child_process';

// We need to mock before importing the module under test
vi.mock('child_process');

const mockedExecSync = vi.mocked(childProcess.execSync);

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns null (success) when a clipboard command is available and succeeds', async () => {
    // First call: commandExists -> success for pbcopy
    // Second call: actual copy -> success
    mockedExecSync.mockReturnValueOnce(Buffer.from('')); // command -v pbcopy
    mockedExecSync.mockReturnValueOnce(Buffer.from('')); // pbcopy pipe

    const { copyToClipboard } = await import('../clipboard.js');
    const result = copyToClipboard('hello clipboard');
    expect(result).toBeNull();
  });

  it('returns an error string when the clipboard command throws', async () => {
    // command -v pbcopy succeeds, but pbcopy itself throws
    mockedExecSync.mockReturnValueOnce(Buffer.from('')); // command -v pbcopy
    mockedExecSync.mockImplementationOnce(() => {
      throw new Error('pbcopy: pipe broken');
    });

    const { copyToClipboard } = await import('../clipboard.js');
    const result = copyToClipboard('hello');
    expect(result).toContain('pbcopy');
    expect(result).toContain('failed');
  });

  it('returns a "no clipboard tool found" message when all commands are missing', async () => {
    // All commandExists calls fail
    mockedExecSync.mockImplementation(() => {
      throw new Error('not found');
    });

    const { copyToClipboard } = await import('../clipboard.js');
    const result = copyToClipboard('hello');
    expect(result).toContain('no clipboard tool found');
  });
});
