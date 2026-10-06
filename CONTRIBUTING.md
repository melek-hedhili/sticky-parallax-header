# Contributing

Inspect existing changes, keep edits focused, and record validation commands and results. The sections below describe setup, compatibility, and the contribution workflow.

## Setup

Use **Node 24.21.0** (`nvm use`, from `.nvmrc`) and **Yarn Classic 1.22.22**.
Verify both versions before installing. With an
existing Corepack installation, `corepack prepare yarn@1.22.22 --activate` provisions
that version. Where Corepack is unavailable, installing the package-manager binary
with `npm install --global yarn@1.22.22` is an alternative; use Yarn for project
dependencies. These commands change your tool environment and may require network
access or system permissions.

The library, Expo example, bare test app, and documentation each have separate dependencies and a Yarn
lockfile. Install only the area needed for your task:

```sh
yarn install --frozen-lockfile --non-interactive
yarn --cwd example install --frozen-lockfile --non-interactive
yarn --cwd docs install --frozen-lockfile --non-interactive
yarn --cwd test-app install --frozen-lockfile --non-interactive
```

These are setup operations and can run lifecycle scripts. Root installation runs
`prepare`, which builds the package and initializes Husky hooks. Use `HUSKY=0`
for isolated validation and CI where hook initialization is unnecessary. A frozen install must not rewrite a lockfile;
if it fails, report the cause rather than regenerate the lock or ignore engines.
Do not run all three installs just to inspect the repository.

Bare `yarn` now performs only the normal root install. The explicit `yarn bootstrap`
command still installs the example and root dependencies and runs CocoaPods.
For iOS, `yarn pods` installs pods after JavaScript dependencies are available;
native development also requires the relevant Xcode or Android SDK tooling.

The selected stacks require New Architecture. The Expo example uses SDK 57 and
RN 0.86.3; the bare app uses RN 0.87.1. Their animation dependencies are deliberately
paired and their node_modules trees must stay separate. Native builds require the
SDK/template toolchains; consult [example native settings](example/NATIVE_SETTINGS.md)
and both app READMEs before regenerating or building native projects.

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
contents and both declaration formats, and compiles with `skipLibCheck: false`.
It may install temporary dependencies; treat it as an explicit validation operation.
Report any upstream declaration failures without weakening the gate.

Use `yarn lint:example`, `yarn lint:test-app`, and `yarn lint:docs` for those scopes,
or `yarn lint:all` after all dependency trees are installed. Run each app's
`typecheck` separately; root TypeScript cannot validate the independent stacks.

For documentation changes run `yarn --cwd docs build` once its dependencies are
available. Root TypeScript excludes docs and both app trees. For runtime changes,
exercise the relevant example screens on affected platforms:

```sh
yarn example ios
yarn example android
yarn example web
yarn test-app ios
yarn test-app android
```

Report which platforms and interactions were actually checked. A passing package
build does not prove animation correctness. Mark unavailable checks as blocked or
not run, with a reason; separate existing failures from regressions.

## Coding and pull requests

- Keep each pull request focused on one issue or feature. Describe the trigger,
  resulting behavior, and any public API impact; link an issue when one exists.
- Preserve worklet boundaries, forwarded refs, and header layout contracts described
  by the public API. Investigate legacy workarounds before removing them.
- Follow the existing ESLint and Prettier configuration. Keep index imports/exports
  and style names alphabetically ordered where that is the surrounding convention.
- Use descriptive branch names and
  [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Complete the PR template with exact commands, results, baseline failures, and
  unverified platforms. Include screenshots or video when they help explain UI changes.
- Keep current public docs and frozen version snapshots distinct. Record a discovered
  documentation/source mismatch before deciding which behavior to change.

Publishing is a separate operation: `yarn release` can publish to npm, create a
GitHub release, and push a release branch. Documentation deployment also publishes
externally. Neither operation is part of validation.
