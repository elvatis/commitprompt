/**
 * clipboard.ts - Cross-platform clipboard write utility
 *
 * Tries, in order:
 *   macOS:   pbcopy
 *   Linux:   xclip -selection clipboard
 *   Linux:   xsel --clipboard --input
 *   WSL/Win: clip.exe
 *
 * Returns an error message string if no clipboard tool is available,
 * or null on success.
 */
import { execSync } from 'child_process';

/** Commands to probe + pipe into (in priority order). */
const CLIPBOARD_CMDS: ReadonlyArray<{ cmd: string; args: string[] }> = [
  { cmd: 'pbcopy', args: [] },
  { cmd: 'xclip', args: ['-selection', 'clipboard'] },
  { cmd: 'xsel', args: ['--clipboard', '--input'] },
  { cmd: 'clip.exe', args: [] },
];

function commandExists(cmd: string): boolean {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Write `text` to the system clipboard.
 * @returns null on success, or an error string if clipboard is unavailable.
 */
export function copyToClipboard(text: string): string | null {
  for (const { cmd, args } of CLIPBOARD_CMDS) {
    if (!commandExists(cmd)) continue;
    try {
      const fullCmd = [cmd, ...args].join(' ');
      execSync(fullCmd, { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
      return null; // success
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return `clipboard: "${cmd}" failed: ${msg}`;
    }
  }
  return (
    'clipboard: no clipboard tool found. ' +
    'Install pbcopy (macOS), xclip or xsel (Linux), or use clip.exe (Windows/WSL).'
  );
}
