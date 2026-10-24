# Contributing

Inspect existing changes, keep edits focused, and record validation commands and
results. This guide describes setup, compatibility and verification for humans
and coding agents.

## Setup

Use **Node 24.21.0** (`nvm use`, from `.nvmrc`) and **Yarn Classic 1.22.22**.
Verify both versions before installing. With an
existing Corepack installation, `corepack prepare yarn@1.22.22 --activate` provisions
that version. Where Corepack is unavailable, installing the package-manager binary
with `npm install --global yarn@1.22.22` is an alternative; use Yarn for project
dependencies. These commands change your tool environment and may require network
access or system permissions.

The library, Expo Router demo and documentation each have separate dependencies
and a Yarn lockfile. Install only the area needed for your task:

```sh
yarn install --frozen-lockfile --non-interactive
yarn --cwd demo install --frozen-lockfile --non-interactive
yarn --cwd docs install --frozen-lockfile --non-interactive
```

These are setup operations and can run lifecycle scripts. Root installation runs
`prepare`, which builds the package and initializes Husky hooks. Use `HUSKY=0`
for isolated validation and CI where hook initialization is unnecessary. A frozen install must not rewrite a lockfile;
if it fails, report the cause rather than regenerate the lock or ignore engines.
Do not run all three installs just to inspect the repository.

Bare `yarn` performs the normal root install. There is no implicit demo install,
Pods setup or native bootstrap. The [demo](demo/README.md) uses Expo SDK 57.0.31,
RN 0.86.3 and their paired animation dependencies. It launches in a compatible
Expo Go client or on web; do not prebuild it or maintain native directories. Its
node_modules tree must stay separate from the root RN 0.87 package test tools.
The bare dependency combinations remain in isolated consumer checks. Known
upstream declaration errors are distinct from package-owned declaration checks.

## Validation

From the repository root:

```sh
yarn check:static
yarn test:ci
yarn test:types
```

Run these separately and report each result. `check:static` runs lint, package
TypeScript, and the CommonJS, ES module, and declaration builds. Individual checks
remain available as `yarn lint`, `yarn typescript`, and `yarn build`.

Jest now runs meaningful regression tests with official native-library mocks.
These checks do not establish actual UI-thread animation behavior. The packed
consumer gate runs outside the repository dependency tree, checks the real package
contents and both declaration formats, and compiles application code with
`strict: true` and `skipLibCheck: true`. A separate strict program uses
`skipLibCheck: false` to check every reachable package-owned declaration in both
emitted formats. Negative API assertions and injected declaration-error probes
guard these checks; upstream declaration internals are outside the gate.
It may install temporary dependencies; treat it as an explicit validation operation.
Do not replace this with only `skipLibCheck: true` or imply that upstream type
errors have been fixed.

Use `yarn lint:demo` and `yarn lint:docs` for those scopes, or `yarn lint:all`
after all three dependency trees are installed. Run `yarn demo:typecheck` and
`yarn docs:typecheck` separately; root TypeScript does not check either project.
Run `yarn --cwd demo test:ci` for focused scene cleanup and timer regressions.

For documentation changes run `yarn --cwd docs build` once its dependencies are
available. Root TypeScript excludes demo and docs. For runtime changes, exercise
the relevant demo screens on affected platforms:

```sh
yarn demo ios
yarn demo android
yarn demo web
```

Run `yarn --cwd demo check:dependencies`, `yarn --cwd demo doctor` and
`yarn --cwd demo build:bundles` for SDK checks and all-platform JavaScript exports.
Performance screens are workload previews; physical-device release measurements
require a separately established harness.

Report which platforms and interactions were actually checked. A passing package
build does not prove animation correctness. Mark unavailable checks as blocked or
not run, with a reason; separate existing failures from regressions.

## Verification record

The Expo Router consolidation was checked on **2026-10-07** with Node 24.21.0
and Yarn Classic 1.22.22. This historical record predates the scoped declaration
policy described above:

- Package lint, TypeScript and CommonJS/ESM/declaration builds passed; all 96
  library Jest tests and seven demo Jest tests passed.
