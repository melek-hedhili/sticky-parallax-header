# Setup and migration

Read this reference when installing the package, checking compatibility, changing native dependencies, or migrating an older implementation. For an existing app, inspect its manifest, lockfile, Babel config, native architecture, root providers, and installed package version before suggesting commands.

## Modern compatibility target

The modern package is `@mhedhili/react-native-sticky-parallax-header` on the `2.0.0-beta` line. It requires React Native's New Architecture, React 19, Reanimated 4, React Native Worklets, React Native Gesture Handler, and React Native Safe Area Context. Reanimated 2/3, FlashList 1, and the legacy architecture are not supported targets.

The repository validates these complete dependency pairs:

| Dependency | Expo consumer lane | Bare consumer lane |
| --- | --- | --- |
| Expo | 57.0.27 | Not required |
| React Native | 0.86.3 | 0.87.1 |
| React | 19.2.3 | 19.2.3 |
| Reanimated | 4.5.1 | 4.7.1 |
| React Native Worklets | 0.10.1 | 0.13.0 |
| Safe Area Context | 5.7.x | 5.10.1 |
| Gesture Handler | 2.32.x | 2.32.x |
| FlashList, optional | 2.0.2 | 2.3.3 |

Treat this table as the package's tested matrix, not permission to force those versions into every application. In Expo, let `expo install` choose SDK-compatible native packages. In an existing bare app, respect its React Native compatibility requirements and report when it lies outside the tested matrix.

## Install the modern package

Use the consumer project's package manager. With Yarn:

```sh
yarn add @mhedhili/react-native-sticky-parallax-header@next
```

Pin an exact prerelease instead of `next` when the application requires reproducible installs.

For Expo 57, install compatible native peers with Expo:

```sh
npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context react-native-gesture-handler
```

Keep `babel-preset-expo`; it supplies the Worklets transform for the supported Expo stack. Do not add the old Reanimated plugin as a second transform.

For the validated bare React Native 0.87.1 lane:

```sh
yarn add react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-safe-area-context@5.10.1 react-native-gesture-handler@2.32.0
```

Configure the Worklets plugin last:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
```

Install iOS Pods when applicable, rebuild the native app after native dependency changes, and restart Metro with its cache reset after changing Babel configuration. A JavaScript bundle alone does not prove native worklet or gesture behavior.

## Required app roots

Reuse existing roots if the application already has them. Do not nest duplicate providers solely for one header.

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function AppRoot() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>{/* navigation or application */}</SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

Native modal content needs a gesture root in its own native hierarchy. The library does not create the application root. Standard Android scroll hosts retain their gesture hierarchy even when `enableHeaderBounce={false}`, so keep the gesture root in that configuration.

Predefined headers own their top safe-area inset by default. Set `enableSafeAreaTopInset={false}` when an opaque navigation header or surrounding layout already owns it. Primitive headers leave safe-area layout to the consumer.

## Import boundaries

Import core components, hooks, HOCs, and types from:

```ts
import { AvatarHeaderScrollView } from '@mhedhili/react-native-sticky-parallax-header';
```

FlashList is optional. Install FlashList 2 and import every FlashList adapter, hook, and prop type from:

```ts
import { withAvatarHeaderFlashList } from '@mhedhili/react-native-sticky-parallax-header/flash-list';
```

Do not deep-import `src/`, `lib/`, hooks used only by predefined components, or internal header components. Core-only consumers do not need FlashList installed.

## Migration to the scoped v2 package

New implementations should use only the modern API. Use the mappings below to translate old code; do not preserve obsolete patterns alongside the replacement.

| Legacy pattern | Modern replacement |
| --- | --- |
| `react-native-sticky-parallax-header` | `@mhedhili/react-native-sticky-parallax-header` |
| `StickyParallaxHeader` with `headerType="AvatarHeader"` | `AvatarHeaderScrollView` |
| `StickyParallaxHeader` with `headerType="DetailsHeader"` | `DetailsHeaderScrollView` |
| `StickyParallaxHeader` with `headerType="TabbedHeader"` | `TabbedHeaderPager` |
| `StickyParallaxHeader` without `headerType` | `StickyHeaderScrollView` |
| `header` | `renderHeaderBar` |
| `headerSize` | `onHeaderLayout` when layout observation is still needed |
| `onRef` or `scrollRef` | Ordinary forwarded `ref` |
| `scrollEvent` | A worklet `onScroll` callback |
| `contentContainerStyles` in the old pager | `pagerProps.contentContainerStyle` |
| `horizontalScrollBounces` | `pagerProps.bounces` |
| `useWorkletCallback` | `useCallback` with a `'worklet'` directive |
| `Extrapolate` | `Extrapolation` |
| `useInterpolateConfig` / `interpolateSharableColor` | `useDerivedValue` with `interpolateColor` |
| FlashList imports from the package root | Imports from the `/flash-list` subpath |
| FlashList 1 estimate props | Remove them; FlashList 2 measures items itself |

`snapValue` was removed. Configure modern snapping with `parallaxHeight`, `headerHeight`, `snapStartThreshold`, `snapStopThreshold`, and `snapToEdge`.

Scroll callbacks now receive `NativeScrollEvent` and run as worklets. Bridge React state, navigation, alerts, and other JavaScript effects with `scheduleOnRN` from `react-native-worklets`. `onTopReached` remains a JavaScript callback.

FlashList 2 uses `FlashListRef<T>`. The `TabbedHeaderPager` outer `ref` controls vertical scrolling; `pagerProps.ref` exposes the horizontal pager's `PagerMethods.goToPage`.

## Migration verification

After migrating, rebuild iOS and Android and verify:

- expanded, collapsed, and snap positions;
- slow drags and momentum in both directions;
- tab presses, horizontal swipes, and current-tab synchronization;
- forwarded scroll refs and pager navigation;
- safe-area ownership with visible, hidden, and transparent navigation headers;
- native refresh and header bounce without double gesture ownership;
- orientation changes and RTL;
- FlashList separately when used;
- the documented web boundaries.

