# Expo example

This separate application uses Expo SDK 57.0.26, React Native 0.86.3 and React
19.2.3. Reanimated 4.5.1, Worklets 0.10.1 and FlashList 2.0.2 follow Expo's stable
SDK bundle. React Navigation 7 preserves the existing stack and routes.

Use Node 24.21.x and Yarn Classic 1.22.22. Install here with
`yarn install --frozen-lockfile --non-interactive`. For iOS, use Ruby 3.4.7,
install the Gemfile with Bundler and run `bundle exec pod install` inside `ios/`.
Xcode 26.4+ and an iOS simulator runtime are required. For Android, use Java 17
and the Android SDK, with `ANDROID_HOME` set. Gradle installs the requested SDK
components when licenses and network access are available.

| Command, in this directory | Purpose |
| --- | --- |
| `yarn typecheck` | App and shared source with SDK 57 peers |
| `yarn check:dependencies` | Expo SDK dependency alignment |
| `yarn build:bundles` | Android, iOS and web exports via Expo Metro |
| `yarn build:web` | Web export only |
| `yarn build:android` | Native debug APK |
| `yarn build:ios` | Unsigned simulator build |
| `yarn start` | Metro development server |
| `yarn android` / `yarn ios` / `yarn web` | Interactive runtime validation |

Use the example routes to check animated colors, image headers, navigation,
refresh, safe areas and responsive web behavior. Native smoke checks must include
snapping, momentum, tab jumps, pager swipes, forwarded refs, rotation and RTL;
export success is not evidence of native animation correctness. The independent
[bare fixture](../test-app/README.md) adds a deterministic selector for every
header family on the latest React Native line.

Both package entrypoints resolve to `../src`. Metro resolves runtime peers from
this app, while TypeScript uses its matching types. `experiments.tsconfigPaths`
is disabled because the type-only peer mappings must not affect runtime imports.
The web build uses Expo Metro; the former webpack setup has been removed.

Native projects remain tracked. Read [NATIVE_SETTINGS.md](NATIVE_SETTINGS.md)
before `yarn prebuild`: it regenerates native projects from app.json and local
plugins. This is an intentional maintenance operation, not a build check.