- Demo lint, generated Router types, TypeScript and SDK dependency alignment
  passed; Expo Doctor passed all 21 checks.
- Agent-device verified all 21 showcase screens, 15 validation cases and nine
  performance workloads on iPhone 17 and Medium Phone API 36.1 in Expo Go.
  Navigation, modal insets, direct links, refs, tab jumps, native refresh,
  snapping, momentum and pager swipes passed. The 15-case iPhone replay also
  passed after deleting the legacy apps.
- iOS/Android JavaScript exports and docs lint, TypeScript and Docusaurus build
  passed. Demo startup and exports generated no native directories.
- Packed package contents passed. All four strict consumer lanes still fail
  with unchanged upstream Reanimated `Keyframe`/SVG declarations, RN 0.87
  generated declarations and FlashList 2.3.3 ref/type incompatibilities. Package
  declarations and consumer fixtures introduced no diagnostics; the gate stays
  nonzero with `skipLibCheck: false`.
- Web runtime QA was deferred. Landscape and RTL runtime remain unverified.
  Expo Go workload checks do not establish physical-device release performance;
  the separate bare runtime app was retired. A physical-device release
  performance harness remains a separate task.

## Coding and pull requests

- Keep each pull request focused on one issue or feature. Describe the trigger,
  resulting behavior, and any public API impact; link an issue when one exists.
- Preserve worklet boundaries, forwarded refs and header layout contracts.
  Keep FlashList exports isolated at `/flash-list` and preserve deliberate
  Worklets runtime transitions. Investigate legacy workarounds before removing them.
- Follow the existing ESLint and Prettier configuration. Keep index imports/exports
  and style names alphabetically ordered where that is the surrounding convention.
- Use descriptive branch names and
  [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Complete the PR template with exact commands, results, baseline failures, and
  unverified platforms. Include screenshots or video when they help explain UI changes.
- Keep current public docs and frozen version snapshots distinct. Record a discovered
  documentation/source mismatch before deciding which behavior to change.

## Publish a prepared beta

Prepare the version and changelog in a reviewed PR first. After it is merged and
required checks pass, publish only when the release is explicitly authorized.
Record native validation for newly supported combinations before publication,
or explicitly document a maintainer-approved deferral. For beta.2, native checks
on RN 0.83 and 0.88 are deferred; passing CI does not establish native compatibility.
Finalize the changelog in a reviewed, committed change before publishing so the
published archive does not retain an unreleased heading.
In the manual **Release to NPM** workflow, select `master` and enter the exact
prepared version (for this release, `2.0.0-beta.2`). Its preflight requires that
the input matches `package.json` and is a beta; static, Jest and packed-consumer
checks run before publication.

The local publishing command from a clean, current `master` checkout is below.
It does not rerun the workflow's validation; use it only after the required checks
pass and native validation or its explicit deferral is recorded for that revision:

```sh
yarn release --ci
```

The script uses `--no-increment`: it publishes the version already reviewed in
Git to the explicit npm `next` tag, pushes the normal `v2.0.0-beta.2` tag, and
creates a GitHub prerelease. It does not create another release branch or promote
either npm `latest` or GitHub's latest release. The local command requires npm
and GitHub authentication; the workflow uses its configured release secrets.

The workflow installs and validates public dependencies without npm authentication.
Registry authentication is configured immediately before publication, with
`NODE_AUTH_TOKEN` and `NPM_TOKEN` supplied only to the publish step from the
repository's `NPM_TOKEN` secret. Do not move that registry setup before the Yarn
checks: Yarn Classic rejects the configuration when `NODE_AUTH_TOKEN` is absent.
The other required repository secrets are `GH_TOKEN` for GitHub releases and
`USERNAME` / `USER_EMAIL` for the Git author identity.

After publishing, inspect the registry version, peer dependencies and dist-tags,
install that exact registry version in a fresh consumer, and check its npm README.
Promotion to npm `latest` is a separate authorized operation after those checks:

```sh
npm dist-tag add @mhedhili/react-native-sticky-parallax-header@2.0.0-beta.2 latest
```

Release preparation and validation do not publish. Documentation deployment also
publishes externally and is separate from these checks.
