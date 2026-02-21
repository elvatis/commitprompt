# TRUST.md - commitprompt Trust Levels

## Trust Matrix

| Component              | Trust Level | Basis                                     |
| ---------------------- | ----------- | ----------------------------------------- |
| diff-reader.ts         | (Verified)  | Unit-tested implicitly via integration tests |
| diff-parser.ts         | (Verified)  | 14 direct tests on real fixture diffs     |
| prompt-builder.ts      | (Verified)  | 12 direct tests on parsed real diffs      |
| index.ts (CLI)         | (Verified)  | E2E test on real staged change            |
| changeType heuristics  | (Assumed)   | Works on 4 fixtures; edge cases not exhaustive |
| trimDiff logic         | (Verified)  | Tested with small maxLines in prompt-builder test |
| git diff --staged read | (Verified)  | E2E test confirmed real git output works  |
| npm publish readiness  | (Assumed)   | package.json publishConfig correct, not yet published |

## Risk Areas

- changeType heuristics: path-based detection can misclassify mixed-purpose changes
  (e.g., a refactor that also touches test files). The heuristic checks all files,
  so if even one non-test file is present, it won't classify as 'test'.

- Smart trimming: current implementation may cut through the middle of a hunk.
  This is acceptable as a UX tradeoff - the user can always pass `--diff` for full context.

- git not found: error message assumes the user knows what git is. Acceptable for
  a developer tool.

## What Has Been Tested Against Real Data

- All 4 fixtures from failprompt (TypeScript bugfix, test expansion, docs update, CI addition)
- E2E on a real staged change to README.md
- All 3 prompt modes (commit, pr, changelog)
