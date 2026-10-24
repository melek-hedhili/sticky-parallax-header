---
sidebar_position: 2
---

# Installation

The modern branch requires React 19, React Native's **New Architecture** and
Reanimated 4. Reanimated 2/3, FlashList 1 and the legacy architecture are outside
this branch's compatibility target.

## Dependency compatibility targets

Keep the React version required by your application. The compatibility update
accepts React `^19.0.0`; React Native still imposes its own React requirements.
Expo is not a peer dependency of this library. The SDK labels below identify
representative combinations, not a requirement to adopt Expo or upgrade an app.

| Consumer check | React Native | React | Gesture Handler | Reanimated / Worklets | Safe Area Context | FlashList, optional |
| --- | --- | --- | --- | --- | --- | --- |
| RN 0.83 lower bound | 0.83.0 | 19.2.0 | 2.30.0 | 4.2.1 / 0.7.4 | 5.6.2 | 2.0.2 |
| SDK 55 combination | 0.83.10 | 19.2.0 | 2.30.0 | 4.2.1 / 0.7.4 | 5.6.2 | 2.0.2 |
| SDK 57 demo combination | 0.86.3 | 19.2.3 | 2.32.0 | 4.5.1 / 0.10.1 | 5.7.0 | 2.0.2 |
| Bare combination | 0.87.1 | 19.2.3 | 2.32.0 | 4.7.1 / 0.13.0 | 5.10.1 | 2.3.3 |
| SDK 58 combination | 0.88.0 | 19.3.0 | 3.3.0 | 4.7.1 / 0.13.0 | 5.10.1 | 2.3.3 |

Fresh strict npm installation passed for RN 0.86, 0.87 and 0.88, with and without
FlashList, preserving each selected React version. Fresh RN 0.83 installs remain
blocked: even without this library, npm selects a newer RN through
`@react-native/virtualized-lists`' wildcard peer. Separate checks adding the
package to existing RN 0.83.0 and 0.83.10 dependency trees passed with and without
FlashList, preserving React 19.2.0. Those existing-app results do not resolve the
fresh-install limitation; preserve an existing app's working lockfile.

Strict declaration checks still fail on upstream types, with no package or
consumer-fixture diagnostics. The maintained Expo SDK 57 demo provides native
runtime evidence; native verification for the added RN 0.83 and 0.88 combinations
is pending. These results do not establish native animation behavior, support for
intervening RN versions, or compatibility between arbitrary native dependencies.
Unresolved strict declaration errors block release.
Use Node 24.21.0 and Yarn Classic 1.22.22 when contributing to this repository.

## Install the beta

```sh
npm install @mhedhili/react-native-sticky-parallax-header@next
# Or, with Yarn:
yarn add @mhedhili/react-native-sticky-parallax-header@next
```

The `next` tag currently targets the `2.0.0-beta` line. Pin an exact prerelease
version when reproducible installs are required. Published beta.1 still requires
its narrower peer versions; the targets above apply to the compatibility update
in this checkout and become available from npm only after a new release. Do not
use `--force` or `--legacy-peer-deps` to bypass a version conflict.

To test an unpublished checkout, build and pack it from the repository root:

```sh
yarn build
yarn pack --filename mhedhili-react-native-sticky-parallax-header.tgz
```

Install that archive in your application using its actual local path. The old
unscoped package's `@rc` command is not a compatibility guarantee.

Strict consumers with `skipLibCheck: false` currently encounter declaration
errors from the targeted React Native, Reanimated and optional FlashList
versions. The package declarations build without package-owned diagnostics, but
this beta does not claim that those upstream declaration errors are resolved.

## Expo

Within an Expo application, let Expo select its compatible native packages, then
compare the resolved set with the matrix above:

```sh
npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context react-native-gesture-handler
```

Keep `babel-preset-expo` in the application's Babel config. It configures the
Worklets transform for the installed Expo/Reanimated stack. Do not configure the
old Reanimated plugin as a second copy of the same transform. The repository demo
runs in Expo Go without prebuild or native projects. Custom consumer applications
need a new native binary when they change native dependencies.

## Bare React Native

For the React Native 0.87.1 target:

```sh
npm install react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-safe-area-context@5.10.1 react-native-gesture-handler@2.32.0
# Or, with Yarn:
yarn add react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-safe-area-context@5.10.1 react-native-gesture-handler@2.32.0
```

For another target, use its complete row rather than combining the newest
versions independently. Do not replace React to match this example.

Configure the Worklets plugin **last** in the application's Babel plugins:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
```

Follow the [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/),
install iOS Pods, and rebuild the native app. Restart Metro with its cache reset
after changing the Babel configuration.

## Gesture handling and safe areas

Wrap the app/navigation in an app-owned `GestureHandlerRootView` with `flex: 1`,
then provide safe areas. Reuse existing providers when present. Native modal
content also needs a gesture root in its own native hierarchy. The library does
not create gesture roots for you. Android's standard scroll hosts keep their
gesture hierarchy mounted when bounce is toggled off, so this root setup is
required even with `enableHeaderBounce={false}`.

```tsx
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AvatarHeaderScrollView } from '@mhedhili/react-native-sticky-parallax-header';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AvatarHeaderScrollView
          containerStyle={{ flex: 1 }}
          title="My profile"
          subtitle="A sticky header"
          backgroundColor="#126b5e">
          <Text style={{ padding: 24, minHeight: 1000 }}>Scroll to collapse the header.</Text>
        </AvatarHeaderScrollView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## Expanded-header pull bounce

Avatar, Details and Tabbed headers enable elastic pull beyond the top by default,
including their predefined FlashList variants. Set `enableHeaderBounce={false}`
to disable the custom effect; `bounces={false}` or `scrollEnabled={false}` also
turns it off. Primitive/custom sticky headers keep their existing behavior.

On iOS, native negative scroll offsets drive the effect. On Android, gestures
handle the visual pull while preserving native refresh ownership. Refresh uses
the original `refreshControl` or `onRefresh`/`refreshing` props; bounce does not
invoke `onRefresh`. Web keeps its existing behavior. On Android, opaque/custom
scroll renderers and custom `RefreshControl` roots retain native behavior rather
than receiving an automatic gesture wrapper. Preserve their native scroll props
and forwarded refs.

For Android pages with independently scrolling vertical lists nested inside a
header's outer scroll view, set `enableHeaderBounce={false}` on the outer header.
Its zero offset cannot establish whether an inner list is at its own top, so the
outer pull gesture cannot safely arbitrate that touch stream. Horizontal pager
navigation and native refresh remain separate from this opt-out.

## Optional FlashList integration

Use `npx expo install @shopify/flash-list` with Expo, or install
the FlashList version in your selected row with npm or Yarn. All FlashList APIs live under the
`/flash-list` subpath; see [FlashList headers](../headers/flashlist-headers.md).

Core `ScrollView`, `FlatList`, `SectionList` and pager headers work without
installing FlashList. Web-specific constraints are described in
[web support](./web-support.md).
