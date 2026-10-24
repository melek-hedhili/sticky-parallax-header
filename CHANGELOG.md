# Changelog

## 2.0.0-beta.2 — prepared, unreleased

### Fixes

- Accept React 19 without requiring the library's development patch version.
  Expand bounded native peers for the RN 0.83 and 0.88 dependency combinations,
  retaining the RN 0.86/0.87 combinations and optional FlashList 2 integration.
- Initialize the Yarn cache path in GitHub Actions steps so the checks workflow
  passes expression validation and can start its jobs.
- Align the demo's six outdated Expo SDK 57 dependencies and Yarn lockfile with
  Expo's recommended patches; retain its React and React Native versions.
- Prepare the release workflow to publish the reviewed package version to `next`
  without incrementing it again. Require `master` and an exact beta-version
  confirmation, create the normal version tag and GitHub prerelease, and remove
  the extra release-branch hook. Promoting npm `latest` remains a separate step.

### Verification

- Check five React Native dependency stacks, with and without FlashList, using
  strict npm resolution of the packed artifact. Verify exact installed versions,
  a single React and RN installation, core/FlashList isolation, and both
  declaration entrypoint formats. The four RN 0.83 fixtures explicitly pin
  `@react-native/virtualized-lists` to RN's own exact dependency; all ten fresh
  installs pass without changing the selected React or bypassing peer checks.
- Check consumer code strictly with `skipLibCheck: true`, then separately check
  every reachable package-owned emitted declaration with `skipLibCheck: false`
  in both CommonJS and ESM trees. Keep negative API checks and fail on package
  declaration errors. Upstream declaration internals are outside this gate.
- Update npm/Yarn installation instructions and the consumer Agent Skill to
  distinguish dependency targets from verified native runtime support.
- The patched demo passes online dependency validation, all 21 Expo Doctor
  checks, frozen-lockfile installation, TypeScript, lint, seven Jest tests,
  and iOS/Android/web JavaScript exports.
- The compatibility change passed hosted package, demo and docs checks on
  [`04e353a`](https://github.com/melek-hedhili/sticky-parallax-header/actions/runs/40129818958).
  Release preparation is validated separately from that baseline.

### Release status and limits

- Unanchored fresh RN 0.83 npm installs can still encounter the independently
  reproduced React Native / virtualized-lists peer resolution conflict. The
  explicit companion dependency in the fixtures is a documented resolver
  workaround, not a repair to upstream metadata.
- Applications using `skipLibCheck: false` may still report known React Native,
  Reanimated and FlashList declaration errors, reproduced without this package's
  imports. The scoped CI policy does not fix those upstream declarations or
  change consumers' TypeScript configuration.
- Native verification of the added RN 0.83/0.88 combinations remains outstanding.
  Installation and type checks do not establish native compatibility.
- This entry records release preparation. Updating the version in Git does not
  publish the package or move npm dist-tags; publication is a separate operation.
