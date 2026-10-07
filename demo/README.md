# Unified Expo demo

The library's showcase, deterministic validation cases, and workload previews run
in one Expo Router app on iOS, Android, and web. This app uses Expo Go: no prebuild,
native projects, CocoaPods, Gradle, Xcode build, or development client is needed.

Use Node **24.21.0** and Yarn Classic **1.22.22**. Root, demo, and docs have
independent dependency trees and lockfiles. From the repository root:

```sh
HUSKY=0 yarn install --frozen-lockfile --non-interactive
yarn --cwd demo install --frozen-lockfile --non-interactive
yarn demo start
```

Scan the Metro QR code with SDK 57 Expo Go, or launch an emulator/simulator with
`yarn demo android` / `yarn demo ios`. Use `yarn demo web` for the browser. Expo CLI
can install the compatible Expo Go binary on a simulator or emulator; physical
devices need a compatible Expo Go installation and a reachable Metro URL.

## Content

- **Showcase:** all 21 original examples, quizzes, authors, custom headers, nested
  SectionLists, animated colors, and FlashList variants. The author view is a
  Router modal; card routes use local author IDs rather than serialized objects.
- **Validation:** 15 deterministic cases with local content, refresh and
  scroll-to-top controls, tab navigation, pager controls, and status reporting.
- **Performance:** nine isolated workload previews, 240 local rows, and six pager
  pages. Only the focused scenario mounts. Sample counters after interacting;
  sampling itself renders the report. Expo Go timings are not release benchmarks.

The root catalogue links to every case. Validation and performance also have
dedicated menus. Invalid route IDs show a recovery link instead of mounting a
fixture. Back controls support direct links without existing navigation history.

## Checks

| Command, from the repository root | Purpose |
| --- | --- |
| `yarn lint:demo` | App, routes and configuration lint |
| `yarn demo:typecheck` | Generated Router types and app/library source TypeScript |
| `yarn demo test:ci` | Focused scene, status-bar and refresh lifecycle regressions |
| `yarn demo check:dependencies` | Expo SDK dependency alignment |
| `yarn demo doctor` | Expo configuration and dependency diagnostics |
| `yarn demo build:bundles` | iOS, Android and web JS/assets export |
| `yarn demo build:web` | Web export |

Metro resolves both library entrypoints to `../src` and native peers from this
app's installation. TypeScript has matching mappings. Automatic runtime tsconfig
aliases are disabled so type-only peer mappings cannot affect Metro; the `@/`
alias is explicitly resolved. Router types and exports remain ignored. The
headless route generator uses the installed SDK's own generation API; recheck
its entrypoints when upgrading Expo. No tracked configuration is regenerated.

## Runtime smoke

Install `agent-device@0.21.21` on PATH. Choose an explicit device and the Metro URL
reachable from that device, then run:

```sh
yarn demo smoke:ios --url exp://127.0.0.1:8092 --device "iPhone 17"
yarn demo smoke:android --url exp://10.0.2.2:8092 --serial emulator-5554
```

Substitute your own URL, port, and device. The script opens the validation route
inside Expo Go and checks all 15 cases, refs, refresh completion, and pager/tab
navigation. Dismiss Expo Go first-open prompts before running it. Artifacts go to
ignored `build/smoke/`. A localhost URL is not universally reachable from physical
devices or Android emulators.

For an emulator using an explicit ADB reverse, run
`adb -s emulator-5554 reverse tcp:8092 tcp:8092` and use `exp://127.0.0.1:8092`.
Keep Metro and source files stable during a replay; a shared Metro reload restarts
every connected Expo Go app.

Also verify short/long drags, snap thresholds, momentum, physical pull-to-refresh,
rotation, safe-area boundaries, and RTL after a device/app restart. Mocked tests,
exports, and automated status checks do not replace these interactions. Web retains
the library's documented limitations for snapping and native RefreshControl.

The independent newer RN/Reanimated stack remains covered by packed-consumer type
checks, not by this Expo Go runtime. Physical-device release performance comparisons
remain deferred; a production native harness would be a separate task.
