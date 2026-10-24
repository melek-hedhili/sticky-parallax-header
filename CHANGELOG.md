# Changelog

## Unreleased — 2.0.0-beta.2 preparation

### Fixes

- Accept React 19 without requiring the library's development patch version.
  Expand bounded native peers for the RN 0.83 and 0.88 dependency combinations,
  retaining the RN 0.86/0.87 combinations and optional FlashList 2 integration.
- Initialize the Yarn cache path in GitHub Actions steps so the checks workflow
  passes expression validation and can start its jobs.

### Verification

- Check five React Native dependency stacks, with and without FlashList, using
  strict npm resolution of the packed artifact. Verify exact installed versions,
  core/FlashList isolation, and both declaration entrypoint formats. Keep
  installation and strict compilation failures visible across all ten consumers.
- Update npm/Yarn installation instructions and the consumer Agent Skill to
  distinguish dependency targets from verified native runtime support.

### Release blockers

- Fresh RN 0.83 npm installs encounter a React Native / virtualized-lists peer
  resolution conflict that also reproduces without this package. Strict npm
  installation into an already-installed RN 0.83 app succeeds without changing
  React 19.2.0; this does not establish a passing fresh-install gate.
- Strict consumer compilation still reports upstream React Native, Reanimated,
  and FlashList declarations, reproduced without this package's imports. These
  failures are not suppressed or patched in consumers.
- Native verification of the added RN 0.83/0.88 combinations and a hosted GitHub
  Actions run remain outstanding. This entry is not a published release; the
  package version and npm tags remain at 2.0.0-beta.1 until release gates pass.
- Online Expo Doctor reports six outdated SDK 57 demo patch packages (20/21
  checks pass). Demo dependencies and lockfiles were not changed by this update.
