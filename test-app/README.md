# Bare React Native compatibility app

This independent Yarn tree exercises the library on React Native 0.87.1 and React
19.2.3, outside Expo. Native projects originate from the pinned
`@react-native-community/template@0.87.1`; CLI packages are pinned to 20.2.0.
It uses Reanimated 4.7.1, Worklets 0.13.0, FlashList 2.3.3 and safe-area-context
5.10.1. It has no Expo or navigation dependency.

Use Node 24.21.x and Yarn Classic 1.22.22. Install in this directory with
`yarn install --frozen-lockfile --non-interactive`. For iOS, install the Gemfile
with Bundler and run `bundle exec pod install` inside `ios/`. Xcode and the iOS
simulator runtime are required. Android requires Java 17, Android SDK platform
37.0 (`platforms;android-37.0`), build tools 37.0.0 and NDK 27.1.12297006; set
`ANDROID_HOME` for the local SDK. The template targets API 36 and supports API 24+.

Commands from this directory:

| Command                                   | Check                                                   |
| ----------------------------------------- | ------------------------------------------------------- |
| `yarn typecheck`                          | App plus shared library source against this app's peers |
| `yarn bundle:android` / `yarn bundle:ios` | Production JavaScript and local assets                  |
| `yarn build:android`                      | Native debug APK, no device required                    |
| `yarn build:ios`                          | Unsigned iOS simulator build, no device required        |
| `yarn start`                              | Metro; keep running while launching debug builds        |
| `yarn android` / `yarn ios`               | Build, install and run on a chosen local device         |

The selector has 15 deterministic cases: the three primitives, Avatar and
Details with ScrollView/FlatList/SectionList, Tabbed SectionList and Pager, and
all four FlashList adapters. The small Tabbed SectionList case initially renders
all logical cells so its section targets have measured layouts; it does not test
unmeasured-section retries. Every case uses local content and the same scroll,
refresh and imperative-ref controls. The pager also exposes a Second page button.

For each platform, exercise short drags across the snap threshold, long drags and
momentum, pull-to-refresh, Scroll to top, section tab jumps, pager swipes and its
Second page button. Return to All cases between variants. Repeat after rotating
the device; inspect safe-area boundaries. RTL needs a device/app restart after
changing RTL configuration and must be recorded separately from LTR results.
`fixture-status` reports refresh completion, top reached and pager transitions.
A passing bundle or typecheck does not prove any of these native interactions.

Both package entrypoints resolve to `../src`; Metro and TypeScript deliberately
resolve peer dependencies from this app's `node_modules`. Root tests and package
compilation exclude this fixture. Keep its `yarn.lock` independent from root and
`example/yarn.lock`.

The iOS template bundle ID is `org.reactjs.native.example.StickyParallaxTestApp`;
Android is `com.stickyparallaxtestapp`.
