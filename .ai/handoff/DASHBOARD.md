# DASHBOARD.md - commitprompt Build Health

| Check         | Status    | Detail                                          |
| ------------- | --------- | ----------------------------------------------- |
| TypeScript    | OK        | Strict mode, NodeNext modules, zero errors      |
| Tests         | 42/42     | diff-parser (14), prompt-builder (12), integration (16) |
| CI            | Live      | github.com/elvatis/commitprompt/actions         |
| npm publish   | Pending   | Needs human `npm login`                         |
| E2E           | Verified  | src/fixtures/e2e-output.txt                     |

## Test Suite Breakdown

### diff-parser.test.ts (14 tests)
- bugfix.diff: file detection, addition/deletion counts, isNew flag
- new-feature.diff: test file detection, changeType='test'
- docs-only.diff: changeType='docs', file detection, counts
- multi-file.diff: CI file detection, changeType='ci', isNew flag, counts

### prompt-builder.test.ts (12 tests)
- commit mode: header, file names, sections, order, counts, trimming
- pr mode: header, file names, instructions, no-cross-contamination
- changelog mode: header, file names, instructions, no-cross-contamination

### integration.test.ts (16 tests)
- bugfix.diff -> commit: full pipeline, diff content in summary
- new-feature.diff -> pr: PR structure, changeType verification
- docs-only.diff -> changelog: changelog structure, changeType verification
- multi-file.diff -> commit: CI file in prompt, all sections present
